import os
import time
import struct
from smbus2 import SMBus, i2c_msg   # I2C

#  Segunda sonda
I2C_ADDR_2s = 0x30            # Dirección Tarjeta 2a Sonda

WRITE_REG_ADDR = 0x00
READ_REG_ADDR = 0x01

SONDA2_SEND = 0x44
OFFSET_PIEL2 = 0
I2C_BUS = 1         # Reemplazar con el bus correcto
ERRORES_SONDA = 0   # Global

#===============================================================#
#               Función de Prueba tarjeta 2a Sonda              #
#===============================================================#
# Corregir el envío de datos bsandose en la comunicación de la tarjeta de bascula at13 bas
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
                bus.write_byte_data(I2C_ADDR_2s, WRITE_REG_ADDR, SONDA2_SEND)
            except Exception:
                ERR_SON_ACUM += 1
                # print("Error",ERR_SON_ACUM)

            time.sleep(0.005)

            try:
                datos = bus.read_byte_data(I2C_ADDR_2s, READ_REG_ADDR)
                print("Datos T2S:", datos)
                # dato_sonda_1 = datos[0]
                # dato_sonda_2 = datos[1]
                # print(dato_sonda_1, dato_sonda_2)
            except Exception:
                ERR_SON_ACUM += 1
                # print("Error",ERR_SON_ACUM)

            # LECT_SONDA = (dato_sonda_1 << 8) | dato_sonda_2

            # if SONDA2_SEND == 0x44:
            #     if LECT_SONDA == 100:
            #         SONDA2_SEND = 0x44
            #     elif LECT_SONDA == 150:
            #         SONDA2_SEND = 0x55

            # if SONDA2_SEND == 0x33 and LECT_SONDA in [49, 28]:
            #     SONDA2_SEND = 0x55

            # LECT_SONDA += OFFSET_PIEL2

            # print("\n\n", LECT_SONDA, "\n\n")
            # time.sleep(0.001)

            # if ERR_SON_ACUM > 1:
            #     ERRORES_SONDA = min(10, ERRORES_SONDA + 1)
            # else:
            #     ERRORES_SONDA = 0

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