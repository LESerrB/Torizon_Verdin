import datetime

from zoneinfo import ZoneInfo

def reloj():
    return datetime.datetime.now().strftime('%d/%m/%Y - %H:%M:%S')