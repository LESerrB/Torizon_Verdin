#!python

import time
# import spidev
# from smbus2 import SMBus, i2c_msg
import gpiod
import time

# Configuración de GPIO basada en pines reales
dout_chip_path = "/dev/gpiochip2"  # GPIO3_IO04 (SODIMM_206)
sck_chip_path = "/dev/gpiochip4"   # GPIO5_IO05 (SODIMM_208)
PIN_DOUT = 4
PIN_SCK = 5

# Inicializar chips
gpio_chip_dout = gpiod.Chip(dout_chip_path)
gpio_chip_sck = gpiod.Chip(sck_chip_path)

# Obtener líneas individuales (gpiod v1.x)
dout_line = gpio_chip_dout.get_line(PIN_DOUT)
sck_line = gpio_chip_sck.get_line(PIN_SCK)

# Solicitar acceso
dout_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_IN)
sck_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_OUT)

# Escala y offset (ajusta con calibración)
SCALE = 1.0
OFFSET = 0

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

# I2C_ADDR = 0x40
# CMD_MEASURE_TEMP = 0xF3
# CMD_MEASURE_HUM = 0xF5

# def read_sensor(bus, command):
#     bus.write_byte(I2C_ADDR, command)
#     time.sleep(0.1)
#     read = i2c_msg.read(I2C_ADDR, 3)
#     bus.i2c_rdwr(read)
#     data = list(read)
#     raw = (data[0] << 8) | data[1]
#     raw &= ~0x0003
#     return raw

# def read_temperature(bus):
#     raw = read_sensor(bus, CMD_MEASURE_TEMP)
#     temp_c = -46.85 + (175.72 * raw / 65536.0)
#     return temp_c

# def read_humidity(bus):
#     raw = read_sensor(bus, CMD_MEASURE_HUM)
#     hum = -6 + (125.0 * raw / 65536.0)
#     return hum

# def main():
#     spi = spidev.SpiDev()

#     while True:
#         try:
#             spi.open(1, 0)
#             spi.mode = 0b01
#             spi.bits_per_word = 8
#             spi.max_speed_hz = 500000

#             data_out = [0xAA, 0x55]
#             data_in = spi.xfer2(data_out)

#             spi.close()

#             time.sleep(0.2)

#             try:
#                 with SMBus(3) as bus:
#                     temp = read_temperature(bus)
#                     hum = read_humidity(bus)
#                     print(f"Temperatura: {temp:.2f} °C")
#                     print(f"Humedad: {hum:.2f} %")
#                     time.sleep(1)
#             except Exception as e:
#                 print(f"Error de lectura: {e}")

#         except (KeyboardInterrupt, SystemExit):
#             print("Cerrando")

if __name__ == '__main__':
    # main()
    try:
        while True:
            w = read_weight()
            print(f"Peso: {w:.2f} unidades")
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nDetenido por usuario.")
    finally:
        dout_line.release()
        sck_line.release()
        gpio_chip_dout.close()
        gpio_chip_sck.close()
