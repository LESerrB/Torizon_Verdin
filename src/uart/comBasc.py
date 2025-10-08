import serial

# from files.logs import logger
# from dotenv import load_dotenv

# logger.info('Inicializando ADC')
# load_dotenv("/mnt/microsd/.env")

SCALE = 1.0
OFFSET = 0.0

w_bas = 0.0

#================================================================#
#             Función principal de comunicación UART             #
#================================================================#
uart_Channel = "/dev/verdin-uart2"
baud_rate = 57600

ser = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

#================================================================#
#                 Funciones de comunicación UART                 #
#================================================================#
def uart_send(data: str):
    try:
        if ser and ser.is_open:
            ser.write(data.encode('ascii'))
            print(f"Enviado: {data.strip()}")
        else:
            print("UART no está abierto")
    except Exception as e:
        # logger.error("Error escribiendo a Tarjeta de Bascula", e)
        # print(f"Error escribiendo a Tarjeta de Bascula {e}")
        return None

def uart_receive() -> str:
    try:
        if ser and ser.is_open:
            data = ser.readline().hex()
            # print("Dato recibido:", data)

            if data:
                return data
        else:
            print("UART no está abierto")
            return ""
    except Exception as e:
        # logger.error("Error leyendo Tarjeta de Bascula", e)
        # print(f"Error leyendo Tarjeta de Bascula {e}")
        return None

def close_uart():
    if ser and ser.is_open:
        ser.close()
        print("UART cerrado")
        # logger.info("UART cerrado")
    else:
        # logger.info("UART ya está cerrado")
        print("UART ya está cerrado")

#================================================================#
#                 Funciones de obtención de Peso                 #
#================================================================#
def decript_Msg():
    global w_bas
    basc_val = []

    trama = uart_receive()

    if trama and trama.startswith("00"): #and trama.endswith("63"):
        trama = [trama[i:i+2] for i in range(0, len(trama), 2)]
        num_bytes = int(trama[1], 16)

        for i in range(2, (2 + num_bytes)):
            basc_val.append(trama[i])

        basc_val = ''.join(basc_val)
        basc_val = bytes.fromhex(basc_val)
        w_bas = (int.from_bytes(basc_val, byteorder='big'))/1000

        # crc_rec = ''.join(trama[len(trama)-3] + trama[len(trama)-2])
        # crc_rec = hex(int(crc_rec, 16))
        # crc_calc = hex(crc16_arc(basc_val))
        # print(crc_calc)

        # if crc_rec == crc_calc:
        # print(w_bas)
    #     return w_bas
    else:
        w_bas = 0.0

    return w_bas

# Calculo de Peso
def pesaje():
    weight = (decript_Msg() - OFFSET) / SCALE

    return weight

# Calibración
def calib_Provisional(peso_Act = 5.0):
    global SCALE
    global OFFSET

    err = 0

    SCALE = round((decript_Msg() - OFFSET) / float(peso_Act), 2)

    while SCALE == 0.0:
        SCALE = round((decript_Msg() - OFFSET) / float(peso_Act), 2)
        err += 1

        if err > 5:
            SCALE = 1.0
            break

    # print(SCALE)

# Taraje
def tare_Provisional():
    global OFFSET
    err = 0

    OFFSET = decript_Msg()

    while OFFSET == 0.0:
        OFFSET = decript_Msg()
        err += 1

        if err > 5:
            break
        # print("OFFSET:", OFFSET)

#================================================================#
#                  Función de creación de CRC                    #
#================================================================#
def reflect_bits(data, width):
    return int('{:0{w}b}'.format(data, w=width)[::-1], 2)

def crc16_arc(data: bytes) -> int:
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
