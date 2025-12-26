import gpiod
import time

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank = "/dev/gpiochip0"     # GPIO3  # Dahlia
bank2 = "/dev/gpiochip3"    # GPIO4  # Dahlia
bank3 = "/dev/gpiochip2"    # GPIO11 # Dahlia

pin_SnsCuna = 6     # GPIO4
pin_SnsIncub = 7    # GPIO5

pin_Motor_n = 3     # GPIO7
pin_Motor_p = 1     # GPIO8

pin_MuxSel_0 = 16     # GPIO11
pin_MuxSel_1 = 5      # GPIO29

strModoFunc = ""
tiempo_deApertura = 15 # seg

# Inicialización chips
gpio_chip = gpiod.Chip(bank)
gpio_chip2 = gpiod.Chip(bank2)
gpio_chip3 = gpiod.Chip(bank3)

# Lineas individuales
cuna = gpio_chip.get_line(pin_SnsCuna)
incb = gpio_chip.get_line(pin_SnsIncub)

motor_P = gpio_chip2.get_line(pin_Motor_p)
motor_N = gpio_chip2.get_line(pin_Motor_n)

muxSelct_0 = gpio_chip3.get_line(pin_MuxSel_0)
muxSelct_1 = gpio_chip.get_line(pin_MuxSel_1)

# Configuración de Acceso
cuna.request(consumer="cuna", type=gpiod.LINE_REQ_EV_BOTH_EDGES)
incb.request(consumer="incb", type=gpiod.LINE_REQ_EV_BOTH_EDGES)

motor_P.request(consumer="motor_P", type=gpiod.LINE_REQ_DIR_OUT)
motor_N.request(consumer="motor_N", type=gpiod.LINE_REQ_DIR_OUT)

muxSelct_0.request(consumer="muxSelct_0", type=gpiod.LINE_REQ_DIR_OUT)
muxSelct_1.request(consumer="muxSelct_1", type=gpiod.LINE_REQ_DIR_OUT)

# Motor apagado
motor_P.set_value(1)
motor_N.set_value(1)

# Selector MUX Inicial
# 00  |   Altura Variable
# 01  |   Altura Calefactor/Lámpara
# 10  |   Inclinación
# 11  |   Motor cambio de modo de Operació

muxSelct_0.set_value(1)
muxSelct_1.set_value(1)

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

    if cuna.get_value():
        strModoFunc = "Cuna"
        return strModoFunc
    elif incb.get_value():
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
        - "Abrir": pone `motor_P` a 1 y `motor_N` a 0 (giro en sentido de apertura).
        - "Cerrar": pone `motor_P` a 0 y `motor_N` a 1 (giro en sentido de cierre).
        - Cualquier otro valor: detiene el motor dejando ambas salidas en reposo.

    Efectos secundarios:
    - Modifica las salidas `motor_P` y `motor_N` para controlar el motor.

    Ejemplo:
        giroMotor("Abrir")
    """
    if action == "Abrir":
        motor_P.set_value(1)
        motor_N.set_value(0)
    elif action == "Cerrar":
        motor_P.set_value(0)
        motor_N.set_value(1)
    else:
        motor_P.set_value(1)
        motor_N.set_value(1)

# Control de Motor de altura
def upRgt_On():
    """
    Activa el motor para mover hacia arriba/derecha.

    Efectúa la salida física a través de `motor_P` para iniciar el movimiento.

    Retorno:
    - None
    """
    # print("upRgt_On")
    motor_P.set_value(0)

def upRgt_Off():
    """
    Detiene la acción de subida/movimiento derecha del motor.

    Restaura la salida `motor_P` a la condición de reposo.

    Retorno:
    - None
    """
    # print("upRgt_Off")
    motor_P.set_value(1)

def dwnLft_On():
    """
    Activa el motor para mover hacia abajo/izquierda.

    Manda la señal correspondiente sobre `motor_N` para iniciar el movimiento.

    Retorno:
    - None
    """
    # print("dwnLft_On")
    motor_N.set_value(0)

def dwnLft_Off():
    """
    Detiene la acción de bajada/movimiento lado izquierdo del motor.

    Restaura `motor_N` a la condición de reposo.

    Retorno:
    - None
    """
    # print("dwnLft_Off")
    motor_N.set_value(1)

#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
# Control de Motor de altura AUX SOLO PARA PROBAR EL HW
def upRgt_On_AUX():
    print("upRgt_On AUX")
    muxSelct_0.set_value(0)

def upRgt_Off_AUX():
    print("upRgt_Off AUX")
    muxSelct_0.set_value(1)

def dwnLft_On_AUX():
    print("dwnLft_On AUX")
    muxSelct_1.set_value(0)

def dwnLft_Off_AUX():
    print("dwnLft_Off AUX")
    muxSelct_1.set_value(1)
#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

# Selector de Dispositivo por Multiplexor
def selDsip(disp):
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
    match disp:
        case "altVar":
            print("Altura Variable")
            muxSelct_0.set_value(0)
            muxSelct_1.set_value(0)

        case "altCalLamp":
            print("Altura Lampara Calefactor")
            muxSelct_0.set_value(0)
            muxSelct_1.set_value(1)

        case "incBac":
            print("Inclinación del Bacinete")
            muxSelct_0.set_value(1)
            muxSelct_1.set_value(0)

        case "motorModOp":
            print("Motor Cambio Modo de Operación")
            muxSelct_0.set_value(1)
            muxSelct_1.set_value(1)

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

                if (rst >= tiempo_deApertura) or incb.get_value():
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>> Comprobación de Sensor y Tiempo de Cierre <<<
            case "edo_5":
                rst = time.monotonic() - self.startTime

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
