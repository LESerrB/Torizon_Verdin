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

I2C_ADDR_2s_1 = 0x60            # Dirección Tarjeta 2a Sonda
I2C_ADDR_2s_2 = 0x61            # Dirección Tarjeta 2a Sonda

SONDA2_SEND = 0x44  # Esto puede cambiar dinámicamente
OFFSET_PIEL2 = 0
I2C_BUS = 1         # Reemplazar con el bus correcto
ERRORES_SONDA = 0   # Global
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
    global SONDA2_SEND, ERRORES_SONDA
    ERR_SON_ACUM = 0
    dato_sonda_1 = 0
    dato_sonda_2 = 0
    LECT_SONDA = 0

    time.sleep(0.005)

    try:
        with SMBus(3) as bus:
            try:
                bus.write_byte(I2C_ADDR_2s_1, 0x01)
                bus.write_byte(I2C_ADDR_2s_1, SONDA2_SEND)
            except Exception:
                ERR_SON_ACUM += 1
                # print("Error",ERR_SON_ACUM)

            time.sleep(0.005)

            try:
                datos = bus.read_i2c_block_data(I2C_ADDR_2s_2, 0x00, 2)
                dato_sonda_1 = datos[0]
                dato_sonda_2 = datos[1]
                # print(dato_sonda_1, dato_sonda_2)
            except Exception:
                ERR_SON_ACUM += 1
                # print("Error",ERR_SON_ACUM)

            LECT_SONDA = (dato_sonda_1 << 8) | dato_sonda_2

            if SONDA2_SEND == 0x44:
                if LECT_SONDA == 100:
                    SONDA2_SEND = 0x44
                elif LECT_SONDA == 150:
                    SONDA2_SEND = 0x55

            if SONDA2_SEND == 0x33 and LECT_SONDA in [49, 28]:
                SONDA2_SEND = 0x55

            LECT_SONDA += OFFSET_PIEL2

            # print("\n\n", LECT_SONDA, "\n\n")
            time.sleep(0.001)

            if ERR_SON_ACUM > 1:
                ERRORES_SONDA = min(10, ERRORES_SONDA + 1)
            else:
                ERRORES_SONDA = 0

            # return ERR_SON_ACUM if auto_pru else LECT_SONDA


            # p = read_sensor(bus, 0x55, I2C_ADDR_2s) # Función Normal
            # print(p)
            # p = read_sensor(bus, 0x33, I2C_ADDR_2s) # Autoprueba
            # print(p)
            # p = read_sensor(bus, 0x44, I2C_ADDR_2s) # Calibración
            # # si tiene una sonda patron manda primero un 100 y luego un 150 para avisar que ya se calibró
            # print(p)
    except Exception as e:
        print(f"Error de lectura: {e}")