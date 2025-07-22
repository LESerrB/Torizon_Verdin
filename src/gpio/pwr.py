# import os
import gpiod
import threading
import time

# from i2c.sht21 import stop_sht21
# from pwm.pwm import stop_pwm
# from gpio.hx711 import stop_hx711
# from spi.bme280 import stop_bme280

# Pin       23      24
# GPIO      3       4
# SODIMM    210     212
# GPIOCHIP  4       4
# LINE      26      27

CHIP_NAME = "/dev/gpiochip4"
LINE_OFFSET = 27
PWR_LED = 26
SHUTDOWN_TIME = 5
Apagado = False

chip = gpiod.Chip(CHIP_NAME)
line = chip.get_line(LINE_OFFSET)
led = chip.get_line(PWR_LED)

line.request(
  consumer="pwr_button_irq",
  type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

led.request(
  consumer="pwr_led",
  type=gpiod.LINE_REQ_DIR_OUT
)

def handle_event():
  global Apagado

  while True:
    event = line.event_wait(5)

    if event:
      evt = line.event_read()

      if evt.type == gpiod.LineEvent.RISING_EDGE:
        start = time.monotonic()

        while line.get_value() == 1:
          timepresed = time.monotonic() - start

          if (timepresed >= SHUTDOWN_TIME) & (not Apagado):
            Apagado = True
            led.set_value(1)
          elif (timepresed >= SHUTDOWN_TIME) & Apagado:
            Apagado = False
            led.set_value(0)

      # elif evt.type == gpiod.LineEvent.FALLING_EDGE:
      #   print("Botón liberado")
        # led.set_value(0)

def pwrBtn():
    thread = threading.Thread(target=handle_event, daemon=True)
    thread.start()

# def apagar():
#   try:
#     if os.name == 'posix':  # Linux
#       os.system('sudo shutdown -h now')
#   except Exception as e:
#     print(f"Error al apagar: {e}")

# def reiniciar():
#   try:
#     if os.name == 'posix':  # Linux
#       os.system('sudo reboot -h now')
#   except Exception as e:
#     print(f"Error al apagar: {e}")