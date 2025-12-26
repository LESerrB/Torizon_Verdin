import struct
import spidev                       # SPI
import os

from dotenv import load_dotenv
# from files.logs import logger

#===============================================================#
#                    Configuración SPI BME280                   #
#===============================================================#
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

#===============================================================#
#               Configuración de offsets y escalas              #
#===============================================================#
load_dotenv("/mnt/microsd/.env")
# logger.info('Inicializando BME280')

T_OFFSET = float(os.getenv("T_OFFSET", 1.0))
P_OFFSET = float(os.getenv("P_OFFSET", 1.0))
H_OFFSET = float(os.getenv("H_OFFSET", 1.0))

EXPECTED_CHIP_ID = int(os.getenv("EXPECTED_CHIP_ID", "0x60"), 16)

#===============================================================#
#                  Configuración de SPI BME280                  #
#===============================================================#
spi = spidev.SpiDev()
spi.open(1, 0)
spi.max_speed_hz = 1000000
spi.mode = 0b00

#===============================================================#
#                  Funciones de lectura BME280                  #
#===============================================================#
def read_bytes(reg, length):
    """
    Lee una secuencia de bytes desde un registro del dispositivo BME280 vía SPI.

    La función realiza una transferencia SPI usando `xfer2`. Para indicar una
    operación de lectura sobre el registro `reg` se aplica la máscara `| 0x80`.

    Parámetros:
    - reg (int): Dirección del registro a leer.
    - length (int): Número de bytes a leer.

    Retorno:
    - list[int]: Lista de bytes leídos (cada elemento 0..255).

    Excepciones:
    - Puede lanzar excepciones relacionadas con SPI (p. ej. si el bus no está
        disponible).
    """
    return spi.xfer2([reg | 0x80] + [0x00]*length)[1:]

def write_byte(reg, val):
    """
    Escribe un byte en un registro del dispositivo BME280 vía SPI.

    Realiza una transferencia SPI con el bit de lectura limpiado (`reg & 0x7F`)
    seguida del valor `val` a escribir.

    Parámetros:
    - reg (int): Dirección del registro a escribir.
    - val (int): Valor del byte a escribir (0..255).

    Retorno:
    - None

    Excepciones:
    - Puede lanzar excepciones relacionadas con SPI (p. ej. si el bus no está
        disponible o hay error de I/O).
    """
    spi.xfer2([reg & 0x7F, val])

def read_calibration():
    """
    Lee y decodifica los parámetros de calibración del sensor BME280.

    Realiza lecturas de los bloques de calibración (temperatura/ presión y
    humedad) y desempaqueta los valores según el formato esperado por el
    dispositivo. Calcula también los valores `dig_H4` y `dig_H5` a partir de
    los bytes de calibración de humedad.

    Retorno:
    - tuple: (params, hum_params)
            - params: tupla con los parámetros de calibración para temperatura y
                presión (desempaquetados según '<HhhHhhhhhhhh').
            - hum_params: tupla con los parámetros de calibración de humedad
                (dig_H1, dig_H2, dig_H3, dig_H4, dig_H5, dig_H6).

    Notas:
    - Los formatos de desempaquetado están basados en la hoja de datos del
        BME280 y pueden variar entre sensores; comprueba compatibilidad si el
        sensor no responde correctamente.
    """
    calib = read_bytes(REG_CALIB, 24)
    calib_h = read_bytes(REG_HUM_CALIB, 7)

    params = struct.unpack('<HhhHhhhhhhhh', bytes(calib))
    dig_H1 = read_bytes(0xA1, 1)[0]
    dig_H2, dig_H3, e4, e5, e6, dig_H6, x = struct.unpack('<BbBBBbb', bytes(calib_h))

    dig_H4 = (e4 << 4) | (e5 & 0x0F)
    dig_H5 = (e6 << 4) | (e5 >> 4)

    return params, (dig_H1, dig_H2, dig_H3, dig_H4, dig_H5, dig_H6)

#===============================================================#
#                Funciones de compensación BME280               #
#===============================================================#
def compensate_temperature(adc_T, calib):
    """
    Compensa la temperatura cruda del ADC del BME280.

    Parámetros:
    - adc_T (int): Lectura cruda de temperatura (20..20bits según sensor).
    - calib (tuple): Parámetros de calibración (dig_T1, dig_T2, dig_T3, ...).

    Retorno:
    - (float, float): Temperatura en grados Celsius (sin offsets externos)
        y el valor intermedio `t_fine` usado por otras compensaciones.

    Nota:
    - `t_fine` debe conservarse y pasarse a la compensación de presión
        y humedad para obtener resultados correctos.
    """
    dig_T1, dig_T2, dig_T3 = calib[0], calib[1], calib[2]
    var1 = (adc_T / 16384.0 - dig_T1 / 1024.0) * dig_T2
    var2 = ((adc_T / 131072.0 - dig_T1 / 8192.0) ** 2) * dig_T3

    t_fine = var1 + var2
    T = t_fine / 5120.0

    return T, t_fine

def compensate_pressure(adc_P, calib, t_fine):
    """
    Compensa la presión cruda del ADC del BME280.

    Parámetros:
    - adc_P (int): Lectura cruda de presión.
    - calib (tuple): Parámetros de calibración (la tupla completa devuelta
        por `read_calibration`).
    - t_fine (float): Valor intermedio obtenido en la compensación de
        temperatura (`compensate_temperature`).

    Retorno:
    - float: Presión en hPa.

    Notas:
    - Si se detecta una división por cero en los cálculos internos, la
        función retorna 0 para indicar fallo en la compensación.
    """
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
    """
    Compensa la humedad relativa cruda del ADC del BME280.

    Parámetros:
    - adc_H (int): Lectura cruda de humedad.
    - calib (tuple): Parámetros de calibración de humedad (dig_H1..dig_H6).
    - t_fine (float): Valor intermedio obtenido en la compensación de
        temperatura (`compensate_temperature`).

    Retorno:
    - float: Humedad relativa en % (0.0 - 100.0), ya limitada al rango.

    Notas:
    - La fórmula sigue la recomendación de la hoja de datos del BME280 y
        aplica saturación para mantener el resultado en el rango válido.
    """
    dig_H1, dig_H2, dig_H3, dig_H4, dig_H5, dig_H6 = calib

    var_h = t_fine - 76800.0
    var_h = (adc_H - (dig_H4 * 64.0 + dig_H5 / 16384.0 * var_h)) * (dig_H2 / 65536.0 * (1.0 + dig_H6 / 67108864.0 * var_h * (1.0 + dig_H3 / 67108864.0 * var_h)))
    var_h = var_h * (1.0 - dig_H1 * var_h / 524288.0)
    var_h = max(0.0, min(var_h, 100.0))

    return var_h

#===============================================================#
#              Función principal de lectura BME280              #
#===============================================================#
def bme280():
    """
    Lee y devuelve una lectura completa del BME280.

    Realiza la inicialización mínima del sensor (configuración de
    oversampling y modo), lee los parámetros de calibración y obtiene
    los valores brutos de presión, temperatura y humedad. Aplica las
    rutinas de compensación y los offsets definidos en el entorno.

    Retorno:
    - bytes: Paquete `struct.pack("fff", temp, press, hum)` con
        temperatura (°C), presión (hPa) y humedad (%).

    Efectos secundarios:
    - Utiliza y puede cerrar el objeto `spi` en caso de error.
    - Imprime errores si la lectura SPI falla.
    """
    chip_id = read_bytes(REG_ID, 1)[0]

    if chip_id != EXPECTED_CHIP_ID:
        # logger.error(f"ID de chip inesperado: {chip_id}, esperado: {EXPECTED_CHIP_ID}")
        print("Sensor no detectado")

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

        # Calibración manual
        temp *= T_OFFSET
        press *= P_OFFSET
        hum *= H_OFFSET

        tph = struct.pack("fff", temp, press, hum)
        return tph
    except Exception as e:
        spi.close()

        # logger.error("Error de lectura BME280:", e)
        print(f"Error de lectura BME280: {e}")

#===============================================================#
#                  Función para Detener BME280                  #
#===============================================================#
def stop_bme280():
    """
    Cierra el bus SPI y libera los recursos asociados al BME280.

    Intenta cerrar el objeto global `spi` mediante `spi.close()`.
    Si se produce una excepción durante el cierre, la función la captura
    e imprime un mensaje de error en lugar de propagarla.

    Efectos secundarios:
    - Cierra el objeto `spi` (libera el descriptor del bus SPI).
    - No retorna valor (None).

    Notas:
    - Llamar a esta función varias veces puede provocar excepciones de
      `spidev` si el dispositivo ya está cerrado; por esto se manejan
      las excepciones internamente.
    """
    try:
        spi.close()
        # logger.info("BME280 detenido correctamente.")
    except Exception as e:
        # logger.error(f"Error al detener BME280: {e}")
        print(f"Error al detener BME280: {e}")