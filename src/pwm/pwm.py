import os

from dotenv import load_dotenv
from files.logs import logger
# import gpiod

# ===============================================================#
#                   Configuración de offsets y escalas           #
# ===============================================================#
load_dotenv("/mnt/microsd/.env")
logger.info('Inicializando PWM')

OFF = float(os.getenv("OFF", 0.0))
MEDIUM = float(os.getenv("MEDIUM", 50.0))
FULL = float(os.getenv("FULL", 100.0))

# gpio_state = {"lightbulb": False}
# gpio_state2 = {"bell-button": True}

pwmchipFOT = "/sys/class/pwm/pwmchip1"
pwmchipLzEx = "/sys/class/pwm/pwmchip2"

# ===============================================================#
#                   Eleccción de Nivel de PWM                    #
# ===============================================================#
def setNvlFototerapia(nvlFototerapia):
    logger.info(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    print(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    if nvlFototerapia == 0:
        set_pwm_duty_cycle(OFF, pwmchipFOT)
    elif nvlFototerapia == 1:
        set_pwm_duty_cycle(MEDIUM, pwmchipFOT)

    elif nvlFototerapia == 2:
        set_pwm_duty_cycle(FULL, pwmchipFOT)
    else:
        print("Nivel de fototerapia no válido. Debe ser 0, 1 o 2.")
        set_pwm_duty_cycle(OFF, pwmchipFOT)

def setNvlLuzExam(nvlLuzExam):
    logger.info(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    print(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    if nvlLuzExam == 0:
        set_pwm_duty_cycle(OFF, pwmchipLzEx)
    elif nvlLuzExam == 1:
        set_pwm_duty_cycle(MEDIUM, pwmchipLzEx)
    elif nvlLuzExam == 2:
        set_pwm_duty_cycle(FULL, pwmchipLzEx)
    else:
        print("Nivel de luz examinación no válido. Debe ser 0, 1, o 2")
        set_pwm_duty_cycle(OFF, pwmchipLzEx)

# ===============================================================#
#                   Configuración de PWM                         #
# ===============================================================#
def set_pwm_duty_cycle(percentage: float, pwmchip):
    pwm = f"{pwmchip}/pwm0"

    period = 1_000_000
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


# Pin       23      24
# GPIO      3       4
# SODIMM    210     212
# GPIOCHIP  4       4
# LINE      26      27
# @app.route("/api/lightbulb", methods=["POST"])
# def api_lightbulb():
#     gpio_state["lightbulb"] = not gpio_state["lightbulb"]
#     value = gpio_state["lightbulb"]

#     chip = gpiod.Chip("/dev/gpiochip4")

#     line_offset = 26
#     line = chip.get_line(line_offset)
#     line.request(consumer="lightbulb", type=gpiod.LINE_REQ_DIR_OUT)
#     line.set_value(1 if value else 0)
#     line.release()

#     return jsonify({"lightbulb": value})

# @app.route("/api/bellButton", methods=["POST"])
# def api_bellButton():
#     # print("Bell Button toggled")
#     gpio_state2["bell-button"] = not gpio_state2["bell-button"]
#     value = gpio_state2["bell-button"]

#     chip = gpiod.Chip("/dev/gpiochip4")

#     line_offset = 27
#     line = chip.get_line(line_offset)
#     line.request(consumer="bell-button", type=gpiod.LINE_REQ_DIR_OUT)
#     line.set_value(1 if value else 0)
#     line.release()

#     return jsonify({"bell-button": value})