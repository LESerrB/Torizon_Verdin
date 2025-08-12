import os

from dotenv import load_dotenv
# from files.logs import logger

# ===============================================================#
#                   Configuración de offsets y escalas           #
# ===============================================================#
load_dotenv("/mnt/microsd/.env")
# logger.info('Inicializando PWM')

pwmchipFOT = "/sys/class/pwm/pwmchip1"
pwmchipLzEx = "/sys/class/pwm/pwmchip2"

# ===============================================================#
#                   Eleccción de Nivel de PWM                    #
# ===============================================================#
def setNvlFototerapia(nvlFototerapia):
    # logger.info(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    # print(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    set_pwm_duty_cycle(float(nvlFototerapia), pwmchipFOT)

def setNvlLuzExam(nvlLuzExam):
    # logger.info(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    # print(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    set_pwm_duty_cycle(float(nvlLuzExam), pwmchipLzEx)

# ===============================================================#
#                   Configuración de PWM                         #
# ===============================================================#
def set_pwm_duty_cycle(percentage: float, pwmchip):
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
    try:
        set_pwm_duty_cycle(float(0.0), pwmchipFOT)
        set_pwm_duty_cycle(float(0.0), pwmchipLzEx)
        # logger.info("Luces apagadas correctamente")
    except Exception as e:
        print(f"No se pudo finalizar el apagado de la luz: {e}")
        # logger.warning(f"No se pudo finalizar el apagado de la luz: {e}")
