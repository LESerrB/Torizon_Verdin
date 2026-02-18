import gpiod
import time

from api.pins_ADC import read_adc

#         Boton  |       |
#        Encoder |  CLK  |  DT
#----------------|-------|------
# Pin        32  |   34  |   35
# GPIO        5  |    7  |    8
# SODIMM    216  |  220  |  222
# GPIOCHIP    0  |    3  |    3
# LINE        7  |    3  |    1
# FUNCTION   In  |   In  |   In

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0"
bank2 = "/dev/gpiochip2"

enc_CLK = 14
enc_DT = 16
enc_SW = 7

# Líneas individuales
enc_clk = gpiod.Chip(bank2).get_line(enc_CLK)
enc_dt = gpiod.Chip(bank2).get_line(enc_DT)
enc_sw = gpiod.Chip(bank).get_line(enc_SW)

# Configuración de Acceso
enc_clk.request(
    consumer="enc_CLK",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

enc_dt.request(
    consumer="enc_DT",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

enc_sw.request(
    consumer="enc_SW",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

DEBOUNCE_TIME = 0.02  # 20 milisegundos

last_DT = enc_dt.get_value()
last_CLK = enc_clk.get_value()

def valEdit(editVal, valIni):
    global last_DT
    global last_CLK

    if enc_clk.event_wait():
        evt = enc_clk.event_read()
        current_CLK = 1 if evt.type == gpiod.LineEvent.RISING_EDGE else 0
        current_DT = enc_dt.get_value()

        if current_CLK != last_CLK:
            if current_CLK == current_DT:
                if editVal == "temProg":
                    if (valIni <= 36.9):
                        valIni += 0.1
                else:
                    valIni += 1
            else:
                if editVal == "temProg":
                    if (valIni > 34.0):
                        valIni -= 0.1
                else:
                    valIni -= 1

        last_CLK = current_CLK
        last_DT = current_DT

        return valIni
    else:
        return valIni

def swAcept():
    if enc_sw.event_wait(0):
        evt = enc_sw.event_read()

        if evt.type == gpiod.LineEvent.RISING_EDGE:
            print("Switch Liberado")

def valupdt(editVal, tempProg_Lvl):
    tempProg_Lvl = valEdit(editVal, tempProg_Lvl)
    swAcept()

    return round(tempProg_Lvl, 1)