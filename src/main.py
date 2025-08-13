#!python

import os
import struct
import threading
import time
import shutil
# import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request

from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

from i2c.sht21 import sht21, calibracion, readTarjeta2S
from spi.bme280 import bme280
from gpio.hx711 import hx711
from gpio.pwr import pwrBtn
from adc.sonda import read_Sonda, read_Sonda2, calib_Sonda
from pwm.pwm import setNvlFototerapia, setNvlLuzExam
from files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
from uart.ttl232rg import uart_send, uart_receive, close_uart

##############################################################################
#                           Configuracion de Flask                           #
##############################################################################
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

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
        "valSonda2": None
    }

    try:
        # sensoresDt["temp"], sensoresDt["hum"] = struct.unpack("ff", sht21())
        sensoresDt["temp280"], sensoresDt["pres280"], sensoresDt["hum280"] = struct.unpack("fff", bme280())
        sensoresDt["peso711"] = hx711()
        sensoresDt["valSonda1"] = read_Sonda()
        sensoresDt["valSonda2"] = read_Sonda2()
    except Exception as e:
        # logger.error("Error leyendo sensores:", e)
        print("Error leyendo sensores:", e)

    def fmt(val):
        return round(float(val), 1) if val is not None else None

    return jsonify({
        "temp": fmt(sensoresDt["temp"]),
        "hum": fmt(sensoresDt["hum"]),
        "temp280": fmt(sensoresDt["temp280"]),
        "pres280": fmt(sensoresDt["pres280"]),
        "hum280": fmt(sensoresDt["hum280"]),
        "peso711": fmt(sensoresDt["peso711"]),
        "valSonda1": fmt(sensoresDt["valSonda1"]),
        "valSonda2": fmt(sensoresDt["valSonda2"])
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

@app.route("/api/saveOffset", methods=["POST"])
def api_saveOffset():
    tempAct = request.get_json().get("action")

    if tempAct:
        calibracion(tempAct)

    return jsonify({"status": "ok"})

##############################################################################
#                            Funciones de sistema                            #
##############################################################################
pwrBtn()
readTarjeta2S()

# for i in range(10):
#     time.sleep(0.5)
#     uart_send('A')
#     time.sleep(0.5)
#     uart_receive()
# close_uart()

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

monitor_thread = threading.Thread(target=monitor_disk, daemon=True)
monitor_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)