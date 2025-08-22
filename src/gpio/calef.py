import gpiod
import time
import threading

# Pin       11  |   12  |   13  |   14  |   15
# GPIO      3   |   3   |   3   |   3   |   3
# SODIMM    30  |  32   |   34  |   36  |   38
# GPIOCHIP  3   |   3   |   3   |   3   |   3
# LINE      25  |  24   |   26  |   23  |   27

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip3" # GPIO3

pin_11 = 25    # Calefactor
pin_12 = 24
pin_13 = 26
pin_14 = 23
pin_15 = 27

# Inicialización chips
gpio_chip = gpiod.Chip(bank)

# Líneas individuales
calef_pin = gpio_chip.get_line(pin_11)
pinout_12 = gpio_chip.get_line(pin_12)
pinout_13 = gpio_chip.get_line(pin_13)
pinout_14 = gpio_chip.get_line(pin_14)
pinout_15 = gpio_chip.get_line(pin_15)

# Configuración de Acceso
calef_pin.request(consumer="calef", type=gpiod.LINE_REQ_DIR_OUT)
pinout_12.request(consumer="pinout_12", type=gpiod.LINE_REQ_DIR_OUT)
pinout_13.request(consumer="pinout_13", type=gpiod.LINE_REQ_DIR_OUT)
pinout_14.request(consumer="pinout_14", type=gpiod.LINE_REQ_DIR_OUT)
pinout_15.request(consumer="pinout_15", type=gpiod.LINE_REQ_DIR_OUT)

PWM_Calef = 75  # Valor inicial
PWM_Calef_lock = threading.Lock()

#===============================================================#
#                   Función Control Calefactor                  #
#===============================================================#
def set_PWM_Calef(val):
    global PWM_Calef

    with PWM_Calef_lock:
        PWM_Calef = val

def get_PWM_Calef():
    with PWM_Calef_lock:
        return PWM_Calef

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

