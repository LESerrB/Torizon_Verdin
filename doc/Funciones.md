# Documentación Funciones

## Contenido

- [read_Sonda()](#read_sonda)
- [calib_Sonda()](#calib_sonda)
- [ctrl_Calef()](#ctrl_calef)
- [set_PWM_Calef()](#set_pwm_calef)
- [statusCom_Calef()](#statuscom_calef)
- [setNvlLuzExam()](#setnvlluzexam)
- [setNvlFototerapia()](#setnvlfototerapia)
- [pesaje()](#pesaje)
- [tare()](#tare)
- [calib()](#calib)

## Funciones de Sonda de Temperatura

Estas funciones se encargan de leer y calibrar la temperatura de la sonda de piel a traves del nivel de voltaje en el ADC.

![Diagrama Sonda Temperatura](/doc/img/adc_FlowDiag.svg)

### read_Sonda()

---

### Descripción

Obtiene el valor de la sonda de temperatura leyendo el valor del voltaje de un divisor de voltaje utilizando una resistencia patrón de 4.3 KΩ y el pin de lectura ADC.

#### Syntax

    from adc.sonda import read_Sonda

    ...

    tempSondaPiel = read_Sonda()

    ...

#### Parámetros

adc_chn (int): Valor entero del canala ADC.

#### Returns

tempSonda(float): Retorna un valor entre 10.0 y 45.0 si la lectura ha sido correcta y 0 si no se ha obtenido un valor correcto.

### calib_Sonda()

---

#### Descripción

Función para calibrar la temperatura de la sonda. Es necesario conectar una sonda patrón antes de iniciar el proceso. La sonda patrón se debe conectar en la entrada principal.

#### Syntax

    from adc.sonda import calib_Sonda

    ...

    calib_Sonda()

    ...

#### Parámetros

No recibe ningún parámetro.

#### Returns

Esta función no devuelve ningún valor, sobrescribe el valor de "a0" para el calculo de la temperatura.

## Funciones de Calefactor

Funciones de control de potencia de calefactor, establecimiento de potencia y de señal PWM.

![Diagrama de Calefactor](/doc/img/calef_FlowDiag.svg)

### ctrl_Calef()

---

#### Descripción

Función principal de control del calefactor. Esta función se encarga de generar un PWM de 16.32 ms para controlar la potencia del calefactor encendiendo y apagando el pin seleccionado con una lógica inversa (0: Encendido, 1: Apagado). Esta función se ejecuta en un hilo, lo que permite su operación en paralelo, obteniendo la potencia de forma recurrente y generando un tren de pulsos.

#### Syntax

    import threading

    from gpio.calef import ctrl_Calef

    ...

    thread_Calef = threading.Thread(target=ctrl_Calef, daemon=True)
    thread_Calef.start()

    ...


#### Parámetros

Esta función no recibe parámetros.

#### Returns

Esta función no devuelve ningún valor.

### set_PWM_Calef()

---

#### Descripción

Función para establecer la potencia del calefactor.

#### Syntax

    from gpio.calef import set_PWM_Calef

    ...

    set_PWM_Calef(val)

    ...

#### Parámetros

val (int): Valor de potencia del calefactor.

#### Returns

Esta función no devuelve ningun valor.

### statusCom_Calef()

---

#### Descripción

Función para monitorear el estado del tren de pulsos, en caso de no encontrar un cambio de nivel de voltaje se habilita una bandera para indicar el fallo. Esta función se utiliza en un hilo para que se mantenga activa durante todo el ciclo.

#### Syntax

    import threading

    from gpio.calef import statusCom_Calef

    ...

    thread_comCalef = threading.Thread(target=statusCom_Calef, daemon=True)
    thread_comCalef.start()

    ...

#### Parámetros

Esta función no recibe parámetros.

#### Returns

Esta función no devuelve ningún valor

## Funciones de Nivel de Luz

Funciones para establecer los niveles de intensidad de luz.

![Diagrama Nivel de Luz](/doc/img/lfe_FlowDiag.svg)

### setNvlFototerapia()

---

### Descripción

Establece el nivel de intensidad de la luz de fototerapia, usando uno de los pines PWM.

#### Syntax

    from pwm.pwm import setNvlFototerapia

    ...

    setNvlFototerapia(nvlFototerapia)

    ...

#### Parámetros

nvlFototerapia (int): Valor entero para establecer la intensidad de la luz de fototerapia.

#### Returns

Esta función no devuelve ningún valor

### setNvlLuzExam()

---

#### Descripción

Establece el nivel de intensidad de la luz de fototerapia, usando uno de los pines PWM.

#### Syntax

    from pwm.pwm import setNvlLuzExam

    ...

    setNvlLuzExam(nvlLuzExam)

    ...

#### Parámetros

nvlLuzExam: Valor entero para establecer la intensidad de la luz de examinación.

#### Returns

Esta función no devuelve ningún valor

## Funciones de Báscula

Funciones para pesar, tarar, y calibrar. Los valores se almacenan en la memoria de la terjeta embebida.

![Diagrama Tajeta de Báscula](/doc/img/basc_FlowDiag.svg)

### pesaje()

---

#### Descripción

Funcion de comunicación para realizar la comunicación UART con la tarjeta de Báscula y realizar la acción de pesaje.

#### Syntax

    from uart.comBasc import pesaje

    ...

    pesoFinal = pesaje()

    ...


#### Parámetros

Esta función no recibe ningún valor.

#### Returns

pesoTotal (float):

&emsp; Valor flotante > 0, si la comunicación se realizó correctamente.

&emsp; 0.0, Si falla la comunicación con la tarjeta

### tare()

---

#### Descripción

Función para tarar los valores de peso de la tarjeta de báscula.

#### Syntax

    from uart.comBasc import tare

    ...

    res = tare()

    ...

#### Parámetros

Esta función no recibe ningún parámetro.

#### Returns

-1 si falla; en otro caso no devuelve nada y actualiza el valor de OFFSET.

### calib()

---

#### Descripción

Función para calibrar los valores de pesaje de la tarjeta de báscula.

#### Syntax

    from uart.comBasc import tare

    ...

    res = calib()

    ...

#### Parámetros

Esta función no recibe ningún parámetro.

#### Returns

-1 si falla; en otro caso no devuelve nada y se actualiza el valor de SCALE.

## Funciones de ajuste de posición

Estas funciones se encargan de ajustar la posición del equipo al igual que el modo de funcionamiento.

![Diagrama Tajeta de Báscula](/doc/img/btnsCtrl_FlowDiag.svg)

### upRgt_On(), upRgt_Off(), dwnLft_On(), dwnLft_Off()

---

#### Descripción

Estas funciones se encargan de encender o apagar los pines de control de los motores.

#### Syntax

    ...
    upRgt_On() / upRgt_Off() / dwnLft_On() / dwnLft_Off()
    ...

#### Parámetros

Esta función no recibe ningún valor.

#### Returns

Esta función no retorna ningún valor.

### giroMotor()

---

#### Descripción

Ser encarga de abrir o cerrar el capelo del equipo.

#### Syntax

```
    ...
    giroMotor("Abrir")
    ...
```
```
    ...
    giroMotor("Cerrar")
    ...
```

#### Parámetros

action (string): Recibe la cadena "Abrir" ó "Cerrar" dependiendo de la acción necesitada por el equipo.

#### Returns

Esta función no retorna ningún valor.

### sm_chngModoOp()

---

#### Descripción

Clase que se usa para crear y manejar la máquina de estados.

![Diagrama Tajeta de Báscula](/doc/img/chnmodo_StateMachine.svg)

#### Syntax

    from gpio.modoFunc import sm_chngModoOp

    ...
    fsm = sm_chngModoOp()
    ...

    def api_modoFunc():
        global strStatus

        while True:
            fsm.run()

            if fsm.state == "edo_0":
                strStatus = ""
                return jsonify({"status": "ok"}), 200
            elif fsm.state == "error" and fsm.errores < 3:
                strStatus = f"{fsm.errores}"
                # return jsonify({"status": "retrying"}), 502
            elif fsm.state == "error" and fsm.errores >= 3:
                strStatus = "Error"
                return jsonify({"status": "fail"}), 500

#### Parámetros

Esta función no recibe ningún parámetro.

#### Returns

Esta función no retorna ningún valor, pero se puede acceder a sus propiedades.