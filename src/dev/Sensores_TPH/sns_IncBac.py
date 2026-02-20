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
    MPU1: {"roll": 0.0, "pitch": 0.0},
    MPU2: {"roll": 0.0, "pitch": 0.0},
}

bus.write_byte_data(MPU1, PWR_MGMT_1, 0)
bus.write_byte_data(MPU2, PWR_MGMT_1, 0)

def read_word_2c(addr, reg):
    high = bus.read_byte_data(addr, reg)
    low  = bus.read_byte_data(addr, reg + 1)
    val = (high << 8) | low

    if val >= 0x8000:
        val -= 65536

    return val

def tilt_deg_from_accel(ax, ay, az):
    ax_g = ax / ACCEL_SCALE
    ay_g = ay / ACCEL_SCALE
    az_g = az / ACCEL_SCALE

    # Posición: Roll (lateral) y Pitch (frontal)
    roll  = math.degrees(math.atan2(ay_g, az_g))
    pitch = math.degrees(math.atan2(-ax_g, math.sqrt(ay_g*ay_g + az_g*az_g)))

    return roll, pitch

def accel_Pos():
    ax1 = read_word_2c(MPU1, ACCEL_XOUT)
    ay1 = read_word_2c(MPU1, ACCEL_YOUT)
    az1 = read_word_2c(MPU1, ACCEL_ZOUT)

    roll1, pitch1 = tilt_deg_from_accel(ax1, ay1, az1)

    roll1  -= OFFSETS[MPU1]["roll"]
    pitch1 -= OFFSETS[MPU1]["pitch"]

    ax2 = read_word_2c(MPU2, ACCEL_XOUT)
    ay2 = read_word_2c(MPU2, ACCEL_YOUT)
    az2 = read_word_2c(MPU2, ACCEL_ZOUT)

    roll2, pitch2 = tilt_deg_from_accel(ax2, ay2, az2)

    print(f"MPU1 -> Roll: {roll1:7.2f}°  Pitch: {pitch1:7.2f}°")
    print(f"MPU2 -> Roll: {roll2:7.2f}°  Pitch: {pitch2:7.2f}°")

def calib_PosZero(addr=MPU1, samples=300, delay_s=0.01, settle_s=0.2):
    """
    Calibra para que la posición ACTUAL sea 0°/0°.
    - samples: cuantas lecturas promediar
    - delay_s: tiempo entre lecturas
    - settle_s: espera inicial para que se estabilice
    """
    time.sleep(settle_s)

    sum_roll = 0.0
    sum_pitch = 0.0

    for _ in range(samples):
        ax = read_word_2c(addr, ACCEL_XOUT)
        ay = read_word_2c(addr, ACCEL_YOUT)
        az = read_word_2c(addr, ACCEL_ZOUT)

        roll, pitch = tilt_deg_from_accel(ax, ay, az)
        sum_roll += roll
        sum_pitch += pitch
        time.sleep(delay_s)

    OFFSETS[addr]["roll"]  = sum_roll / samples
    OFFSETS[addr]["pitch"] = sum_pitch / samples

    # Opcional: regresar el offset aplicado
    return OFFSETS[addr]["roll"], OFFSETS[addr]["pitch"]