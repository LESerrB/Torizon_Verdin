import time

from smbus2 import SMBus   # I2C

ADDR_BASC = 0x28

WRITE_REG_ADDR = 0x00
READ_REG_ADDR = 0x01

def bascula():
    try:
        with SMBus(3) as bus:   # 3
            bus.write_byte_data(ADDR_BASC, WRITE_REG_ADDR, 0x01)
            bus.write_byte_data(ADDR_BASC, WRITE_REG_ADDR, 0x55)

            time.sleep(0.1)

            read = bus.read_byte_data(ADDR_BASC, READ_REG_ADDR)
            print("Lectura tarjeta bascula:", read)
    except Exception as e:
        print("Error:", e)