import gpiod
import threading
import time

# Pin       23   |   24
# GPIO      3    |   4
# SODIMM    210  |   212
# GPIOCHIP  4    |   4
# LINE      26   |   27

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
CHIP_NAME = "/dev/gpiochip4"

pin_24 = 27   # Botón de Encendido
pin_23 = 26   # Led de Botón

cont_modo_calib = 0
calib = False         # Bandera de habilitación para modo de CAlibración

# Inicialización chips
chip = gpiod.Chip(CHIP_NAME)

# Líneas individuales
pwrBtn = chip.get_line(pin_24)
led = chip.get_line(pin_23)

# Configuración de Acceso
pwrBtn.request(
  consumer="pwr_button",
  type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

led.request(
  consumer="pwr_led",
  type=gpiod.LINE_REQ_DIR_OUT
)

# Valores Inicial
led.set_value(1) 

#===============================================================#
#                   Funcion de Evento de Boton                  #
#===============================================================#
def pwrBtn_Evnt():
  global cont_modo_calib
  global calib
  
  last_event_time = time.monotonic()
  
  while True:
    event = pwrBtn.event_wait(5)
    now = time.monotonic()

    if now - last_event_time > 30:
      cont_modo_calib = 0
      last_event_time = now

    if event:
      evt = pwrBtn.event_read()
      last_event_time = now

      if evt.type == gpiod.LineEvent.FALLING_EDGE:
        led.set_value(1)
        print("Toques para calibrar:", cont_modo_calib)
      elif evt.type == gpiod.LineEvent.RISING_EDGE:
        led.set_value(0)
        cont_modo_calib += 1
    
    if cont_modo_calib >= 10:
      calib = True

#===============================================================#
#                Parpadeo Led Boton de Encendido                #
#===============================================================#
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

#===============================================================#
#                    Inicialización de Hilos                    #
#===============================================================#
thread_pwrBtn = threading.Thread(target=pwrBtn_Evnt, daemon=True)
thread_pwrBtn.start()

thread_pwrLed = threading.Thread(target=blink_calib, daemon=True)
thread_pwrLed.start()