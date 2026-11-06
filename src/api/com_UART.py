import time

#================================================================#
#                 Funciones de comunicación UART                 #
#================================================================#
def uart_send(uart_dev, data):
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
        if not uart_dev or not uart_dev.is_open:
            print("UART no está abierto")
            return False

        if not isinstance(data, (bytes, bytearray)):
            data = str(data).encode("ascii")

        # print(">>>>",data)
        written = uart_dev.write(data)
        uart_dev.flush()

        if written != len(data):
            print( f"Escritura UART incompleta: "
                   f"{written}/{len(data)} bytes" )
            return False

        return True
    except Exception as error:
        # logger.error("Error escribiendo a Tarjeta de Bascula", e)
        print(f"Error escribiendo a Tarjeta UART {error}")
        return False

def uart_receive(uart_dev, expected_size, timeout = 1.0) -> str:
    """
    Lee una línea desde UART y devuelve su representación hexadecimal.

    Retorno:
    - str: cadena hexadecimal de la línea leída si hay datos.
    - "": si el puerto no está abierto.
    - None: si ocurre una excepción durante la lectura.
    """
    try:
        if not uart_dev or not uart_dev.is_open:
            print("UART no está abierto")
            return None

        data = bytearray()
        deadline = time.monotonic() + timeout

        while len(data) < expected_size:
            rem = deadline - time.monotonic()

            if rem <= 0:
                break

            chunk = uart_dev.read(expected_size - len(data))

            if chunk:
                data.extend(chunk)
            else:
                time.sleep(0.005)

        if len(data) != expected_size:
            print( f"Trama UART incompleta: "
                   f"{len(data)}/{expected_size} bytes - {data.hex()}" )
            return None

        # print("<<<<",data)
        return bytes(data)
    except Exception as e:
        # logger.error("Error leyendo Tarjeta UART", e)
        print(f"Error leyendo Tarjeta UART {e}")
        return None

def close_uart(uart_dev):
    """
    Cierra el puerto UART si está abierto.

    Efectos secundarios:
    - Cierra el objeto global `ser` y libera el descriptor.
    - Imprime el estado resultante.
    """
    if uart_dev and uart_dev.is_open:
        uart_dev.close()
        print("UART cerrado")
        # logger.info("UART cerrado")
    else:
        # logger.info("UART ya está cerrado")
        print("UART ya está cerrado")

#================================================================#
#             Funciones de comunicación Tarjeta UART             #
#================================================================#
def decode_Msg(frame):
    """
    Decodifica la trama recibida desde la tarjeta de báscula y devuelve el peso.

    Flujo:
    - Llama a `uart_receive()` para obtener la trama en hex.
    - Valida cabecera (`00`) y terminador (`63`).
    - Extrae el número de bytes y la carga útil, calcula y compara CRC.
    - Convierte la carga útil a un valor de peso en kg (divide por 1000).

        Retorno:
        - tuple(bytes, int): siempre retorna una tupla con la carga útil
            como `bytes` y la longitud de la carga útil (número de bytes).
            En caso de error devuelve una carga indicadora `b'\x99\x00'` y
            su longitud.
    """
    try:
        bytes_list = []

        if frame and frame.startswith(b'\x00') and frame.endswith(b'\xaa'):
            n_bytes = frame[1]
            bytes_list = frame[2 : 2 + n_bytes]
            crc_calc = crc16_arc(bytes_list)
            crc_rec = int.from_bytes(frame[len(frame) - 3 : len(frame) - 1], byteorder='big')

            if crc_rec == crc_calc and n_bytes == len(bytes_list):
                return bytes_list, "sns_Info"
        elif b'\xaa\x0a' in frame:
            st = frame.find(b'\xaa\x0a')
            end = frame.find(b'\x63')
            bytes_list = frame[st + 2 : end]
            crc_calc = crc16_arc(bytes_list[:10])
            crc_rec = int.from_bytes(bytes_list[10:], byteorder='big')

            if crc_rec == crc_calc:
                return bytes_list[:10], "dvc_Conf"

        return b'\x99\x00', None
    except Exception as e:
        print(f"Error al recibir trama: {e}")
        return b'\x99\x00'

def encode_Msg(msg, cmd = None, edit_Ctrl = None):
    """
    Construye y envía una trama hacia la tarjeta de báscula.

    Parámetros:
    - msg (str): cadena con datos hexadecimales (sin espacios) que conforman
        la carga útil a enviar.

    Comportamiento:
    - Calcula el número de bytes, añade CRC-16 y el terminador `0x63`, y
        envía la trama completa mediante `uart_send()`.
    """
    try:
        # Trama base de 16 bytes
        dt = bytearray([
            0x00,                          # Header
            0x00,                          # CMD
            0x00,                          # LNG
            0x00, 0x00,                    # Temperatura aire / Solicitar Info Sensores [3]
            0x00, 0x00,                    # Potencia calefactor
            0x00, 0x00,                    # Temperatura piel
            0x00, 0x00,                    # Oxígeno
            0x00, 0x00,                    # Humedad
            0xFF, 0xFF,                    # CRC
            0x63                           # Tail
        ])

        control_config = {
            #     (Position, ByteCount)
            "ta_Prog":   (3, 2),
            "pot_Clf":   (6, 1),
            "tp_Prog":   (7, 2),
            "pot_Ox":    (10, 1),
            "pot_Hum":   (12, 1),
        }

        if cmd is None:
            # dt.pop(1)  # <<== PROBAR
            dt[2] = len(msg)
            dt[3:3 + len(msg)] = msg
        elif cmd == b'\xAA':
            dt[1] = cmd[0]
            dt[2] = 0x0A

            try:
                config = control_config.get(edit_Ctrl)
                position, byte_count = config

                if byte_count == 2:
                    value = int(float(msg) * 10)
                    max_value = 0xFFFF
                else:
                    value = int(msg)
                    max_value = 0xFF
            except (TypeError, ValueError):
                return "Invalid Value"

            if not 0 <= value <= max_value:
                    return "Value Out of Range"

            dt[position : position + byte_count] = value.to_bytes(byte_count, byteorder="big")

        # ========== Calculo de CRC ========== #
        crc = hex(crc16_arc(dt[3:13]))
        dt[13:15] = int(crc, 16).to_bytes(2, byteorder="big")

        return dt
    except Exception as e:
        print(f"Error al mandar trama: {e}")
        return False

#================================================================#
#                  Función de creación de CRC                    #
#================================================================#
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
        byte = int('{:0{w}b}'.format(byte, w=8)[::-1], 2)
        crc ^= (byte << 8)

        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ poly
            else:
                crc <<= 1

            crc &= 0xFFFF

    crc = int('{:0{w}b}'.format(crc, w=16)[::-1], 2)

    return crc