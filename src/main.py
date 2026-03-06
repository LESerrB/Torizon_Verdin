#!python

import os
import struct
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

from collections import deque
from typing import Deque, Dict, Any

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

#-------- Valores Iniciales --------#
tempProg = 34.0
sobreGiro = False

TEMP_MIN = 34.0
TEMP_MAX = 37.0
TEMP_MAX_SG = 38.0

pot_Calef = 100

nvlLuzExam = 0
nvlLuzFot = 0

pesoFinal = 0.0
strStatus = ""

alertaSumEner = ""
# ##############################################################################
# #                           Rutas de la aplicacion                           #
# ##############################################################################
@app.route("/")
def index():
    return render_template("index.html")



def clamp_round_temp(v: float, sobre_giro: bool) -> float:
    vmax = TEMP_MAX_SG if sobre_giro else TEMP_MAX
    v = max(TEMP_MIN, min(vmax, v))

    return round(v, 1)

@dataclass
class ControlState:
    tempProg: float = 34.0
    sobreGiro: bool = False

state = ControlState()
state_lock = threading.Lock()

def snapshot_state():
    return {
        "tempProg": round(state.tempProg, 1),
        "sobreGiro": bool(state.sobreGiro),
    }

def push_encoder_event(evt_type: str, payload: dict):
    global encoder_event_id
    with encoder_events_lock:
        encoder_event_id += 1
        encoder_events.append({
            "id": encoder_event_id,
            "type": evt_type,     # "change" | "accept"
            "ts": time.time(),
            "payload": payload,   # normalmente snapshot_state()
        })


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

        # Al cambiar sobreGiro, re-clamp de tempProg
        state.tempProg = clamp_round_temp(state.tempProg, state.sobreGiro)
        s = snapshot_state()

    return jsonify({"status": "ok", **s}), 200


@app.route("/api/encoder/events", methods=["GET"])
def api_encoder_events():
    """
    Poll simple: /api/encoder/events?since=<id>
    Devuelve eventos con id > since.
    """
    try:
        since = int(request.args.get("since", "0"))
    except ValueError:
        since = 0

    with encoder_events_lock:
        evts = [e for e in encoder_events if e["id"] > since]

    return jsonify({"status": "ok", "events": evts}), 200



def apply_encoder_delta_tempProg(delta: float):
    """Cuando metas encoder, tu hilo llamará a esto para modificar tempProg."""
    with state_lock:
        state.tempProg = clamp_round_temp(state.tempProg + delta, state.sobreGiro)



##############################################################################
#                            Funciones de sistema                            #
##############################################################################
def sys_monitor():
    # global alertaSumEner

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

def encoder_loop():
    """
    Lee el encoder y sincroniza tempProg con el state.
    Además emite eventos para que main.js haga console.log en accept.
    """
    last_sent_temp = None

    while True:
        # Snapshot de entrada
        with state_lock:
            cur_temp = float(state.tempProg)
            sg = bool(state.sobreGiro)

        # Lee encoder (no bloqueante en swAcept y con event_wait interno en clk)
        try:
            new_temp, accepted = hw_encoder.valUpdt("temProg", cur_temp, sg)
        except Exception as e:
            # Si falla GPIO por cualquier razón, evita tumbar el server
            # (puedes loggear con logger si lo tienes)
            time.sleep(0.1)
            continue

        changed = (new_temp != cur_temp)

        if changed:
            with state_lock:
                # Reaplica clamp por seguridad (tu clamp ya existe)
                state.tempProg = clamp_round_temp(new_temp, state.sobreGiro)
                snap = snapshot_state()

            # Evita spamear si rebota el mismo valor
            if last_sent_temp != snap["tempProg"]:
                last_sent_temp = snap["tempProg"]
                push_encoder_event("change", snap)

        if accepted:
            with state_lock:
                snap = snapshot_state()
            push_encoder_event("accept", snap)

        time.sleep(0.01)  # 10ms: suficientemente suave


#============================================================================#
#                                    Hilos                                   #
#============================================================================#
monitor_thread = threading.Thread(target=sys_monitor, daemon=True)
monitor_thread.start()

thread_encoder = threading.Thread(target=encoder_loop, daemon=True)
thread_encoder.start()



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)