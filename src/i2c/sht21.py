import time
import struct
from smbus2 import SMBus, i2c_msg   # I2C
import os
from dotenv import load_dotenv

# ===============================================================#
#                    Configuración I2C SHT21                     #
# ===============================================================#
I2C_ADDR = 0x40                 # Dirección SHT21
CMD_MEASURE_TEMP = 0xF3         # Registro Temperatura
CMD_MEASURE_HUM = 0xF5          # Registro de Humedad

# ===============================================================#
#                  Configuración de offsets y escalas            #
# ===============================================================#
load_dotenv("/mnt/microsd/.env")
OFFSET_TEMP = float(os.getenv("OFFSET_TEMP", -46.85))   # Offset de Temperatura
OFFSET_HUM = float(os.getenv("OFFSET_HUM", -6.0))       # Offset de Humedad
SCALE_TEMP = float(os.getenv("SCALE_TEMP", 175.72))     # Escala de Temperatura
SCALE_HUM = float(os.getenv("SCALE_HUM", 125.0))        # Escala de Humedad

# ===============================================================#
#                   Funciones de lectura SHT21                   #
# ===============================================================#
def read_sensor(bus, command):
    bus.write_byte(I2C_ADDR, command)
    time.sleep(0.1)
    read = i2c_msg.read(I2C_ADDR, 3)
    bus.i2c_rdwr(read)
    data = list(read)
    raw = (data[0] << 8) | data[1]
    raw &= ~0x0003
    return raw

def read_temperature(bus):
    raw = read_sensor(bus, CMD_MEASURE_TEMP)
    temp_c = OFFSET_TEMP + (SCALE_TEMP * raw / 65536.0)
    return temp_c

def read_humidity(bus):
    raw = read_sensor(bus, CMD_MEASURE_HUM)
    hum = OFFSET_HUM + (SCALE_HUM * raw / 65536.0)
    return hum

def sht21():
    try:
        with SMBus(3) as bus: # 3 -> /dev/i2c-3
            temp = read_temperature(bus)
            hum = read_humidity(bus)
            th = struct.pack("ff", temp, hum)

            return th
    except Exception as e:
        print(f"Error de lectura: {e}")
