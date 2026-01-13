# Generar Imagen de Instalación

Comprobar que docker este funcionando usando:

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

Generar el el paquete del proyecto.

    torizoncore-builder bundle docker-compose.yml --platform linux/arm64 --bundle-directory bundle --dind-param="--insecure-registry=172.17.0.1:5002"

![Bundle del proyecto](/doc/img/bundle.png)

Generar la carpeta para crear la memoria booteable.

    torizoncore-builder build --file tcbuild.yaml

![Build booteable](/doc/img/ISO_build.png)

Copiar la carpeta generada un la memoria.

![Carpeta con archivos booteables](/doc/img/dirBooteable.png)

Conectar la memoria en el puerto USB durante la visualización de la Interfaz de EasyInstaller y la instalación iniciará automáticamente.
