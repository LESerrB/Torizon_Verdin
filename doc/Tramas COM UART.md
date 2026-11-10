# Comunicación TCI

Estructura de las tramas de comunicación entre la tarjeta Verdín y la tarjeta de sensores TCI, usando las funciones  y "encode_Msg" y "decode_Msg".

## Datos UART TCI => Verdin

**DD**: Datos en hexadecimal (0xFF)

| #  | VDN Rx |    Dato        |
|----|--------|----------------|
| 0  |  0x00  | Header         |
| 1  |  0x10  | Longitud       |
| 2  |   DD   | MSB t Aire     |
| 3  |   DD   | LSB t Aire     |
| 4  |   DD   | MSB % HR       |
| 5  |   DD   | LSB % HR       |
| 6  |   DD   | MSB temp seg   |
| 7  |   DD   | LSB temp seg   |
| 8  |   DD   | MSB t Piel     |
| 9  |   DD   | LSB t Piel     |
| 10 |   DD   | MSB t Piel Aux |
| 11 |   DD   | LSB t Piel Aux |
| 12 |   DD   | MSB pot Cal    |
| 13 |   DD   | LSB pot Cal    |
| 14 |   DD   | MSB % O2       |
| 15 |   DD   | LSB % O2       |
| 16 |  0x00  | Zero           |
| 17 |   DD   | Byte Alarmas   |
| 18 |   DD   | MSB CRC        |
| 19 |   DD   | LSB CRC        |
| 20 |  0xAA  | Tail           |

### Byte de alarmas

| #Byte |     Dato                |
|-------|-------------------------|
|   0   |  Fallo de Sensor O2     |
|   1   |  O2 Alto                |
|   2   |  O2 Bajo                |
|   3   |  Depósito de Agua Vacío |
|   4   |  % HR Alto              |
|   5   |  % HR Bajo              |
|   6   |  Fallo módulo humedad   |
|   7   |  Error de comunicación  |

## Datos UART Verdin => TCI

**Comando** 0xAA para configurar valores de control
            0x00 para solicitar datos de los sensores

**Longitud** 0x01 para solicitar datos de los sensores
             0x0A para configurar valores de control

| #  | VDN Tx |    Dato         |
|----|--------|-----------------|
| 0  |  0x00  | Header          |
| 1  |  0xFF  | Comando         |
| 2  |  0xFF  | Longitud        |
| 3  |   DD   | MSB t Aire Ctrl |
| 4  |   DD   | LSB t Aire Ctrl |
| 5  |   DD   | MSB pot Manual  |
| 6  |   DD   | LSB pot Manual  |
| 7  |   DD   | MSB t Piel Ctrl |
| 8  |   DD   | LSB t Piel Ctrl |
| 9  |   DD   | MSB % O2 Ctrl   |
| 10 |   DD   | LSB % O2 Ctrl   |
| 11 |   DD   | MSB % HR Ctrl   |
| 12 |   DD   | LSB % HR Ctrl   |
| 13 |   DD   | MSB CRC         |
| 14 |   DD   | LSB CRC         |
| 15 |  0x63  | Tail            |

# Comunicación Tarjeta Motores


## Tarjeta Motores => Verdín

**Comando** 0xBB para diferenciar la trama proveniente de la tarjeta
                 de motores.

**Longitud** 0xDD sustituyendo DD por el valor hexadecimal de los datos
                  enviados por la tarjeta de motores.

| #  | VDN Tx |    Dato         |
|----|--------|-----------------|
| 0  |  0x00  | Header          |
| 1  |  0xFF  | Comando         |
| 2  |  0xFF  | Longitud        |
| 3  |   DD   | MSB Dt 1        |
| 4  |   DD   | LSB Dt 2        |
| 5  |   DD   | MSB CRC         | <== No implementados
| 6  |   DD   | LSB CRC         | <== No implementados
| 7  |  0x63  | Tail            |