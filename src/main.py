#!python

import struct
from flask import Flask, render_template, jsonify
import os
import gpiod

from i2c.sht21 import sht21
# from spi.bme280 import bme280
from gpio.hx711 import hx711
# from adc.hw504 import hw504

gpio_state = {"lightbulb": False}
gpio_state2 = {"bell-button": True}

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route("/")
def index():
    temp, hum = None, None
    temp280, pres280, hum280 = None, None, None
    peso711 = None
    x_val, y_val, button_val = None, None, None

    try:
        temp, hum = struct.unpack("ff", sht21())
    #     temp280, pres280, hum280 = struct.unpack("fff", bme280())
        peso711 = hx711()
    #     x_val, y_val, button_val = struct.unpack("iii", hw504())
    except Exception as e:
        print("Error leyendo sensores:", e)

    def fmt(val):
        return round(float(val), 2) if val is not None else None

    return render_template(
        "index.html",
        temp = fmt(temp),
        hum = fmt(hum),
        temp280 = fmt(temp280),
        pres280 = fmt(pres280),
        hum280 = fmt(hum280),
        peso711 = fmt(peso711),
        x_val = fmt(x_val),
        y_val = fmt(y_val),
        button_val = fmt(button_val)
    )

@app.route("/api/sensores")
def api_sensores():
    temp, hum = None, None
    temp280, pres280, hum280 = None, None, None
    peso711 = None
    x_val, y_val, button_val = None, None, None

    try:
        temp, hum = struct.unpack("ff", sht21())
    #     temp280, pres280, hum280 = struct.unpack("fff", bme280())
        peso711 = hx711()
    #     x_val, y_val, button_val = struct.unpack("iii", hw504())
    except Exception as e:
        print("Error leyendo sensores:", e)

    print("Temperatura:", temp, "°C")
    print("Humedad:", hum, "%")
    print("Temperatura BME280:", temp280, "°C")
    print("Presión BME280:", pres280, "hPa")
    print("Humedad BME280:", hum280, "%")
    print("Peso HX711:", peso711, "g")
    print("X Val:", x_val)
    print("Y Val:", y_val)
    print("Button Val:", button_val)

    def fmt(val):
        return round(float(val), 2) if val is not None else None

    return jsonify({
        "temp": fmt(temp),
        "hum": fmt(hum),
        "temp280": fmt(temp280),
        "pres280": fmt(pres280),
        "hum280": fmt(hum280),
        "peso711": fmt(peso711),
        "x_val": fmt(x_val),
        "y_val": fmt(y_val),
        "button_val": fmt(button_val)
    })

# Pin       23      24
# GPIO      3       4
# SODIMM    210     212
# GPIOCHIP  4       4
# LINE      26      27
@app.route("/api/lightbulb", methods=["POST"])
def api_lightbulb():
    gpio_state["lightbulb"] = not gpio_state["lightbulb"]
    value = gpio_state["lightbulb"]

    chip = gpiod.Chip("/dev/gpiochip4")

    line_offset = 26
    line = chip.get_line(line_offset)
    line.request(consumer="lightbulb", type=gpiod.LINE_REQ_DIR_OUT)
    line.set_value(1 if value else 0)
    line.release()

    return jsonify({"lightbulb": value})


@app.route("/api/bellButton", methods=["POST"])
def api_bellButton():
    # print("Bell Button toggled")
    gpio_state2["bell-button"] = not gpio_state2["bell-button"]
    value = gpio_state2["bell-button"]

    chip = gpiod.Chip("/dev/gpiochip4")

    line_offset = 27
    line = chip.get_line(line_offset)
    line.request(consumer="bell-button", type=gpiod.LINE_REQ_DIR_OUT)
    line.set_value(1 if value else 0)
    line.release()

    return jsonify({"bell-button": value})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)