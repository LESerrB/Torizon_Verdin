import os
import time
import struct
from smbus2 import SMBus, i2c_msg   # I2C

from dotenv import load_dotenv
# from files.logs import logger

#===============================================================#
#                    Configuración I2C SHT21                    #
#===============================================================#
I2C_ADDR = 0x40                 # Dirección SHT21
CMD_MEASURE_TEMP = 0xF3         # Registro Temperatura
CMD_MEASURE_HUM = 0xF5          # Registro de Humedad

I2C_ADDR_2s = 0x30                 # Dirección Tarjeta 2a Sonda

# ===============================================================#
#               Configuración de offsets y escalas               #
# ===============================================================#
load_dotenv("/mnt/microsd/.env")
# logger.info('Inicializando SHT21')

OFFSET_TEMP = float(os.getenv("OFFSET_TEMP", -46.85))   # Offset de Temperatura
OFFSET_HUM = float(os.getenv("OFFSET_HUM", -6.0))       # Offset de Humedad
SCALE_TEMP = float(os.getenv("SCALE_TEMP", 175.72))     # Escala de Temperatura
SCALE_HUM = float(os.getenv("SCALE_HUM", 125.0))        # Escala de Humedad

#===============================================================#
#                   Funciones de lectura SHT21                  #
#===============================================================#
def read_sensor(bus, command, address):
    bus.write_byte(address, command)
    time.sleep(0.1)
    read = i2c_msg.read(address, 3)
    bus.i2c_rdwr(read)
    data = list(read)
    raw = (data[0] << 8) | data[1]
    raw &= ~0x0003

    return raw

def read_temperature(bus):
    raw = read_sensor(bus, CMD_MEASURE_TEMP, I2C_ADDR)
    temp_c = OFFSET_TEMP + (SCALE_TEMP * raw / 65536.0)

    return temp_c

def read_humidity(bus):
    raw = read_sensor(bus, CMD_MEASURE_HUM, I2C_ADDR)
    hum = OFFSET_HUM + (SCALE_HUM * raw / 65536.0)

    return hum

#===============================================================#
#             Funciones principales de lectura SHT21            #
#===============================================================#
def sht21():
    try:
        with SMBus(3) as bus: # 3 -> /dev/i2c-3
            temp = read_temperature(bus)
            hum = read_humidity(bus)
            th = struct.pack("ff", temp, hum)

            return th
    except Exception as e:
        # logger.error("Error de lectura SHT21:", e)
        print(f"Error de lectura: {e}")

def calibracion(tempAct):
    global OFFSET_TEMP
    lines = []
    # logger.info(f"Calibrando SHT21 con temperatura actual: {tempAct}")
    print(f"Calibrando SHT21 con temperatura actual: {tempAct}")

    with SMBus(3) as bus: # 3 -> /dev/i2c-3
        raw = read_sensor(bus, CMD_MEASURE_TEMP)
        newOFFSET = round(float(tempAct) - (SCALE_TEMP * raw / 65536.0), 2)
        OFFSET_TEMP = newOFFSET
        # logger.info(f"Nuevo OFFSET_TEMP: {OFFSET_TEMP}")
        print(f"Nuevo OFFSET_TEMP: {OFFSET_TEMP}")

    
    with open("/mnt/microsd/.env", "r") as f:
        for line in f:
            if line.startswith("OFFSET_TEMP="):
                lines.append(f"OFFSET_TEMP={OFFSET_TEMP}\n")
            else:
                lines.append(line)

    with open("/mnt/microsd/.env", "w") as f:
        f.writelines(lines)

def stop_sht21():
    try:
        with SMBus(3) as bus:
            bus.read_byte(I2C_ADDR)
            # logger.info("SHT21 desconectado correctamente")
    except Exception as e:
        print(f"No se pudo finalizar conexión con SHT21: {e}")
        # logger.warning(f"No se pudo finalizar conexión con SHT21: {e}")

#===============================================================#
#               Función de Prueba tarjeta 2a Sonda              #
#===============================================================#
def readTarjeta2S():
    try:
        with SMBus(3) as bus:
            p = read_sensor(bus, 0x55, I2C_ADDR_2s)
            print(p)
            p = read_sensor(bus, 0x33, I2C_ADDR_2s)
            print(p)
            p = read_sensor(bus, 0x44, I2C_ADDR_2s)
            print(p)
    except Exception as e:
        print(f"Error de lectura: {e}")