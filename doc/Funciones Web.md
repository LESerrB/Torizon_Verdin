# Funciones Web

## Propósito
Este documento describe cómo el `backend` en `src/main.py` expone endpoints HTTP que consumen los scripts JavaScript del `frontend` (archivos en `web/static/js/` y la plantilla `web/templates/index.html`). Incluye los contratos (payloads y respuestas) y ejemplos de uso desde el navegador.

## Cómo sirve la interfaz
- Flask sirve la vista principal en la ruta `/` que devuelve `web/templates/index.html`.
- Archivos estáticos (JS/CSS/imagenes) se sirven desde `web/static` gracias a la configuración de Flask.
- CORS está habilitado para rutas `/api/*`, lo que permite peticiones `fetch` desde otros orígenes si fuese necesario.

## Convenciones generales
- Métodos: la mayoría de los endpoints usan `POST` y esperan JSON cuando reciben datos.
- Respuestas: siempre JSON con al menos la clave `status` (ej.: `ok`, `fail`, mensajes de error o códigos intermedios como 206).
- Códigos HTTP relevantes: 200 (OK), 206 (partial / advertencia), 500 (error interno).

## Endpoints principales (resumen)

- `/` (GET)
	- Sirve la página principal `index.html`.

- `/api/getTemp` (POST)
	- Propósito: leer sondas de temperatura.
	- Respuesta 200: `{ "status": "ok", "tempSondaPiel": <float>, "tempSondaAux": <float> }`
	- Respuesta 206: sonda auxiliar no conectada: incluye `tempSondaPiel` y `tempSondaAux`.
	- Respuesta 500: sonda principal no conectada.

- `/api/setTemp` (POST)
	- Payload esperado: `{ "tempProg": <valor> }`.
	- Respuesta 200: `{ "status": "ok" }` si se recibe el valor.
	- Respuesta 500: `{ "status": "ERROR NO SE RECIBIÓ VALOR" }` si falta.

- `/api/potCalef` (POST)
	- Payload: `{ "potCalef": <valor> }`.
	- Acción: llama internamente a `set_PWM_Calef(int(potCalef))`.
	- Respuesta: `{ "status": "ok" }`.

- `/api/bascPeso` (POST)
	- Acción: realiza `pesaje()` y devuelve `{ "status": "ok", "peso": <float> }` o `{ "status": "fail" }`.

- `/api/bascTar` (POST)
	- Acción: ejecuta `tare()` y luego `pesaje()`; devuelve `peso` o `fail`.

- `/api/bascCalib` (POST)
	- Acción: ejecuta `calib()` y luego `pesaje()`; devuelve `peso` o `fail`.

- `/api/nvlFototerapia` (POST)
	- Payload: `{ "nvlFototerapia": <valor>, "nvlExam": <valor> }` (uno u otro).
	- Acción: llama a `setNvlLuzExam` o `setNvlFototerapia`.
	- Respuesta: `{ "status": "ok" }`.

- `/api/ctrlPos` (POST)
	- Payload: `{ "action": "..." }`.
	- Acción: imprime la acción y devuelve `{ "status": "ok" }`.

- `/api/chng_modoFunc` (POST)
	- Acción: ejecuta una máquina de estados (`sm_chngModoOp`) hasta terminar.
	- Respuestas: puede devolver 200 (`ok`) o 500 (`fail`) según estado/errores.

## Ejemplo práctico desde el frontend (fetch)

```javascript
// helper: POST JSON y obtener respuesta
async function postJson(url, body) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = await res.json();
	return { status: res.status, data };
}

// Leer temperatura (no envía payload en este backend)
const { status, data } = await postJson('/api/getTemp', {});
if (status === 200 && data.status === 'ok') {
	console.log('Piel:', data.tempSondaPiel, 'Aux:', data.tempSondaAux);
} else if (status === 206) {
	console.warn('Sonda auxiliar no conectada', data);
} else {
	console.error('Error al leer sondas', data);
}
```

## Archivos frontend relevantes
- `web/templates/index.html` — HTML principal.
- `web/static/js/main.js` — lógica de la UI y listeners.
- `web/static/js/sensor.js` — lógica para lecturas y refresco de sensores (si existe).
- `web/static/js/ui.js` — utilidades de UI.

