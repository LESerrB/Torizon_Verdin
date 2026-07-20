from datetime import datetime
import json
import os

file_path = "/mnt/microsd/tendencias.json"

#================================================================#
#       Función para agregar datos al archivo de tendencias      #
#================================================================#
def agregarDtTemperatura(temp):
    """
    Añade una entrada de temperatura con marca temporal al archivo de tendencias.

    Lee (o crea) el fichero JSON definido en `file_path`, añade un diccionario
    con la temperatura y la hora actual, y guarda la lista actualizada de vuelta
    en disco.

    Parámetros:
    - temp (float|int): Valor de temperatura a almacenar.

    Retorna:
    - list: Lista completa de registros almacenados después de añadir el nuevo.

    Comportamiento:
    - Si el archivo no existe, se crea con una lista que contiene la nueva entrada.
    - Si el archivo existe pero contiene JSON inválido, se sobrescribe con una
      lista nueva que contiene únicamente la nueva entrada.

    Ejemplo:
        registros = agregarDtTemperatura(23.5)
    """
    hr = datetime.now().strftime("%H:%M:%S")

    data = {
        "temp": temp,
        "hr": hr
    }

    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            try:
                data_list = json.load(file)
            except json.JSONDecodeError:
                data_list = []
    else:
        data_list = []
        
    data_list.append(data)
    
    with open(file_path, "w") as file:
        json.dump(data_list, file, indent=4)
    
    return data_list

#================================================================#
#    Función para limpiar los datos del archivo de tendencias    #
#================================================================#
def limpiarDtTemperatura():
    """
    Limpia todos los registros de tendencias guardados en `file_path`.

    Si el fichero existe, lo sobrescribe con una lista JSON vacía `[]` y
    muestra un mensaje de confirmación por consola. Si no existe, informa
    que no se puede realizar la limpieza.

    Parámetros:
    - Ninguno.

    Retorno:
    - None

    Ejemplo:
        limpiarDtTemperatura()
    """
    if os.path.exists(file_path):
        with open(file_path, "w") as file:
            json.dump([], file, indent=4)
            
        print("Datos de tendencias limpiados.")
    else:
        print("El archivo no existe, no se puede limpiar.")