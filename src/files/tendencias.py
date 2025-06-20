# from datetime import datetime
# import json
# import os

data = []

def agregarDtTemperatura(temp, hr):
    data.append({"temp": temp, "hr": hr})
    print(f"Datos actuales: {data}")

    # with open("src/files/tendencias.json", "w") as file:
    #     json.dump(data, file, indent=4)