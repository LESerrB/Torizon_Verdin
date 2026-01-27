#===============================================================#
#                        Funciones de SPI                       #
#===============================================================#
def read_bytes(SPI_dev, reg, length):
    """
    Lee una secuencia de bytes desde un registro del dispositivo BME280 vía SPI.

    La función realiza una transferencia SPI usando `xfer2`. Para indicar una
    operación de lectura sobre el registro `reg` se aplica la máscara `| 0x80`.

    Parámetros:
    - reg (int): Dirección del registro a leer.
    - length (int): Número de bytes a leer.

    Retorno:
    - list[int]: Lista de bytes leídos (cada elemento 0..255).

    Excepciones:
    - Puede lanzar excepciones relacionadas con SPI (p. ej. si el bus no está
        disponible).
    """
    return SPI_dev.xfer2([reg | 0x80] + [0x00]*length)[1:]

def write_byte(SPI_dev, reg, val):
    """
    Escribe un byte en un registro del dispositivo BME280 vía SPI.

    Realiza una transferencia SPI con el bit de lectura limpiado (`reg & 0x7F`)
    seguida del valor `val` a escribir.

    Parámetros:
    - reg (int): Dirección del registro a escribir.
    - val (int): Valor del byte a escribir (0..255).

    Retorno:
    - None

    Excepciones:
    - Puede lanzar excepciones relacionadas con SPI (p. ej. si el bus no está
        disponible o hay error de I/O).
    """
    SPI_dev.xfer2([reg & 0x7F, val])

def close_COM(SPI_dev):
    SPI_dev.close()