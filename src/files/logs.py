import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import os

logger = logging.getLogger("my_logger")
logger.propagate = False

if os.path.exists("/mnt/microsd/"):
    try:
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

        logger.setLevel(LOG_LEVEL)
        logger.addHandler(handler)
    except Exception as e:
        print(f"[LOGGING DISABLED] No se pudo configurar RotatingFileHandler: {e}")
else:
    logger.addHandler(logging.NullHandler())