import time
import gpiod

bank = "/dev/gpiochip3" # GPIO3

line_11 = 25             # SODIMM_30
line_12 = 24             # SODIMM_32
line_13 = 26             # SODIMM_34
line_14 = 23             # SODIMM_36
line_15 = 27             # SODIMM_38

gpio_chip = gpiod.Chip(bank)

pinout_11 = gpio_chip.get_line(line_11)
pinout_12 = gpio_chip.get_line(line_12)
pinout_13 = gpio_chip.get_line(line_13)
pinout_14 = gpio_chip.get_line(line_14)
pinout_15 = gpio_chip.get_line(line_15)

pinout_11.request(consumer="calef1", type=gpiod.LINE_REQ_DIR_OUT)
pinout_12.request(consumer="calef2", type=gpiod.LINE_REQ_DIR_OUT)
pinout_13.request(consumer="calef3", type=gpiod.LINE_REQ_DIR_OUT)
pinout_14.request(consumer="calef4", type=gpiod.LINE_REQ_DIR_OUT)
pinout_15.request(consumer="calef5", type=gpiod.LINE_REQ_DIR_OUT)

def prueba_pin():
    for i in range(10):
        pinout_15.set_value(1)
        time.sleep(1)
        pinout_15.set_value(0)
        time.sleep(1)
    
