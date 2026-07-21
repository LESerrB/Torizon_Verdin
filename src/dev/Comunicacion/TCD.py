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

            # print(vls_snsrsTCD["ta_Ctrl"])
    else:
        vls_snsrsTCD["alrm"] = 128 # MSB Indica error de comunicación UART

def set_dtProg(tdc_s):
    # n_bytes = int(len(tdc_s)/2)
    # tdc_s = "55" + tdc_s
    print(tdc_s)
    # dt = bytes.fromhex(tdc_s)

    # crc = crc16_arc(dt)
    # crc = crc.to_bytes(2, byteorder='big')

    # rpt = 10 - n_bytes

    # if rpt > 0:
    #     void_dt = b'\x00' * rpt
    # else:
    #     void_dt = b''

    # n_bytes = n_bytes.to_bytes(1, byteorder='big')
    
#            00        AA        0C  |    T Aire ctrl    |   Pot Calefactor  |    t Piel Ctrl    |      O2 Ctrl      |     Hum Ctrl      |        CRC        
    dt = b'\x00' + b'\xAA' + b'\x0C' + b'\x01' + b'\x68' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x00' + b'\x63'
    
    print(">>>>", dt)
    uart_send(tcd_UART1, dt)
    print("<<<<<", uart_receive(tcd_UART1))