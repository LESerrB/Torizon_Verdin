from smbus2 import SMBus
import math
import struct

MPU1 = 0x68
MPU2 = 0x69

PWR_MGMT_1 = 0x6B

ACCEL_SCALE = 16384.0


ACCEL_XOUT = 0x3B
ACCEL_YOUT = 0x3D
ACCEL_ZOUT = 0x3F

def read_word(addr, reg_X, reg_Y, reg_Z):
    try:
        with SMBus(3) as bus: # 3 -> /dev/i2c-3
            bus.write_byte_data(MPU1, PWR_MGMT_1, 0)
            bus.write_byte_data(MPU2, PWR_MGMT_1, 0)

            high_X = bus.read_byte_data(addr, reg_X)
            low_X = bus.read_byte_data(addr, reg_X + 1)
            x_val = (high_X << 8) + low_X

            if x_val >= 0x8000:
                x_val = -((65535 - x_val) + 1)

            high_Y = bus.read_byte_data(addr, reg_Y)
            low_Y = bus.read_byte_data(addr, reg_Y + 1)
            y_val = (high_Y << 8) + low_Y

            if y_val >= 0x8000:
                y_val = -((65535 - y_val) + 1)

            high_Z = bus.read_byte_data(addr, reg_Z)
            low_Z = bus.read_byte_data(addr, reg_Z + 1)
            z_val = (high_Z << 8) + low_Z

            if z_val >= 0x8000:
                z_val = -((65535 - z_val) + 1)

            r_xyz = struct.pack("fff", x_val, y_val, z_val)

            return r_xyz
    except Exception as e:
        print("Error", e)
        r_xyz = struct.pack("fff", 0.0, 0.0, 0.0)
        return r_xyz


def accel_Pos():
    r_xyz = read_word(MPU1, ACCEL_XOUT, ACCEL_YOUT, ACCEL_ZOUT)

    ax1, ay1, az1 = struct.unpack("fff", r_xyz)

    gx1 = round(ax1 / ACCEL_SCALE, 1)
    gy1 = round(ay1 / ACCEL_SCALE, 1)
    gz1 = round(az1 / ACCEL_SCALE, 1)

    print("MPU1:", "\tX:", gx1, "°\n\tY:", gy1, "°")

    # Roll (eje X)
    roll = math.degrees(math.atan2(gy1, gz1))

    # Pitch (eje Y)
    pitch = math.degrees(math.atan2(-gx1, math.sqrt(gy1**2 + gz1**2)))

    print("X:", roll, "\nY:", pitch)
