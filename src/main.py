#!python

import struct
from flask import Flask, render_template, jsonify
import os

# from i2c.sht21 import sht21
# from spi.bme280 import bme280
# from gpio.hx711 import hx711
# from adc.hw504 import hw504

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "static")
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route("/")
def index():
    temp, hum = None, None
    temp280, pres280, hum280 = None, None, None
    peso711 = None
    x_val, y_val, button_val = None, None, None

    # try:
    #     temp, hum = struct.unpack("ff", sht21())
    #     temp280, pres280, hum280 = struct.unpack("fff", bme280())
    #     peso711 = hx711()
    #     x_val, y_val, button_val = struct.unpack("iii", hw504())
    # except Exception as e:
    #     print("Error leyendo sensores:", e)

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

    # try:
    #     temp, hum = struct.unpack("ff", sht21())
    #     temp280, pres280, hum280 = struct.unpack("fff", bme280())
    #     peso711 = hx711()
    #     x_val, y_val, button_val = struct.unpack("iii", hw504())
    # except Exception as e:
    #     print("Error leyendo sensores:", e)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)