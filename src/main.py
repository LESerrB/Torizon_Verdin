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
# from dev.Comunicacion import bascula as com_bascula

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
# from dev.Controles_Alertas.alrt_alimentacion import monitoreo_alimentación

# import serial

# from api.com_UART import decode_Msg, encode_Msg

# uart_Channel = "/dev/verdin-uart1"
# baud_rate = 115200
# tcd_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

# ##############################################################################
# #                           Configuracion Pag WEB                            #
# ##############################################################################
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
#--------------------- Valores Iniciales ---------------------#
valores_ctrl = {
    "tp_Prog": 34.0,        # Ajuste de Temperatura programada de Piel
    "ta_Prog": 35.0,        # Ajuste de Temperatura programada de Aire
    "pot_Ox": 60,           # Ajuste de Potencia de Oxigeno
    "pot_Hum": 50,          # Ajuste de Potencia de Humedad
    "pot_Fot": 30,          # Ajuste de Potencia de Fototerapia
    "pot_Calef": 100,       # Ajuste de Potencia de Calefactor
    "confirm": False        # Habilitación / Deshabilitación Encoder
}

W = b"\x00" * 10
pesoTCD = 0

# ##############################################################################
# #                           Rutas de la aplicacion                           #
# ##############################################################################
@app.route("/")
def index():
    return render_template("home.html")

##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    global W
    global pesoTCD

    while True:
        monitor_pause.wait()
        restart_container()                         # Memoria del contenedor

        # Comunicación TCD
        # encode_Msg(tcd_UART1, "55")
        # Q, Q_len = decode_Msg(tcd_UART1)

        # if (Q_len == 28) and (not (Q.hex().startswith("99") and Q.hex().endswith("00"))):
        #     W = Q

        #     t_Aire = int.from_bytes(W[0:2], byteorder="big")
        #     t_Piel = int.from_bytes(W[2:4], byteorder="big")
        #     s_Aux = int.from_bytes(W[4:6], byteorder="big")

        #     ta_Ctrl = int.from_bytes(W[6:8], byteorder="big")

        #     basc = int.from_bytes(W[8:10], byteorder="big")

        #     pot_Calef = int.from_bytes(W[10:12], byteorder="big")

        #     tp_Ctrl = int.from_bytes(W[12:14], byteorder="big")

        #     s_Ox = int.from_bytes(W[14:16], byteorder="big")
        #     ox_Ctrl = int.from_bytes(W[16:18], byteorder="big")

        #     s_Hum = int.from_bytes(W[18:20], byteorder="big")
        #     hum_Ctrl = int.from_bytes(W[20:22], byteorder="big")

        #     fot_Hrs = int.from_bytes(W[22:24], byteorder="big")
        #     fot_Mins = int.from_bytes(W[24:26], byteorder="big")

        #     zero = W[26]
        #     alrm = W[27]

            # print(f"\n==>Trama: {W}\nTemp Aire: {t_Aire} \n Temp Piel: {t_Piel} \n Sonda Aux: {s_Aux} \n Temp Aire Ctrl: {ta_Ctrl} \n Bascula: {basc} \n Pot Cal: {pot_Calef} \n Temp Piel Ctrl: {tp_Ctrl} \n Sens O2: {s_Ox} \n O2 Ctrl: {ox_Ctrl} \n Sens Hum: {s_Hum} \n Hum Ctrl: {fot_Hrs} \n Fot Hrs: {fot_Mins} \n Fot Mins: {hum_Ctrl} \n Cero: {zero} \n Alarmas: {alrm}")

        time.sleep(0.1)

def restart_container(threshold=90):
    total, used, free = shutil.disk_usage("/")
    used_percent = (used / total) * 100

    if used_percent >= threshold:
        print("Espacio casi lleno, reiniciando contenedor...")
        # logger.warning('Espacio casi lleno, reiniciando contenedor...')
        os._exit(1)

def encoder_Reader():
    global edit_Ctrl
    hw_encoder.init_encoder()

    while True:
        if valores_ctrl["confirm"]:
            nuevo_val = hw_encoder.valEdit(valores_ctrl[edit_Ctrl])

            if nuevo_val != valores_ctrl[edit_Ctrl]:
                valores_ctrl[edit_Ctrl] = nuevo_val

            valores_ctrl["confirm"] = hw_encoder.swAcept()

        time.sleep(0.005)

##############################################################################
#                                  Sensores                                  #
##############################################################################
@app.route("/api/setInitVals", methods=["POST"])
def setInitVals():
    return jsonify(
        {
            "vals": valores_ctrl,
            "status": "ok"
        }
    ), 200

@app.route("/api/getTemp", methods=["POST"])
def getTempPiel():
    global W

    if not isinstance(W, (bytes, bytearray)) or len(W) < 10:
        return jsonify({
            "status": "fail"
        }), 400

    t_Aire = int.from_bytes(W[0:2], byteorder='big') / 10
    t_Piel = int.from_bytes(W[2:4], byteorder='big') / 10
    s_Aux = int.from_bytes(W[4:6], byteorder="big") / 10

    # ta_Ctrl = int.from_bytes(W[6:8], byteorder="big")

    # basc = int.from_bytes(W[8:10], byteorder="big")+-

    # pot_Calef = int.from_bytes(W[10:12], byteorder="big")

    # tp_Ctrl = int.from_bytes(W[12:14], byteorder="big")

    s_Ox = int.from_bytes(W[14:16], byteorder="big")
    # ox_Ctrl = int.from_bytes(W[16:18], byteorder="big")

    s_Hum = int.from_bytes(W[18:20], byteorder="big")
    # hum_Ctrl = int.from_bytes(W[20:22], byteorder="big")

    # fot_Hrs = int.from_bytes(W[22:24], byteorder="big")
    # fot_Mins = int.from_bytes(W[24:26], byteorder="big")

    return jsonify(
        {
            "status": "ok",
            "temAire": t_Aire,
            "temPiel": t_Piel,
            "temSondaAux": s_Aux,
            "kgs": 10,
            "sensOx": s_Ox,
            "sensHum": s_Hum,
        }
    ), 200

@app.route("/api/pesar", methods=["POST"])
def api_Pesaje():
    global pesoTCD

    # peso = round(com_bascula.pesaje(), 3)

    # print(f"=======Fin Pesaje: {peso}=======")

    # if peso != 999:
    #     pesoTCD = int(peso * 1000)

    #     if peso > 10:
    #         pesoTCD = int((peso - 7) * 1000)
    #         peso = round((pesoTCD/1000), 3)

    #     return jsonify({"status": "ok", "peso": peso}), 200
    # else:
    return jsonify({"status": "fail"}), 400

@app.route("/api/enEdit", methods=["POST"])
def enEditCtrls():
    global edit_Ctrl

    ctrl = request.get_json()

    edit_Ctrl = ctrl.get("Ctrl")
    hw_encoder.valConfig(edit_Ctrl)
    valores_ctrl["confirm"] = ctrl.get("Enable")

    return jsonify(
        {
            "status": "ok"
        }
    ), 200

@app.route("/api/editValProg", methods=["POST"])
def ctrlEncd():
    try:
        global edit_Ctrl

        # No se que haga esto pero ahi va
        # if valores_ctrl["confirm"] == False:
        #     tdc_s = f"{int(valores_ctrl['tp_Prog'] * 10):04x}"
            # encode_Msg(tcd_UART1, tdc_s)

        return jsonify(
            {
                "status": "ok",
                "val": valores_ctrl[edit_Ctrl],
                "confirm": valores_ctrl["confirm"],
            }
        ), 200
    except:
        return jsonify(
            {
                "status": "fail"
            }
        ), 400

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