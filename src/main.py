#!python

import struct
from flask import Flask, render_template, jsonify
import os
# import gpiod

from i2c.sht21 import sht21
from spi.bme280 import bme280
from gpio.hx711 import hx711
from adc.hw504 import hw504
from files.tendencias import agregarDtTemperatura, leerDtTemperatura

# gpio_state = {"lightbulb": False}
# gpio_state2 = {"bell-button": True}

sensoresDt = {
    "temp": None,
    "hum": None,
    "temp280": None,
    "pres280": None,
    "hum280": None,
    "peso711": None,
    "x_val": None,
    "y_val": None
}

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/sensores")
def api_sensores():
    try:
        sensoresDt["temp"], sensoresDt["hum"] = struct.unpack("ff", sht21())
        sensoresDt["temp280"], sensoresDt["pres280"], sensoresDt["hum280"] = struct.unpack("fff", bme280())
        # peso711 = hx711()
        # x_val, y_val = struct.unpack("ii", hw504())
        # sensoresDt["hr"] = datetime.now().strftime("%H:%M")
    except Exception as e:
        print("Error leyendo sensores:", e)

    # print("Hr:", sensoresDt["hr"],
    #       "Temperatura:", sensoresDt["temp"], "°C")
        #   "Humedad:", sensoresDt["hum"], "%",
        #   "Temperatura BME280:", sensoresDt["temp280"], "°C",
        #   "Presión BME280:", sensoresDt["pres280"], "hPa",
        #   "Humedad BME280:", sensoresDt["hum280"], "%",
        #   "Peso HX711:", sensoresDt["peso711"], "g",
        #   "X Val:", sensoresDt["x_val"],
        #   "Y Val:", sensoresDt["y_val"])

    def fmt(val):
        return round(float(val), 1) if val is not None else None

    return jsonify({
        # "hr": sensoresDt["hr"],
        "temp": fmt(sensoresDt["temp"]),
        "hum": fmt(sensoresDt["hum"]),
        "temp280": fmt(sensoresDt["temp280"]),
        "pres280": fmt(sensoresDt["pres280"]),
        "hum280": fmt(sensoresDt["hum280"])
        # "peso711": fmt(peso711),
        # "x_val": fmt(x_val),
        # "y_val": fmt(y_val)
    })

# Pin       23      24
# GPIO      3       4
# SODIMM    210     212
# GPIOCHIP  4       4
# LINE      26      27
# @app.route("/api/lightbulb", methods=["POST"])
# def api_lightbulb():
#     gpio_state["lightbulb"] = not gpio_state["lightbulb"]
#     value = gpio_state["lightbulb"]

#     chip = gpiod.Chip("/dev/gpiochip4")

#     line_offset = 26
#     line = chip.get_line(line_offset)
#     line.request(consumer="lightbulb", type=gpiod.LINE_REQ_DIR_OUT)
#     line.set_value(1 if value else 0)
#     line.release()

#     return jsonify({"lightbulb": value})

# @app.route("/api/bellButton", methods=["POST"])
# def api_bellButton():
#     # print("Bell Button toggled")
#     gpio_state2["bell-button"] = not gpio_state2["bell-button"]
#     value = gpio_state2["bell-button"]

#     chip = gpiod.Chip("/dev/gpiochip4")

#     line_offset = 27
#     line = chip.get_line(line_offset)
#     line.request(consumer="bell-button", type=gpiod.LINE_REQ_DIR_OUT)
#     line.set_value(1 if value else 0)
#     line.release()

#     return jsonify({"bell-button": value})

@app.route('/api/tendencias')
def get_tendencias():
    agregarDtTemperatura(round(float(sensoresDt["temp"]), 1))

    return jsonify({
        "temp": round(float(sensoresDt["temp"]), 1)
    })

@app.route("/api/obtTemp")
def obtenerTemperatura():
    datosTemp = leerDtTemperatura()
    # print("Datos obtenidos:", datosTemp)

    return jsonify(datosTemp)

@app.route("/api/limpiarVariables", methods=["POST"])
def limparVariables():
    del sensoresDt
    print("Variables limpiadas")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)