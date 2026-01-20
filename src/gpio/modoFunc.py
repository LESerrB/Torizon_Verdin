import gpiod
import time

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank3 = "/dev/gpiochip3"
bank2 = "/dev/gpiochip2"

pin_SnsCuna = 8         # GPIO_60
pin_SnsIncub = 9        # GPIO_62

pin_MotorAV_N = 26      # GPIO_24
pin_MotorAV_P = 27      # GPIO_26

pin_MotorBAC_N = 0      # GPIO_52
pin_MotorBAC_P = 1      # GPIO_54

pin_MotorLMP_N = 6      # GPIO_56
pin_MotorLMP_P = 7      # GPIO_58

strModoFunc = ""
tiempo_deApertura = 15 # seg

# Inicialización chips
gpio_chip3 = gpiod.Chip(bank3)
gpio_chip2 = gpiod.Chip(bank2)

# Lineas individuales
sns_Cuna = gpio_chip2.get_line(pin_SnsCuna)
sns_Incb = gpio_chip2.get_line(pin_SnsIncub)

motorAV_P = gpio_chip3.get_line(pin_MotorAV_N)
motorAV_N = gpio_chip3.get_line(pin_MotorAV_P)

motorBAC_N = gpio_chip2.get_line(pin_MotorBAC_N)
motorBAC_P = gpio_chip2.get_line(pin_MotorBAC_P)

motorLMP_N = gpio_chip2.get_line(pin_MotorLMP_N)
motorLMP_P = gpio_chip2.get_line(pin_MotorLMP_P)

# Configuración de Acceso
sns_Cuna.request(consumer="sns_Cuna", type=gpiod.LINE_REQ_EV_BOTH_EDGES)
sns_Incb.request(consumer="sns_Incb", type=gpiod.LINE_REQ_EV_BOTH_EDGES)

motorAV_P.request(consumer="motorAV_P", type=gpiod.LINE_REQ_DIR_OUT)
motorAV_N.request(consumer="motorAV_N", type=gpiod.LINE_REQ_DIR_OUT)

motorBAC_N.request(consumer="motorBAC_N", type=gpiod.LINE_REQ_DIR_OUT)
motorBAC_P.request(consumer="motorBAC_P", type=gpiod.LINE_REQ_DIR_OUT)

motorLMP_N.request(consumer="motorLMP_N", type=gpiod.LINE_REQ_DIR_OUT)
motorLMP_P.request(consumer="motorLMP_P", type=gpiod.LINE_REQ_DIR_OUT)

# Selector MUX Inicial
# 00  |   Altura Variable
# 01  |   Altura Calefactor/Lámpara
# 10  |   Inclinación
# 11  |   Motor cambio de modo de Operación
# Motores apagados

motorAV_P.set_value(1)
motorAV_N.set_value(1)

motorBAC_N.set_value(1)
motorBAC_P.set_value(1)

motorLMP_N.set_value(1)
motorLMP_P.set_value(1)
#===============================================================#
#           Funciones de Lectura y Control de Sensores          #
#===============================================================#
# Lectura del modo de operación
def rd_ModoOp():
    """
    Lee los sensores y actualiza/retorna el modo de funcionamiento.

    Comprueba las entradas `cuna` e `incb` para determinar el modo actual:
    - Si `cuna.get_value()` es True, establece `strModoFunc = "Cuna"`.
    - Si `incb.get_value()` es True, establece `strModoFunc = "Incubadora"`.
    - Si ninguna está activa, marca error con `strModoFunc = "ERROR"`.

    Retorna la cadena `strModoFunc` resultante.

    Retorno:
    - str: "Cuna", "Incubadora" o "ERROR" según la lectura de sensores.
    """
    global strModoFunc

    if sns_Cuna.get_value():
        strModoFunc = "Cuna"
        return strModoFunc
    elif sns_Incb.get_value():
        strModoFunc = "Incubadora"
        return strModoFunc
    else:
        strModoFunc = "ERROR"
        return strModoFunc

# Control de motor para Abrir/Cerrar el capelo
def giroMotor(action):
    """
    Controla el motor principal para abrir, cerrar o parar el capelo.

    Parámetros:
    - action (str): Acción a ejecutar. Valores soportados:
        - "Abrir": pone `motorAV_P` a 1 y `motorAV_N` a 0 (giro en sentido de apertura).
        - "Cerrar": pone `motorAV_P` a 0 y `motorAV_N` a 1 (giro en sentido de cierre).
        - Cualquier otro valor: detiene el motor dejando ambas salidas en reposo.

    Efectos secundarios:
    - Modifica las salidas `motorAV_P` y `motorAV_N` para controlar el motor.

    Ejemplo:
        giroMotor("Abrir")
    """
    if action == "Abrir":
        motorAV_P.set_value(1)
        motorAV_N.set_value(0)
    elif action == "Cerrar":
        motorAV_P.set_value(0)
        motorAV_N.set_value(1)
    else:
        motorAV_P.set_value(1)
        motorAV_N.set_value(1)

# Control de Motores
def ctrl_Motores(accion):
    match accion:
        case "up-prsd":
            motorAV_P.set_value(0)

        case "up-rlsd":
            motorAV_P.set_value(1)

        case "dwn-prsd":
            motorAV_N.set_value(0)

        case "dwn-rlsd":
            motorAV_N.set_value(1)

        case "incLft-prsd":
            motorBAC_N.set_value(0)

        case "incLft-rlsd":
            motorBAC_N.set_value(1)

        case "incRgt-prsd":
            motorBAC_P.set_value(0)

        case "incRgt-rlsd":
            motorBAC_P.set_value(1)

        case "upLmp-prsd":
            motorLMP_N.set_value(0)

        case "upLmp-rlsd":
            motorLMP_N.set_value(1)

        case "dwnLmp-prsd":
            motorLMP_P.set_value(0)

        case "dwnLmp-rlsd":
            motorLMP_P.set_value(1)

#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

# Selector de Dispositivo por Multiplexor
# def selDsip(disp):
    """
    Selecciona el dispositivo a través del multiplexor según la cadena `disp`.

    Parámetros:
    - disp (str): Identificador del dispositivo. Valores esperados:
        - "altVar": Altura Variable (MUX = 00)
        - "altCalLamp": Altura Lámpara/Calefactor (MUX = 01)
        - "incBac": Inclinación del bacinete (MUX = 10)
        - "motorModOp": Motor cambio de modo de operación (MUX = 11)

    Efectos secundarios:
    - Modifica las salidas `muxSelct_0` y `muxSelct_1` para seleccionar la
      entrada correspondiente en el multiplexor y escribe un mensaje por
      consola indicando la selección.

    Retorno:
    - None

    Ejemplo:
        selDsip("altVar")
    """
    # match disp:
    #     case "altVar":
    #         print("Altura Variable")
    #         muxSelct_0.set_value(0)
    #         muxSelct_1.set_value(0)

    #     case "altCalLamp":
    #         print("Altura Lampara Calefactor")
    #         muxSelct_0.set_value(0)
    #         muxSelct_1.set_value(1)

    #     case "incBac":
    #         print("Inclinación del Bacinete")
    #         muxSelct_0.set_value(1)
    #         muxSelct_1.set_value(0)

    #     case "motorModOp":
    #         print("Motor Cambio Modo de Operación")
    #         muxSelct_0.set_value(1)
    #         muxSelct_1.set_value(1)

#===============================================================#
#    Máquina de Estados para cambio de Modo de Funcionamiento   #
#===============================================================#
class sm_chngModoOp:
    """
    Ejecuta la máquina de estados para cambiar el modo de funcionamiento.

    Este método recorre estados que leen sensores, accionan el motor para
    abrir o cerrar el capelo y verifican condiciones temporales y de
    sensor para confirmar el cambio de modo. Los estados principales son:
    - `edo_0`: lectura inicial de sensores.
    - `edo_1`: decide si abrir o cerrar según `strModoFunc`.
    - `edo_2`/`edo_3`: inicia apertura/cierre del capelo y registra el
        tiempo de inicio (`self.startTime`).
    - `edo_4`/`edo_5`: espera sensor o tiempo (`tiempo_deApertura`) para
        parar el motor y pasar a verificación final.
    - `edo_6`: valida que el modo quedó correctamente establecido.
    - `error`: reintenta la operación hasta 3 fallos, luego informa error.

    Efectos secundarios:
    - Llama a `giroMotor()` para controlar `motor_P`/`motor_N`.
    - Lee `cuna` e `incb` mediante `rd_ModoOp()` y `get_value()`.
    - Modifica los atributos `self.state`, `self.prev_state`,
        `self.next_state` y `self.errores`.

    Notas:
    - Diseñada para ejecutarse repetidamente (por ejemplo en un hilo).
    - Usa `time.monotonic()` y `time.sleep()` para control de tiempos.
    """
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
                # selDsip("motorModOp")

                self.prev_state = self.state
                self.next_state = "edo_1"
                self.state = self.next_state

#           >> Elección de Cambio de Modo de Funcionamiento <<
            case "edo_1":
                if strModoFunc == "Cuna":
                    self.prev_state = self.state
                    self.next_state = "edo_2"
                    self.state = self.next_state
                elif strModoFunc == "Incubadora":
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

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or sns_Incb.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>> Comprobación de Sensor y Tiempo de Cierre <<<
            case "edo_5":
                rst = time.monotonic() - self.startTime

                time.sleep(0.1)

                if (rst >= tiempo_deApertura) or sns_Cuna.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>>>>>> Comprobación de Modo de Operación <<<<<<<<
            case "edo_6":
                rd_ModoOp()

                time.sleep(0.1)

                if (self.prev_state == "edo_5" and strModoFunc == "Cuna") or (self.prev_state == "edo_4" and strModoFunc == "Incubadora"):
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
