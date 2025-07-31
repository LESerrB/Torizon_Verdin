import serial

ser = serial.Serial("/dev/verdin-uart1", 9600, 8, 'N', 1, timeout=1)

def uart_send(data: str):
    if ser and ser.is_open:
        ser.write(data.encode('ascii'))
        print(f"Enviado: {data.strip()}")
    else:
        print("UART no está abierto")

def uart_receive() -> str:
    if ser and ser.is_open:
        data = ser.readline().decode('ascii').strip()
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


# import sys
# import pynmea2
# import serial

# # Example using Colibri board, in UART C interface. To check the available
# # interfaces for your device, please check (remember to also update the
# # docker-compose.yml file):
# # https://developer.toradex.com/linux-bsp/application-development/peripheral-access/uart-linux
# serial_port = "/dev/colibri-uartc"

# ser = serial.Serial(serial_port,9600, 8, 'N', 1, timeout=1)
# while True:
#      data = ser.readline()
#      data = data.decode("utf-8","ignore").rstrip()
#      if data[0:6] == '$GPGGA':
#         msg = pynmea2.parse(data)
#         print("Time = " + msg.timestamp.strftime("%H:%M:%S"))
#         if msg.lat != ""  and msg.lon != "":
#          print("Latitude = " + msg.lat + ", " + msg.lat_dir)
#          print("Longitude = " + msg.lon + ", " + msg.lon_dir)
#          print("\n")
#         else:
#          print("Unable to get the GPS Location on this read.")
