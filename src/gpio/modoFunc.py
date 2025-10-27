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
motor_P.set_value(1)
motor_N.set_value(1)

time.sleep(5)

#Prueba
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
#                Máquina de estados                #
#===============================================================#
class sm_chngModoOp:
    def __init__(self):
        self.state = "edo_0"
        self.prev_state = ""
        self.next_state = ""
        self.startTime = 0
        self.contErrores = 0

    def run(self):
        match self.state:
            case "edo_0":
                rd_ModoOp()
                print("Lectura de sensor Modo", time.monotonic())

                # IF DE LA ACCION DEL BOTON DE LA PANTALLA WEB
                self.prev_state = self.state
                self.next_state = "edo_1"
                self.state = self.next_state

            case "edo_1":
                print("Elección de cambio de modo")

                if strModoFunc == "Modo Cuna":
                    self.prev_state = self.state
                    self.next_state = "edo_2"
                    self.state = self.next_state
                elif strModoFunc == "Modo Incubadora":
                    self.prev_state = self.state
                    self.next_state = "edo_3"
                    self.state = self.next_state

            case "edo_2":
                print("Incubadora -> Cuna")
                giroMotor("Abrir")

                self.startTime = time.monotonic()
                print("Inicio a:", self.startTime)

                self.prev_state = self.state
                self.next_state = "edo_4"
                self.state = self.next_state

            case "edo_3":
                print("Cuna -> Incubadora")
                giroMotor("Cerrar")

                self.startTime = time.monotonic()
                print("Inicio a:", self.startTime)

                self.prev_state = self.state
                self.next_state = "edo_5"
                self.state = self.next_state

            case "edo_4":
                rst = time.monotonic() - self.startTime
                print("Abriendo...", self.startTime, time.monotonic(), "=", rst, (rst > tiempo_deApertura), cuna.get_value())

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or incb.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_7"
                    self.state = self.next_state

            case "edo_5":
                rst = time.monotonic() - self.startTime
                print("Cerrando...", self.startTime, time.monotonic(), "=", rst, (rst > tiempo_deApertura), incb.get_value())

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or cuna.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_7"
                    self.state = self.next_state

            case "edo_7":
                print("Comprobando sensores al terminar")
                rd_ModoOp()

                if self.prev_state == "edo_4" and strModoFunc == "Modo Cuna":
                    print("Comprobación cambio a Incubadora:", self.prev_state, strModoFunc)
                    self.contErrores += 1

                    if self.contErrores > 3:
                        self.contErrores = 0
                        self.prev_state = ""
                        self.next_state = ""
                        self.state = "error"
                    else:
                        self.state = "edo_2"
                elif self.prev_state == "edo_5" and strModoFunc == "Modo Incubadora":
                    print("Comprobación cambio a Cuna:", self.prev_state, strModoFunc)
                    self.contErrores += 1

                    if self.contErrores > 3:
                        self.contErrores = 0
                        self.prev_state = ""
                        self.next_state = ""
                        self.state = "error"
                    else:
                        self.state = "edo_3"
                # elif self.prev_state == "edo_4" and strModoFunc == "Modo Incubadora":
                #     print("Se completó el proceso de conversión")
                #     self.contErrores = 0
                #     self.prev_state = ""
                #     self.next_state = ""
                #     self.state = "edo_0"
                elif (self.prev_state == "edo_5" and strModoFunc == "Modo Cuna") or (self.prev_state == "edo_4" and strModoFunc == "Modo Incubadora"):
                    print("Se completó el proceso de conversión", time.monotonic())
                    self.contErrores = 0
                    self.prev_state = ""
                    self.next_state = ""
                    self.state = "edo_0"

            case "error":
                print("No se completo el cambio de Modo de Funcionamiento\nCONTACTAR A SERVICIO TÉCNICO")
                # Aqui falta una forma en la que se regrese al estado anterior
