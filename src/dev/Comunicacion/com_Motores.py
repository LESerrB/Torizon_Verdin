from api.com_UART import (
    decode_Msg,
    uart_receive,
)

def status_Motrs(dev):
    res = uart_receive(dev, 6)
    print(res)
    # decode_Msg(res)
    return res