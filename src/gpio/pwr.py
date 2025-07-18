import os

def apagar():
  try:
    if os.name == 'posix':  # Linux, etc.
      os.system('sudo shutdown -h now')
    else:
      print("Sistema operativo no compatible.")
  except Exception as e:
    print(f"Error al apagar: {e}")

def reiniciar():
  try:
    if os.name == 'posix':  # Linux, etc.
      os.system('sudo reboot -h now')
    else:
      print("Sistema operativo no compatible.")
  except Exception as e:
    print(f"Error al apagar: {e}")