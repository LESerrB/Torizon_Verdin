import serial

from api.com_UART import decode_Msg, encode_Msg

uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200
tcd_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

def com_TCD(vls_snsrsTCD):
    encode_Msg(tcd_UART1, "55")
    W, Q_len = decode_Msg(tcd_UART1)

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
        print("error COM TCD")
