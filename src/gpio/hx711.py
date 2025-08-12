import time
import gpiod                        # GPIO
import os

from dotenv import load_dotenv
# from files.logs import logger

#===============================================================#
#               Configuración GPIO Serial HX711                 #
#===============================================================#
dout_chip_path = "/dev/gpiochip2"       # GPIO1_IO04 (SODIMM_206)
sck_chip_path = "/dev/gpiochip4"        # GPIO2_IO05 (SODIMM_208)
PIN_DOUT = 4
PIN_SCK = 5

# Inicializar chips
gpio_chip_dout = gpiod.Chip(dout_chip_path)
gpio_chip_sck = gpiod.Chip(sck_chip_path)

# Obtener líneas individuales
dout_line = gpio_chip_dout.get_line(PIN_DOUT)
sck_line = gpio_chip_sck.get_line(PIN_SCK)

# Solicitar acceso
dout_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_IN)
sck_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_OUT)

#================================================================#
#               Configuración de offsets y escalas               #
#================================================================#
load_dotenv("/mnt/microsd/.env")
# logger.info('Inicializando HX711')

SCALE = float(os.getenv("SCALE", 1.0))
OFFSET = float(os.getenv("OFFSET", 0.0))

#===============================================================#
#                   Funciones de lectura HX711                  #
#===============================================================#
def read_raw():
    while dout_line.get_value() == 1:
        time.sleep(0.001)

    count = 0

    for _ in range(24):
        sck_line.set_value(1)
        count = count << 1
        sck_line.set_value(0)

        if dout_line.get_value():
            count += 1

    sck_line.set_value(1)
    sck_line.set_value(0)

    if count & 0x800000:
        count |= ~0xffffff

    return count

def read_weight():
    raw = read_raw()
    weight = (raw - OFFSET) / SCALE

    return weight
#===============================================================#
#                    Función de Taraje HX711                    #
#===============================================================#
def tare():
    global OFFSET
    lines = []
    OFFSET = read_weight()

    with open("/mnt/microsd/.env", "r") as f:
        for line in f:
            if line.startswith("OFFSET="):
                lines.append(f"OFFSET={OFFSET}\n")
            else:
                lines.append(line)

    with open("/mnt/microsd/.env", "w") as f:
        f.writelines(lines)

    # logger.info(f"Taraje realizado. Nuevo offset: {OFFSET}")
    print(f"Taraje realizado. Nuevo offset: {OFFSET}")

#===============================================================#
#               Función principal de lectura HX711              #
#===============================================================#
def hx711():
    try:
        w = read_weight()

        if 0 < w < 100:
            return w
    except Exception as e:
        dout_line.release()
        sck_line.release()
        gpio_chip_dout.close()
        gpio_chip_sck.close()

        # logger.error("Error de lectura HX711:", e)
        print(f"Error de lectura: {e}")

#===============================================================#
#                  Función de calibración HX711                 #
#===============================================================#
def calibracion(pesoAct):
    global SCALE
    lines = []

    # logger.info(f"Calibrando HX711 con peso actual: {pesoAct}")
    print(f"Calibrando HX711 con peso actual: {pesoAct}")

    raw = read_raw()
    newSCALE = round(float(pesoAct) / (raw - OFFSET), 2)
    SCALE = newSCALE
    # logger.info(f"Nuevo SCALE: {SCALE}")
    print(f"Nuevo SCALE: {SCALE}")

    with open("/mnt/microsd/.env", "r") as f:
        for line in f:
            if line.startswith("SCALE="):
                lines.append(f"SCALE={SCALE}\n")
            else:
                lines.append(line)

    with open("/mnt/microsd/.env", "w") as f:
        f.writelines(lines)

#===============================================================#
#                   Función para Detener HX711                  #
#===============================================================#
def stop_hx711():
    try:
        # logger.info("Liberando recursos de HX711")
        dout_line.release()
        sck_line.release()
        gpio_chip_dout.close()
        gpio_chip_sck.close()
        print("HX711 detenido correctamente")
    except Exception as e:
        # logger.error(f"Error al detener HX711: {e}")
        print(f"Error al detener HX711: {e}")