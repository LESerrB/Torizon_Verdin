import time

from smbus2 import SMBus

VL53_ADDR = 0x29

# Registro                          | Descripción
# --------------------------------- | --------------------
SYSRANGE_START = 0x00             # | Iniciar medición    
SYSTEM_SEQUENCE_CONFIG = 0x01     # | Qué etapas ejecutar 
SYSTEM_INTERRUPT_CLEAR = 0x0B     # | Limpiar interrupción
RESULT_INTERRUPT_STATUS = 0x13    # | Estado medición     
RESULT_RANGE_STATUS = 0x14        # | Resultado principal 


def prox_Med(startTime):
    with SMBus(3) as bus:
        bus.write_byte_data(VL53_ADDR, SYSRANGE_START, 0x01)

        status = bus.read_byte_data(VL53_ADDR, RESULT_INTERRUPT_STATUS)

        if (status >> 6) & 0x01:
            hi = bus.read_byte_data(VL53_ADDR, 0x1E)
            lo = bus.read_byte_data(VL53_ADDR, 0x1F)

            distance = (hi << 8) | lo

            if (150 < distance < 350):
                print("Distance:", distance, "mm")

                if startTime == 0:
                    startTime = time.monotonic()
            else:
                if startTime != 0 and ((time.monotonic() - startTime) >= 0.4):
                    return 99

                startTime = 0

        bus.write_byte_data(VL53_ADDR, SYSTEM_INTERRUPT_CLEAR, 0x01)

        return startTime

