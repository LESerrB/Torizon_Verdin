import serial
import time

from api.com_UART import decode_Msg, encode_Msg
# from files.logs import logger
# from dotenv import load_dotenv

# logger.info('Inicializando ADC')
# load_dotenv("/mnt/microsd/.env")

SCALE = 1.0
OFFSET = 0.0
tolerancia = 0.100

#================================================================#
#             Función principal de comunicación UART             #
#================================================================#
uart_Channel = "/dev/verdin-uart1"
baud_rate = 57600

basc_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

#================================================================#
#                 Funciones de obtención de Peso                 #
#================================================================#
def pesaje():
    """
    Realiza múltiples lecturas de la báscula y devuelve el peso promedio calibrado.

    Proceso:
    - Envía la solicitud con `encode_Msg("55")` y lee respuestas válidas.
    - Promedia hasta 4 lecturas exitosas o hasta agotar el tiempo.
    - Aplica `OFFSET` y `SCALE` para convertir a las unidades finales.

    Retorno:
    - float: peso calculado; 0.0 si no se obtienen lecturas válidas.
    """
    pesoAcc = 0
    c = 0

    print("Iniciando Pesaje")

    finPesaje = time.monotonic() + 5

    while (c < 4) and (time.monotonic() < finPesaje):
        encode_Msg(basc_UART1, "55")
        w = decode_Msg(basc_UART1)

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    print("Peso acumulado:", pesoAcc)

    if pesoAcc > 0:
        pesoTotal = pesoAcc/c
        pesoTotal = (pesoTotal - OFFSET) / SCALE
    else:
        pesoTotal = 0.0

    return pesoTotal

def tare():
    """
    Realiza la operación de tara: mide el peso actual y actualiza `OFFSET`.

    Proceso:
    - Toma hasta 5 lecturas en un periodo máximo de 10 segundos.
    - Si no hay lecturas válidas retorna -1.
    - Si hay lecturas válidas calcula la media y la asigna a `OFFSET`.

    Retorno:
    - None cuando tiene éxito, -1 si falla la medición.
    """
    global OFFSET
    err = 0
    pesoAcc = 0
    c = 0

    print("Iniciando Tara")

    finPesaje = time.monotonic() + 10

    while (c < 5) and (time.monotonic() < finPesaje):
        encode_Msg(basc_UART1, "55")
        w = decode_Msg(basc_UART1)

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    print("Peso acumulado:", pesoAcc)

    if pesoAcc > 0:
        pesoAcc = pesoAcc/c
    else:
        return -1

    OFFSET = pesoAcc

def calib(peso_ptrn = 2.0):
    """
    Calibra la constante `SCALE` usando una masa patrón conocida.

    Parámetros:
    - peso_ptrn (float): peso patrón conocido usado para la calibración.

    Proceso:
    - Realiza hasta 4 lecturas válidas dentro de un periodo de 5 segundos.
    - Calcula la media de las lecturas y comprueba tolerancia básica.
    - Ajusta `SCALE = (medida - OFFSET) / peso_ptrn` redondeado a 2 decimales.

    Retorno:
    - None en éxito, -1 en caso de fallo en la medida o inconsistencia.
    """
    global SCALE
    err = 0
    pesoAcc = 0
    c = 0

    print("Iniciando Calibración")

    finPesaje = time.monotonic() + 5

    while (c < 4) and (time.monotonic() < finPesaje):
        encode_Msg(basc_UART1, "55")
        w = decode_Msg(basc_UART1)

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    print("Peso acumulado:", pesoAcc)

    if (pesoAcc > 0):
        pesoAcc = pesoAcc/c
    else:
        return -1

    if not ((pesoAcc-tolerancia) < pesoAcc < (pesoAcc+tolerancia)):
        return -1

    SCALE = round((pesoAcc - OFFSET) / float(peso_ptrn), 2)

    if SCALE <= 0:
        SCALE = 1
        print("Error Calibrando la Tarjeta de Báscula")
