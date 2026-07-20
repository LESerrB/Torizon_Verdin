import gpiod
import time

#        PWR LED | PWR button
#----------------|-------------
# Pin       29   |   30
# GPIO      3    |   4
# SODIMM    210  |   212
# GPIOCHIP  0    |   0
# LINE      5    |   6
# FUNCTION  Out  |  In

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0"

pin_led = 5
pin_pwr = 6

cont_modo_calib = 0

# Líneas individuales
pwrBTN = gpiod.Chip(bank).get_line(pin_pwr)
pwrLED = gpiod.Chip(bank).get_line(pin_led)

# Configuración de Acceso
pwrBTN.request(
  consumer="pwr_button",
  type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

pwrLED.request(
  consumer="pwr_led",
  type=gpiod.LINE_REQ_DIR_OUT
)

# Valores Inicial
pwrLED.set_value(1)

#===============================================================#
#                   Funcion de Evento de Boton                  #
#===============================================================#
# Funcinamiento de botón de encendido para activar la calibración
def pwrBtn_Evnt():
  """
  Maneja eventos del botón de encendido para entrar en modo calibración.

  Comportamiento:
  - Espera eventos en `pwrBTN` (ambos flancos). Usa `pwrBTN.event_wait(5)`
    y `pwrBTN.event_read()` para leerlos.
  - Mantiene `last_event_time` con `time.monotonic()` y si pasan más de
    30 segundos sin eventos reinicia `cont_modo_calib` a 0.
  - En flanco de bajada (`FALLING_EDGE`) enciende el `led` y muestra por
    consola el contador de toques; en flanco de subida (`RISING_EDGE`)
    apaga el `led` e incrementa `cont_modo_calib`.
  - Si `cont_modo_calib` alcanza 10, establece la bandera global `calib = True`.
  - Incluye debouncing (20ms) para evitar brincos en el contador causados
    por rebotes del botón físico.

  Efectos secundarios:
  - Modifica las variables globales `cont_modo_calib` y `calib`.
  - Controla la salida `led`.

  Notas:
  - Diseñada para ejecutarse en un hilo dedicado; es un bucle infinito.
  - Usa `time.monotonic()` para evitar problemas con cambios en el reloj
    del sistema.
  """
  global cont_modo_calib
  
  last_event_time = time.monotonic()
  last_debounce_time = time.monotonic()
  DEBOUNCE_TIME = 0.02  # 20 milisegundos para filtrar rebotes

  while True:
    event = pwrBTN.event_wait(5)
    now = time.monotonic()

    if now - last_event_time > 30:
      cont_modo_calib = 0
      last_event_time = now

    if event:
      # Descartar el rebote
      if now - last_debounce_time < DEBOUNCE_TIME:
        pwrBTN.event_read()
        continue

      evt = pwrBTN.event_read()
      last_event_time = now
      last_debounce_time = now

      if evt.type == gpiod.LineEvent.FALLING_EDGE:
        pwrLED.set_value(1)
      elif evt.type == gpiod.LineEvent.RISING_EDGE:
        pwrLED.set_value(0)
        cont_modo_calib += 1

    if cont_modo_calib >= 10:
      blink_calib(True)

#===============================================================#
#                Parpadeo Led Boton de Encendido                #
#===============================================================#
def blink_calib(calib):
  """
  Parpadea el LED para indicar que el modo calibración está activo.

  Comportamiento:
  - Si la bandera `calib` es True, inicia un periodo de parpadeo de
    hasta 60 segundos: alterna `led` apagado/encendido con 1s de separación.
  - Tras el periodo o si `calib` pasa a False, desactiva la bandera `calib`.

  Efectos secundarios:
  - Modifica la salida `led` y la variable `calib`.

  Notas:
  - Diseñada para ejecutarse en un hilo dedicado (bucle infinito).
  - Usa `time.monotonic()` para cálculos de tiempo robustos.
  """

  if calib:
    start_time = time.monotonic()

    while calib and (time.monotonic() - start_time < 60):
      pwrLED.set_value(0)
      time.sleep(1)
      pwrLED.set_value(1)
      time.sleep(1)

    calib = False

  time.sleep(0.1)

