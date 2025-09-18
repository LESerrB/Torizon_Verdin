import time

from smbus2 import SMBus   # I2C
from typing import List

ADDR_BASC = 0x28

WRITE_REG_ADDR = 0x00
READ_REG_ADDR = 0x01

def read_Bascula():
    try:
        with SMBus(3) as bus:   # 3
            bus.write_byte_data(ADDR_BASC, WRITE_REG_ADDR, 0x01)
            bus.write_byte_data(ADDR_BASC, WRITE_REG_ADDR, 0x55)

            time.sleep(0.1)

            read_byte1 = bus.read_byte_data(ADDR_BASC, READ_REG_ADDR)
            read_byte2 = bus.read_byte_data(ADDR_BASC, READ_REG_ADDR)
            peso = ((read_byte1 << 8) | read_byte2)/1000

            return peso
    except Exception as e:
        print("Error de Báscula:", e)

def calib_Bascula():
    print("Calibración")

def tarar_Bascula():
    print("Proceso de Taraje")