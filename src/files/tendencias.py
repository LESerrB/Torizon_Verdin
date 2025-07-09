from datetime import datetime
import json
import os

file_path = "/mnt/microsd/tendencias.json"

def agregarDtTemperatura(temp, hum, pres280):
    hr = datetime.now().strftime("%H:%M:%S")

    data = {
        "temp": temp,
        "hum": hum,
        "pres280": pres280,
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

def limpiarDtTemperatura():
    if os.path.exists(file_path):
        with open(file_path, "w") as file:
            json.dump([], file, indent=4)
        print("Datos de tendencias limpiados.")
    else:
        print("El archivo no existe, no se puede limpiar.")