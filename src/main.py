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

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

# from gpio.pwr import pwrBtn_Evnt, blink_calib
from adc.sonda import read_Sonda#, calib_Sonda
from pwm.pwm import setNvlFototerapia, setNvlLuzExam
from gpio.calef import ctrl_Calef, set_PWM_Calef, statusCom_Calef, get_PWMstatus
from spi.bme280 import bme280
# from rtc.reloj import reloj
from gpio.modoFunc import ctrl_Motores
# from i2c.sht21 import sht21, calibracion#, read_temp275
from files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
from uart.comBasc import tare, calib, pesaje
#------------------------- En Pruebas -------------------------#
# from i2c.at18_T2s import readTarjeta2S

# sensor1075 = TMP1075() # NO ESTA EL DISPOSITIVO

#--------------------------------------------------------------#

##############################################################################
#                           Configuracion Pag WEB                            #
##############################################################################
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# fsm = sm_chngModoOp()
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
##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("index.html")

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TEMPERATURAS
# Lectura de las sondas de piel
@app.route("/api/getTemp", methods=["POST"])
def api_getTemp():
    tempSondaPiel = read_Sonda(3) # Canal ADC
    tempSondaAux = read_Sonda(2)  # Canal ADC (2 AUX)

    if tempSondaPiel != 0 and tempSondaAux != 0:
        return jsonify({
            "status": "ok",
            "tempSondaPiel": tempSondaPiel,
            "tempSondaAux": tempSondaAux
        }), 200
    elif tempSondaPiel != 0 and tempSondaAux == 0:
        return jsonify({
            "status": "Sonda Aux No Conectada",
            "tempSondaPiel": tempSondaPiel,
            "tempSondaAux": tempSondaAux
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
    Fot = nvlFototerapia.get("nvlFototerapia")
    Exam = nvlFototerapia.get("nvlExam")

    # if Exam:
    setNvlLuzExam(nvlFototerapia.get("nvlExam"))
    # elif Fot:
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
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Cambio de Modo de Funcionamiento
# @app.route("/api/chng_modoFunc", methods=["POST"])
# def api_modoFunc():
#     global strStatus

#     while True:
#         fsm.run()

#         if fsm.state == "edo_0":
#             strStatus = ""
#             return jsonify({"status": "ok"}), 200
#         elif fsm.state == "error" and fsm.errores < 3:
#             strStatus = f"{fsm.errores}"
#             # return jsonify({"status": "retrying"}), 502
#         elif fsm.state == "error" and fsm.errores >= 3:
#             strStatus = "Error"
#             return jsonify({"status": "fail"}), 500

#------------------------- En Pruebas -------------------------#

#--------------------------------------------------------------#

##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def monitor_disk():
    while True:
        restart_container()
        time.sleep(30)

def restart_container(threshold=95):
    total, used, free = shutil.disk_usage("/")
    used_percent = (used / total) * 100

    if used_percent >= threshold:
        print("Espacio casi lleno, reiniciando contenedor...")
        # logger.warning('Espacio casi lleno, reiniciando contenedor...')
        os._exit(1)

#===============================================================#
#                    Inicialización de Hilos                    #
#===============================================================#
# thread_pwrBtn = threading.Thread(target=pwrBtn_Evnt, daemon=True)
# thread_pwrBtn.start()

# thread_pwrLed = threading.Thread(target=blink_calib, daemon=True)
# thread_pwrLed.start()

thread_Calef = threading.Thread(target=ctrl_Calef, daemon=True)
thread_Calef.start()

thread_comCalef = threading.Thread(target=statusCom_Calef, daemon=True)
thread_comCalef.start()

monitor_thread = threading.Thread(target=monitor_disk, daemon=True)
monitor_thread.start()

#------------------------- En Pruebas -------------------------#
# # # # # # # # # # # # # readTarjeta2S()
#--------------------------------------------------------------#

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)