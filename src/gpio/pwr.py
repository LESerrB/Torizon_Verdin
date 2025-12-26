import gpiod
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
# Funcinamiento de botón de encendido para activar la calibración
def pwrBtn_Evnt():
  """
  Maneja eventos del botón de encendido para entrar en modo calibración.

  Comportamiento:
  - Espera eventos en `pwrBtn` (ambos flancos). Usa `pwrBtn.event_wait(5)`
    y `pwrBtn.event_read()` para leerlos.
  - Mantiene `last_event_time` con `time.monotonic()` y si pasan más de
    30 segundos sin eventos reinicia `cont_modo_calib` a 0.
  - En flanco de bajada (`FALLING_EDGE`) enciende el `led` y muestra por
    consola el contador de toques; en flanco de subida (`RISING_EDGE`)
    apaga el `led` e incrementa `cont_modo_calib`.
  - Si `cont_modo_calib` alcanza 10, establece la bandera global `calib = True`.

  Efectos secundarios:
  - Modifica las variables globales `cont_modo_calib` y `calib`.
  - Controla la salida `led`.

  Notas:
  - Diseñada para ejecutarse en un hilo dedicado; es un bucle infinito.
  - Usa `time.monotonic()` para evitar problemas con cambios en el reloj
    del sistema.
  """
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
# Parpadeo indicando la activación de la calibración
def blink_calib():
  """
  Parpadea el LED para indicar que el modo calibración está activo.

  Comportamiento:
  - Si la bandera global `calib` es True, inicia un periodo de parpadeo de
    hasta 60 segundos: alterna `led` apagado/encendido con 1s de separación.
  - Tras el periodo o si `calib` pasa a False, desactiva la bandera `calib`.

  Efectos secundarios:
  - Modifica la salida `led` y la variable global `calib`.

  Notas:
  - Diseñada para ejecutarse en un hilo dedicado (bucle infinito).
  - Usa `time.monotonic()` para cálculos de tiempo robustos.
  """
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