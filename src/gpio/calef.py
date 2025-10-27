import gpiod
import time
import threading
import struct

# Pin       11  |   12  |   13  |   14  |   15
# GPIO      3   |   3   |   3   |   3   |   3
# SODIMM    30  |  32   |   34  |   36  |   38
# GPIOCHIP  3   |   3   |   3   |   3   |   3
# LINE      25  |  24   |   26  |   23  |   27

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
# bank = "/dev/gpiochip3" # GPIO3 # Mallow
bank = "/dev/gpiochip0" # GPIO3 # Dahlia

# pin_11 = 25     # Calefactor
# pin_12 = 24     # Lectura de Señal Calefactor

pin_27 = 0     # Calefactor
pin_28 = 1     # Lectura de Señal Calefactor

# Inicialización chips
gpio_chip = gpiod.Chip(bank)

# Líneas individuales
calef_pin = gpio_chip.get_line(pin_27)
calef_read = gpio_chip.get_line(pin_28)

# Configuración de Acceso
calef_pin.request(consumer="calef", type=gpiod.LINE_REQ_DIR_OUT)
calef_read.request(consumer="calef_read", type=gpiod.LINE_REQ_EV_BOTH_EDGES)

PWM_Calef = 100  # Valor inicial
PWM_Calef_lock = threading.Lock()

# Valores de Monitoreo de pulsos de Calefactor
alertaCalef_Desconectado = False

#===============================================================#
#                  Funciones Control Calefactor                 #
#===============================================================#
def set_PWM_Calef(val):
    global PWM_Calef

    with PWM_Calef_lock:
        PWM_Calef = val

def get_PWM_Calef():
    with PWM_Calef_lock:
        return PWM_Calef

def get_PWMstatus():
    calefData = struct.pack('i?', PWM_Calef, alertaCalef_Desconectado)

    return calefData
#===============================================================#
#                    Función PWM Calefactor                     #
#===============================================================#
def ctrl_Calef():
    timer = 0
    timer_calef = 0

    while True:
        timer += 1

        if timer >= 10:
            timer_calef += 1

            # Logica Inversa
            potencia = get_PWM_Calef()

            if timer_calef <= potencia:
                calef_pin.set_value(0) # Enciende el calefactor
            elif timer_calef > potencia:
                calef_pin.set_value(1) # Apaga el calefactor

            if timer_calef > 100:
                timer_calef = 0

            timer = 0

        time.sleep(0.01632)  # 16.32 ms

def statusCom_Calef():
    low_Start = None
    global alertaCalef_Desconectado
    timeout = 20  # [seg]

    while True:
        now = time.monotonic()

        if calef_read.get_value() == 0:
            if low_Start is None:
                low_Start = now
            elif now - low_Start > timeout:
                alertaCalef_Desconectado = True
        else:
            low_Start = None
            alertaCalef_Desconectado = False

        time.sleep(0.1)
