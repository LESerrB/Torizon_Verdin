const valorDiv = document.querySelector('._100');
const btnAumentar = document.querySelector('.btn-aumentar');
const btnDisminuir = document.querySelector('.btn-disminuir');
const intervalo = 1; // Intervalo en minutos para guardar los datos

let ultimoDatoSensores = {};

// ####################################################################### //
//                      FUNCIONES BOTONES CALEFACTOR                       //
// ####################################################################### //
document.querySelector('.btn-calefactor').addEventListener('click', habilitarCalefactor);

function habilitarCalefactor() {
    // Habilitar botones
    document.querySelector('.btn-aumentar').disabled = false;
    document.querySelector('.btn-disminuir').disabled = false;
    document.querySelector('.btn-aceptar').disabled = false;

    // Parpadeo
    const porcentaje = document.querySelector('.porcentaje-calef');
    porcentaje.classList.add('parpadeo');
}

document.querySelector('.btn-aceptar').addEventListener('click', deshabilitarCalefactor);

function deshabilitarCalefactor() {
    // Deshabilitar botones
    document.querySelector('.btn-aumentar').disabled = true;
    document.querySelector('.btn-disminuir').disabled = true;
    document.querySelector('.btn-aceptar').disabled = true;

    // Parpadeo
    const porcentaje = document.querySelector('.porcentaje-calef');
    porcentaje.classList.remove('parpadeo');
}

btnAumentar.addEventListener('click', () => {
    if (valorDiv.textContent < 100)
        valorDiv.textContent = parseInt(valorDiv.textContent) + 1;
});

btnDisminuir.addEventListener('click', () => {
    if (valorDiv.textContent > 0)
        valorDiv.textContent = parseInt(valorDiv.textContent) - 1;
});

// ####################################################################### //
//                          ACTUALIZACION DE SENSORES                      //
// ####################################################################### //

async function updateSensors() {
    let data = {};

    try {
        const response = await fetch('/api/sensores');
        data = await response.json();

        document.getElementById('temp').textContent = data.temp ?? '00.0';
        document.getElementById('hum').textContent = data.hum ?? '00.0';
        // document.getElementById('temp280').textContent = data.temp280;
        document.getElementById('pres280').textContent = data.pres280;
        // document.getElementById('hum280').textContent = data.hum280;
        // document.getElementById('peso711').textContent = data.peso711 ?? '00.00';
        // document.getElementById('x_val').textContent = data.x_val;
        // document.getElementById('y_val').textContent = data.y_val;

        actualizarColorTemp();
    } catch (e) {
        console.error('Error fetching sensor data:', e);
    }

    ultimoDatoSensores = data;
    return data; // Se debe usar await en las funciones que hace uso de los datos de los sensores para que la lectura sea correcta
}

function actualizarColorTemp() {
    const tempSpan = document.getElementById('temp');
    const tempValor = parseFloat(tempSpan.textContent);

    if (tempValor > 40.0) {
        tempSpan.classList.add('temp-roja');
    } else {
        tempSpan.classList.remove('temp-roja');
    }
}

// ####################################################################### //
//                            GUARDADO DE DATOS                            //
// ####################################################################### //
async function guardarDatos() {
    const data = ultimoDatoSensores;

    try {
        const response = await fetch('/api/tendencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                temp: data.temp,
                hum: data.hum,
                pres280: data.pres280,
            })
        });
    } catch (error) {
        console.error('Error al guardar los datos:', error);
    }
}

setInterval(updateSensors, 1000);
setInterval(guardarDatos, 1000 * 60 * intervalo);