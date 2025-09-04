import serial

uart_Channel = "/dev/verdin-uart1"
baud_rate = 115200

ser = serial.Serial(uart_Channel, baud_rate, 8, 'N', 1, timeout=1)

def uart_send(data: str):
    if ser and ser.is_open:
        ser.write(data.encode('ascii'))
        print(f"Enviado: {data.strip()}")
    else:
        print("UART no está abierto")

def uart_receive() -> str:
    if ser and ser.is_open:
        data = ser.readline().decode("utf-8", errors="ignore")
        print("Dato recibido:", data)
        # data = clean_text(data)

        if data:
            return data
    else:
        print("UART no está abierto")
        return ""

def close_uart():
    if ser and ser.is_open:
        ser.close()
        print("UART cerrado")

def clean_text(uart_bytes: bytes) -> str:
    # Opcional: quita caracteres nulos y similares
    cleaned = uart_bytes.replace("\x00", "").replace("\n", "").replace("\r", "")

    # Busca el inicio del texto esperado
    start = cleaned.find("Arroba")
    if start == -1:
        return ""

    # Recorta desde "Arroba" en adelante
    final = cleaned[start:]

    # Busca el final de la cadena esperada
    end_ctrl = final.find("CTCtrl=--.-C")

    if end_ctrl != -1:
        end = end_ctrl + len("CTCtrl=--.-C")
        return final[:end]

    # Si no se encuentra el final esperado, regresa desde "Arroba"
    return final.strip()

class StateMachine:
    def __init__(self):
        self.state = "edo_0"

    def run(self):
        match self.state:
            case "edo_0":
                val = self.edo_0()
                return val
            case "edo_1":
                val = self.edo_1()
                return val
            case "edo_2":
                val = self.edo_2()
                return val
            case "edo_3":
                val = self.edo_3()
                return val
            case "edo_4":
                val = self.edo_4()
                return val

    def edo_0(self):
        print("→ Estado 0 - Leyendo Valor")
        val = uart_receive()

        if val == "200":
            print("Valor leido =", val, "sumando 15")
            val = int(val) + 15
            print("Enviando:", val, "→ edo_1")
            uart_send(str(val))

            self.state = "edo_1"
            return val

    def edo_1(self):
        print("→ Estado 1 - Leyendo Valor")
        val = uart_receive()

        if val == "228":
            print("Valor leido =", val, "sumando 37")
            val = int(val) + 37
            print("Enviando:", val, "→ edo_2")
            uart_send(str(val))

            self.state = "edo_2"
            return val
        
    def edo_2(self):
        print("→ Estado 2 - Leyendo Valor")
        val = uart_receive()

        if val == "278":
            print("Valor leido =", val, "sumando 61")
            val = int(val) + 61
            print("Enviando:", val, "→ edo_3")
            uart_send(str(val))

            self.state = "edo_3"
            return val

    def edo_3(self):
        print("→ Estado 3 - Leyendo Valor")
        val = uart_receive()

        if val == "352":
            print("Valor leido =", val, "Enviando → edo_4")
            uart_send(str(val))

            self.state = "edo_4"
            return val

    def edo_4(self):
        print("→ Estado 4 - Leyendo Valor")
        val = uart_receive()

        if val == "365":
            print("Valor leido =", val, "Fin")
            return val
