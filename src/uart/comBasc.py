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
    try:
        if ser and ser.is_open:
            if isinstance(data, (bytes, bytearray)):
                # print(f"Enviado (hex): {data.hex()}")
                # print(data)
                ser.write(data)
            else:
                s = str(data)
                ser.write(s.encode('ascii'))
                # print(f"Enviado (str): {s.strip()}")
        else:
            print("UART no está abierto")
    except Exception as e:
        # logger.error("Error escribiendo a Tarjeta de Bascula", e)
        print(f"Error escribiendo a Tarjeta de Bascula {e}")
        return None

def uart_receive() -> str:
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
        # print(crc_calc)

        if crc_rec == crc_calc:
            # print("W:", w_bas)
            return w_bas
    else:
        w_bas = 0.0

    return w_bas

def encode_Msg(msg):
    n_bytes = int(len(msg)/2).to_bytes(1, byteorder='big')
    dt = bytes.fromhex(msg)

    crc = crc16_arc(dt)
    crc = crc.to_bytes(2, byteorder='big')
    dt = b'\x00' + n_bytes + dt + crc + b'\x63'

    # print(dt.hex())

    uart_send(dt)
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
#================================================================#
#                 Funciones de obtención de Peso                 #
#================================================================#
def pesaje():
    pesoAcc = 0
    c = 0

    print("Iniciando Pesaje")

    finPesaje = time.monotonic() + 5

    while (c < 4) and (time.monotonic() < finPesaje):
        encode_Msg("55")
        w = decode_Msg()
        # print(w, pesoAcc, c, time.monotonic(), finPesaje)

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    if pesoAcc > 0:
        pesoTotal = pesoAcc/c
        pesoTotal = (pesoTotal - OFFSET) / SCALE
    else:
        pesoTotal = 0.0

    print("Peso Final:", pesoTotal)
    return pesoTotal

def tare():
    global OFFSET
    err = 0
    pesoAcc = 0
    c = 0

    print("Iniciando Tara")

    finPesaje = time.monotonic() + 10

    while (c < 5) and (time.monotonic() < finPesaje):
        encode_Msg("55")
        w = decode_Msg()
        print(w, pesoAcc, c, time.monotonic(), finPesaje)

        if w != 0.0:
            pesoAcc = pesoAcc + w
            c += 1

    if pesoAcc > 0:
        pesoAcc = pesoAcc/c
    else:
        return -1

    OFFSET = pesoAcc
    print("Nuevo Offset:", OFFSET)

def calib(peso_ptrn = 5.0):
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

    print("SCALE:", SCALE)
