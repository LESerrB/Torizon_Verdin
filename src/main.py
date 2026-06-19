#!python

import os
import threading
import time
import shutil

# # import logging

# from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from dataclasses import dataclass

# from files.logs import logger
# load_dotenv("/mnt/microsd/.env")
# logger.info('Encendido del sistema')

from collections import deque
from typing import Deque, Dict, Any

# from dev.Fototerapia.ctrl_Fot_Exam import setNvlFototerapia, setNvlLuzExam
# from dev.Sensores_TPH.bme280 import bme280
from dev.Bascula.bascula import tare, calib, pesaje
# from dev.GPIO.botones import pwrBtn_Evnt
# from dev.GPIO.calefactor import ctrl_Calef, set_PWM_Calef, statusCom_Calef
# from dev.GPIO.modoFunc import ctrl_Motores, sm_chngModoOp
# from dev.Sensores_TPH.sht21 import sht21

# from api.files.tendencias import agregarDtTemperatura, limpiarDtTemperatura
#------------------------- En Pruebas -------------------------#
from dev.Controles_Alertas.alrt_alimentacion import monitoreo_alimentación
from dev.Controles_Alertas import encoder as hw_encoder
from dev.Temperatura.sonda import read_Sonda

import serial

from api.com_UART import decode_Msg, encode_Msg

uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200
tcd_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)


encoder_events_lock = threading.Lock()
encoder_events: Deque[Dict[str, Any]] = deque(maxlen=200)
encoder_event_id = 0



# from dev.Sensores_TPH.sns_Ox import read_SnsOx
# from i2c.at18_T2s import readTarjeta2S
#--------------------------------------------------------------#

# ##############################################################################
# #                           Configuracion Pag WEB                            #
# ##############################################################################
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

#-------- Valores Iniciales --------#
W = b"\x00" * 10
pesoTCD = 0

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

@dataclass
class ControlState:
    tempProg: float = 34.0          # valor confirmado
    tempProgDraft: float = 34.0     # valor temporal mientras editas
    sobreGiro: bool = False
    editingTempProg: bool = False   # encoder habilitado para tempProg

state = ControlState()
state_lock = threading.Lock()

def clamp_round_temp(v: float, sobre_giro: bool) -> float:
    vmax = TEMP_MAX_SG if sobre_giro else TEMP_MAX
    v = max(TEMP_MIN, min(vmax, v))

    return round(v, 1)

def snapshot_state():
    return {
        "tempProg": round(state.tempProg, 1),
        "tempProgDraft": round(state.tempProgDraft, 1),
        "sobreGiro": bool(state.sobreGiro),
        "editingTempProg": bool(state.editingTempProg),
    }

def push_encoder_event(evt_type: str, payload: dict):
    global encoder_event_id
    with encoder_events_lock:
        encoder_event_id += 1
        encoder_events.append({
            "id": encoder_event_id,
            "type": evt_type,
            "ts": time.time(),
            "payload": payload,
        })

# ##############################################################################
# #                           Rutas de la aplicacion                           #
# ##############################################################################
@app.route("/")
def index():
    return render_template("home.html")

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

    return jsonify({"status": "ok", **s}), 200

@app.route("/api/sobreGiro", methods=["POST"])
def toggle_sobreGiro():
    body = request.get_json(force=True, silent=True) or {}

    with state_lock:
        if "enabled" in body:
            state.sobreGiro = bool(body["enabled"])
        else:
            state.sobreGiro = not state.sobreGiro

        state.tempProg = clamp_round_temp(state.tempProg, state.sobreGiro)
        s = snapshot_state()

    return jsonify({"status": "ok", **s}), 200

#>>>>>>>>>>>>>>>>>>>>>>>>> Encoder <<<<<<<<<<<<<<<<<<<<<<<<<<#
@app.route("/api/encoder/events", methods=["GET"])
def api_encoder_events():
    try:
        since = int(request.args.get("since", "0"))
    except ValueError:
        since = 0

    with encoder_events_lock:
        evts = [e for e in encoder_events if e["id"] > since]

    return jsonify({"status": "ok", "events": evts}), 200

@app.route("/api/tempProg/edit/start", methods=["POST"])
def start_tempProg_edit():
    global enableEdit, edit_started_temp

    monitor_pause.clear()

    with state_lock:
        s = snapshot_state()

    enableEdit = True
    edit_started_temp = state.tempProg
    s["tempProg"] = state.tempProg

    return jsonify({"status": "ok", **s}), 200

@app.route("/api/tempProg/edit/accept", methods=["POST"])
def accept_tempProg_edit():
    global enableEdit

    with state_lock:
        s = snapshot_state()

    enableEdit = False
    s["tempProg"] = state.tempProg
    p = int(state.tempProg * 10)
    p = f"{0:04}{0:04}{0:04}{p:04X}"
    encode_Msg(tcd_UART1, p)

    time.sleep(0.5)

    monitor_pause.set()

    print("La nueva temperatura programada es:", state.tempProg)
    return jsonify({"status": "ok", **s}), 200

@app.route("/api/tempProg/edit/cancel", methods=["POST"])
def cancel_tempProg_edit():
    global enableEdit, edit_started_temp

    with state_lock:
        s = snapshot_state()

    enableEdit = False
    state.tempProg = edit_started_temp
    s["tempProg"] = state.tempProg

    monitor_pause.set()

    print("Regresando a la temperatura anterior:", edit_started_temp)
    return jsonify({"status": "ok", **s}), 200
##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    # global alertaSumEner
    global W
    global pesoTCD

    while True:
        monitor_pause.wait()
        restart_container()                         # Memoria del contenedor
        # alertaSumEner = monitoreo_alimentación(2)   # Suministro de energía

# Comunicación temperatura
        encode_Msg(tcd_UART1, "55")
        Q, Q_len = decode_Msg(tcd_UART1)

        if (Q_len == 28) and (not (Q.hex().startswith("99") and Q.hex().endswith("00"))):
            W = Q

            t_Aire = int.from_bytes(W[0:2], byteorder="big")
            t_Piel = int.from_bytes(W[2:4], byteorder="big")
            s_Aux = int.from_bytes(W[4:6], byteorder="big")

            ta_Ctrl = int.from_bytes(W[6:8], byteorder="big")

            basc = int.from_bytes(W[8:10], byteorder="big")

            pot_Calef = int.from_bytes(W[10:12], byteorder="big")

            tp_Ctrl = int.from_bytes(W[12:14], byteorder="big")

            s_Ox = int.from_bytes(W[14:16], byteorder="big")
            ox_Ctrl = int.from_bytes(W[16:18], byteorder="big")

            s_Hum = int.from_bytes(W[18:20], byteorder="big")
            hum_Ctrl = int.from_bytes(W[20:22], byteorder="big")

            fot_Hrs = int.from_bytes(W[22:24], byteorder="big")
            fot_Mins = int.from_bytes(W[24:26], byteorder="big")

            zero = W[26]
            alrm = W[27]

            print(f"\n==>Trama: {W}\nTemp Aire: {t_Aire} \n Temp Piel: {t_Piel} \n Sonda Aux: {s_Aux} \n Temp Aire Ctrl: {ta_Ctrl} \n Bascula: {basc} \n Pot Cal: {pot_Calef} \n Temp Piel Ctrl: {tp_Ctrl} \n Sens O2: {s_Ox} \n O2 Ctrl: {ox_Ctrl} \n Sens Hum: {s_Hum} \n Hum Ctrl: {fot_Hrs} \n Fot Hrs: {fot_Mins} \n Fot Mins: {hum_Ctrl} \n Cero: {zero} \n Alarmas: {alrm}")


        # encode_Msg(tcd_UART1, TCD_trama)
        # pesaje()
        time.sleep(0.1)

def restart_container(threshold=90):
    total, used, free = shutil.disk_usage("/")
    used_percent = (used / total) * 100

    if used_percent >= threshold:
        print("Espacio casi lleno, reiniciando contenedor...")
        # logger.warning('Espacio casi lleno, reiniciando contenedor...')
        os._exit(1)

def encoder_loop():
    last_sent_temp = None

    while True:
        if enableEdit:
            with state_lock:
                cur_temp = float(state.tempProg)
                sg = bool(state.sobreGiro)

            try:
                new_temp, accepted = hw_encoder.valUpdt("temProg", cur_temp, sg)
            except Exception as e:
                time.sleep(0.1)
                continue

            changed = (new_temp != cur_temp)

            if changed:
                with state_lock:
                    state.tempProg = clamp_round_temp(new_temp, state.sobreGiro)
                    snap = snapshot_state()

                if last_sent_temp != snap["tempProg"]:
                    last_sent_temp = snap["tempProg"]
                    push_encoder_event("change", snap)

            if accepted:
                with state_lock:
                    snap = snapshot_state()

                push_encoder_event("accept", snap)

            time.sleep(0.01)

##############################################################################
#                                  Sensores                                  #
##############################################################################
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

    state.tempProg = int.from_bytes(W[6:8], byteorder='big') / 10

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

    return jsonify({
        "status": "ok",
        "temAire": t_Aire,
        "temPiel": t_Piel,
        "temSondaAux": s_Aux,
        "tempProg": state.tempProg,
        "kgs": 10,
        "sensOx": s_Ox,
        "sensHum": s_Hum,
    }), 200

@app.route("/api/pesar", methods=["POST"])
def api_Pesaje():
    global pesoTCD

    peso = round(pesaje(), 3)

    print(f"=======Fin Pesaje: {peso}=======")

    if peso != 999:
        pesoTCD = int(peso * 1000)

        if peso > 10:
            pesoTCD = int((peso - 7) * 1000)
            peso = round((pesoTCD/1000), 3)

        return jsonify({"status": "ok", "peso": peso}), 200
    else:
        return jsonify({"status": "fail"}), 400
#============================================================================#
#                                    Hilos                                   #
#============================================================================#
monitor_pause = threading.Event()
monitor_pause.set()

monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

thread_encoder = threading.Thread(target=encoder_loop, daemon=True)
thread_encoder.start()



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)