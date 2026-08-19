#===============================================================#
#                      Configuración de ADC                     #
#===============================================================#
def read_adc(channel):
    """
    Lee la lectura cruda del ADC desde sysfs y la devuelve como entero.

    Esta función abre el fichero de dispositivo ADC correspondiente al canal
    provisto y devuelve el valor leído convertido a `int`.

    Parámetros:
    - channel (int): Número del canal ADC a leer (ej. 0, 1...).

    Retorno:
    - int: Valor entero leído desde el ADC (rango esperado 0..1800).
           Si el archivo del dispositivo no existe, retorna -1.

    Excepciones/Comportamiento:
    - Atrapa `FileNotFoundError` y registra un mensaje por consola en vez de
      propagar la excepción, retornando -1 para señalar el fallo.
    - No captura otras excepciones (p. ej. permisos), que se propagarán.

    Ejemplo:
        v = read_adc(0)
        if v >= 0:
            print("Lectura ADC:", v)
    """
    try:
        with open(f"/sys/bus/iio/devices/iio:device0/in_voltage{channel}_raw", "r") as f:
            return int(f.read().strip())
    except FileNotFoundError:
        # logger.error(f"Canal ADC {channel} no encontrado.")
        print(f"Canal ADC {channel} no encontrado.")
        return -1