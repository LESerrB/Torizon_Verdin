#!python
import spidev
import time

def main():
    spi = spidev.SpiDev()

    while True:
        spi.open(1, 0)

        spi.mode = 0b01

        spi.bits_per_word = 8

        spi.max_speed_hz = 500000

        data_out = [0xAA, 0x55]
        # print(f"Enviando: {data_out}")

        data_in = spi.xfer2(data_out)
        # print(f"Recibido: {data_in}")

        spi.close()

        time.sleep(0.2)

if __name__ == "__main__":
    main()