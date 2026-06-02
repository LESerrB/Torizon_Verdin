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

from dev.Fototerapia.ctrl_Fot_Exam import setNvlFototerapia, setNvlLuzExam
from dev.Sensores_TPH.bme280 import bme280
from dev.Bascula.bascula import tare, calib, pesaje
from dev.GPIO.botones import pwrBtn_Evnt
from dev.GPIO.calefactor import ctrl_Calef, set_PWM_Calef, statusCom_Calef
from dev.GPIO.motores import ctrl_Motores, sm_chngModoOp, sm_ajstInclinacion
from dev.Sensores_TPH.sht21 import sht21

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
from dev.Controles_Alertas.alrt_alimentacion import monitoreo_alimentación
from dev.Controles_Alertas.encoder import valupdt
# from dev.Sensores_TPH.sns_IncBac import accel_Pos, calib_PosZero
# from dev.Sensores_TPH.sns_Ox import read_SnsOx
# from i2c.at18_T2s import readTarjeta2S

# calib_PosZero()
# calib_PosZero(0x69)
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
##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("home.html")


#--------------------------------------------------------------#
##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    global alertaSumEner

    while True:
        restart_container()                         # Memoria del contenedor
        # alertaSumEner = monitoreo_alimentación(2)   # Suministro de energía

        # lat1, frnt1, lat2, frnt2 = accel_Pos()
        # print(lat1, frnt1, "\n", lat2, frnt2)

        time.sleep(1)# 0.5

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