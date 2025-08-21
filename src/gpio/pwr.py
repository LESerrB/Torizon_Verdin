import gpiod
import threading
import time

# Pin       23      24
# GPIO      3       4
# SODIMM    210     212
# GPIOCHIP  4       4
# LINE      26      27

CHIP_NAME = "/dev/gpiochip4"
PWR_LINE = 27
PWR_LED = 26
cont_modo_calib = 0
calib = False

chip = gpiod.Chip(CHIP_NAME)
line = chip.get_line(PWR_LINE)
led = chip.get_line(PWR_LED)

line.request(
  consumer="pwr_button_irq",
  type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

led.request(
  consumer="pwr_led",
  type=gpiod.LINE_REQ_DIR_OUT
)

led.set_value(1) 

def handle_event():
  global cont_modo_calib
  global calib
  
  last_event_time = time.monotonic()
  
  while True:
    event = line.event_wait(5)
    now = time.monotonic()

    if now - last_event_time > 30:
      cont_modo_calib = 0
      last_event_time = now

    if event:
      evt = line.event_read()
      last_event_time = now

      if evt.type == gpiod.LineEvent.FALLING_EDGE:
        led.set_value(1)
        print("Toques para calibrar:", cont_modo_calib)
      elif evt.type == gpiod.LineEvent.RISING_EDGE:
        led.set_value(0)
        cont_modo_calib += 1
    
    if cont_modo_calib >= 10:
      calib = True

def blink_calib():
  global calib

  while True:
    if calib:
      start_time = time.monotonic()

      while calib and (time.monotonic() - start_time < 60):
        led.set_value(0)
        time.sleep(1)
        led.set_value(1)
        time.sleep(1)

      calib = False

    time.sleep(0.1)

def pwrBtn():
  thread = threading.Thread(target=handle_event, daemon=True)
  thread.start()

def pwrLed():
  thread = threading.Thread(target=blink_calib, daemon=True)
  thread.start()

pwrLed()