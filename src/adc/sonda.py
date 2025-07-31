import struct
import math
import os

from files.logs import logger
from dotenv import load_dotenv

logger.info('Inicializando ADC')
load_dotenv("/mnt/microsd/.env")

# Variables Calibracion Sonda Patron
a0 = float(os.getenv("A0", 0.001319224))
b0 = float(os.getenv("B0", 0.000216279))
c0 = float(os.getenv("C0", 0.000000181))

a1 = float(os.getenv("A0", 0.001319224))
b1 = float(os.getenv("B0", 0.000216279))
c1 = float(os.getenv("C0", 0.000000181))
#===============================================================#
#                      Configuración de ADC                     #
#===============================================================#
def read_adc(channel):
    try:
        with open(f"/sys/bus/iio/devices/iio:device0/in_voltage{channel}_raw", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        logger.error(f"Canal ADC {channel} no encontrado.")
        print(f"Canal ADC {channel} no encontrado.")
        return -1

#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def read_Sonda():
    try:
        valSonda1 = round(4300 * ((1800/read_adc(0)) - 1))  # ADC1_IN0 (SODIMM 8), 4300 ohms de resistencia referencia, 1800 fuente de voltaje de la tarjeta
        logaritmo=math.log(valSonda1)
        temperatura = 1/(a0 + b0 * (logaritmo) + c0 * (pow(logaritmo, 3)))
        tempSonda = temperatura - 273

        return tempSonda
    except Exception as e:
        logger.error("Error leyendo SONDA1:", e)
        print(f"Error leyendo SONDA1: {e}")

def read_Sonda2():
    try:
        valSonda2 = round(4300 * ((1800/read_adc(1)) - 1))  # ADC1_IN0 (SODIMM 8)
        logaritmo=math.log(valSonda2)
        temperatura = 1/(a0 + b0 * (logaritmo) + c0 * (pow(logaritmo, 3)))
        tempSonda2 = temperatura - 273
        
        return tempSonda2
    except Exception as e:
        logger.error("Error leyendo SONDA2:", e)
        print(f"Error leyendo SONDA2: {e}")

#================================================================#
#                       Calibración Sondas                       #
#================================================================#
def calib_Sonda(sonda_patron = 36+273):
    global a0
    lines = []

    valSonda1 = round(4300 * ((1800/read_adc(0)) - 1))
    logaritmo=math.log(valSonda1)

    a0 = round(1/sonda_patron - (b0 * logaritmo) - (c0 * (pow(logaritmo, 3))), 9)

    with open("/mnt/microsd/.env", "r") as f:
        for line in f:
            if line.startswith("A0="):
                lines.append(f"A0={a0}\n")
            else:
                lines.append(line)

    with open("/mnt/microsd/.env", "w") as f:
        f.writelines(lines)