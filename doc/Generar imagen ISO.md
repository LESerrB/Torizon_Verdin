# Generar Imagen de Instalación

Seguir los pasos de [Instalar TorizonCore Builder](https://developer.toradex.com/torizon/os-customization/install-torizoncore-builder/) para crear la carpeta `tcbdir` dentro del proyecto, con la siguiente estructura:

```
.
├── tcbdir
│      ├── device-trees
│      ├── dt-bindings
│      ├── linux
│      ├── Overlays
│      │       ├── imx8mp-pinfunc.h
│      │       └── verdin-imx8mp-qspi-gpio.dts
│      ├── docker-compose.yml
│      ├── logo.png
│      ├── tcb-env-setup.sh
│      ├── tcbuild.yaml
│      └── torizon-core-docker-verdin-imx8mp-Tezi_X.X.X+build.XX
```

Los pasos solo crearán la carpeta tcbdir y los archivos para ejecutar ```torizoncore-builder``` los demás archivos se deberán copiar del repositorio y descargar siguiendo los pasos de [Build Custom Torizon OS Images](https://developer.toradex.com/torizon/os-customization/customize-torizon-os-images). Ahí se deberá seleccionar el modelo y la versión de la tarjeta SoM verdin utilizada para descargar los archivos necesarios para crear la imagen correcta.

En esta versión se esta utilizando la versión del SO:

    torizon-core-docker-verdin-imx8mp-Tezi_6.8.4+build.40

Comprobar que docker este funcionando usando dentro de la carpeta del proyecto:

    docker ps

![Comprobación del contenedor](/doc/img/dck_rgt.png)

Obtener la dirección IP del contenedor.

    ip addr show docker0 | grep inet

![Comprobación del contenedor](/doc/img/IP_addressdck.png)

Build de la imagen del proyecto,

    docker build -t 172.17.0.1:5002/quickstart1-debug:arm64 .

![Build de la imagen](/doc/img/dockerBuild.png)

Push al registro local

    docker push 172.17.0.1:5002/quickstart1-debug:arm64

![Push imagen al docker local](/doc/img/dockerPush.png)

Generar el el paquete del proyecto dentro de la carpeta tcbdir (Debe inicarse TorizonCore Builder usando `source tcb-env-setup.sh
` dentro de la carpeta tcbdir).

    torizoncore-builder bundle docker-compose.yml --platform linux/arm64 --bundle-directory bundle --dind-param="--insecure-registry=172.17.0.1:5002"

![Bundle del proyecto](/doc/img/bundle.png)

Generar la carpeta para crear la memoria booteable.

    torizoncore-builder build --file tcbuild.yaml

![Build booteable](/doc/img/ISO_build.png)

Copiar la carpeta generada un la memoria.

![Carpeta con archivos booteables](/doc/img/dirBooteable.png)

Conectar la memoria en el puerto USB durante la visualización de la Interfaz de EasyInstaller y la instalación iniciará automáticamente.
