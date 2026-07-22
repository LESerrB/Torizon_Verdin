import serial

from api.com_UART import decode_Msg, encode_Msg, uart_send, crc16_arc, uart_receive

uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200
tcd_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

def com_TCD(vls_snsrsTCD):
    encode_Msg(tcd_UART1, "55")
    W, Q_len = decode_Msg(tcd_UART1)
    
    if(W[0] != 153 and W[1] != 0):
        if Q_len == 28:
            vls_snsrsTCD["t_Aire"] = int.from_bytes(W[0:2], byteorder="big")/10
            vls_snsrsTCD["t_Piel"] = int.from_bytes(W[2:4], byteorder="big")/10
            vls_snsrsTCD["s_Aux"] = int.from_bytes(W[4:6], byteorder="big")/10
            vls_snsrsTCD["ta_Ctrl"] = int.from_bytes(W[6:8], byteorder="big")/10
            vls_snsrsTCD["basc"] = int.from_bytes(W[8:10], byteorder="big")
            vls_snsrsTCD["pot_Calef"] = int.from_bytes(W[10:12], byteorder="big")
            vls_snsrsTCD["tp_Ctrl"] = int.from_bytes(W[12:14], byteorder="big")/10
            vls_snsrsTCD["s_Ox"] = int.from_bytes(W[14:16], byteorder="big")
            vls_snsrsTCD["ox_Ctrl"] = int.from_bytes(W[16:18], byteorder="big")
            vls_snsrsTCD["s_Hum"] = int.from_bytes(W[18:20], byteorder="big")
            vls_snsrsTCD["hum_Ctrl"] = int.from_bytes(W[20:22], byteorder="big")
            vls_snsrsTCD["fot_Hrs"] = int.from_bytes(W[22:24], byteorder="big")
            vls_snsrsTCD["fot_Mins"] = int.from_bytes(W[24:26], byteorder="big")
            vls_snsrsTCD["zero"] = W[26]
            vls_snsrsTCD["alrm"] = W[27]
    else:
        vls_snsrsTCD["alrm"] = 128 # MSB Indica error de comunicación UART

def set_dtProg(tdc_v, edit_Ctrl):
    control_config = {
        "ta_Prog":   (3, 2),
        "pot_Calef": (6, 1),
        "tp_Prog":   (7, 2),
        "pot_Ox":    (10, 1),
        "pot_Hum":   (12, 1),
        # "pot_Fot": (8, 1),
    }

    config = control_config.get(edit_Ctrl)

    if config is None:
        return "Unknown Status Code"

    position, byte_count = config

    try:
        if byte_count == 2:
            value = int(float(tdc_v) * 10)
            max_value = 0xFFFF
        else:
            value = int(tdc_v)
            max_value = 0xFF
    except (TypeError, ValueError):
        return "Invalid Value"

    if not 0 <= value <= max_value:
        return "Value Out of Range"

    # Trama base de 16 bytes
    dt = bytearray([
        0x00, 0xAA, 0x0C,              # Header
        0x00, 0x00,                    # Temperatura aire
        0x00, 0x00,                    # Potencia calefactor
        0x00, 0x00,                    # Temperatura piel
        0x00, 0x00,                    # Oxígeno
        0x00, 0x00,                    # Humedad
        0xFF, 0xFF,                    # CRC
        0x63                           # Tail
    ])

    dt[position:position + byte_count] = value.to_bytes(
        byte_count,
        byteorder="big"
    )

    print(dt)

    uart_send(tcd_UART1, bytes(dt))

    return bytes(dt)