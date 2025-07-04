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

>&nbsp;.\
├── docker-compose.yml &emsp;# Configuración de contenedores\
├── src/ &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;# Código fuente\
│ &nbsp; &emsp;├── main.py &emsp; &emsp; &emsp; &nbsp; # Aplicación principal en Python\
│ &nbsp; &emsp;├── adc \
│  &nbsp; &emsp;│&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; └── hw504.py &nbsp;&nbsp;# Joystick \
│ &nbsp; &emsp;├── gpio \
│ &nbsp; &emsp;│&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; └── hx711.py &nbsp; &nbsp;# Lector de celdas de pesaje \
│ &nbsp; &emsp;├── i2c \
│ &nbsp; &emsp;│&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; └── sht21.py &nbsp; &nbsp;# Sensor de Temperatura y Humedad  \
│ &nbsp; &emsp;├── spi \
│ &nbsp; &nbsp; &nbsp; │ &emsp;&nbsp; &nbsp; └── bme280.py&nbsp;# Sensor de Presion, Temperatura y Humedad&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; \
│ &nbsp; &emsp;└── web &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;# Pagina WEB con la información de los sensores \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; ├── static&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; │ &emsp;&emsp;&emsp; ├─ css&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; │ &emsp;&emsp;&emsp;&nbsp;│&emsp; └─ style.css&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; │ &emsp;&emsp;&emsp; └─ js&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; │ &emsp;&emsp;&emsp;&emsp;&emsp;└─ script.js&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; └── templates&nbsp; \
│ &nbsp; &nbsp; &nbsp;&emsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; &emsp;&emsp;&emsp;&emsp; └─ index.html&nbsp; \
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
- Comunicación con el sensor HX711, se requiere de un level-shifter de 1.8v (Tarjeta Verdin + Mallow) a 3.3v (HX711) para lectura.

### v0.3.1 - [14/Mayo/2025]

- Modificación de SPI para trabajar con BME280.

### v0.3.2 - [19/Mayo/2025]

- Separación del código en módulos para cada sensor.
- Uso de TXS0108E para ajustar el nivel de voltaje entre el módulo HX711 (3.3v) y la tarjeta de desarrollo Verdin + Mallow (1.8v).
- Lectura de celdas de pesaje.

### v0.4 - [20/Mayo/2025]

- Uso de pines ADC para lectura de posición de joystick HW-504.

### v0.5 - [20/Mayo/2025]

- Prueba de levantamiento de servidor local.
- Instalación de librería Flask.
- Funcionamiento en local.

### v0.5.1 - [28/Marzo/2025]

- Se puede acceder a la pagina WEB desde la PC conectada en la misma red.
- Cambio de home.html por index.html.
- Creado directorio "web" dentro del directorio "src" para las plantillas UI/UX. 
- Creado directorio "static" y "templates" dentro del directorio "web" para las plantillas html. 
- Se separaron index y style.
- Agregado despliegue de sensores conectados en la pagina WEB.

### v0.5.2 - [29/Marzo/2025]

- Configurado contenedor Chromium.
- Visualización de la página de Toradex como previsualización.

### v0.6 - [29/Marzo/2025]

- Configurado archivo docker-compose para acceder a la aplicación de manera local.
- Visualización en pantalla LCD-MIPI de página web de la aplicación.

### v0.6.1 - [30/Marzo/2025]

- Actualización en index y main para ver los datos de los sensores en tiempo real.
- Creación de script de javascript para la lectura de sensores.
- Actualización de UI HTML.
- Ajustada resolución de la pantalla a 1024 × 600.

### v0.6.2 - [9/Junio/2025]

- Cambio de weston-imx8:4 a weston-vivante:2 por error de compatibilidad (Queda comentado por si es necesario cambiarlo)

### v0.6.3 - [11/Junio/2025]

- Implementación de gráficas de tendencias de temperatura.

### v0.7 - [17/Junio/2025]

- Cambio de interfaz de pantalla de sensores.
- Ajustados valores a contenedores de Temperatura y Temp. Prog.
- Habilitación y deshabilitación de botones de "+", "-" y "✓".
- Agregada función de aumentar y disminuir la Potencia del Calefactor.
- Añadida animación de parpadeo en el valor de la potencia al dar click en el botón de calefactor y se detiene al dar click en el botón de "✓".
- Limitación de aumento y disminución de valor de potencia de 0 - 100%.
- Corregido bug de guardado de valores de temperatura.

### v0.8 - [2/Julio/2025]

- Guardado de valores de tendencias de Temperatura en archivo json.
- Cambio de color de valor de temperatura al superar los 40.0°C
- Monitorización de memoria y función de limpieza.
- Creación de entrypoint para auto-inicialización de aplicación.
- Control de PWM para fototerapia.

### v0.9 - [4/Julio/2025]

- Agregada microSD para almacenado de datos de tendencias y variables de entorno.
- Lectura de datos como respuesta del documento json e implementación de función de limpieza de datos de archivo json.
- Implementación de variables de entorno para calibración y elección de dispositivos I2C.
- Agregada libreria logging para registro de eventos.