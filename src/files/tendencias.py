from datetime import datetime
import json
import os

file_path = "/tmp/temperatura.json"

def agregarDtTemperatura(temp):
    hr = datetime.now().strftime("%H:%M")
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

def leerDtTemperatura():
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            try:
                data_list = json.load(file)
                return data_list
            except json.JSONDecodeError:
                return []
    else:
        return []