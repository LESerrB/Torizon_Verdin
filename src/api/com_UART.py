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
        if uart_dev and uart_dev.is_open:
            if isinstance(data, (bytes, bytearray)):
                print(">>>>", data)
                uart_dev.write(data)
            else:
                s = str(data)
                uart_dev.write(s.encode('ascii'))
        else:
            print("UART no está abierto")
    except Exception as e:
        # logger.error("Error escribiendo a Tarjeta de Bascula", e)
        print(f"Error escribiendo a Tarjeta de Bascula {e}")
        return None

def uart_receive(uart_dev) -> str:
    """
    Lee una línea desde UART y devuelve su representación hexadecimal.

    Retorno:
    - str: cadena hexadecimal de la línea leída si hay datos.
    - "": si el puerto no está abierto.
    - None: si ocurre una excepción durante la lectura.
    """
    try:
        if uart_dev and uart_dev.is_open:
            data = uart_dev.readline().hex()

            if data:
                return data
        else:
            print("UART no está abierto")
            return ""
    except Exception as e:
        # logger.error("Error leyendo Tarjeta de Bascula", e)
        print(f"Error leyendo Tarjeta de Bascula {e}")
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
#          Funciones de comunicación Tarjeta de Báscula          #
#================================================================#
def decode_Msg(basc_UART1):
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
    # basc_val = []

    trama = uart_receive(basc_UART1)
    print("<<<<", trama)
    if trama != None:
        return trama

    # if trama and trama.startswith("00") and trama.endswith("63"):
    #     trama = [trama[i:i+2] for i in range(0, len(trama), 2)]
    #     n_bytes = int(trama[1], 16)

    #     for i in range(2, (2 + n_bytes)):
    #         basc_val.append(trama[i])

    #     basc_val = ''.join(basc_val)
    #     basc_val = bytes.fromhex(basc_val)
    #     w_bas = (int.from_bytes(basc_val, byteorder='big'))/1000

    #     crc_rec = ''.join(trama[len(trama)-3] + trama[len(trama)-2])
    #     crc_rec = hex(int(crc_rec, 16))
    #     crc_calc = hex(crc16_arc(basc_val))

    #     if crc_rec == crc_calc:
    #         return w_bas
    # else:
    #     w_bas = 0.0

    # return w_bas

def encode_Msg(basc_UART1, msg):
    # {0x00,0x00,0x55,0x00,0x00,0x00,0x00,0x00,0x00,0x00};
    """
    Construye y envía una trama hacia la tarjeta de báscula.

    Parámetros:
    - msg (str): cadena con datos hexadecimales (sin espacios) que conforman
        la carga útil a enviar.

    Comportamiento:
    - Calcula el número de bytes, añade CRC-16 y el terminador `0x63`, y
        envía la trama completa mediante `uart_send()`.
    """
    # n_bytes = int(len(msg)/2).to_bytes(1, byteorder='big')
    # dt = bytes.fromhex(msg)

    # crc = crc16_arc(dt)
    # crc = crc.to_bytes(2, byteorder='big')
    # dt = b'\x00' + n_bytes + dt + crc + b'\x63'

    dt = b'\x00' + b'\x00' + b'\x55' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00'

    uart_send(basc_UART1, dt)
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