import struct
import spidev                       # SPI

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

def bme280():
    chip_id = read_bytes(REG_ID, 1)[0]

    if chip_id != EXPECTED_CHIP_ID_BME280:
        print("BME280 no detectado")

    write_byte(REG_CTRL_HUM, 0x01)      # Humedad oversampling x1
    write_byte(REG_CTRL_MEAS, 0x27)     # Temp y pres. normal mode, oversampling x1
    write_byte(REG_CONFIG, 0xA0)

    calib, calib_h = read_calibration()

    try:
        raw = read_bytes(REG_PRESS_MSB, 8)
        adc_P = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4)
        adc_T = (raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4)
        adc_H = (raw[6] << 8) | raw[7]

        temp, tf = compensate_temperature(adc_T, calib)
        press = compensate_pressure(adc_P, calib, tf)
        hum = compensate_humidity(adc_H, calib_h, tf)

        tph = struct.pack("fff", temp, press, hum)
        return tph
    except KeyboardInterrupt:
        spi.close()
        print("\nFinalizado")