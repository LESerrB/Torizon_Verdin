import gpiod
import time

from api.pins_ADC import read_adc
from dev.Controles.sns_Prox import prox_Med

#         Boton
#        Joystick 
#----------------
# Pin       32   
# GPIO      5    
# SODIMM    216  
# GPIOCHIP  0    
# LINE      7    
# FUNCTION  In   

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0"
pin_sw = 7

# Líneas individuales
jstkSW = gpiod.Chip(bank).get_line(pin_sw)

# Configuración de Acceso
jstkSW.request(
    consumer="jsSW_button",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)
#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def jstk_axis(adc_chn: int):
    """
    Lee un canal ADC del joystick.
    
    Args:
        adc_chn: Número de canal ADC (0 o 1)
    
    Returns:
        Valor ADC leído o 0 si hay error
    """
    try:
        pos = read_adc(adc_chn)
        return pos
    except Exception as e:
        return 0

#================================================================#
#                  Función Lectura de Controles                  #
#================================================================#
def rd_joystick(joystick_data):
    """
    Monitorea continuamente el joystick:
    - Lee los ejes X (canal 1) e Y (canal 0) del ADC
    - Detecta presionado/soltado del botón con debouncing
    
    Comportamiento:
    - Actualiza los valores de ADC cada 100ms
    - Monitorea eventos del switch sin bloquear
    - Filtra rebotes con debouncing de 20ms
    """
    last_debounce_time = time.monotonic()
    DEBOUNCE_TIME = 0.02  # 20 milisegundos
    READ_INTERVAL = 0.1
    last_read_time = time.monotonic()

    x = 0
    y = 0
    startTime = 0

    while True:
        startTime = prox_Med(startTime)
        now = time.monotonic()

        if startTime == 99:
            startTime = 0
            joystick_data["silenciar"] = True

        if now - last_read_time >= READ_INTERVAL:
            x = jstk_axis(1)
            y = jstk_axis(0)
            joystick_data["x"] = x
            joystick_data["y"] = y
            last_read_time = now

        if jstkSW.event_wait(0):
            if now - last_debounce_time >= DEBOUNCE_TIME:
                evt = jstkSW.event_read()
                last_debounce_time = now
                
                if evt.type == gpiod.LineEvent.FALLING_EDGE:
                    # print("Joystick - Switch Presionado")
                    joystick_data["pressed"] = True
                elif evt.type == gpiod.LineEvent.RISING_EDGE:
                    # print("Joystick - Switch Liberado")
                    joystick_data["pressed"] = False
            else:
                jstkSW.event_read()
        
        time.sleep(0.01)
