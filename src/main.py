#!python
# import spidev
# import time

# def main():
#     spi = spidev.SpiDev()

#     while True:
#         spi.open(1, 0)

#         spi.mode = 0b01

#         spi.bits_per_word = 8

#         spi.max_speed_hz = 500000

#         data_out = [0xAA, 0x55]

#         data_in = spi.xfer2(data_out)

#         spi.close()

#         time.sleep(0.2)

# if __name__ == "__main__":
#     main()

import time
from smbus2 import SMBus, i2c_msg

I2C_ADDR = 0x40
CMD_MEASURE_TEMP = 0xF3
CMD_MEASURE_HUM = 0xF5

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

def main():
    try:
        with SMBus(3) as bus:
            temp = read_temperature(bus)
            hum = read_humidity(bus)
            print(f"Temperatura: {temp:.2f} °C")
            print(f"Humedad: {hum:.2f} %")
    except Exception as e:
        print(f"Error de lectura: {e}")

if __name__ == '__main__':
    main()