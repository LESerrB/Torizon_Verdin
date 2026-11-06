#!python

import os
import threading
import time
import shutil
import serial

# # import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
from dev.Controles_Alertas import encoder as hw_encoder
from dev.Comunicacion import bascula as com_bascula
from dev.Fototerapia.ctrl_Fot_Exam import setNvlLuzExam as lvlFot
from dev.Fototerapia.ctrl_Fot_Exam import setNvlFototerapia as lvlLExam
from dev.Comunicacion.TCD import (
    com_TCD,
    process_TCD_responses,
    start_TCD_communication,
)

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

#--------------------- TCI ---------------------#
uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200
tcd_UART1 = serial.Serial(
    uart_Channel,
    baud_rate,
    8,
    'N',
    1,
    timeout = 0.05,
    write_timeout = 0.5
)

edit_Ctrl = ""
val_Encd = 0
#--------------------- Valores Iniciales ---------------------#
valores_ctrl = {
    "tp_Prog":   35.0,      # Ajuste de Temperatura programada de Piel
    "ta_Prog":   37.0,      # Ajuste de Temperatura programada de Aire
    "pot_Ox":    60,        # Ajuste de Potencia de Oxigeno
    "pot_Hum":   50,        # Ajuste de Potencia de Humedad
    "pot_Fot":   1,         # Ajuste de Potencia de Fototerapia
    "pot_Clf":   100,       # Ajuste de Potencia de Calefactor
    "confirm":   False,     # Habilitación / Deshabilitación Encoder
    "sg_tp":     False,     # Sobregiro de Temperatura Piel
    "sg_ta":     False,     # Sobregiro de Temperatura Aire
}

modos = {
    "ctrl":      "tPiel",        # Modo de Control (Piel / Aire / Manual)
    "op":        "Incubadora",   # Modo de Operación (Incubadora / Cuna)
}

#--------------------- Valores Sensados ----------------------#
vls_snsTCD = {
    "t_Aire":    0,         # Tempertura Aire Sensada
    "t_Piel":    0,         # Tempertura Piel Sensada
    "s_Aux":     0,         # Tempertura Sonda Auxiliar
    "ta_Prog":   0,         # Tempertura Aire Controlada
    "basc":      0,         # Peso de Báscula
    "pot_Clf":   0,         # Potencia Actual Calefactor
    "tp_Prog":   0,         # Tempertura Programada de Piel
    "s_Ox":      0,         # Sonda de Oxigeno
    "pot_Ox":    0,         # Oxigeno Controlado
    "s_Hum":     0,         # Sensor de Humedad
    "pot_Hum":   0,         # Humedad Controlada
    "fot_Hrs":   0,         # Horas Fototerapia
    "fot_Mins":  0,         # Minutos Fototerapia
    "zero":      0,
    "alrm":      0,         # Alarmas
}

pesoTCD = 0

##############################################################################
#                           Rutas de la aplicacion                           #
##############################################################################
lvlLExam(0)

@app.route("/")
def index():
    return render_template("home.html")

#----------------------------------------------------------------------------#
#                                  Sensores                                  #
#----------------------------------------------------------------------------#
@app.route("/api/setInitVals", methods=["POST"])
def setInitVals():
    updateVals = request.get_json()

    ctrl = updateVals.get("modCtrl")
    op = updateVals.get("modOp")

    if (ctrl):
        modos["ctrl"] = ctrl

    if (op):
        modos["op"] = op

    return jsonify(
        {
            "vals": valores_ctrl,
            "modos": modos,
            "status": "ok"
        }
    ), 200

@app.route("/api/getDtSensores", methods=["POST"])
def get_DtSensores():
    try:
        if vls_snsTCD["alrm"] != 128:
            # t_Aire = vls_snsrsTCD["t_Aire"] if 0 < vls_snsrsTCD["t_Aire"] < 50.0 else "--.-"
            # s_Hum = vls_snsrsTCD["s_Hum"] if 0 < vls_snsrsTCD["s_Hum"] < 100.0 else "--.-"
            # t_Piel = vls_snsrsTCD["t_Piel"] if 0 < vls_snsrsTCD["t_Piel"] < 40.0 else "--.-"
            # s_Aux = vls_snsrsTCD["s_Aux"] if 0 < vls_snsrsTCD["s_Aux"] < 40.0 else "--.-"
            # pot_Clf = vls_snsrsTCD["pot_Clf"] if 0 < vls_snsrsTCD["pot_Clf"] < 100 else "--.-"
            # s_Ox = vls_snsrsTCD["s_Ox"] if 0 < vls_snsrsTCD["s_Ox"] < 100 else "--.-"

            # vls_snsrsTCD["t_Aire"] = t_Aire
            # vls_snsrsTCD["s_Hum"] = s_Hum
            # vls_snsrsTCD["t_Piel"] = t_Piel
            # vls_snsrsTCD["s_Aux"] = s_Aux
            # vls_snsrsTCD["pot_Clf"] = pot_Clf
            # vls_snsrsTCD["s_Ox"] = s_Ox

            return jsonify(
                {
                    "vls_snsrsTCD": vls_snsTCD,
                    "modos": modos,
                    "status": "ok",
                }), 200
    except Exception as error:
        print(error)

        return jsonify(
            {
                "modos": modos,
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

        data = request.get_json() or {}

        if edit_Ctrl in ("tp_Prog", "ta_Prog"):
            sg = "sg_" + edit_Ctrl[0:2]

            prev_edoSG = bool(valores_ctrl.get(sg, False))
            nuevo_edoSG = bool(data.get(sg, prev_edoSG))

            valores_ctrl[sg] = nuevo_edoSG

            if prev_edoSG and not nuevo_edoSG and val_Encd > 37.0:
                val_Encd = 37.0

        if not valores_ctrl["confirm"]:
            try:
                if edit_Ctrl == "pot_Fot":
                    lvlFot((val_Encd * 33) + 1)
                    lvlLExam((val_Encd * 33) + 1)
                else:
                    valores_ctrl[edit_Ctrl] = val_Encd
                    com_TCD(vls_snsTCD, val_Encd, b'\xAA', edit_Ctrl)
            except Exception as e:
                print(e)

        # print(val_Encd)
        return jsonify(
            {
                "status": "ok",
                "ctrl": edit_Ctrl,
                "val": val_Encd,
                "confirm": valores_ctrl["confirm"],
            }), 200
    except Exception as error:
                print(f"Error en ctrlEncd: {error}")

                return jsonify(
                    {
                        "status": "fail",
                        "error": str(error),
                    }), 400

@app.route("/api/ctrlLights", methods=["POST"])
def ctrl_Lights():
    ctrl = request.get_json().get('pot')

    lvlFot((ctrl * 33 ) + 1)
    lvlLExam((ctrl * 33 ) + 1)

    return jsonify(
        {
            "status": "ok",
        }
    ), 200

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

        return jsonify(
            {
                "status": "ok",
                "peso": peso
            }
        ), 200
    else:
        return jsonify(
            {
                "status": "fail"
            }
        ), 400

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>#
#                            Funciones de sistema                            #
#<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<#
def sys_monitor():
    while True:
        restart_container()           # Memoria del contenedor

        com_TCD(vls_snsTCD, b'\x55')  # Envío de datos a la TCD

        time.sleep(0.5)

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
monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

encoder_Thread = threading.Thread(target=encoder_Reader, daemon=True)
encoder_Thread.start()

start_TCD_communication(tcd_UART1)

tcd_response_thread = threading.Thread(target=process_TCD_responses, daemon=True, name="TCD-Response-Processor",)
tcd_response_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False, use_reloader=False,)