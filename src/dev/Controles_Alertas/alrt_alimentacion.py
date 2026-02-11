from api.pins_ADC import read_adc

sts_AlmnEq = True
#================================================================#
#                Función principal de lectura ADC                #
#================================================================#
def monitoreo_alimentación(adc_chn: int):
    global sts_AlmnEq

    try:
        valVoltaje = read_adc(adc_chn)

        if (valVoltaje < 1750) and sts_AlmnEq:
            # print("ALERTA DE SUMINISTRO DE ENERGÍA")
            sts_AlmnEq = False
            return True
        elif (valVoltaje > 1750) and (not sts_AlmnEq):
            # print("Suministro de Energia Restablecido")
            sts_AlmnEq = True
            return False
        else:
            return sts_AlmnEq
    except Exception as e:
        print(f"Error leyendo Voltaje: {e}")
        return 0
