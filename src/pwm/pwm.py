import os

OFF = 0.0
LOW = 33.0
MEDIUM = 50.0
FULL = 100.0

pwmchipFOT = "/sys/class/pwm/pwmchip1"
pwmchipLzEx = "/sys/class/pwm/pwmchip2"

def setNvlFototerapia(nvlFototerapia):
    print(f"Nivel de fototerapia establecido: {nvlFototerapia}")
    if nvlFototerapia == 0:
        set_pwm_duty_cycle(OFF, pwmchipFOT)
    elif nvlFototerapia == 1:
        set_pwm_duty_cycle(LOW, pwmchipFOT)
    elif nvlFototerapia == 2:
        set_pwm_duty_cycle(MEDIUM, pwmchipFOT)
    elif nvlFototerapia == 3:
        set_pwm_duty_cycle(FULL, pwmchipFOT)
    else:
        print("Nivel de fototerapia no válido. Debe ser 0, 1, 2 o 3.")
        set_pwm_duty_cycle(OFF, pwmchipFOT)

def setNvlLuzExam(nvlLuzExam):
    print(f"Nivel de luz examinación establecido: {nvlLuzExam}")
    if nvlLuzExam == 0:
        set_pwm_duty_cycle(OFF, pwmchipLzEx)
    elif nvlLuzExam == 1:
        set_pwm_duty_cycle(LOW, pwmchipLzEx)
    elif nvlLuzExam == 2:
        set_pwm_duty_cycle(MEDIUM, pwmchipLzEx)
    elif nvlLuzExam == 3:
        set_pwm_duty_cycle(FULL, pwmchipLzEx)
    else:
        print("Nivel de luz examen no válido. Debe ser 0, 1, 2 o 3.")
        set_pwm_duty_cycle(OFF, pwmchipLzEx)

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