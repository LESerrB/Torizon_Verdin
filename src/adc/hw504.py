import struct

from files.logs import logger

logger.info('Inicializando HW504')

#===============================================================#
#                   Configuración de ADC HW504                  #
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
def hw504():
    try:
        x_val = read_adc(0)  # VRx on ADC1_IN0 (SODIMM 8)
        y_val = read_adc(1)  # VRy on ADC1_IN1 (SODIMM 6)

        xy = struct.pack("iii", x_val, y_val)

        return xy
    except Exception as e:
        logger.error("Error leyendo HW504:", e)
        print(f"Error leyendo HW504: {e}")