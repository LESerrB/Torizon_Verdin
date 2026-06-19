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

DEBOUNCE_TIME = 0.02  # 20 milisegundos

last_DT = enc_dt.get_value()
last_CLK = enc_clk.get_value()

def valEdit(editVal, valIni, sobreGiro):
    """
    Detecta rotación del encoder y modifica el valor en función de la dirección.
    
    Monitorea los cambios de estado del encoder (CLK y DT) para determinar la dirección
    de rotación e incrementa o decrementa el valor según corresponda.
    
    Args:
        editVal (str): Tipo de valor a editar:
                      - "temProg": Temperatura Programada
                      - Otro valor: Potencia del Calefactor
        valIni (float): Valor inicial a modificar
        sobreGiro (bool): Bandera que permite sobregiro en temperatura programada
    
    Returns:
        float: Valor modificado después de la rotación del encoder
               Si no hay evento, retorna el valor original (valIni)
    
    Límites de valores:
        - Temperatura: 34.0°C - 37.0°C (o hasta 38.0°C con sobreGiro)
        - Potencia: 0 - 100%
    """
    global last_DT
    global last_CLK

    if enc_clk.event_wait():
        evt = enc_clk.event_read()
        current_CLK = 1 if evt.type == gpiod.LineEvent.RISING_EDGE else 0
        current_DT = enc_dt.get_value()

        if current_CLK != last_CLK:
            if current_CLK == current_DT:
                if editVal == "temProg":
                    if (valIni < 37.0) and (not sobreGiro):
                        valIni += 0.1
                    elif(valIni < 38.0) and sobreGiro:
                        valIni += 0.1
                else:
                    if valIni < 100:
                        valIni += 1
            else:
                if editVal == "temProg":
                    if (valIni > 34.0):
                        valIni -= 0.1
                else:
                    if valIni > 0:
                        valIni -= 1

        last_CLK = current_CLK
        last_DT = current_DT

        return valIni
    else:
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
    if enc_sw.event_wait(0):
        evt = enc_sw.event_read()

        if evt.type == gpiod.LineEvent.RISING_EDGE:
            return True

    return False

def valUpdt(editVal, initValue, sobreGiro):
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
    new_value = valEdit(editVal, initValue, sobreGiro)
    accepted = swAcept()

    return round(new_value, 1), accepted