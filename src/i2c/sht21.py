import time
import struct
from smbus2 import SMBus, i2c_msg   # I2C

# ===============================================================#
#                    Configuración I2C SHT21                     #
# ===============================================================#
I2C_ADDR = 0x40                 # Dirección SHT21
CMD_MEASURE_TEMP = 0xF3         # Registro Temperatura
CMD_MEASURE_HUM = 0xF5          # Registro de Humedad

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
    temp_c = -46.85 + (175.72 * raw / 65536.0)
    return temp_c

def read_humidity(bus):
    raw = read_sensor(bus, CMD_MEASURE_HUM)
    hum = -6 + (125.0 * raw / 65536.0)
    return hum

def sht21():
    try:
        with SMBus(3) as bus:
            temp = read_temperature(bus)
            hum = read_humidity(bus)
            th = struct.pack("ff", temp, hum)

            return th
    except Exception as e:
        print(f"Error de lectura: {e}")
