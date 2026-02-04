import gpiod
import time
import threading

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
    if cont_minutos >= 2:
        AlertaOn(True, blink_duration=60)  # Blink durante 60 segundos
        return 0

    return cont_minutos + 1

def AlertaOn(flag, blink_duration=None):
    """
    Controla la alarma.
    
    Args:
        flag: True para encender, False para apagar
        blink_duration: Si se especifica, genera un blink durante este tiempo (en segundos)
                       sin bloquear otras mediciones
    """
    if flag:
        if blink_duration:
            blink_thread = threading.Thread(
                target=_blink_alarm,
                args=(10, blink_duration),
                daemon=True
            )
            blink_thread.start()
        else:
            alrmBzz.set_value(0)
    else:
        alrmBzz.set_value(1)

def _blink_alarm(blink_period=8, duration=60):
    """
    Genera un parpadeo de la alarma en un hilo separado.
    
    Args:
        blink_period: Período total del parpadeo en segundos (default 10)
        duration: Duración total del blink en segundos (default 60)
    """
    half_period = blink_period / 2
    elapsed = 0

    while elapsed < duration:
        alrmBzz.set_value(0)
        time.sleep(half_period)

        alrmBzz.set_value(1)
        time.sleep(half_period)

        elapsed += blink_period
