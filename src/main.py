#!python

import os
import threading
import time
import shutil

# # import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

from dev.Controles_Alertas import encoder as hw_encoder
from dev.Comunicacion import bascula as com_bascula

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
from dev.Comunicacion.TCD import com_TCD as TCD
from dev.Comunicacion.TCD import set_dtProg as dt_progTCD

#****************************************************************************#
#                           Configuracion Pag WEB                            #
#****************************************************************************#
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

edit_Ctrl = ""
val_Encd = 0
#--------------------- Valores Iniciales ---------------------#
valores_ctrl = {
    "tp_Prog":   35.0,      # Ajuste de Temperatura programada de Piel
    "ta_Prog":   37.0,      # Ajuste de Temperatura programada de Aire
    "pot_Ox":    60,        # Ajuste de Potencia de Oxigeno
    "pot_Hum":   50,        # Ajuste de Potencia de Humedad
    "pot_Fot":   1,         # Ajuste de Potencia de Fototerapia
    "pot_Calef": 100,       # Ajuste de Potencia de Calefactor
    "confirm":   False,     # Habilitación / Deshabilitación Encoder
    "sg_tp":     False,     # Sobregiro de Temperatura Piel
    "sg_ta":     False,     # Sobregiro de Temperatura Aire
}

#--------------------- Valores Sensados ----------------------#
vls_snsrsTCD = {
    "t_Aire" :    0,        # Tempertura Aire Sensada
    "t_Piel" :    0,        # Tempertura Piel Sensada
    "s_Aux" :     0,        # Tempertura Sonda Auxiliar
    "ta_Ctrl" :   0,        # Tempertura Aire Controlada
    "basc" :      0,        # Peso de Báscula
    "pot_Calef" : 0,        # Potencia Actual Calefactor
    "tp_Ctrl" :   0,        # Tempertura Programada de Calefactor
    "s_Ox" :      0,        # Sonda de Oxigeno
    "ox_Ctrl" :   0,        # Oxigeno Controlado
    "s_Hum" :     0,        # Sensor de Humedad
    "hum_Ctrl" :  0,        # Humedad Controlada
    "fot_Hrs" :   0,        # Horas Fototerapia
    "fot_Mins" :  0,        # Minutos Fototerapia
    "zero" :      0,
    "alrm" :      0,        # Alarmas
}

pesoTCD = 0

##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
@app.route("/")
def index():
    return render_template("home.html")

#----------------------------------------------------------------------------#
#                                  Sensores                                  #
#----------------------------------------------------------------------------#
@app.route("/api/setInitVals", methods=["POST"])
def setInitVals():
    return jsonify(
        {
            "vals": valores_ctrl,
            "status": "ok"
        }
    ), 200

@app.route("/api/getDtSensores", methods=["POST"])
def get_DtSensores():
    if vls_snsrsTCD["alrm"] != 128:
        return jsonify(
            {
                "vls_snsrsTCD": vls_snsrsTCD,
                "status": "ok",
            }
        ), 200
    else:
        return jsonify(
            {
                "status": "fail",
            }
        ), 400

@app.route("/api/enEdit", methods=["POST"])
def enEditCtrls():
    global edit_Ctrl, val_Encd

    ctrl = request.get_json()
    edit_Ctrl = ctrl.get("Ctrl")

    val_Encd = valores_ctrl[edit_Ctrl]
    valores_ctrl["confirm"] = ctrl.get("Enable")

    hw_encoder.valConfig(edit_Ctrl)

    return jsonify(
        {
            "status": "ok",
            "valor": valores_ctrl[edit_Ctrl],
        }
    ), 200

@app.route("/api/editValProg", methods=["POST"])
def ctrlEncd():
    try:
        global edit_Ctrl, val_Encd

        sg = "sg_" + edit_Ctrl[0:2]
        valores_ctrl[sg] = request.get_json().get(sg)

        if not valores_ctrl["confirm"]:
            monitor_pause.clear()               # Pausa monitoreo para enviar datos de control

            valores_ctrl[edit_Ctrl] = val_Encd
            dt_progTCD(valores_ctrl[edit_Ctrl], edit_Ctrl)

            monitor_pause.set()                 # Reinicio de Monitoreo

        return jsonify(
            {
                "status": "ok",
                "ctrl": edit_Ctrl,
                "val": val_Encd,
                "confirm": valores_ctrl["confirm"],
            }
        ), 200
    except:
        monitor_pause.set()                     # Reinicio de Monitoreo

        return jsonify(
            {
                "status": "fail"
            }
        ), 400

@app.route("/api/pesar", methods=["POST"])
def api_Pesaje():
    global pesoTCD

    # peso = round(com_bascula.pesaje(), 3)

    print(f"=======Fin Pesaje: {peso}=======")

    if peso != 999:
        pesoTCD = int(peso * 1000)

        if peso > 10:
            pesoTCD = int((peso - 7) * 1000)
            peso = round((pesoTCD/1000), 3)

        return jsonify({"status": "ok", "peso": peso}), 200
    else:
        return jsonify({"status": "fail"}), 400

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>#
#                            Funciones de sistema                            #
#<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<#
def sys_monitor():
    while True:
        monitor_pause.wait()
        restart_container()         # Memoria del contenedor

        TCD(vls_snsrsTCD)           # Envío de datos a la TCD

        time.sleep(0.1)

def restart_container(threshold=90):
    total, used, free = shutil.disk_usage("/")
    used_percent = (used / total) * 100

    if used_percent >= threshold:
        print("Espacio casi lleno, reiniciando contenedor...")
        # logger.warning('Espacio casi lleno, reiniciando contenedor...')
        os._exit(1)

def encoder_Reader():
    global edit_Ctrl, val_Encd
    hw_encoder.init_encoder()

    while True:
        if valores_ctrl["confirm"]:
            if edit_Ctrl == "tp_Prog" or edit_Ctrl == "ta_Prog":
                sg = "sg_" + edit_Ctrl[0:2]
                nuevo_val = hw_encoder.valEdit(val_Encd, valores_ctrl[sg])
            else:
                nuevo_val = hw_encoder.valEdit(val_Encd)

            if nuevo_val != val_Encd:
                val_Encd = nuevo_val

            valores_ctrl["confirm"] = hw_encoder.swAcept()

        time.sleep(0.005)

#============================================================================#
#                                    Hilos                                   #
#============================================================================#
monitor_pause = threading.Event()
monitor_pause.set()

monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

encoder_Thread = threading.Thread(target=encoder_Reader, daemon=True)
encoder_Thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)