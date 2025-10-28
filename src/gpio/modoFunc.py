import gpiod
import time

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0" # GPIO3 # Dahlia
bank2 = "/dev/gpiochip3" # GPIO4 # Dahlia

pin_SnsCuna = 6     # GPIO4
pin_SnsIncub = 7    # GPIO5

pin_Motor_n = 3     # GPIO7
pin_Motor_p = 1     # GPIO8

strModoFunc = ""
tiempo_deApertura = 15 # seg

# Inicialización chips
gpio_chip = gpiod.Chip(bank)
gpio_chip2 = gpiod.Chip(bank2)

# Lineas individuales
cuna = gpio_chip.get_line(pin_SnsCuna)
incb = gpio_chip.get_line(pin_SnsIncub)

motor_P = gpio_chip2.get_line(pin_Motor_p)
motor_N = gpio_chip2.get_line(pin_Motor_n)

# Configuración de Acceso
cuna.request(consumer="cuna", type=gpiod.LINE_REQ_EV_BOTH_EDGES)
incb.request(consumer="incb", type=gpiod.LINE_REQ_EV_BOTH_EDGES)

motor_P.request(consumer="motor_P", type=gpiod.LINE_REQ_DIR_OUT)
motor_N.request(consumer="motor_N", type=gpiod.LINE_REQ_DIR_OUT)

# Motor apagado
motor_P.set_value(0)
motor_N.set_value(0)

#===============================================================#
#                Funciones de Lectura de Sensores               #
#===============================================================#
def rd_ModoOp():
    global strModoFunc

    if cuna.get_value():
        strModoFunc = "Modo Cuna"
        return strModoFunc
    elif incb.get_value():
        strModoFunc = "Modo Incubadora"
        return strModoFunc
    else:
        strModoFunc = "ERROR"
        return strModoFunc
    
def giroMotor(action):
    if action == "Abrir":
        motor_P.set_value(1)
        motor_N.set_value(0)
    elif action == "Cerrar":
        motor_P.set_value(0)
        motor_N.set_value(1)
    else:
        motor_P.set_value(0)
        motor_N.set_value(0)

#===============================================================#
#    Máquina de Estados para cambio de Modo de Funcionamiento   #
#===============================================================#
class sm_chngModoOp:
    def __init__(self):
        self.state = "edo_0"
        self.prev_state = ""
        self.next_state = ""
        self.startTime = 0
        self.errores = 0

    def run(self):
        match self.state:
#           >>>>>>>>>>> Inicio - Lectura de Sensor <<<<<<<<<<<
            case "edo_0":
                rd_ModoOp()

                self.prev_state = self.state
                self.next_state = "edo_1"
                self.state = self.next_state

#           >> Elección de Cambio de Modo de Funcionamiento <<
            case "edo_1":
                if strModoFunc == "Modo Cuna":
                    self.prev_state = self.state
                    self.next_state = "edo_2"
                    self.state = self.next_state
                elif strModoFunc == "Modo Incubadora":
                    self.prev_state = self.state
                    self.next_state = "edo_3"
                    self.state = self.next_state

#           >>>>>>>>>>>>>>> Apertura de Capelo <<<<<<<<<<<<<<<
            case "edo_2":
                giroMotor("Abrir")

                self.startTime = time.monotonic()

                self.prev_state = self.state
                self.next_state = "edo_4"
                self.state = self.next_state

#           >>>>>>>>>>>>>>>> Cerrado de Capelo <<<<<<<<<<<<<<<
            case "edo_3":
                giroMotor("Cerrar")

                self.startTime = time.monotonic()

                self.prev_state = self.state
                self.next_state = "edo_5"
                self.state = self.next_state

#           >> Comprobación de Sensor y Tiempo de Apertura <<
            case "edo_4":
                rst = time.monotonic() - self.startTime
                # print("Abriendo...", "Start:", self.startTime, "Now", time.monotonic(), "=", rst, (rst > tiempo_deApertura), "Sensor:", incb.get_value(), "Errores:", self.errores)

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or incb.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>> Comprobación de Sensor y Tiempo de Cierre <<<
            case "edo_5":
                rst = time.monotonic() - self.startTime
                # print("Cerrando...", "Start:", self.startTime, "Now", time.monotonic(), "=", rst, (rst > tiempo_deApertura), "Sensor", cuna.get_value(), "", )

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or cuna.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>>>>>> Comprobación de Modo de Operación <<<<<<<<
            case "edo_6":
                rd_ModoOp()

                time.sleep(0.1)

                if (self.prev_state == "edo_5" and strModoFunc == "Modo Cuna") or (self.prev_state == "edo_4" and strModoFunc == "Modo Incubadora"):
                    self.errores = 0
                    self.prev_state = ""
                    self.next_state = ""
                    self.state = "edo_0"
                else:
                    self.errores += 1
                    self.state = "error"

#           >>> Error al Cambio de Modo de Funcionamiento <<<
            case "error":
                if self.errores < 3:
                    print("Error Parcial")
                    if self.prev_state == "edo_4":
                        self.next_state = "edo_2"
                    elif self.prev_state == "edo_5":
                        self.next_state = "edo_3"

                    self.prev_state = self.state
                    self.state = self.next_state
                else:
                    print("Error Total")
                    self.prev_state = ""
                    self.next_state = ""


                print("No se completo el cambio de Modo de Funcionamiento\nCONTACTAR A SERVICIO TÉCNICO")
                # Aqui falta una forma en la que se regrese al estado anterior
