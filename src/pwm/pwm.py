import os

from dotenv import load_dotenv
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

# ===============================================================#
#                   Configuración de PWM                         #
# ===============================================================#
def set_pwm_duty_cycle(percentage: float, pwmchip):
    """
    Configura el duty cycle de un PWM expuesto vía sysfs.

    Parámetros:
    - percentage (float): Porcentaje de duty cycle deseado (0.0 - 100.0).
    - pwmchip (str): Ruta al directorio del PWM chip (ej. "/sys/class/pwm/pwmchip0").

    Comportamiento:
    - Calcula `duty_cycle` a partir del `percentage` y un periodo fijo de
      1_000_000 ns.
    - Si la salida PWM (`pwmchip/pwm0`) no existe, escribe "0" en
      `pwmchip/export` para exportarla.
    - Escribe los valores en los ficheros sysfs correspondientes:
      `period`, `polarity`, `duty_cycle` y `enable`.

    Consideraciones:
    - Requiere permisos de escritura en los ficheros sysfs del PWM; puede
      lanzar excepciones en caso de falta de permisos o errores de I/O.
    - No devuelve valor (retorna `None`).

    Ejemplo:
        set_pwm_duty_cycle(75.0, "/sys/class/pwm/pwmchip0")
    """
    pwm = f"{pwmchip}/pwm0"

    period = 1_000_000 # ns
    duty_cycle = int((percentage / 100.0) * period)

    if not os.path.exists(pwm):
        with open(f"{pwmchip}/export", "w") as f:
            f.write("0")

    with open(f"{pwm}/period", "w") as f:
        f.write(str(period))

    with open(f"{pwm}/polarity", "w") as f:
        f.write("normal")

    with open(f"{pwm}/duty_cycle", "w") as f:
        f.write(str(duty_cycle))

    with open(f"{pwm}/enable", "w") as f:
        f.write("1")

#===============================================================#
#                 Función para detener uso de SHT21             #
#===============================================================#
def stop_pwm():
  """
  Apaga las salidas PWM de fototerapia y luz de examinación.

  Intenta establecer el duty cycle a 0% para ambos PWM (`pwmchipFOT` y
  `pwmchipLzEx`) llamando a `set_pwm_duty_cycle`. Si ocurre un error de I/O
  o de permisos, captura la excepción y muestra un mensaje por consola.

  Parámetros:
  - Ninguno.

  Retorno:
  - None

  Ejemplo:
    stop_pwm()
  """
  try:
    set_pwm_duty_cycle(float(0.0), pwmchipFOT)
    set_pwm_duty_cycle(float(0.0), pwmchipLzEx)
    # logger.info("Luces apagadas correctamente")
  except Exception as e:
    print(f"No se pudo finalizar el apagado de la luz: {e}")
    # logger.warning(f"No se pudo finalizar el apagado de la luz: {e}")
