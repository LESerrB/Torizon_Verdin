import threading
import uuid

from dataclasses import dataclass, field
from queue import Empty, Full, Queue

from api.com_UART import (
    decode_Msg,
    encode_Msg,
    uart_receive,
    uart_send
)

@dataclass
class TCDRequest:
    request_id: str
    frame: bytes
    expected_size: int
    request_type: str
    vls_snsrsTCD: dict | None = None
    dedupe_key: str | None = None

    response_queue: Queue = field(
        default_factory=lambda: Queue(maxsize=1)
    )

@dataclass
class TCDResponse:
    request_id: str
    request_type: str
    ok: bool
    data: bytes | None = None
    error: str | None = None
    vls_snsrsTCD: dict | None = None

out_COM_TL = Queue(maxsize=100)
in_COM_TL = Queue(maxsize=100)

_pending_keys = set()
_pending_lock = threading.Lock()

_worker_started = False
_worker_lock = threading.Lock()

def com_TCD(vls_snsrsTCD, msg, cmd = None, edit_Ctrl = None, *, expected_size = None,
            wait_response = False, response_timeout = 2.0, dedupe_key = None,):
    """
    Envía una solicitud a la TCD y, opcionalmente, espera la respuesta asociada.

    Parámetros:
    - vls_snsrsTCD (dict): diccionario de sensores donde se almacenarán los datos
      recibidos si la respuesta es válida.
    - msg: carga útil del mensaje que se enviará en la trama.
    - cmd (bytes | None): comando de operación para la TCD.
    - edit_Ctrl (str | None): parámetro de control a modificar cuando se usa
      una configuración con `cmd == b"\xAA"`.
    - expected_size (int | None): tamaño esperado de la respuesta.
    - wait_response (bool): indica si la función debe bloquear hasta recibir la
      respuesta.
    - response_timeout (float): tiempo máximo de espera en segundos.
    - dedupe_key (str | None): clave para evitar peticiones duplicadas concurrentes.

    Retorno:
    - str: identificador de la solicitud cuando `wait_response` es `False`.
    - TCDResponse: objeto con la respuesta completa cuando `wait_response` es
      `True` y la operación termina correctamente.
    - None: si no se pudo construir la trama o si la solicitud queda descartada
      por deduplicación.
    """
    frame = encode_Msg(msg, cmd, edit_Ctrl)

    if frame is None:
        print("No fue posible construir la trama")
        return

    if expected_size is None:
        expected_size = 16 if cmd == b"\xAA" else 21

    request_id = uuid.uuid4().hex

    request = TCDRequest(
        request_id = request_id,
        frame = bytes(frame),
        expected_size = expected_size,
        request_type = ("config" if cmd == b"\xAA" else "monitor"),
        vls_snsrsTCD = vls_snsrsTCD,
        dedupe_key = dedupe_key,
    )

    if dedupe_key is not None:
        with _pending_lock:
            if dedupe_key in _pending_keys:
                return None

            _pending_keys.add(dedupe_key)

    try:
        out_COM_TL.put(request, block=True, timeout=0.5)
    except Full:
        if dedupe_key is not None:
            with _pending_lock:
                _pending_keys.discard(dedupe_key)

        raise TimeoutError("La cola de salida TCD está llena")

    if not wait_response:
        return request_id

    try:
        response = request.response_queue.get(block=True, timeout=response_timeout)
    except Empty:
        raise TimeoutError( f"Tiempo agotado esperando respuesta "
                            f"de {request_id}" )

    if not response.ok:
        raise IOError(response.error or "Falló la comunicación con la TCD")

    return response

def _uart_worker(uart_dev):
    """
    Ejecuta el hilo de trabajo de UART para procesar las solicitudes de la TCD.

    Comportamiento:
    - Recupera una petición desde la cola de salida.
    - Envía la trama al puerto UART.
    - Espera la respuesta y la empaqueta en un objeto `TCDResponse`.
    - Publica el resultado en la cola de entrada y en la cola de respuesta
      asociada a la solicitud.

    Parámetros:
    - uart_dev: dispositivo UART activo sobre el que se comunica la TCD.

    Retorno:
    - None. El bucle se mantiene activo indefinidamente mientras el hilo siga
      ejecutándose.
    """
    while True:
        request = out_COM_TL.get()

        try:
            if not uart_send(uart_dev, request.frame):
                raise IOError("No fue posible enviar la trama")

            response_data = uart_receive(uart_dev, expected_size = request.expected_size, timeout = 1.0,)

            if response_data is None:
                raise TimeoutError("No se recibió una trama completa")

            response = TCDResponse(
                request_id = request.request_id,
                request_type = request.request_type,
                ok = True,
                data = response_data,
                vls_snsrsTCD = request.vls_snsrsTCD,
            )
        except Exception as error:
            response = TCDResponse(
                request_id = request.request_id,
                request_type = request.request_type,
                ok = False,
                error = str(error),
                vls_snsrsTCD = request.vls_snsrsTCD,
            )
        finally:
            if request.dedupe_key is not None:
                with _pending_lock:
                    _pending_keys.discard(request.dedupe_key)

        try:
            in_COM_TL.put(response, block = True, timeout = 0.5)
        except Full:
            print( "La cola in_COM_TL está llena; "
                   f"se descartó {response.request_id}" )

        try:
            request.response_queue.put_nowait(response)
        except Full:
            pass

        out_COM_TL.task_done()

def start_TCD_communication(uart_dev):
    """
    Inicia el hilo de comunicación con la TCD si aún no está activo.

    Parámetros:
    - uart_dev: instancia del puerto UART para la tarjeta de comunicación.

    Efectos secundarios:
    - Crea un hilo en segundo plano con nombre `TCD-UART-Worker`.
    - Evita que se lancen varios workers simultáneos con el bloqueo global.

    Retorno:
    - None.
    """
    global _worker_started

    with _worker_lock:
        if _worker_started:
            return

        worker = threading.Thread(
            target=_uart_worker,
            args=(uart_dev,),
            daemon=True,
            name="TCD-UART-Worker",
        )

        worker.start()
        _worker_started = True

def process_TCD_responses():
    """
    Procesa las respuestas recibidas desde la TCD y actualiza el estado de sensores.

    Comportamiento:
    - Obtiene la respuesta desde la cola de entrada.
    - Verifica si la trama fue exitosa.
    - Decodifica el payload y actualiza los valores del diccionario asociado.
    - En caso de error, imprime el detalle sin interrumpir el flujo del bucle.

    Retorno:
    - None. La rutina se ejecuta en un ciclo continuo hasta que el proceso termine.
    """
    while True:
        response = in_COM_TL.get()

        try:
            if not response.ok:
                print( f"Error TCD [{response.request_id}]: "
                       f"{response.error}" )
                continue

            res, s_res = decode_Msg(response.data)

            if s_res == "sns_Info":
                response.vls_snsrsTCD["t_Aire"] = int.from_bytes(res[0:2], byteorder="big") / 10
                response.vls_snsrsTCD["s_Hum"] = int.from_bytes(res[2:4], byteorder="big")
                # temp seg = int.from_bytes(res[4:6], byteorder="big")
                response.vls_snsrsTCD["t_Piel"] = int.from_bytes(res[6:8], byteorder="big") / 10
                response.vls_snsrsTCD["s_Aux"] = int.from_bytes(res[8:10], byteorder="big") / 10
                response.vls_snsrsTCD["pot_Clf"] = int.from_bytes(res[10:12], byteorder="big")
                response.vls_snsrsTCD["s_Ox"] = int.from_bytes(res[12:14], byteorder="big")
            elif s_res == "dvc_Conf":
                response.vls_snsrsTCD["ta_Prog"] = int.from_bytes(res[0:2], byteorder="big")
                response.vls_snsrsTCD["pot_Clf"] = int.from_bytes(res[2:4], byteorder="big")
                response.vls_snsrsTCD["tp_Prog"] = int.from_bytes(res[4:6], byteorder="big")
                response.vls_snsrsTCD["pot_Ox"] = int.from_bytes(res[6:8], byteorder="big")
                response.vls_snsrsTCD["pot_Hum"] = int.from_bytes(res[8:10], byteorder="big")
            else:
                response.vls_snsTCD["alrm"] = 128

            # print(response.vls_snsrsTCD)
        except Exception as error:
            print(f"Error procesando respuesta TCD: {error}")
        finally:
            in_COM_TL.task_done()