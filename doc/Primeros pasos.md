# Primeros Pasos con Torizon y Verdin

## Instalación de la SoM

Para instalar la tarjeta Verdin se debe insertar en la placa en un slot SODIMM en un ángulo de 30° hasta que se oiga un click.

![Instalación en placa](./img/Instalacion_SoM.png)

Bajar la tarjeta hasta que los clips queden en su lugar, colocar los tornillos de soporte.

![SoM conectado](./img/SoM_Conectado.png)

Enchufar los cables de alimentación, cable de red y HDMI. Opcionalmente conectar el cable USB C si se necesita usar el Recovery Modoe.

![Conexión de cables](./img/Cables.png)

Encender la tarjeta presionando el boton ON/OFF.

![Ubicación botón encendido](./img/boton%20ON%20OFF.png)

Despues del primer inicio se verá el GUI de Toradex Easy Installer. (Si no se visualiza la GUI en la pantalla usar VNC para comprobar que este funcionando correctamente)

![Toradex Easy Installer](./img/GUI_EasyInstaller.png)

## Instalación del SO

Ubicar el modelo y número de serie en la tarjeta (Fig. 9). Estos se usarán para crear el nombre host de la tarjeta Ej. [familia]-[procesador]-[número-serie] (verdin-imx8mp-xxxxxxxx)

![Etiqueta SoM](./img/num_Serie.png)

Usar Advanced IP Scaner (O software similar) para encontrar la dirección IP dentro de la red. Los números de la etiqueta deben corresponder a los que aparecen en el software.

![Dirección IP SoM](./img/IP_address.png)

Abrir RealVNC Viewer e iniciar una nueva conexión. En VNC Servver colocar la dirección IP obtenida con el software.

![Dirección IP SoM](./img/VNC_viewer.png)

En la pantalla de EasyInstaller seleccionar la versión 6.8

![Version Torizon](./img/EasyInstaller.png)

Esperar a que el instalador termine.

![Instalador](./img/Instalando_SO.png)

Cuando termine, el sistema debe reiniciarse. Si se usa VNC la conexión se perderá y necesitará reinicar manualmente con el botón de Reset u On/Off.

![Reboot](./img/rebootSys.png)

## Configuración VS Code

Dar click en el icono de Extensiones del lado izquierdo en VS Code

![Extensiones](./img/iconosExtensiones.png)

Buscar e instalar Torizon IDE Extension.

![IDE Torizon](./img/TorizonIDE.png)

Activar la extensión seleccionando el icono en la barra lateral.

![Torizon](./img/Torizon_Icono.png)

Durante la primer activación se deben verificar e instalar las distintas dependencias necesarias.

![Verificación Dependencias](./img/Install_Dependences.png)

Instalar Windows Subsystem for Linux. El equipo se reiniciará después de la instalación.

![Instalación de WSL](./img/WSL_Install.png)

Despues del reinicio, volver a abrir VS Code y ejecutar de nuevo la verificación de las dependencias. Si se han completado las verificaciones anteriores de manera correcta. Instalar Torizon WSL 2.

![Verificación Dependencias](./img/WSL-Torizon_Install.png)

Configurar el entorno de Torizon WSL.

![Verificación Dependencias](./img/WSL-Torizon_Config.png)
![Verificación Dependencias](./img/Config_TZ-WSL.png)

Asignar el Nombre del Sistema y la contraseña ```sudo```

![Verificación Dependencias](./img/Config_TZ-WSL_NomPsw.png)

Después de verificar e instalar las dependencias conectar con WSL.

![Conectar a WSL](./img/ConexionWSL.png)

Después de conectar WSL se podrá Abrir/Crear un proyecto de Torizon.

![VS Code](./img/vsCode_conf.png)

## Construcción del proyecto

Descargar el proyecto en una instancia de WSL.

![Repositorio del proyecto](./img/github-prj.png)
![Instancia de WSL Torizon](./img/WSL_Torizon.png)

Abrir el proyecto en VS Code y construir el proyecto.

![Build del proyecto](./img/build_prjt.png)

Asegurar que el compilador de VS Code se encuentre como Torizon arm64.

![Debug](./img/debugOptions.png)

Durante la primer carga del proyecto se pedira instalar los paquetes y recursos necesarios para el proyecto. Usar la contraseña configurada con anterioridad.

![Verificación Dependencias](./img/InstallResources.png)