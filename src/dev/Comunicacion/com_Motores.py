from api.com_UART import (
    decode_Msg,
    uart_receive,
)

msg_col_Calef = {
    0x00 : "Inicialización",
    0x10 : "Modo Cuna, subida completada",
    0x11 : "Modo Incubadora, bajada completada",
    0x20 : "Modo Cuna seleccionado, esperando pulsación larga",
    0x21 : "Modo Incubadora seleccionado, esperando pulsación larga",
    0x30 : "Columna subiendo hacia Cuna",
    0x31 : "Columna bajando hacia Incubadora",
    0xFF : "Falla crítica, parada general enclavada",
}

msg_Calef = {
    0x00 : "Lámpara inactiva",
    0x10 : "Inicialización correcta, comienza subida",
    0x11 : "Subida completada correctamente",
    0x12 : "Bajada completada correctamente",
    0x20 : "Lámpara subiendo",
    0x21 : "Lámpara bajando",
    0xFF : "Error de Lámpara en cualquier etapa",
}

msg_Vent = {
    0x00 : "Ventiladores apagados normalmente",
    0x82 : "Ventiladores arrancando o en validación",
    0x83 : "Ambos ventiladores funcionando correctamente",
    0xF1 : "Falla únicamente FAN1",
    0xF2 : "Falla únicamente FAN2",
    0xFF : "Falla de ambos ventiladores",
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

        # return col_Calef, calef, fan
        vls_snsrsTCD["col_calef"] = col_Calef
        vls_snsrsTCD["calef"] = calef
        vls_snsrsTCD["fan"] = fan
    else:
        return "Error de COM"