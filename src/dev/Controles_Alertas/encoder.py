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


DEBOUNCE_TIME_SW = 0.1      # Valor para evitar rebotes en el switch de 20 milisegundos
last_SW_time = 0            # Timestamp para el boton del encoder



# =====================================
# Configuración de Valores para Encoder
# =====================================
# Tiempo entre lecturas del encoder
POLL_TIME = 0.001          # 1 ms
# Tiempo mínimo entre pasos completos aceptados
STEP_DEBOUNCE_TIME = 0.030 # 30 ms
# Estado de reposo del encoder.
# Muchos encoders con pull-up descansan en 0b11.
# Si tu encoder descansa en bajo, usa 0b00.
DETENT_STATE = 0b11
# Cambia a True si el sentido queda invertido
INVERT_DIRECTION = False

# ===========
# Incrementos 
# ===========
STEP_VALUE_TP = 0.1         # Valor de cambio Temperatura Programada de Aire/Piel
STEP_VALUE_POT = 1          # Valor de cambio de Potencia Porcentual de Controles
######################################################
STEP_VALUE = 0.1            # Valor ajustado de cambio

# ==================
# Variables internas
# ==================
last_state = None
last_step_time = 0.0
encoder_accum = 0



def read_stable_gpio(line, samples=5, delay=0.0002):
    """
    Lee un GPIO varias veces y devuelve el valor dominante.
    Esto ayuda a rechazar ruido corto o rebotes pequeños.
    """
    total = 0

    for _ in range(samples):
        total += line.get_value()
        time.sleep(delay)

    return 1 if total >= 3 else 0


def read_encoder_state():
    """
    Lee CLK y DT como un estado de 2 bits.

    Estado:
        CLK | DT
         0  |  0  -> 0b00
         0  |  1  -> 0b01
         1  |  0  -> 0b10
         1  |  1  -> 0b11
    """

    clk = read_stable_gpio(enc_clk)
    dt = read_stable_gpio(enc_dt)

    return (clk << 1) | dt



def init_encoder():
    """
    Inicializa el estado del encoder.
    Llamar una sola vez antes del while principal.
    """

    global last_state
    global last_step_time
    global encoder_accum

    last_state = read_encoder_state()
    last_step_time = time.monotonic()
    encoder_accum = 0



def valEdit(valIni):
    """
    Lee el encoder con máquina de estados.

    Esta función evita que al girar en sentido antihorario
    el valor siga aumentando por culpa de rebotes en DT o CLK.
    """

    global last_state
    global last_step_time
    global encoder_accum

    # Tabla de cuadratura
    #
    # Sentido A:
    # 00 -> 01 -> 11 -> 10 -> 00
    #
    # Sentido B:
    # 00 -> 10 -> 11 -> 01 -> 00
    #
    # Las transiciones inválidas se ignoran.

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

    current_state = read_encoder_state()

    if last_state is None:
        last_state = current_state
        return valIni

    # Si no hubo cambio real, no hacer nada
    if current_state == last_state:
        return valIni

    transition = transition_table.get((last_state, current_state), 0)

    # Actualizar estado
    last_state = current_state

    # Si la transición no existe en la tabla, probablemente fue ruido
    if transition == 0:
        encoder_accum = 0
        return valIni

    if INVERT_DIRECTION:
        transition *= -1

    encoder_accum += transition

    now = time.monotonic()

    # Solo aceptar el paso cuando el encoder vuelve al estado de reposo
    if current_state == DETENT_STATE:

        if now - last_step_time < STEP_DEBOUNCE_TIME:
            encoder_accum = 0
            return valIni

        # Se requiere una acumulación consistente.
        # Valores positivos: un sentido.
        # Valores negativos: sentido contrario.
        if (encoder_accum >= 2) and (valIni < 37.0):
            valIni += STEP_VALUE
            valIni = round(valIni, 1)
            last_step_time = now

        elif (encoder_accum <= -2) and (34.0 < valIni):
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
    check = swAcept()

    return value, check
