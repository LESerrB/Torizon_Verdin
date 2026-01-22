#===============================================================#
#                      Configuración de ADC                     #
#===============================================================#
def read_adc(channel):
    try:
        with open(f"/sys/bus/iio/devices/iio:device0/in_voltage{channel}_raw", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        # logger.error(f"Canal ADC {channel} no encontrado.")
        print(f"Canal ADC {channel} no encontrado.")
        return -1

#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def mv_Joystick(adc_chn: int):
    try:
        return read_adc(adc_chn)
    except Exception as e:
        # logger.error("Error leyendo SONDA1:", e)
        # print(f"Error leyendo SONDA1: {e}")
        return 0
