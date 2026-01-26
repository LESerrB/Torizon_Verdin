import gpiod
import time

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0"

pin_sw = 7  # GPIO_5

# Inicialización chips
gpio_chip0 = gpiod.Chip(bank)

# Líneas individuales
jstkSW = gpio_chip0.get_line(pin_sw)

# Configuración de Acceso
jstkSW.request(
    consumer="jsSW_button",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)
#===============================================================#
#                      Configuración de ADC                     #
#===============================================================#
def read_adc(channel):
    try:
        with open(f"/sys/bus/iio/devices/iio:device0/in_voltage{channel}_raw", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        # logger.error(f"Canal ADC {channel} no encontrado.")
        print(f"Canal ADC {channel} no encontrado.")
        return -1

#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def rd_jstk_axis(adc_chn: int):
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
#              Función integrada de Joystick                    #
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

    while True:
        now = time.monotonic()

        if now - last_read_time >= READ_INTERVAL:
            x = rd_jstk_axis(1)
            y = rd_jstk_axis(0)
            # print(f"Joystick - X: {x}, Y: {y}")
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
