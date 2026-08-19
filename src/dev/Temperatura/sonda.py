import math
import os

# from files.logs import logger
from api.pins_ADC import read_adc
from dotenv import load_dotenv

# logger.info('Inicializando ADC')
load_dotenv("/mnt/microsd/.env")

# Variables Calibracion Sonda Patron
a0 = float(os.getenv("A0", 0.001319224))
b0 = float(os.getenv("B0", 0.000216279))
c0 = float(os.getenv("C0", 0.000000181))

a1 = float(os.getenv("A0", 0.001319224))
b1 = float(os.getenv("B0", 0.000216279))
c1 = float(os.getenv("C0", 0.000000181))

habSonda2 = os.getenv("SONDA2", False)

if habSonda2:
    print("Sonda2 Habilitada")
else:
    print("Sonda2 Deshabilitada")

#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def read_Sonda(adc_chn: int):
    """
    Lee la sonda desde el canal ADC y devuelve la temperatura en grados Celsius.

    El cálculo convierte la lectura ADC a una resistencia equivalente, aplica la
    ecuación tipo Steinhart–Hart usando los coeficientes globales `a0`, `b0`, `c0`
    para obtener la temperatura en Kelvin y la transforma a °C.

    Parámetros:
    - adc_chn (int): Canal ADC a leer.

    Retorno:
    - float: Temperatura en °C si el valor calculado está en el rango (10, 45).
             Devuelve 0 en caso de error o si la temperatura está fuera de rango.

    Comportamiento:
    - Las excepciones internas se capturan; la función no propaga errores sino
      que retorna 0 cuando ocurre cualquiera.
    """
    try:
        valSonda1 = round(4300 * ((1800/read_adc(adc_chn)) - 1))
        logaritmo = math.log(valSonda1)
        temperatura = 1/(a0 + b0 * (logaritmo) + c0 * (pow(logaritmo, 3)))
        tempSonda = temperatura - 273

        if 10 < tempSonda < 45:
            return tempSonda
        else:
            return 0
    except Exception as e:
        # logger.error("Error leyendo SONDA1:", e)
        # print(f"Error leyendo SONDA1: {e}")
        return 0

#================================================================#
#                       Calibración Sondas                       #
#================================================================#
# def calib_Sonda(sonda_patron = 36+273):
#     """
#     Calibra la sonda y actualiza la constante global `a0` en el archivo de entorno.

#     La función lee el valor ADC del canal 0, calcula el logaritmo de la resistencia
#     equivalente y recalcula `a0` usando el patrón de temperatura proporcionado
#     (en Kelvin). Sustituye la línea que comienza con "A0=" en
#     "/mnt/microsd/.env" por el nuevo valor calculado.

#     Parámetros:
#     - sonda_patron (float): Temperatura de referencia en Kelvin (por defecto 36°C + 273 K).

#     Efectos secundarios:
#     - Modifica la variable global `a0`.
#     - Sobrescribe el fichero "/mnt/microsd/.env" reemplazando la línea "A0=...".

#     Retorno:
#     - None

#     Excepciones:
#     - Puede arrojar `FileNotFoundError` o `IOError` si "/mnt/microsd/.env" no existe
#       o no es accesible.

#     Ejemplo:
#         calib_Sonda()  # calibra usando 36°C como patrón
#     """

#     global a0
#     lines = []

#     valSonda1 = round(4300 * ((1800/read_adc(0)) - 1))
#     logaritmo = math.log(valSonda1)

#     a0 = round(1/sonda_patron - (b0 * logaritmo) - (c0 * (pow(logaritmo, 3))), 9)

#     with open("/mnt/microsd/.env", "r") as f:
#         for line in f:
#             if line.startswith("A0="):
#                 lines.append(f"A0={a0}\n")
#             else:
#                 lines.append(line)

#     with open("/mnt/microsd/.env", "w") as f:
#         f.writelines(lines)