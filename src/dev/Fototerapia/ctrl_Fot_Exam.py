from dotenv import load_dotenv
from api.pins_PWM import set_pwm_duty_cycle
# from files.logs import logger

# ===============================================================#
#                   Configuración de offsets y escalas           #
# ===============================================================#
load_dotenv("/mnt/microsd/.env")
# logger.info('Inicializando PWM')

pwmchipFOT = "/sys/class/pwm/pwmchip0"
pwmchipLzEx = "/sys/class/pwm/pwmchip1"

# ===============================================================#
#                   Eleccción de Nivel de PWM                    #
# ===============================================================#
def setNvlFototerapia(nvlFototerapia):
    """
    Establece el nivel de fototerapia mediante PWM.

    Parámetros:
    - nvlFototerapia (float|int): Porcentaje de duty cycle deseado (0-100).

    Comportamiento:
    - Convierte el valor a `float` y delega en `set_pwm_duty_cycle` usando el
      PWM chip definido en `pwmchipFOT`.
    - No devuelve valor; puede propagar excepciones en caso de fallo de I/O.

    Ejemplo:
        setNvlFototerapia(75.0)
    """
    # logger.info(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    # print(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    set_pwm_duty_cycle(float(nvlFototerapia), pwmchipFOT)

def setNvlLuzExam(nvlLuzExam):
    """
    Establece el nivel de luz de examinación mediante PWM.

    Parámetros:
    - nvlLuzExam (float|int): Porcentaje de duty cycle deseado (0-100).

    Comportamiento:
    - Convierte el valor a `float` y delega en `set_pwm_duty_cycle` usando el
      PWM chip definido en `pwmchipLzEx`.
    - No devuelve valor; puede propagar excepciones en caso de fallo de I/O.

    Ejemplo:
        setNvlLuzExam(50.0)
    """
    # logger.info(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    # print(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    set_pwm_duty_cycle(float(nvlLuzExam), pwmchipLzEx)

