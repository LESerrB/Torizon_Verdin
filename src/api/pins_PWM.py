import os

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