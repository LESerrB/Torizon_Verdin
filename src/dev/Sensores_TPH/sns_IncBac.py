import math
import time

from smbus2 import SMBus

bus = SMBus(3)   # /dev/i2c-3

MPU1 = 0x68
MPU2 = 0x69

PWR_MGMT_1 = 0x6B

ACCEL_XOUT = 0x3B
ACCEL_YOUT = 0x3D
ACCEL_ZOUT = 0x3F

ACCEL_SCALE = 16384.0  # ±2g
OFFSETS = {
    MPU1: {"lat": 0.0, "frnt": 0.0},
    MPU2: {"lat": 0.0, "frnt": 0.0},
}

#===============================================================#
#                    Configuración de Módulos                   #
#===============================================================#
try:
    bus.write_byte_data(MPU1, PWR_MGMT_1, 0)
    bus.write_byte_data(MPU2, PWR_MGMT_1, 0)

except Exception as e:
    print("No se pudo configurar el dispositivo:", e)

#===============================================================#
#                      Lectura de registros                     #
#===============================================================#
def read_WReg(addr, reg):
    """
    Lee un valor de 16 bits desde un registro de un dispositivo I2C (MPU6050).
    
    El valor se forma combinando dos bytes consecutivos (MSB y LSB).
    Si el valor es negativo (>= 0x8000), se convierte a complemento a 2.
    
    Args:
        addr (int): Dirección I2C del dispositivo (0x68 o 0x69).
        reg (int): Dirección del registro a leer.
    
    Returns:
        int: Valor de 16 bits con signo del registro.
    """
    try:
        high = bus.read_byte_data(addr, reg)
        low  = bus.read_byte_data(addr, reg + 1)
        val = (high << 8) | low

        if val >= 0x8000:
            val -= 65536

        return val
    except Exception as e:
        print("No se pudo leer el dispositivo:", e)

def pos_LatFrnt(ax, ay, az):
    """
    Calcula el ángulo de inclinación lateral (pitch) y frontal (roll) a partir de aceleraciones.
    
    Convierte las lecturas brutas del acelerómetro a gravedades (g) y luego
    calcula los ángulos utilizando funciones trigonométricas (atan2).
    
    Args:
        ax (int): Aceleración en el eje X (valores brutos del MPU6050).
        ay (int): Aceleración en el eje Y (valores brutos del MPU6050).
        az (int): Aceleración en el eje Z (valores brutos del MPU6050).
    
    Returns:
        tuple: (lat, frnt) - Ángulo lateral y frontal en grados.
    """
    ax_g = ax / ACCEL_SCALE
    ay_g = ay / ACCEL_SCALE
    az_g = az / ACCEL_SCALE

    lat  = math.degrees(math.atan2(ay_g, az_g))
    frnt = math.degrees(math.atan2(-ax_g, math.sqrt(ay_g*ay_g + az_g*az_g)))

    return lat, frnt

#===============================================================#
#                 Función Principal de Lectura                  #
#===============================================================#
def accel_Pos():
    """
    Lee las posiciones (ángulos de inclinación) de ambos acelerómetros (MPU1 y MPU2).
    
    Obtiene datos de ambos sensores MPU6050, calcula sus ángulos y resta los offsets
    de calibración previamente almacenados. Imprime los resultados en consola.
    
    Returns:
        None (imprime directamente en consola)
    """
    ax1 = read_WReg(MPU1, ACCEL_XOUT)
    ay1 = read_WReg(MPU1, ACCEL_YOUT)
    az1 = read_WReg(MPU1, ACCEL_ZOUT)

    # Cálculo de posición
    if ax1 and ay1 and az1:
        lat1, frnt1 = pos_LatFrnt(ax1, ay1, az1)

        # Ajuste Calibrado
        lat1  -= OFFSETS[MPU1]["lat"]
        frnt1 -= OFFSETS[MPU1]["frnt"]
    else:
        lat1  = -99.99
        frnt1 = -99.99

    ax2 = read_WReg(MPU2, ACCEL_XOUT)
    ay2 = read_WReg(MPU2, ACCEL_YOUT)
    az2 = read_WReg(MPU2, ACCEL_ZOUT)

    # Cálculo de posición
    if ax2 and ay2 and az2:
        lat2, frnt2 = pos_LatFrnt(ax2, ay2, az2)

        # Ajuste Calibrado
        lat2  -= OFFSETS[MPU2]["lat"]
        frnt2 -= OFFSETS[MPU2]["frnt"]
    else:
        lat2  = -99.99
        frnt2 = -99.99

    return lat1, frnt1, lat2, frnt2

#===============================================================#
#                    Calibración de Punto Zero                  #
#===============================================================#
def calib_PosZero(addr=MPU1, samples=300, delay_s=0.01, settle_s=0.2):
    """
    Calibra un acelerómetro para establecer su posición actual como punto cero (0°/0°).
    
    Realiza múltiples lecturas del sensor, promedia sus ángulos y almacena estos
    valores como offsets de calibración que se restan posteriormente en los cálculos.
    
    Args:
        addr (int): Dirección I2C del dispositivo a calibrar. Default: MPU1 (0x68).
        samples (int): Número de lecturas para promediar. Default: 300.
        delay_s (float): Tiempo entre lecturas en segundos. Default: 0.01 s.
        settle_s (float): Tiempo de estabilización inicial en segundos. Default: 0.2 s.
    
    Returns:
        tuple: (offset_lat, offset_frnt) - Offsets de calibración calculados en grados.
    """
    time.sleep(settle_s)

    sum_lat = 0.0
    sum_frnt = 0.0

    for _ in range(samples):
        ax = read_WReg(addr, ACCEL_XOUT)
        ay = read_WReg(addr, ACCEL_YOUT)
        az = read_WReg(addr, ACCEL_ZOUT)

        lat, frnt = pos_LatFrnt(ax, ay, az)
        sum_lat += lat
        sum_frnt += frnt
        time.sleep(delay_s)

    OFFSETS[addr]["lat"]  = sum_lat / samples
    OFFSETS[addr]["frnt"] = sum_frnt / samples

    # Opcional: regresar el offset aplicado
    return OFFSETS[addr]["lat"], OFFSETS[addr]["frnt"]