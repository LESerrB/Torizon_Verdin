import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import os

load_dotenv("/mnt/microsd/.env")

LOG_LEVEL = logging.DEBUG if os.getenv("DEBUG") == "DEBUG" else logging.INFO

handler = RotatingFileHandler(
    '/mnt/microsd/dual.log',
    maxBytes=5 * 1024 * 1024,
    backupCount=5
)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',
                              datefmt='%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)

logger = logging.getLogger("my_logger")
logger.setLevel(LOG_LEVEL)
logger.addHandler(handler)
logger.propagate = False