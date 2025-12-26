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
    """
    Establece el valor de PWM del calefactor de forma segura entre hilos.

    Parámetros:
    - val (int): Nuevo valor deseado para `PWM_Calef` (por convención 0-100).

    Efectos secundarios:
    - Modifica la variable global `PWM_Calef` protegiéndola con
      `PWM_Calef_lock` para evitar condiciones de carrera.

    Ejemplo:
        set_PWM_Calef(75)
    """
    global PWM_Calef

    with PWM_Calef_lock:
        PWM_Calef = val

def get_PWM_Calef():
    """
    Devuelve de forma segura el valor actual de PWM del calefactor.

    Usa `PWM_Calef_lock` para proteger la lectura de la variable global
    `PWM_Calef` y evitar condiciones de carrera cuando otros hilos la
    estén modificando.

    Retorno:
    - int: Valor actual de `PWM_Calef` (por convención 0-100).
    """
    with PWM_Calef_lock:
        return PWM_Calef

def get_PWMstatus():
    """
    Empaqueta y devuelve el estado del PWM del calefactor y la alerta de desconexión.

    Usa `struct.pack` con el formato `'i?'` para combinar el entero
    `PWM_Calef` y el booleano `alertaCalef_Desconectado` en una secuencia de
    bytes lista para envío o almacenamiento binario.

    Retorno:
    - bytes: Bytes empaquetados que contienen (`int PWM_Calef`, `bool alerta`).

    Ejemplo:
        estado = get_PWMstatus()
        desempaquetar con struct.unpack('i?', estado)
    """
    calefData = struct.pack('i?', PWM_Calef, alertaCalef_Desconectado)

    return calefData
#===============================================================#
#                    Función PWM Calefactor                     #
#===============================================================#
def ctrl_Calef():
    """
    Bucle de control PWM del calefactor.

    Implementa un PWM por software: mantiene un contador `timer_calef` que
    recorre 0..100 y compara con la potencia deseada obtenida por
    `get_PWM_Calef()`. Mientras `timer_calef` <= `potencia` la salida se activa
    (valor 0, lógica inversa); en caso contrario se desactiva (valor 1).

    Notas:
    - Es un bucle infinito pensado para ejecutarse en un hilo dedicado.
    - La resolución y frecuencia del PWM vienen definidas por la espera
      `time.sleep(0.01632)` y la lógica de conteo.
    """
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
    """
    Monitor de comunicación del calefactor.

    Observa la señal de lectura `calef_read` y detecta ausencias prolongadas
    de pulsos que pueden indicar desconexión o fallo. Si la entrada se
    mantiene en nivel bajo (`0`) durante más de `timeout` segundos, la
    variable global `alertaCalef_Desconectado` se establece en `True`; si se
    detecta actividad, la alerta se desactiva.

    Notas:
    - Diseñada como un bucle infinito para ejecutarse en un hilo separado.
    - Usa `time.monotonic()` para medir intervalos de forma robusta.
    """
    global alertaCalef_Desconectado
    low_Start = None
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
