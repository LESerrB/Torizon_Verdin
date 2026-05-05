#!python

import os
import struct
import threading
import time
import shutil

# import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request, abort
from flask_cors import CORS

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

from collections import deque
from typing import Deque, Dict, Any

from dev.Fototerapia.ctrl_Fot_Exam import setNvlFototerapia, setNvlLuzExam
from dev.Sensores_TPH.bme280 import bme280
from dev.Bascula.bascula import tare, calib, pesaje
from dev.GPIO.botones import pwrBtn_Evnt
from dev.GPIO.calefactor import ctrl_Calef, set_PWM_Calef, statusCom_Calef
from dev.GPIO.modoFunc import ctrl_Motores, sm_chngModoOp
from dev.Sensores_TPH.sht21 import sht21

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
from dev.Controles_Alertas.alrt_alimentacion import monitoreo_alimentación
from dev.Controles_Alertas import encoder as hw_encoder



encoder_events_lock = threading.Lock()
encoder_events: Deque[Dict[str, Any]] = deque(maxlen=200)
encoder_event_id = 0
#--------------------------------------------------------------#

##############################################################################
#                           Configuracion Pag WEB                            #
##############################################################################
template_dir = "web/templates"
static_dir = "web/static"

app = Flask(__name__,
            template_folder=template_dir,
            static_folder=static_dir)

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

##############################################################################
#                           Configuracion de entorno                         #
##############################################################################
# logger.warning('And this, too')
# logger.error('And non-ASCII stuff, too, like Øresund and Malmö')
# logger.critical('This is critical!')
# app.logger.handlers = logger.handlers
# app.logger.setLevel(logger.level)

# werkzeug_logger = logging.getLogger('werkzeug')
# werkzeug_logger.handlers = logger.handlers
# werkzeug_logger.setLevel(logger.level)
fsm = sm_chngModoOp()

#-------- Valores Iniciales --------#
tempProg = 34.0
sobreGiro = False
enableEdit = False
edit_started_temp = None

TEMP_MIN = 34.0
TEMP_MAX = 37.0
TEMP_MAX_SG = 38.0

pot_Calef = 100

nvlLuzExam = 0
nvlLuzFot = 0

pesoFinal = 0.0
strStatus = ""

alertaSumEner = ""
##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/view/<name>")
def view(name):
    allowed = ["PantPrin"]   # aquí agregarás más pantallas después

    if name not in allowed:
        abort(404)

    return render_template(f"{name}.html")

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SONDAS DE TEMPERATURA
# Seleccionar Temperatura Programada
@app.route("/api/setTemp", methods=["POST"])
def api_setTemp():
    nTempProg = request.get_json()

    if nTempProg.get("tempProg"):
        # print("La nueva temperatura Programada es:", nTempProg.get("tempProg"))

        return jsonify({
            "status": "ok"
        }), 200
    else:
        print("No se recibió valor")

        return jsonify({
            "status": "ERROR NO SE RECIBIÓ VALOR"
        }), 500
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SENSORES HUMEDAD/TEMPERATURA/OXIGENO
@app.route("/api/getSnsTHO", methods=["POST"])
def api_THO():
    # sht21()

    temp_CjSns, pres_CjSns, hum_CjSns = struct.unpack("fff", bme280())
    SnsOx = 0

    return jsonify({
        "status": "ok",
        "snsTemp": temp_CjSns,
        "snsPres": pres_CjSns,
        "snsHum": hum_CjSns,
        "snsOx": SnsOx,
    }), 200
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CONTROL DE CALEFACTOR
# Seleccionar Potencia de calefactor
@app.route("/api/potCalef", methods=["POST"])
def api_potCalef():
    potCalef = request.get_json()
    PWM_Calef = potCalef.get("potCalef")

    if PWM_Calef is not None:
        set_PWM_Calef(int(PWM_Calef))

#>>>>>>>>>>>>>>>>>> Temperatura Programada <<<<<<<<<<<<<<<<<<#
@app.route("/api/tempProg", methods=["GET"])
def get_tempProg():
    with state_lock:
        s = snapshot_state()

    return jsonify({"status": "ok", **s}), 200

@app.route("/api/tempProg", methods=["POST"])
def set_tempProg():
    body = request.get_json(force=True, silent=True) or {}

    with state_lock:
        if "delta" in body:
            try:
                delta = float(body["delta"])
            except (TypeError, ValueError):
                return jsonify({"status": "fail", "error": "delta inválido"}), 400

            state.tempProg = clamp_round_temp(state.tempProg + delta, state.sobreGiro)

        elif "tempProg" in body:
            try:
                v = float(body["tempProg"])
            except (TypeError, ValueError):
                return jsonify({"status": "fail", "error": "tempProg inválido"}), 400

            state.tempProg = clamp_round_temp(v, state.sobreGiro)

        else:
            return jsonify({"status": "fail", "error": "Falta delta o tempProg"}), 400

        s = snapshot_state()

    return jsonify({"status": "ok", **s}), 200

@app.route("/api/sobreGiro", methods=["GET"])
def get_sobreGiro():
    with state_lock:
        s = snapshot_state()

    return jsonify({
        "status": "ok"
    }), 200
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FUNCIONES DE PESAJE
# Pesar
@app.route("/api/bascPeso", methods=["POST"])
def api_pesaje():
    pesoFinal = pesaje()

    if pesoFinal != 0.0:
        return jsonify({
            "status": "ok",
            "peso": pesoFinal
        }), 200 
    else:
        return jsonify({
            "status": "fail"
        }), 500
# Tarar
@app.route("/api/bascTar", methods=["POST"])
def api_bascTar():
    res = tare()

    if res != -1:
        pesoFinal = pesaje()

        return jsonify({
            "status": "ok",
            "peso": pesoFinal
        }), 200
    else:
        return jsonify({
            "status": "fail"
        }), 500
# Calibrar
@app.route("/api/bascCalib", methods=["POST"])
def api_bascCalib():
    res = calib()

    if res != -1:
        pesoFinal = pesaje()

        return jsonify({
            "status": "ok",
            "peso": pesoFinal
        }), 200
    else:
        return jsonify({
            "status": "fail"
        }), 500
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NIVEL DE FOTOTERAPIA
@app.route("/api/nvlFototerapia", methods=["POST"])
def api_nvlFototerapia():
    nvlFototerapia = request.get_json()
    # Fot = nvlFototerapia.get("nvlFototerapia")
    # Exam = nvlFototerapia.get("nvlExam")

    setNvlLuzExam(nvlFototerapia.get("nvlExam"))
    setNvlFototerapia(nvlFototerapia.get("nvlFototerapia"))

    return jsonify({"status": "ok"})
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CONTROL DE POSICIÓN
@app.route("/api/ctrlPos", methods=["POST"])
def api_ctrlPos():
    accion = request.get_json().get("action")
    # print(accion)

    ctrl_Motores(accion)

    return jsonify({
        "status": "ok"
    }), 200
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CAMBIO DE MODO DE FUNCIONAMIENTO
@app.route("/api/chng_modoFunc", methods=["POST"])
def api_modoFunc():
    global strStatus

    while True:
        fsm.run()

        if fsm.state == "edo_0":
            strStatus = ""
            return jsonify({"status": "ok"}), 200
        elif fsm.state == "error" and fsm.errores < 3:
            strStatus = f"{fsm.errores}"
            # return jsonify({"status": "retrying"}), 502
        elif fsm.state == "error" and fsm.errores >= 3:
            strStatus = "Error"
            return jsonify({"status": "fail"}), 500
#------------------------- En Pruebas -------------------------#
@app.route("/api/ctrls", methods=["GET"])
def controles():
    return jsonify({
        "Alerta": alertaSumEner,
        # "x": joystick_data["x"],
        # "y": joystick_data["y"],
        # "pressed": joystick_data["pressed"]
    })

@app.route("/api/encdCtrl", methods=["POST"])
def encdCtrl():
    tempProg_Lvl = request.get_json().get("tempProg_Lvl")
    editVal = request.get_json().get("editVal")
    sobreGiro = request.get_json().get("sobreGiro")

    tempProg_Lvl = valupdt(editVal, tempProg_Lvl, sobreGiro)

    return jsonify({
        "tempProg_Lvl": tempProg_Lvl
    })

#--------------------------------------------------------------#
##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    global alertaSumEner

    while True:
        restart_container()                         # Memoria del contenedor
        # alertaSumEner = monitoreo_alimentación(2)   # Suministro de energía
        time.sleep(0.5)

def restart_container(threshold=90):
    total, used, free = shutil.disk_usage("/")
    used_percent = (used / total) * 100

    if used_percent >= threshold:
        print("Espacio casi lleno, reiniciando contenedor...")
        # logger.warning('Espacio casi lleno, reiniciando contenedor...')
        os._exit(1)

#===============================================================#
#                    Inicialización de Hilos                    #
#===============================================================#
thread_pwrBtn = threading.Thread(target=pwrBtn_Evnt, daemon=True)
thread_pwrBtn.start()

thread_Calef = threading.Thread(target=ctrl_Calef, daemon=True)
thread_Calef.start()

thread_comCalef = threading.Thread(target=statusCom_Calef, daemon=True)
thread_comCalef.start()

monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

#------------------------- En Pruebas -------------------------#
# # # # # # # # # # # # # readTarjeta2S()
#--------------------------------------------------------------#

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)