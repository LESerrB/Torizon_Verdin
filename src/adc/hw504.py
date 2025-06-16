import struct
import gpiod

def read_adc(channel):
    try:
        with open(f"/sys/bus/iio/devices/iio:device0/in_voltage{channel}_raw", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        print(f"ADC channel {channel} not found.")
        return -1

# GPIO config for joystick button (SW)
CHIP_NAME = "gpiochip0"  # GPIO1

chip = gpiod.Chip(CHIP_NAME)

def hw504():
    try:
        x_val = read_adc(0)  # VRx on ADC1_IN0 (SODIMM 8)
        y_val = read_adc(1)  # VRy on ADC1_IN1 (SODIMM 6)

        xybtn = struct.pack("iii", x_val, y_val)
        return xybtn
    except KeyboardInterrupt:
        chip.close()