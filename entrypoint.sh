#!/bin/bash
# Activa el entorno virtual
source /home/torizon/app/.venv/bin/activate
# Arranca tu aplicación en segundo plano
python3 /home/torizon/app/src/main.py &
# Arranca el SSHD en primer plano
exec /usr/sbin/sshd -D