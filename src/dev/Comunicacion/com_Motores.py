from api.com_UART import (
    decode_Msg,
    uart_receive,
)

msg_col_Calef = {                                                     # Prioridad
    0x00 : "Inicialización",                                          #    0
    0x10 : "Modo Cuna, subida completada",                            #    2
    0x11 : "Modo Incubadora, bajada completada",                      #    2
    0x20 : "Modo Cuna seleccionado, esperando pulsación larga",       #    1
    0x21 : "Modo Incubadora seleccionado, esperando pulsación larga", #    1
    0x30 : "Columna subiendo hacia Cuna",                             #    2
    0x31 : "Columna bajando hacia Incubadora",                        #    2
    0xFF : "Falla crítica, parada general enclavada",                 #    3
}

msg_Calef = {
    0x00 : "Calefactor inactivo",                                     #    0
    0x10 : "Inicialización correcta, comienza subida",                #    1
    0x11 : "Subida completada correctamente",                         #    2
    0x12 : "Bajada completada correctamente",                         #    2
    0x20 : "Calefactor subiendo",                                     #    2
    0x21 : "Calefactor bajando",                                      #    2
    0xFF : "Error de Calefactor en cualquier etapa",                  #    3
}

msg_Vent = {
    0x00 : "Ventiladores apagados normalmente",                       #    0
    0x82 : "Ventiladores arrancando o en validación",                 #    1
    0x83 : "Ambos ventiladores funcionando correctamente",            #    1
    0xF1 : "Falla únicamente FAN1",                                   #    2
    0xF2 : "Falla únicamente FAN2",                                   #    2
    0xFF : "Falla de ambos ventiladores",                             #    3
}

def status_Motrs(dev, vls_snsrsTCD):
    col_Calef = 0xFF
    calef = 0xFF
    fan = 0xFF

    res = uart_receive(dev, 10)
    res, id_res = decode_Msg(res)

    if id_res == "status_Motors":
        for pos in range(0, len(res), 2):
            sys = res[pos]
            stat = res[pos + 1]

            if sys == 0x01:
                col_Calef = msg_col_Calef.get(stat)
            elif sys == 0x02:
                calef = msg_Calef.get(stat)
            elif sys == 0x03:
                fan = msg_Vent.get(stat)

        vls_snsrsTCD["col_calef"] = col_Calef
        vls_snsrsTCD["calef"] = calef
        vls_snsrsTCD["fan"] = fan
    else:
        vls_snsrsTCD["col_calef"] = "Error de COM"
        vls_snsrsTCD["calef"] = "Error de COM"
        vls_snsrsTCD["fan"] = "Error de COM"