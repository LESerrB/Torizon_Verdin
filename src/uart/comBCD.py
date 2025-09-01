import serial

uart_Channel = "/dev/verdin-uart1"
baud_rate = 19200

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
        data = extract_clean_text(data)
        print(data)

        if data:
            print(f"Recibido: {data}")
            return data
    else:
        print("UART no está abierto")
        return ""

def close_uart():
    if ser and ser.is_open:
        ser.close()
        print("UART cerrado")

def extract_clean_text(uart_bytes: bytes) -> str:
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

    def run(self, entrada):
        match self.state:
            case "edo_0":
                self.edo_0(entrada)
            case "edo_1":
                self.edo_1(entrada)
            case "edo_2":
                self.edo_2(entrada)
            case "edo_3":
                self.edo_3(entrada)
            case "edo_4":
                self.edo_4(entrada)
            case "edo_5":
                self.edo_5(entrada)
            case "edo_6":
                self.edo_6(entrada)

    def edo_0(self, entrada):
        print("→ Estado 0 - Leer Valor")

        # val = uart_receive()

        if entrada == "200":
            print("Valor leido = 200 → edo_1")
            self.state = "edo_1"

    def edo_1(self, entrada):
        print("→ Estado 1 - Convierte valor recibido y le suma 15")

        if entrada == "215":
            print("Envía valor 215 → edo_2")

            # uart_send(val)

            self.state = "edo_2"
        
    def edo_2(self, entrada):
        print("→ Estado 2 - Leer Valor")

        # val = uart_receive()

        if entrada == "230":
            print("Valor leido = 230 → edo_3")
            self.state = "edo_3"

    def edo_3(self, entrada):
        print("→ Estado 3 - Convierte valor recibido y le suma 37")

        if entrada == "267":
            print("Envía valor 267 → edo_4")

            # uart_send(val)

            self.state = "edo_4"

    def edo_4(self, entrada):
        print("→ Estado 4 - Leer Valor")

        # val = uart_receive()

        if entrada == "304":
            print("Valor leido = 304 → edo_5")
            self.state = "edo_5"

    def edo_5(self, entrada):
        print("→ Estado 5 - Convierte valor recibido y le suma 61")

        if entrada == "365":
            print("Envía valor 365 → edo_6")

            # uart_send(val)

            self.state = "edo_6"

    def edo_6(self, entrada):
        print("→ Estado 6 - Leer Valor")

        # val = uart_receive()

        if entrada == "402":
            print("Valor leido = 402 → FIN")
