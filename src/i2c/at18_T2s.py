import time
from smbus2 import SMBus, i2c_msg   # I2C

#  Segunda sonda
I2C_ADDR_2s = 0x30            # Dirección Tarjeta 2a Sonda

WRITE_REG_ADDR = 0x00
READ_REG_ADDR = 0x01

#===============================================================#
#               Función de Prueba tarjeta 2a Sonda              #
#===============================================================#
# Corregir el envío de datos bsandose en la comunicación de la tarjeta de bascula at13 bas
def readTarjeta2S():
    dato_sonda_1 = 0
    dato_sonda_2 = 0

    time.sleep(0.005)

    try:
        with SMBus(1) as bus:
            bus.write_byte_data(I2C_ADDR_2s, WRITE_REG_ADDR, 0x01)
            bus.write_byte_data(I2C_ADDR_2s, WRITE_REG_ADDR, 0x55)

            time.sleep(0.01)

            dato_sonda_1 = bus.read_byte_data(I2C_ADDR_2s, READ_REG_ADDR)
            dato_sonda_2 = bus.read_byte_data(I2C_ADDR_2s, READ_REG_ADDR)

            sonda = ((dato_sonda_1 << 8) | dato_sonda_2)/10

            return sonda
    except Exception as e:
        print(f"Error de lectura T2S: {e}")