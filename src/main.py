#!python

import time
import struct
import spidev                       # SPI
# from smbus2 import SMBus, i2c_msg   # I2C
# import gpiod                        # GPIO

# #===============================================================#
# #               Configuración GPIO Serial HX711                 #
# #===============================================================#
# # Configuración de GPIO basada en pines reales
# dout_chip_path = "/dev/gpiochip2"  # GPIO1_IO04 (SODIMM_206)
# sck_chip_path = "/dev/gpiochip4"   # GPIO2_IO05 (SODIMM_208)
# PIN_DOUT = 4
# PIN_SCK = 5

# # Inicializar chips
# gpio_chip_dout = gpiod.Chip(dout_chip_path)
# gpio_chip_sck = gpiod.Chip(sck_chip_path)

# # Obtener líneas individuales (gpiod v1.x)
# dout_line = gpio_chip_dout.get_line(PIN_DOUT)
# sck_line = gpio_chip_sck.get_line(PIN_SCK)

# # Solicitar acceso
# dout_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_IN)
# sck_line.request(consumer="hx711", type=gpiod.LINE_REQ_DIR_OUT)

# # Escala y offset (ajusta con calibración)
# SCALE = 1.0
# OFFSET = 0

# def read_raw():
#     while dout_line.get_value() == 1:
#         time.sleep(0.001)

#     count = 0
#     for _ in range(24):
#         sck_line.set_value(1)
#         count = count << 1
#         sck_line.set_value(0)
#         if dout_line.get_value():
#             count += 1

#     sck_line.set_value(1)
#     sck_line.set_value(0)

#     if count & 0x800000:
#         count |= ~0xffffff

#     return count

# def read_weight():
#     raw = read_raw()
#     weight = (raw - OFFSET) / SCALE
#     return weight

# # ===============================================================#
# #                       Configuración I2C SHT21                  #
# # ===============================================================#
# I2C_ADDR = 0x40                 # Dirección SHT21
# CMD_MEASURE_TEMP = 0xF3         # Registro Temperatura
# CMD_MEASURE_HUM = 0xF5          # Registro de Humedad

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

# ===============================================================#
#                    Configuración SPI BME280                    #
# ===============================================================#
# BMP-280 registros
REG_ID = 0xD0
REG_RESET = 0xE0
REG_CTRL_MEAS = 0xF4
REG_CONFIG = 0xF5
REG_PRESS_MSB = 0xF7
REG_CALIB = 0x88

# BME-280 registros
REG_CTRL_HUM = 0xF2
REG_STATUS = 0xF3
REG_HUM_CALIB = 0xE1

EXPECTED_CHIP_ID_BME280 = 0x60
EXPECTED_CHIP_ID_BMP280 = 0x58

# Configuración BME-280
spi = spidev.SpiDev()
spi.open(1, 0)
spi.max_speed_hz = 1000000
spi.mode = 0b00

def read_bytes(reg, length):
    return spi.xfer2([reg | 0x80] + [0x00]*length)[1:]

def write_byte(reg, val):
    spi.xfer2([reg & 0x7F, val])

def read_calibration():
    calib = read_bytes(REG_CALIB, 24)
    calib_h = read_bytes(REG_HUM_CALIB, 7)

    params = struct.unpack('<HhhHhhhhhhhh', bytes(calib))
    dig_H1 = read_bytes(0xA1, 1)[0]
    dig_H2, dig_H3, e4, e5, e6, dig_H6, x = struct.unpack('<BbBBBbb', bytes(calib_h))

    dig_H4 = (e4 << 4) | (e5 & 0x0F)
    dig_H5 = (e6 << 4) | (e5 >> 4)

    return params, (dig_H1, dig_H2, dig_H3, dig_H4, dig_H5, dig_H6)

def compensate_temperature(adc_T, calib):
    dig_T1, dig_T2, dig_T3 = calib[0], calib[1], calib[2]
    var1 = (adc_T / 16384.0 - dig_T1 / 1024.0) * dig_T2
    var2 = ((adc_T / 131072.0 - dig_T1 / 8192.0) ** 2) * dig_T3
    t_fine = var1 + var2
    T = t_fine / 5120.0
    return T, t_fine

def compensate_pressure(adc_P, calib, t_fine):
    dig_P = calib[3:]
    var1 = t_fine / 2.0 - 64000.0
    var2 = var1 * var1 * dig_P[5] / 32768.0
    var2 = var2 + var1 * dig_P[4] * 2.0
    var2 = var2 / 4.0 + dig_P[3] * 65536.0
    var1 = (dig_P[2] * var1 * var1 / 524288.0 + dig_P[1] * var1) / 524288.0
    var1 = (1.0 + var1 / 32768.0) * dig_P[0]
    if var1 == 0:
        return 0
    p = 1048576.0 - adc_P
    p = ((p - var2 / 4096.0) * 6250.0) / var1
    var1 = dig_P[8] * p * p / 2147483648.0
    var2 = p * dig_P[7] / 32768.0
    p = p + (var1 + var2 + dig_P[6]) / 16.0
    return p / 100.0

def compensate_humidity(adc_H, calib, t_fine):
    dig_H1, dig_H2, dig_H3, dig_H4, dig_H5, dig_H6 = calib
    var_h = t_fine - 76800.0
    var_h = (adc_H - (dig_H4 * 64.0 + dig_H5 / 16384.0 * var_h)) * (
        dig_H2 / 65536.0 * (1.0 + dig_H6 / 67108864.0 * var_h * (1.0 + dig_H3 / 67108864.0 * var_h)))
    var_h = var_h * (1.0 - dig_H1 * var_h / 524288.0)
    var_h = max(0.0, min(var_h, 100.0))
    return var_h

chip_id = read_bytes(REG_ID, 1)[0]

if chip_id != EXPECTED_CHIP_ID_BMP280:
    print("BMP280 no detectado")
elif chip_id != EXPECTED_CHIP_ID_BME280:
    print("BME280 no detectado")
    exit(1)

write_byte(REG_CTRL_HUM, 0x01)      # Humedad oversampling x1
write_byte(REG_CTRL_MEAS, 0x27)     # Temp y pres. normal mode, oversampling x1
write_byte(REG_CONFIG, 0xA0)

calib, calib_h = read_calibration()

try:
    while True:
        raw = read_bytes(REG_PRESS_MSB, 8)
        adc_P = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4)
        adc_T = (raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4)
        adc_H = (raw[6] << 8) | raw[7]

        temp, tf = compensate_temperature(adc_T, calib)
        press = compensate_pressure(adc_P, calib, tf)
        hum = compensate_humidity(adc_H, calib_h, tf)

        print(f"Temp: {temp:.2f} °C | Press: {press:.2f} hPa | Hum: {hum:.2f} %")
        time.sleep(1)
except KeyboardInterrupt:
    spi.close()
    print("\nFinalizado")

# def main():
    # while True:
        # try:
        #     with SMBus(3) as bus:
        #         temp = read_temperature(bus)
        #         hum = read_humidity(bus)
        #         print(f"Temperatura: {temp:.2f} °C")
        #         print(f"Humedad: {hum:.2f} %")
        #         time.sleep(1)
        # except Exception as e:
        #     print(f"Error de lectura: {e}")

# if __name__ == '__main__':
#     main()
    # try:
    #     while True:
    #         w = read_weight()
    #         print(f"Peso: {w:.2f} unidades")
    #         time.sleep(0.5)
    # except KeyboardInterrupt:
    #     print("\nDetenido por usuario.")
    # finally:
    #     dout_line.release()
    #     sck_line.release()
    #     gpio_chip_dout.close()
    #     gpio_chip_sck.close()
