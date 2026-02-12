#!python

import os
import struct
import threading
import time
import shutil

# import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from multiprocessing import Manager

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

# from dev.Temperatura.sonda import read_Sonda
from dev.Controles_Alertas.joystick import rd_joystick
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
# from dev.Sensores_TPH.sns_Ox import read_SnsOx
# from i2c.at18_T2s import readTarjeta2S
#--------------------------------------------------------------#

##############################################################################
#                           Configuracion Pag WEB                            #
##############################################################################
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

fsm = sm_chngModoOp()
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

PWM_Calef = 100
pesoFinal = 0.0
strStatus = ""

alertaSumEner = ""
joystick_data = Manager().dict({"x": 0, "y": 0, "pressed": False})
##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("index.html")
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SONDAS DE TEMPERATURA
# Lectura de las sondas de piel
@app.route("/api/getTemp", methods=["POST"])
def api_getTemp():
    # tempSondaPiel = read_Sonda(3) # Canal ADC
    # tempSondaAux = read_Sonda(2)  # Canal ADC (2 AUX)
    tempSondaPiel = 0

    if tempSondaPiel != 0:
        return jsonify({
            "status": "ok",
            "tempSondaPiel": tempSondaPiel
        }), 200
    elif tempSondaPiel != 0:
        return jsonify({
            "status": "Sonda Aux No Conectada",
            "tempSondaPiel": tempSondaPiel
        }), 206
    else:
        return jsonify({
            "status": "ERROR SONDA PRINCIPAL NO CONECTADA"
        }), 500
# Seleccionar Temperatura Programada
@app.route("/api/setTemp", methods=["POST"])
def api_setTemp():
    nTempProg = request.get_json()

    if nTempProg.get("tempProg"):
        print("La nueva temperatura Programada es:", nTempProg.get("tempProg"))

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
    sht21()

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

#--------------------------------------------------------------#
##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    global alertaSumEner

    while True:
        restart_container()
        alertaSumEner = monitoreo_alimentación(2)
        
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

thread_Joystick = threading.Thread(target=rd_joystick, args=(joystick_data,), daemon=True)
thread_Joystick.start()

monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

#------------------------- En Pruebas -------------------------#
# # # # # # # # # # # # # readTarjeta2S()
#--------------------------------------------------------------#

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)