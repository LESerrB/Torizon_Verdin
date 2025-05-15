# Proyecto para Torizon Verdin iMX8MM

Este repositorio contiene configuraciones, scripts y/o aplicaciones diseñadas para ejecutarse en la plataforma **Torizon Verdin iMX8MM** de Toradex. Está enfocado en facilitar el desarrollo y despliegue de soluciones embebidas utilizando esta tarjeta basada en ARM Cortex-A53.

## Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Control de Versiones](#control-de-versiones)

## Características

- Compatible con TorizonCore y Debian.
- Compatible con Docker y TorizonCore Builder.
- Comunicación con periféricos vía I2C, SPI, UART, CAN, GPIO.
- Desarrollo en Python.
- Preparado para integración CI/CD (GitHub Actions, GitLab CI, etc.).

## Requisitos

- Tarjeta **Verdin iMX8MM** con TorizonCore instalado.
- Cable USB o conexión Ethernet.
- [Toradex Easy Installer](https://developer.toradex.com/software/toradex-easy-installer/).
- [TorizonCore Builder](https://developer.toradex.com/torizon/torizoncore-builder/) (si deseas personalizar el SO).
- Docker y Docker Compose instalados.
- Python 3.x y GCC para desarrollos en C y Python.
- Visual Studio Code con extensiones de Torizon (opcional).

## Estructura del Proyecto

>.\
├── docker-compose.yml &emsp; # Configuración de contenedores\
├── src/ &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; # Código fuente\
│ &nbsp; &emsp; └── main.py &emsp; &emsp; &emsp; &nbsp; # Aplicación principal en Python\
├── overlays/ &emsp; &emsp; &emsp; &emsp; &emsp; # Device Tree Overlays (si aplica)\
└── README.md

## Control de Versiones

### v0.1 - [9/May/2025]

- Habilitación del bus SPI.
- Configuración del archivo torizonPackages.json para instalar la libreria "python3-spidev".
- Configuración del contenedor (docker-compose.yml) para enlazar el bus SPI1.0 con la biblioteca spidev.
- Configuración de la comunicación SPI en Modo 1 a 500kHz.

### v0.2 - [12/Mayo/2025]

- Configuración del bus I2C.
- Configuración del contenedor (docker-compose.yml) para enlazar el bus I2C-3 con la biblioteca smbus2.
- Lectura del sensor SHT21.

### v0.3 - [13/Mayo/2025]

- Configuración de GPIO 1 y 2 de Carrier Board Mallow y Line 4 y 5 de tarjeta Verdin iMX8MM.
- Configuración del archivo torizonPackages.json para instalar la libreria "python3-libgpiod".
- Configuración de contenedor (docker-compose.yml) para enlazar los buses gpiochip2 y gpiochip4 para usar los GPIO_1 y GPIO_2.
- Comunicación con el sensor HX711, se requiere de un level-shifter de 1.8v (Tarjeta Verdin-Mallow) a 3.3v (HX711) para lectura.

### v0.3.1 - [14/Mayo/2025]

- Modificación de SPI para trabajar con BME280