import serial

from api.com_UART import decode_Msg, encode_Msg

uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200
tcd_UART1 = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

def com_TCD():
    encode_Msg(tcd_UART1, "55")
    Q, Q_len = decode_Msg(tcd_UART1)

    if (Q_len == 28) and (not (Q.hex().startswith("99") and Q.hex().endswith("00"))):
        W = Q

        t_Aire = int.from_bytes(W[0:2], byteorder="big")
        t_Piel = int.from_bytes(W[2:4], byteorder="big")
        s_Aux = int.from_bytes(W[4:6], byteorder="big")

        ta_Ctrl = int.from_bytes(W[6:8], byteorder="big")

        basc = int.from_bytes(W[8:10], byteorder="big")

        pot_Calef = int.from_bytes(W[10:12], byteorder="big")

        tp_Ctrl = int.from_bytes(W[12:14], byteorder="big")

        s_Ox = int.from_bytes(W[14:16], byteorder="big")
        ox_Ctrl = int.from_bytes(W[16:18], byteorder="big")

        s_Hum = int.from_bytes(W[18:20], byteorder="big")
        hum_Ctrl = int.from_bytes(W[20:22], byteorder="big")

        fot_Hrs = int.from_bytes(W[22:24], byteorder="big")
        fot_Mins = int.from_bytes(W[24:26], byteorder="big")

        zero = W[26]
        alrm = W[27]

        print(f"\n==>Trama: {W}\nTemp Aire: {t_Aire} \n Temp Piel: {t_Piel} \n Sonda Aux: {s_Aux} \n Temp Aire Ctrl: {ta_Ctrl} \n Bascula: {basc} \n Pot Cal: {pot_Calef} \n Temp Piel Ctrl: {tp_Ctrl} \n Sens O2: {s_Ox} \n O2 Ctrl: {ox_Ctrl} \n Sens Hum: {s_Hum} \n Hum Ctrl: {fot_Hrs} \n Fot Hrs: {fot_Mins} \n Fot Mins: {hum_Ctrl} \n Cero: {zero} \n Alarmas: {alrm}")
