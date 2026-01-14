import serial
import time

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
uart_Channel = "/dev/verdin-uart2"
baud_rate = 57600

ser = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)
#================================================================#
#                 Funciones de comunicación UART                 #
#================================================================#
def uart_send(data):
    """
    Envía datos por UART al dispositivo de la báscula.

    Comportamiento:
    - Si `data` es `bytes` o `bytearray` se envía tal cual.
    - En caso contrario se convierte a cadena y se codifica en ASCII.

    Parámetros:
    - data: objeto iterable de bytes o cualquier valor convertible a cadena.

    Retorno:
    - None. En caso de error la función captura la excepción e imprime
      un mensaje y retorna `None`.
    """
    try:
        if ser and ser.is_open:
            if isinstance(data, (bytes, bytearray)):
                ser.write(data)
            else:
                s = str(data)
                ser.write(s.encode('ascii'))
        else:
            print("UART no está abierto")
    except Exception as e:
        # logger.error("Error escribiendo a Tarjeta de Bascula", e)
        print(f"Error escribiendo a Tarjeta de Bascula {e}")
        return None

def uart_receive() -> str:
    """
    Lee una línea desde UART y devuelve su representación hexadecimal.

    Retorno:
    - str: cadena hexadecimal de la línea leída si hay datos.
    - "": si el puerto no está abierto.
    - None: si ocurre una excepción durante la lectura.
    """
    try:
        if ser and ser.is_open:
            data = ser.readline().hex()

            if data:
                return data
        else:
            print("UART no está abierto")
            return ""
    except Exception as e:
        # logger.error("Error leyendo Tarjeta de Bascula", e)
        print(f"Error leyendo Tarjeta de Bascula {e}")
        return None

def close_uart():
    """
    Cierra el puerto UART si está abierto.

    Efectos secundarios:
    - Cierra el objeto global `ser` y libera el descriptor.
    - Imprime el estado resultante.
    """
    if ser and ser.is_open:
        ser.close()
        print("UART cerrado")
        # logger.info("UART cerrado")
    else:
        # logger.info("UART ya está cerrado")
        print("UART ya está cerrado")
#================================================================#
#          Funciones de comunicación Tarjeta de Báscula          #
#================================================================#
def decode_Msg():
    """
    Decodifica la trama recibida desde la tarjeta de báscula y devuelve el peso.

    Flujo:
    - Llama a `uart_receive()` para obtener la trama en hex.
    - Valida cabecera (`00`) y terminador (`63`).
    - Extrae el número de bytes y la carga útil, calcula y compara CRC.
    - Convierte la carga útil a un valor de peso en kg (divide por 1000).

    Retorno:
    - float: peso en kg si la trama y el CRC son válidos.
    - 0.0 si la trama no es válida o no cumple el formato.
    """
    basc_val = []

    trama = uart_receive()
    # print("Trama:",trama)

    if trama and trama.startswith("00") and trama.endswith("63"):
        trama = [trama[i:i+2] for i in range(0, len(trama), 2)]
        n_bytes = int(trama[1], 16)

        for i in range(2, (2 + n_bytes)):
            basc_val.append(trama[i])

        basc_val = ''.join(basc_val)
        basc_val = bytes.fromhex(basc_val)
        w_bas = (int.from_bytes(basc_val, byteorder='big'))/1000

        crc_rec = ''.join(trama[len(trama)-3] + trama[len(trama)-2])
        crc_rec = hex(int(crc_rec, 16))
        crc_calc = hex(crc16_arc(basc_val))

        if crc_rec == crc_calc:
            return w_bas
    else:
        w_bas = 0.0

    return w_bas

def encode_Msg(msg):
    """
    Construye y envía una trama hacia la tarjeta de báscula.

    Parámetros:
    - msg (str): cadena con datos hexadecimales (sin espacios) que conforman
        la carga útil a enviar.

    Comportamiento:
    - Calcula el número de bytes, añade CRC-16 y el terminador `0x63`, y
        envía la trama completa mediante `uart_send()`.
    """
    n_bytes = int(len(msg)/2).to_bytes(1, byteorder='big')
    dt = bytes.fromhex(msg)

    crc = crc16_arc(dt)
    crc = crc.to_bytes(2, byteorder='big')
    dt = b'\x00' + n_bytes + dt + crc + b'\x63'

    uart_send(dt)
#================================================================#
#                  Función de creación de CRC                    #
#================================================================#
def reflect_bits(data, width):
    """
    Refleja (invierte) los bits de `data` en un ancho `width`.

    Ejemplo:
    - reflect_bits(0b1101, 4) -> 0b1011

    Parámetros:
    - data (int): valor entero cuyos bits se van a reflejar.
    - width (int): número de bits a considerar en la reflexión.

    Retorno:
    - int: valor con los bits reflejados.
    """
    return int('{:0{w}b}'.format(data, w=width)[::-1], 2)

def crc16_arc(data: bytes) -> int:
    """
    Calcula el CRC-16/ARC (polinomio 0x8005) de los datos proporcionados.

    Características:
    - Usa reflexión de bits en entrada y salida (reflect in/out).
    - Devuelve el valor CRC de 16 bits como entero.

    Parámetros:
    - data (bytes): secuencia de bytes para calcular el CRC.

    Retorno:
    - int: CRC de 16 bits.
    """
    poly = 0x8005
    crc = 0x0000

    for byte in data:
        byte = reflect_bits(byte, 8)
        crc ^= (byte << 8)

        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ poly
            else:
                crc <<= 1

            crc &= 0xFFFF

    crc = reflect_bits(crc, 16)

    return crc
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
        encode_Msg("55")
        w = decode_Msg()

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

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
        encode_Msg("55")
        w = decode_Msg()

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    if pesoAcc > 0:
        pesoAcc = pesoAcc/c
    else:
        return -1

    OFFSET = pesoAcc

def calib(peso_ptrn = 5.0):
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
        encode_Msg("55")
        w = decode_Msg()

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    if (pesoAcc > 0):
        pesoAcc = pesoAcc/c
    else:
        return -1

    if not ((pesoAcc-tolerancia) < pesoAcc < (pesoAcc+tolerancia)):
        return -1

    SCALE = round((pesoAcc - OFFSET) / float(peso_ptrn), 2)
