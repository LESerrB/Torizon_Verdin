#!python

import time
import struct

from temperatura.sht21 import sht21
from presion.bme280 import bme280
from bascula.hx711 import hx711

if __name__ == '__main__':
    while True:
        #-------------------SHT21-------------------#
        temp, hum = struct.unpack("ff", sht21())
        print(f"Temperatura: {temp:.2f} °C")
        print(f"Humedad: {hum:.2f} %")
        #------------------BME280-------------------#
        temp280, pres280, hum280 = struct.unpack("fff", bme280())
        print(f"Temp: {temp280:.2f} °C | Press: {pres280:.2f} hPa | Hum: {hum280:.2f} %")
        #------------------HX711--------------------#
        peso711 = hx711()
        print(f"Peso: {peso711:.2f} unidades")

        time.sleep(1)
