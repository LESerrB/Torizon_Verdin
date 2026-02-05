import gpiod
import time

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
def alert_VigilarBB(cont_minutos):
    print("cont_minutos:", cont_minutos)
    print(time.monotonic() - cont_minutos)
    if (time.monotonic() - cont_minutos) >= 120:
        print("Alerta On")
        AlertaOn(True, 60)
        return time.monotonic()
    else:
        print("Alerta Off")
        # AlertaOn(False)
        return cont_minutos

def AlertaOn(flag, blink_duration):
    """
    Controla la alarma.
    
    Args:
        flag: True para encender, False para apagar
        blink_duration: Si se especifica, genera un blink durante este tiempo (en segundos)
                        sin bloquear otras mediciones
    """
    elapsed = 0
    print("Start")
    while flag and (blink_duration > elapsed):
        alrmBzz.set_value(0)
        time.sleep(5)

        alrmBzz.set_value(1)
        time.sleep(5)
        elapsed += 10 
    print("End")