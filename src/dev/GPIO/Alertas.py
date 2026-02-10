import gpiod
import time

start = False
#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank3 = "/dev/gpiochip3"

pin_AlarmaSon = 1

alrmBzz = gpiod.Chip(bank3).get_line(pin_AlarmaSon)

alrmBzz.request(
    consumer="alrmBzz",
    type=gpiod.LINE_REQ_DIR_OUT
)

alrmBzz.set_value(1)

#===============================================================#
#                      Temporizador Alarma                      #
#===============================================================#
def alarma_VigilarBB(cont_minutos):
    global start

    # print("cont_minutos:", cont_minutos)
    if (time.monotonic() - cont_minutos) >= 120: # 600 => 10 min * 60 seg
        AlertaOn(True, 60)
        return time.monotonic()
    else:
        start = False
        return cont_minutos

def AlertaOn(flag, blink_duration=0):
    """
    Controla la alarma.
    
    Args:
        flag: True para encender, False para apagar
        blink_duration: Si se especifica, genera un blink durante este tiempo (en segundos)
                        sin bloquear otras mediciones
    """
    global start
    start = flag
    elapsed = 0

    while (blink_duration > elapsed):
        if start:
            alrmBzz.set_value(0)
            time.sleep(5)

            alrmBzz.set_value(1)
            time.sleep(5)
            elapsed += 10 
        else:
            break