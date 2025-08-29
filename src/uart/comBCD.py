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