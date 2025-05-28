#!python

# import time
# import struct
from flask import Flask, render_template
import os

# from i2c.sht21 import sht21
# from spi.bme280 import bme280
# from gpio.hx711 import hx711
# from adc.hw504 import hw504

# if __name__ == '__main__':
#     while True:
#         #-------------------Sensor Humedad/Temperatutra-------------------#
#         temp, hum = struct.unpack("ff", sht21())
#         print(f"Temperatura: {temp:.2f} °C")
#         print(f"Humedad: {hum:.2f} %")
#         #---------------Sensor Presion/Humedad/Temperatura----------------#
#         temp280, pres280, hum280 = struct.unpack("fff", bme280())
#         print(f"Temp: {temp280:.2f} °C | Press: {pres280:.2f} hPa | Hum: {hum280:.2f} %")
#         #-----------------------------Bascula-----------------------------#
#         peso711 = hx711()
#         print(f"Peso: {peso711:.2f} unidades")
#         #-----------------------------Joystick----------------------------#
#         x_val, y_val, button_val = struct.unpack("iii", hw504())
#         print(f"X: {x_val} | Y: {y_val} | Btn: {button_val}")

#         time.sleep(1)

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", 'templates')
app = Flask(__name__, template_folder=template_dir)

@app.route("/")
def index():
    return render_template("index.html") #templates/index.html

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)