from api.pins_ADC import read_adc

sts_AlmnEq = True
#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def monitoreo_alimentación(adc_chn: int):
    global sts_AlmnEq

    try:
        valVoltaje = read_adc(adc_chn)

        if (valVoltaje < 1750):# and sts_AlmnEq:
            sts_AlmnEq = False
            statBatt = "ALERTA DE SUMINISTRO DE ENERGÍA"
            return statBatt
        elif (valVoltaje > 1750) and (not sts_AlmnEq):
            sts_AlmnEq = True
            statBatt = "Suministro de Energia Restablecido"
            return statBatt
        elif valVoltaje > 1750 and sts_AlmnEq:
            statBatt = "Bateria conectada"
            return statBatt
    except Exception as e:
        print(f"Error leyendo Voltaje: {e}")
        return 0
