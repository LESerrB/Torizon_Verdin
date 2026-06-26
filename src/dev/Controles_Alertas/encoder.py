import gpiod
import time

from api.pins_ADC import read_adc

#         Boton  |       |
#        Encoder |  CLK  |  DT
#----------------|-------|------
# Pin         4  |    1  |    2
# GPIO        0  |   26  |   27
# SODIMM     52  |   24  |   26
# GPIOCHIP    2  |    3  |    3
# FUNCTION   In  |   In  |   In

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip3"
bank2 = "/dev/gpiochip2"

enc_CLK = 26
enc_DT = 27
enc_SW = 0

# Líneas individuales
enc_clk = gpiod.Chip(bank).get_line(enc_CLK)
enc_dt = gpiod.Chip(bank).get_line(enc_DT)
enc_sw = gpiod.Chip(bank2).get_line(enc_SW)

# Configuración de Acceso
enc_clk.request(
    consumer="enc_CLK",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

enc_dt.request(
    consumer="enc_DT",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

enc_sw.request(
    consumer="enc_SW",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

# Valores para Encoder
DEBOUNCE_TIME_SW = 0.1      # Valor para evitar rebotes en el switch de 20 milisegundos

DEBOUNCE_TIME = 0.050       # 30 ms: ignora rebotes rápidos
SETTLE_TIME = 0.010         # 2 ms: espera pequeña antes de leer DT
STEP_LOCK_TIME = 0.100      # 100 ms: bloqueo después de aceptar un paso

STEP_VALUE_TP = 0.1         # Valor de cambio Temperatura Programada de Aire/Piel
STEP_VALUE_POT = 1          # Valor de cambio de Potencia Porcentual de Controles

STEP_VALUE = 0.1              # Valor ajustado de cambio

last_valid_time = 0.0
last_SW_time = 0.0

def clear_encoder_events():
    while enc_clk.event_wait(0):
        enc_clk.event_read()

def valEdit(valIni):
    global last_valid_time

    if not enc_clk.event_wait():
        return valIni

    evt = enc_clk.event_read()
    now = time.monotonic()

    if now - last_valid_time < DEBOUNCE_TIME:
        clear_encoder_events()
        return valIni

    if evt.type != gpiod.LineEvent.RISING_EDGE:
        return valIni

    time.sleep(SETTLE_TIME)

    current_DT = enc_dt.get_value()

    if (current_DT == 0) and (34.0 < valIni):
        valIni -= STEP_VALUE
    elif (valIni < 37.0):
        valIni += STEP_VALUE

    last_valid_time = now

    time.sleep(STEP_LOCK_TIME)

    clear_encoder_events()

    return round(valIni, 1)

def swAcept() -> bool:
    """
    Detecta la liberación del botón del encoder (Switch).
    
    Monitorea el evento de liberación (RISING_EDGE) del botón pulsador del encoder
    e imprime un mensaje cuando se detecta. Esta función es principalmente para
    validar la interacción del usuario con el botón.
    
    Returns:
        None
    """
    global last_SW_time

    if enc_sw.event_wait(0):
        evt = enc_sw.event_read()

        if evt.type == gpiod.LineEvent.RISING_EDGE:
            current_time = time.monotonic()

            if (current_time - last_SW_time) >= DEBOUNCE_TIME_SW:
                last_SW_time = current_time
                return False

    return True

def valUpdt(Value, Ctrl="TempProg"):
    """
    Actualiza el valor del control detectando entrada del encoder.
    
    Función principal que orquesta la lectura del encoder y actualiza el valor
    de control. Procesa tanto la rotación del encoder como la pulsación del botón.
    
    Args:
        editVal (str): Tipo de valor a editar ("temProg" o potencia)
        initValue (float): Valor inicial del control
        sobreGiro (bool): Bandera de sobregiro para temperatura
    
    Returns:
        float: Valor actualizado y redondeado a 1 decimal
    
    Nota:
        El valor es redondeado a 1 decimal para evitar problemas de precisión
        en cálculos posteriores.
    """
    global STEP_VALUE

    if Ctrl == "TempProg":
        STEP_VALUE = STEP_VALUE_TP
    elif Ctrl == "CtrlPot":
        STEP_VALUE = STEP_VALUE_POT

    value = valEdit(Value)
    check = swAcept()

    return value, check
