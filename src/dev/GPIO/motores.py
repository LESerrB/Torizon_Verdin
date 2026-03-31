import gpiod
import time

from dev.Sensores_TPH.sns_IncBac import accel_Pos
from api.pins_ADC import read_adc


#        Sensor    | Sensor Modo | Motor Altura | Motor Altura | Motor      | Motor      | Motor      | Motor     
#        Modo Cuna | Incubadora  | Variable P   | Variable N   | Bacinete P | Bacinete N | Lampara P  | Lampara N 
#------------------|-------------|--------------|--------------|------------|------------|------------|-----------
# Pin          9   |   10        |    1         |    2         |   5        |   4        |   7        |   6       
# GPIO         8   |   9         |   26         |   27         |   1        |   0        |   7        |   6       
# SODIMM      60   |   62        |   24         |   26         |   54       |   52       |   58       |   56      
# GPIOCHIP     2   |   2         |   3          |   3          |   2        |   2        |   2        |   2       
# LINE         8   |   9         |   26         |   27         |   1        |   0        |   7        |   6       
# FUNCTION    In   |   In        |   Out        |   Out        |   Out      |   Out      |   Out      |   Out     

#===============================================================#
#                      Configuración GPIOs                      #
#===============================================================#
bank3 = "/dev/gpiochip3"
bank2 = "/dev/gpiochip2"

pin_SnsCuna = 8
pin_SnsIncub = 9

pin_MotorAV_N = 26
pin_MotorAV_P = 27

pin_MotorBAC_N = 0
pin_MotorBAC_P = 1

pin_MotorLMP_N = 6
pin_MotorLMP_P = 7

# Lineas individuales
sns_Cuna = gpiod.Chip(bank2).get_line(pin_SnsCuna)
sns_Incb = gpiod.Chip(bank2).get_line(pin_SnsIncub)

motorAV_P = gpiod.Chip(bank3).get_line(pin_MotorAV_N)
motorAV_N = gpiod.Chip(bank3).get_line(pin_MotorAV_P)

motorBAC_N = gpiod.Chip(bank2).get_line(pin_MotorBAC_N)
motorBAC_P = gpiod.Chip(bank2).get_line(pin_MotorBAC_P)

motorLMP_N = gpiod.Chip(bank2).get_line(pin_MotorLMP_N)
motorLMP_P = gpiod.Chip(bank2).get_line(pin_MotorLMP_P)

# Configuración de Acceso
sns_Cuna.request(
    consumer="sns_Cuna",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)
sns_Incb.request(
    consumer="sns_Incb",
    type=gpiod.LINE_REQ_EV_BOTH_EDGES
)

motorAV_P.request(
    consumer="motorAV_P",
    type=gpiod.LINE_REQ_DIR_OUT
)
motorAV_N.request(
    consumer="motorAV_N",
    type=gpiod.LINE_REQ_DIR_OUT
)

motorBAC_N.request(
    consumer="motorBAC_N",
    type=gpiod.LINE_REQ_DIR_OUT
)
motorBAC_P.request(
    consumer="motorBAC_P",
    type=gpiod.LINE_REQ_DIR_OUT
)

motorLMP_N.request(
    consumer="motorLMP_N",
    type=gpiod.LINE_REQ_DIR_OUT
)
motorLMP_P.request(
    consumer="motorLMP_P",
    type=gpiod.LINE_REQ_DIR_OUT
)

# strModoFunc = ""
tiempo_deApertura = 15 # seg

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
def rd_ModoOp(strModoFunc):
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
    # global strModoFunc

    # if read_adc(3) < 100:
    #     strModoFunc = "Incubadora"
    # elif read_adc(3) > 1700:
    #     strModoFunc = "Cuna"
    if strModoFunc == "Incubadora":
        return "Cuna"
    elif strModoFunc == "Cuna":
        return "Incubadora"


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
        motorLMP_P.set_value(1)
        motorLMP_N.set_value(0)
    elif action == "Cerrar":
        motorLMP_P.set_value(0)
        motorLMP_N.set_value(1)
    else:
        motorLMP_P.set_value(1)
        motorLMP_N.set_value(1)

# Control de Motores
def ctrl_Motores(accion):
    """
    Controla los motores según la acción especificada mediante GPIO.

    Parámetros:
    - accion (str): Acción a ejecutar. Valores soportados:
        - "up-prsd": Presionar botón altura arriba (motorAV_P a 0).
        - "up-rlsd": Soltar botón altura arriba (motorAV_P a 1).
        - "dwn-prsd": Presionar botón altura abajo (motorAV_N a 0).
        - "dwn-rlsd": Soltar botón altura abajo (motorAV_N a 1).
        - "incLft-prsd": Presionar inclinación izquierda (motorBAC_N a 0).
        - "incLft-rlsd": Soltar inclinación izquierda (motorBAC_N a 1).
        - "incRgt-prsd": Presionar inclinación derecha (motorBAC_P a 0).
        - "incRgt-rlsd": Soltar inclinación derecha (motorBAC_P a 1).
        - "upLmp-prsd": Presionar lámpara arriba (motorLMP_N a 0).
        - "upLmp-rlsd": Soltar lámpara arriba (motorLMP_N a 1).
        - "dwnLmp-prsd": Presionar lámpara abajo (motorLMP_P a 0).
        - "dwnLmp-rlsd": Soltar lámpara abajo (motorLMP_P a 1).

    Efectos secundarios:
    - Modifica los valores GPIO de los motores: motorAV_P, motorAV_N,
      motorBAC_N, motorBAC_P, motorLMP_N, motorLMP_P.
    - Los valores 0/1 representan activo/inactivo respectivamente.

    Retorno:
    - None
    """
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
#          Máquinas de Estados para Control de Motores          #
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
    # Variables de estado
    def __init__(self):
        # self.strModoFunc = "Incubadora"
        self.strModoFunc = "Cuna"

        self.state = "edo_0"
        self.prev_state = ""
        self.next_state = ""

        self.startTime = 0
        self.errores = 0

    def run(self):
        match self.state:
#           >>>>>>>>>>> Inicio - Lectura de Sensor <<<<<<<<<<<
            case "edo_0":
                print(">>>>>>>>>>> Inicio - Lectura de Sensor <<<<<<<<<<<")
                # self.strModoFunc = "Cuna"

                self.prev_state = self.state
                self.next_state = "edo_1"
                self.state = self.next_state

#           >> Elección de Cambio de Modo de Funcionamiento <<
            case "edo_1":
                print(">> Elección de Cambio de Modo de Funcionamiento <<")
                if self.strModoFunc == "Cuna":
                    self.prev_state = self.state
                    self.next_state = "edo_2"
                    self.state = self.next_state
                elif self.strModoFunc == "Incubadora":
                    self.prev_state = self.state
                    self.next_state = "edo_3"
                    self.state = self.next_state

#           >>>>>>>>>>>>>>> Cerrado de Capelo <<<<<<<<<<<<<<<
            case "edo_2":
                print(">>>>>>>>>>>>>>> Cerrado de Capelo <<<<<<<<<<<<<<<")
                
                giroMotor("Cerrar")

                self.startTime = time.monotonic()

                self.prev_state = self.state
                self.next_state = "edo_4"
                self.state = self.next_state

#           >>>>>>>>>>>>>>>> Apertura de Capelo <<<<<<<<<<<<<<<
            case "edo_3":
                print(">>>>>>>>>>>>>>>> Apertura de Capelo <<<<<<<<<<<<<<<")
                giroMotor("Abrir")

                self.startTime = time.monotonic()

                self.prev_state = self.state
                self.next_state = "edo_5"
                self.state = self.next_state

#           >> Comprobación de Sensor y Tiempo de Cerrado <<
            case "edo_4":
                print(">> Comprobación de Sensor y Tiempo de Cerrado <<")
                rst = time.monotonic() - self.startTime

                time.sleep(0.1)

                if rst >= tiempo_deApertura:
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>> Comprobación de Sensor y Tiempo de Apertura <<<
            case "edo_5":
                print(">>> Comprobación de Sensor y Tiempo de Apertura <<<")
                rst = time.monotonic() - self.startTime

                time.sleep(0.1)

                if rst >= (tiempo_deApertura+1):
                    giroMotor("Parar")

                    self.prev_state = self.state
                    self.next_state = "edo_6"
                    self.state = self.next_state

#           >>>>>>> Comprobación de Modo de Operación <<<<<<<<
            case "edo_6":
                print(">>> Comprobación de Sensor y Tiempo de Cierre <<<")
                self.strModoFunc = rd_ModoOp(self.strModoFunc)

                time.sleep(0.1)

                if (self.prev_state == "edo_5" and self.strModoFunc == "Cuna") or (self.prev_state == "edo_4" and self.strModoFunc == "Incubadora"):
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

class sm_ajstInclinacion:
    """
    Máquina de estados para ajustar la inclinación del bacinete.

    Esta clase lee periódicamente la posición de dos acelerómetros y,
    en función del ángulo frontal del segundo sensor (`frnt2`), decide
    mover el bacinete hacia la cabeza o hacia los pies. El flujo de
    estados es:
    - "LecturaPos": obtiene las posiciones y calcula el siguiente estado.
    - "ElevarCabeza": activa el motor de inclinación hacia la cabeza.
    - "ElevarPies": activa el motor de inclinación hacia los pies.
    - "CompruebaPos": incrementa un contador para confirmar estabilidad
      y termina tras suficientes lecturas constantes.
    - "Fin": detiene la máquina.

    Atributos de instancia:
        state (str): estado actual de la máquina.
        prev_state (str): estado anterior guardado.
        next_state (str): siguiente estado calculado.
        contComp (int): contador usado en el estado "CompruebaPos".
    """
    # Variables de estado
    def __init__(self):
        self.state = "LecturaPos"
        self.prev_state = ""
        self.next_state = ""

    # Máquina de Estados
    def run(self):
        """
        Ejecuta el ciclo de la máquina de estados.

        El método itera indefinidamente hasta que el estado se convierta en
        "Fin", momento en el que se rompe el bucle. En cada iteración se evalúa
        `self.state` y se realizan las acciones correspondientes, como la
        lectura de posiciones, el control de motores mediante `ctrl_Motores`
        y la transición de estados. El método también imprime información de
        diagnóstico en la consola.

        No toma parámetros ni devuelve valor; todos los resultados se aplican
        a los atributos de la instancia y a los actuadores GPIO.
        """
        while True:
            match self.state:
                case "LecturaPos":
                    lat1, frnt1, lat2, frnt2 = accel_Pos()

                    if frnt2 == -99.99:
                        print("Error no se puedo leer el módulo")
                        self.next_state = "Fin"
                    elif frnt2 < -0.2:
                        self.next_state = "ElevarCabeza"
                    elif frnt2 > 0.2:
                        self.next_state = "ElevarPies"
                    else:
                        self.next_state = "CompruebaPos"

                    self.prev_state = self.state
                    # self.next_state = "edo_6"
                    self.state = self.next_state

                case "ElevarCabeza":
                    ctrl_Motores("incLft-prsd")
                    time.sleep(0.05)
                    ctrl_Motores("incLft-rlsd")

                    self.prev_state = self.state
                    self.next_state = "LecturaPos"
                    self.state = self.next_state

                case "ElevarPies":
                    ctrl_Motores("incRgt-prsd")
                    time.sleep(0.05)
                    ctrl_Motores("incRgt-rlsd")

                    self.prev_state = self.state
                    self.next_state = "LecturaPos"
                    self.state = self.next_state

                case "CompruebaPos":
                    sum_frnt = 0.0

                    for _ in range(10):
                        lat1, frnt1, lat2, frnt2 = accel_Pos()
                        print(frnt2)
                        sum_frnt += frnt2

                    frnt2 = sum_frnt / 10

                    if -0.2 < frnt2 < 0.2:
                        self.prev_state = self.state
                        self.next_state = "Fin"
                        self.state = self.next_state
                    else:
                        self.prev_state = self.state
                        self.next_state = "LecturaPos"
                        self.state = self.next_state

                case "Fin":
                    print("Termina Ajuste")
                    break