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

from gpio.pwr import pwrBtn_Evnt, blink_calib
from adc.sonda import read_Sonda#, calib_Sonda
# from i2c.at13_Bas import read_Bascula
from pwm.pwm import setNvlFototerapia, setNvlLuzExam
# from i2c.sht21 import sht21, calibracion#, read_temp275
# from gpio.hx711 import hx711
from gpio.calef import ctrl_Calef, set_PWM_Calef, statusCom_Calef, get_PWMstatus
from spi.bme280 import bme280
from files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
# from uart.comBCD import uart_send, uart_receive, decript_Msg#, StateMachine
from uart.comBasc import decript_Msg, tare_Provisional, calib_Provisional, pesaje
from rtc.reloj import reloj

#------------------------- En Pruebas -------------------------#
# from i2c.at18_T2s import readTarjeta2S
# decript_Msg()
# tare_Provisional()
# time.sleep(10)
# calib_Provisional()
# sensor1075 = TMP1075() # NO ESTA EL DISPOSITIVO

# fsm = StateMachine()

# while True:
#     fsm.run()
#--------------------------------------------------------------#

##############################################################################
#                           Configuracion de Flask                           #
##############################################################################
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
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

PWM_Calef = 100
pesoFinal = 0.0
##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/sensores")
def api_sensores():
    sensoresDt = {
        "temp": None,
        "hum": None,
        "temp280": None,
        "pres280": None,
        "hum280": None,
        "peso711": None,
        "valSonda1": None,
        "valSonda2": None,
        "alertaCalefactor": None,
        "potCalefactor": None,
        "msgSistema": None
    }

    # try:
    # sensoresDt["temp"], sensoresDt["hum"] = struct.unpack("ff", sht21())
    sensoresDt["temp280"], sensoresDt["pres280"], sensoresDt["hum280"] = struct.unpack("fff", bme280())
    sensoresDt["peso711"] = pesoFinal
    sensoresDt["valSonda1"] = read_Sonda()
    # sensoresDt["valSonda2"] = readTarjeta2S()
    sensoresDt["potCalefactor"], sensoresDt["alertaCalefactor"] = struct.unpack('i?', get_PWMstatus())
    sensoresDt["msgSistema"] = reloj()
    # valor_uart = uart_receive()

    # if valor_uart is None or valor_uart.strip() == "" or not valor_uart.replace('.', '', 1).isdigit():
    #     sensoresDt["msgSistema"] = None
    # else:
    #     sensoresDt["msgSistema"] = f"{valor_uart} °C"
#------------------------- En Pruebas -------------------------#
    # readTarjeta2S()
    # print(decript_Msg())
    # print(read_temp275())
    # sensoresDt["msgSistema"] = fsm.run()
    # print(sensor1075.read_temperature()) # NO FUNCIONA POR QUE NO ESTA EL DISPOSITIVO, PERO QUEDA PARA VER COMO FUNCIONAN LAS CLASES
#--------------------------------------------------------------#
    # except Exception as e:
        # logger.error("Error leyendo sensores:", e)
        # print("Error leyendo sensores:", e)

    return jsonify({
        "temp": sensoresDt["temp"],
        "hum": sensoresDt["hum"],

        "temp280": round(float(sensoresDt["temp280"]), 2) if sensoresDt["temp280"] not in (None, 0, 0.0, "0", "0.0") else "--.-",
        "pres280": round(float(sensoresDt["pres280"]), 2) if sensoresDt["pres280"] not in (None, 0, 0.0, "0", "0.0") else "--.-",
        "hum280": round(float(sensoresDt["hum280"]), 2) if sensoresDt["hum280"] not in (None, 0, 0.0, "0", "0.0") else "--.-",

        "peso711": round(float(sensoresDt["peso711"]), 3) if sensoresDt["hum280"] not in (None, 0, 0.0, "0", "0.0") else "--.-",

        "valSonda1": round(float(sensoresDt["valSonda1"]), 2) if sensoresDt["valSonda1"] not in (None, 0, 0.0, "0", "0.0") else "--.-",
        "valSonda2": round(float(sensoresDt["valSonda2"]), 2) if sensoresDt["valSonda2"] not in (None, 0, 0.0, "0", "0.0") else "--.-",

        "alertaCalefactor": sensoresDt["alertaCalefactor"],
        "potCalefactor": sensoresDt["potCalefactor"],

        "msgSistema": sensoresDt["msgSistema"]
    })

@app.route("/api/tendencias", methods=["POST"])
def api_tendencias():
    datos = request.get_json()

    tend_json = agregarDtTemperatura(
        temp = datos.get("temp")
    )

    return jsonify({"tend_json": tend_json})

@app.route("/api/tendencias/limpiar", methods=["POST"])
def api_limpiarTendencias():
    limpiarDtTemperatura()
    clear = request.get_json()
    print("Limpiar datos:", clear)

@app.route("/api/nvlFototerapia", methods=["POST"])
def api_nvlFototerapia():
    nvlFototerapia = request.get_json()
    Fot = nvlFototerapia.get("nvlFototerapia")
    Exam = nvlFototerapia.get("nvlExam")

    if Exam:
        setNvlLuzExam(nvlFototerapia.get("nvlExam"))
    elif Fot:
        setNvlFototerapia(nvlFototerapia.get("nvlFototerapia"))

    return jsonify({"status": "ok"})

# @app.route("/api/saveOffset", methods=["POST"])
# def api_saveOffset():
#     tempAct = request.get_json().get("action")

#     if tempAct:
#         calibracion(tempAct)

#     return jsonify({"status": "ok"})

@app.route("/api/potCalef", methods=["POST"])
def api_potCalef():
    potCalef = request.get_json()
    PWM_Calef = potCalef.get("potCalef")

    if PWM_Calef is not None:
        set_PWM_Calef(int(PWM_Calef))

    return jsonify({"status": "ok"})

@app.route("/api/bascTar", methods=["POST"])
def api_bascTar():
    global pesoFinal

    tare_Provisional()
    pesoFinal = pesaje()

    return jsonify({"status": "ok"})

@app.route("/api/bascCalib", methods=["POST"])
def api_bascCalib():
    global pesoFinal

    calib_Provisional()
    pesoFinal = pesaje()

    if pesoFinal != 0.0:
        return jsonify({"status": "ok"})
    else:
        return jsonify({"status": "fail"})

@app.route("/api/bascPeso", methods=["POST"])
def api_pesaje():
    global pesoFinal

    pesoFinal = pesaje()
    print(pesoFinal)

    if pesoFinal != 0.0:
        return jsonify({"status": "ok"}), 200
    else:
        return jsonify({"status": "fail"}), 500

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
thread_pwrBtn = threading.Thread(target=pwrBtn_Evnt, daemon=True)
thread_pwrBtn.start()

thread_pwrLed = threading.Thread(target=blink_calib, daemon=True)
thread_pwrLed.start()

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