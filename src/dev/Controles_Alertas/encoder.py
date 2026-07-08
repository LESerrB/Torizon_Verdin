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

# =============
# Botón Encoder
# =============
DEBOUNCE_TIME_SW = 0.8      # Valor para evitar rebotes en el switch de 20 milisegundos
last_SW_time = 0            # Timestamp para el boton del encoder

# ===========
# Incrementos 
# ===========
STEP_VALUE_TP = 0.1         # Valor de cambio Temperatura Programada de Aire/Piel
STEP_VALUE_POT = 1          # Valor de cambio de Potencia Porcentual de Controles
############################
STEP_VALUE = 0.1            # Valor ajustado de cambio


# =====================================
# Configuración de Valores para Encoder
# =====================================
# Tiempo entre lecturas del encoder
POLL_TIME = 0.0003              # 0.3 ms
TRANSITION_DEBOUNCE = 0.0001    # 0.1 ms
# Tiempo mínimo entre pasos completos aceptados
STEP_DEBOUNCE_TIME = 0.003      # 3 ms
TRANSITIONS_PER_STEP = 2

INVERT_DIRECTION = True


# ==================
# Variables internas
# ==================
last_state = None
last_transition_time = 0.0
last_step_time = 0.0
encoder_accum = 0


def read_encoder_state():
    """
    Lee CLK y DT lo más rápido posible.

    No se usan múltiples muestras largas porque tu señal es de ~4 ms.
    """

    clk = enc_clk.get_value()
    dt = enc_dt.get_value()

    return (clk << 1) | dt

def init_encoder():
    """
    Inicializa el estado actual del encoder.
    Llamar una sola vez antes del while principal.
    """

    global last_state
    global last_transition_time
    global last_step_time
    global encoder_accum

    last_state = read_encoder_state()
    now = time.monotonic()

    last_transition_time = now
    last_step_time = now
    encoder_accum = 0

def valEdit(valIni):
    """
    Lectura robusta del encoder usando máquina de estados.

    Esta versión está ajustada para un encoder de 24 pulsos
    con señales alrededor de 4 ms.
    """

    global last_state
    global last_transition_time
    global last_step_time
    global encoder_accum

    transition_table = {
        (0b00, 0b01): +1,
        (0b01, 0b11): +1,
        (0b11, 0b10): +1,
        (0b10, 0b00): +1,

        (0b00, 0b10): -1,
        (0b10, 0b11): -1,
        (0b11, 0b01): -1,
        (0b01, 0b00): -1,
    }

    now = time.monotonic()
    current_state = read_encoder_state()

    if last_state is None:
        last_state = current_state
        return valIni

    if current_state == last_state:
        return valIni

    if now - last_transition_time < TRANSITION_DEBOUNCE:
        return valIni

    transition = transition_table.get((last_state, current_state), 0)

    last_state = current_state
    last_transition_time = now

    if transition == 0:
        encoder_accum = 0
        return valIni

    if INVERT_DIRECTION:
        transition *= -1

    encoder_accum += transition

    if encoder_accum >= TRANSITIONS_PER_STEP:
        if (now - last_step_time >= STEP_DEBOUNCE_TIME) and (valIni < 38.0):
            valIni += STEP_VALUE
            valIni = round(valIni, 1)
            last_step_time = now

        encoder_accum = 0

    elif encoder_accum <= -TRANSITIONS_PER_STEP:
        if (now - last_step_time >= STEP_DEBOUNCE_TIME) and (34.0 < valIni):
            valIni -= STEP_VALUE
            valIni = round(valIni, 1)
            last_step_time = now

        encoder_accum = 0

    return valIni



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
    # check = swAcept()

    return value#, check
