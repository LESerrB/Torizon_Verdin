const valorDiv = document.querySelector('._100');
const valTemp = document.querySelector('._36-4-c-span');
const btnAumentar = document.querySelector('.btn-aumentar');
const btnDisminuir = document.querySelector('.btn-disminuir');

let intervalId = null;
let intervalDatos = null;
let ultimoDatoSensores = {};
let nvlFototerapia = 0;
let cntCalibTemp = 0;
let habConfgCalef = false;
let habCalibTemp = false;

let tempHumEnabled = true;
let basculaEnabled = false;
let presEnabled = false;

// Estilos de botones de sensores
const btnSHT21 = document.querySelector('.btn-sensor-1');
const btnSHT21_lbl = document.querySelector('.btn-sensor-lbl-1');
const btnBME280 = document.querySelector('.btn-sensor-2');
const btnBME280_lbl = document.querySelector('.btn-sensor-lbl-2');
const btnHX711 = document.querySelector('.btn-sensor-3');
const btnHX711_lbl = document.querySelector('.btn-sensor-lbl-3');
const btnHW504 = document.querySelector('.btn-sensor-4');
const btnHW504_lbl = document.querySelector('.btn-sensor-lbl-4');

// Inicializar estilos de botones de sensores por default
btnSHT21.classList.add('btn-sensor-pressed');
btnSHT21_lbl.classList.add('btn-sensor-lbl-pressed');
btnBME280.classList.add('btn-sensor');
btnBME280_lbl.classList.add('btn-sensor-lbl');
btnHX711.classList.add('btn-sensor');
btnHX711_lbl.classList.add('btn-sensor-lbl');
btnHW504.classList.add('btn-sensor');
btnHW504_lbl.classList.add('btn-sensor-lbl');

// Inicializa el estado de los botones de cabecera
document.getElementById('btn-temperatura').classList.add('active');
document.getElementById('info-mod').style.display = 'block'
document.getElementById('graf-tendencias').style.display = 'none'

// ####################################################################### //
//                        FUNCIONES BOTONES CABECERA                       //
// ####################################################################### //
document.getElementById('btn-fototerapia').addEventListener('click', async () => {
    nvlFototerapia++;
    
    switch (nvlFototerapia) {
        case 1:
            alert('Fototerapia activada a nivel MEDIO');
        break;

        case 2:
            alert('Fototerapia activada a nivel ALTO');
        break;
    
        default:
            alert('Fototerapia desactivada');
            nvlFototerapia = 0;
        break;
    }

    try {
        const response = await fetch('/api/nvlFototerapia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nvlFototerapia: nvlFototerapia
            })
        });

        alert(response.status === 200 ? 'Datos recibidos correctamente' : 'Error al enviar los datos');
    } catch (error) {
        console.error('Error al guardar los datos:', error);
    }

    // Cambia el estado de los botones superiores
    document.getElementById('btn-fototerapia').classList.toggle('active');
    document.getElementById('btn-temperatura').classList.remove('active');
    document.getElementById('btn-tendencias').classList.remove('active');
});

document.getElementById('btn-temperatura').addEventListener('click', async () => {
    document.getElementById('info-mod').style.display = 'block'
    document.getElementById('graf-tendencias').style.display = 'none'
    // Cambia el estado de los botones superiores
    document.getElementById('btn-fototerapia').classList.remove('active');
    document.getElementById('btn-temperatura').classList.toggle('active');
    document.getElementById('btn-tendencias').classList.remove('active');
});

document.getElementById('btn-tendencias').addEventListener('click', async () => {
    document.getElementById('info-mod').style.display = 'none'
    document.getElementById('graf-tendencias').style.display = 'block'
    // Cambia el estado de los botones superiores
    document.getElementById('btn-fototerapia').classList.remove('active');
    document.getElementById('btn-temperatura').classList.remove('active');
    document.getElementById('btn-tendencias').classList.toggle('active');
});
// ####################################################################### //
//                      FUNCIONES BOTONES CALEFACTOR                       //
// ####################################################################### //
document.querySelector('.btn-calefactor').addEventListener('click', habilitarCalefactor);

function habilitarCalefactor() {
    // Habilitar botones
    document.querySelector('.btn-aumentar').disabled = false;
    document.querySelector('.btn-disminuir').disabled = false;
    document.querySelector('.btn-aceptar').disabled = false;

    // Habilitar botones de aumentar y decremento para calefactor
    habConfgCalef = true;
    habCalibTemp = false;

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

    if (habCalibTemp) {
        saveOffset(valTemp.textContent);
    }

    // Parpadeo
    const porcentaje = document.querySelector('.porcentaje-calef');
    porcentaje.classList.remove('parpadeo');
    const temperatura = document.querySelector('._36-4-c-span');
    temperatura.classList.remove('parpadeo');
    
    // Deshabilitar botones de aumentar y decremento
    habConfgCalef = false;
    habCalibTemp = false;
}

btnAumentar.addEventListener('click', () => {
    if (valorDiv.textContent < 100 && habConfgCalef)
        valorDiv.textContent = parseInt(valorDiv.textContent) + 1;
    else if (habCalibTemp)  // RESTA AGREGAR LIMITES DE LA TEMPERATURA MÁXIMA
        valTemp.textContent = (parseFloat(valTemp.textContent) + 0.1).toFixed(1);
});

btnDisminuir.addEventListener('click', () => {
    if (valorDiv.textContent > 0 && habConfgCalef)
        valorDiv.textContent = parseInt(valorDiv.textContent) - 1;
    else if (habCalibTemp) // RESTA AGREGAR LIMITES DE LA TEMPERATURA MÍNIMA
        valTemp.textContent = (parseFloat(valTemp.textContent) - 0.1).toFixed(1);
});

// ####################################################################### //
//                     FUNCIONES DE BOTONES DE MODULOS                     //
// ####################################################################### //
// SHT21
document.getElementById('btn-sensor-1').addEventListener('click', async () => {
    console.log("Boton sht21");
    tempHumEnabled = true;
    presEnabled = false;
    basculaEnabled = false;

    removeStlBtn();
    btnSHT21.classList.add('btn-sensor-pressed');
    btnSHT21_lbl.classList.add('btn-sensor-lbl-pressed');

    btnBME280.classList.add('btn-sensor');
    btnBME280_lbl.classList.add('btn-sensor-lbl');
    btnHX711.classList.add('btn-sensor');
    btnHX711_lbl.classList.add('btn-sensor-lbl');
    btnHW504.classList.add('btn-sensor');
    btnHW504_lbl.classList.add('btn-sensor-lbl');
});

// BME280
document.getElementById('btn-sensor-2').addEventListener('click', async () => {
    console.log("Boton bme280");
    tempHumEnabled = false;
    presEnabled = true;
    basculaEnabled = false;

    removeStlBtn();
    btnSHT21.classList.add('btn-sensor');
    btnSHT21_lbl.classList.add('btn-sensor-lbl');

    btnBME280.classList.add('btn-sensor-pressed');
    btnBME280_lbl.classList.add('btn-sensor-lbl-pressed');

    btnHX711.classList.add('btn-sensor');
    btnHX711_lbl.classList.add('btn-sensor-lbl');
    btnHW504.classList.add('btn-sensor');
    btnHW504_lbl.classList.add('btn-sensor-lbl');
});

// HX711
document.getElementById('btn-sensor-3').addEventListener('click', async () => {
    console.log("Boton hx711");
    tempHumEnabled = false;
    presEnabled = false;
    basculaEnabled = true;

    removeStlBtn();
    btnSHT21.classList.add('btn-sensor');
    btnSHT21_lbl.classList.add('btn-sensor-lbl');
    btnBME280.classList.add('btn-sensor');
    btnBME280_lbl.classList.add('btn-sensor-lbl');

    btnHX711.classList.add('btn-sensor-pressed');
    btnHX711_lbl.classList.add('btn-sensor-lbl-pressed');
    
    btnHW504.classList.add('btn-sensor');
    btnHW504_lbl.classList.add('btn-sensor-lbl');
});

// HW-504
document.getElementById('btn-sensor-4').addEventListener('click', async () => {
    console.log("Boton hw504");
    tempHumEnabled = false;
    presEnabled = false;
    basculaEnabled = true;

    removeStlBtn();
    btnSHT21.classList.add('btn-sensor');
    btnSHT21_lbl.classList.add('btn-sensor-lbl');
    btnBME280.classList.add('btn-sensor');
    btnBME280_lbl.classList.add('btn-sensor-lbl');
    btnHX711.classList.add('btn-sensor');
    btnHX711_lbl.classList.add('btn-sensor-lbl');

    btnHW504.classList.add('btn-sensor-pressed');
    btnHW504_lbl.classList.add('btn-sensor-lbl-pressed');
});
// ####################################################################### //
//                          ACTUALIZACION DE SENSORES                      //
// ####################################################################### //
async function updateSensors() {
    let data = {};

    try {
        const response = await fetch('/api/sensores');
        data = await response.json();
        
        if (data && tempHumEnabled) {
            document.getElementById('temp').textContent = data.temp ?? '--.-';
            document.getElementById('unitT').textContent = '°C';
            document.getElementById('tempProg').textContent = data.hum ?? '--.-';
            document.getElementById('unitTP').textContent = '%';
            actualizarColorTemp();
        }
        else if (data && presEnabled) {
            // document.getElementById('temp280').textContent = data.temp280;
            document.getElementById('temp').textContent = data.pres280 ?? '---';
            document.getElementById('unitT').textContent = 'hPa';
            // document.getElementById('hum280').textContent = data.hum280;
        }
        else if (data && basculaEnabled) {
            document.getElementById('temp').textContent = data.peso711 ?? '--.--';
            document.getElementById('unitT').textContent = ' kg';
        }
        // document.getElementById('x_val').textContent = data.x_val;
        // document.getElementById('y_val').textContent = data.y_val;
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
        
        const result = await response.json();
        const tendencias = result.tend_json.map(item => [item.temp, item.hr]);
        console.log(tendencias);
    }catch (error) {
        console.error('Error al guardar los datos:', error);
    }
}

// ####################################################################### //
//                          CALIBRACION DE TEMPERATURA                     //
// ####################################################################### //
document.getElementById('temperaturaCont').addEventListener('click', async () => {
    cntCalibTemp++;

    if (cntCalibTemp > 10) {
        cntCalibTemp = 0;
    
        // Habilitar botones de aumentar y decremento para calefactor
        habConfgCalef = false;
        habCalibTemp = true;

        document.querySelector('.btn-aumentar').disabled = false;
        document.querySelector('.btn-disminuir').disabled = false;
        document.querySelector('.btn-aceptar').disabled = false;

        // Parpadeo
        const temperatura = document.querySelector('._36-4-c-span');
        temperatura.classList.add('parpadeo');

        pauseSensor();

        return;
    }
});

async function saveOffset(nuevaTemp) {
    const response = await fetch('/api/saveOffset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: nuevaTemp })
    });

    alert(response.status === 200 ? 'Calibración guardada correctamente' : 'Error al calibrar');
    startSensor();
}

// ####################################################################### //
//                          INICIALIZACION DE EVENTOS                      //
// ####################################################################### //
function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(updateSensors, 1000);
    }
}

function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function startGuardarDatos(intervalo) {
    if (!intervalDatos) {
        intervalDatos = setInterval(guardarDatos, 1000 * 60 * intervalo);
    }
}

function stopGuardarDatos() {
    if (intervalDatos) {
        clearInterval(intervalDatos);
        intervalDatos = null;
    }
}
// ####################################################################### //
//                       FUNCIONES ESTILOS DE BOTONES                      //
// ####################################################################### //
function removeStlBtn() {
    btnSHT21.classList.remove('btn-sensor-pressed');
    btnSHT21_lbl.classList.remove('btn-sensor-lbl-pressed');
    btnBME280.classList.remove('btn-sensor-pressed');
    btnBME280_lbl.classList.remove('btn-sensor-lbl-pressed');
    btnHX711.classList.remove('btn-sensor-pressed');
    btnHX711_lbl.classList.remove('btn-sensor-lbl-pressed');
    btnHW504.classList.remove('btn-sensor-pressed');
    btnHW504_lbl.classList.remove('btn-sensor-lbl-pressed');
}

// ####################################################################### //
//                                 GRÁFICA                                 //
// ####################################################################### //
const temperatureChartCanvas = document.getElementById('temperatureChart');

let temperatureChart; // Variable para la instancia del gráfico
let recordingInterval; // Variable para el ID del setInterval

temperatureChart = new Chart(temperatureChartCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'HH:mm:ss',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                title: {
                    display: true,
                    text: 'Tiempo'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Temperatura (°C)'
                },
                min: 20,
                max: 40
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    }
});

function updateChartDisplay() {
    if (!temperatureChart) return;

    let chartDisplayData = allCollectedHistoricalData;

    if (chartDisplayData.length === 0) {
        temperatureChart.data.labels = [];
        temperatureChart.data.datasets[0].data = [];
        temperatureChart.update();
        return;
    }

    // Downsampling opcional
    const maxPointsForDisplay = 2000;

    if (chartDisplayData.length > maxPointsForDisplay) {
        const downsampleFactor = Math.ceil(chartDisplayData.length / maxPointsForDisplay);
        chartDisplayData = chartDisplayData.filter((_, index) => index % downsampleFactor === 0);
        console.log(`Datos downsampleados para visualización. Original: ${allCollectedHistoricalData.length}, Mostrando: ${chartDisplayData.length}`);
    }

    // Actualizar el gráfico con los datos filtrados/downsampleados
    temperatureChart.data.labels = chartDisplayData.map(point => point.time);
    temperatureChart.data.datasets[0].data = chartDisplayData.map(point => point.value);
    temperatureChart.update();
}

// Manejadores de eventos para los selectores de duración e intervalo
// Cuando cambian, se debe actualizar el gráfico
durationSelect.addEventListener('change', updateChartDisplay);
intervalSelect.addEventListener('change', updateChartDisplay);

// Función para iniciar la grabación de datos
startRecordingBtn.addEventListener('click', () => {
    console.log("Botón 'Iniciar Registro' presionado.");

    // Deshabilitar/habilitar botones
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    durationSelect.disabled = true;
    intervalSelect.disabled = true;

    const intervalMs = parseInt(intervalSelect.value);
    // Iniciar el intervalo para guardar datos
    recordingInterval = setInterval(async () => {
        await obtenerTemperatura();

        const dtListaTemp = await leerDtTemperatura();

        if (Array.isArray(dtListaTemp)) {
            allCollectedHistoricalData = dtListaTemp.map(d => ({
                time: convertirHoraAFechaHoy(d.hr),
                value: d.temp
            }));
        } else if (dtListaTemp && dtListaTemp.temp && dtListaTemp.hr) {
            allCollectedHistoricalData.push({
                time: convertirHoraAFechaHoy(dtListaTemp.hr),
                value: dtListaTemp.temp
            });
        }

        updateChartDisplay();
    }, intervalMs);

    console.log(`Iniciando registro cada ${intervalMs / 1000} segundos.`);
});

// Función para detener la grabación de datos
stopRecordingBtn.addEventListener('click', () => {
    clearInterval(recordingInterval);
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    durationSelect.disabled = false;
    intervalSelect.disabled = false;
    console.log('Registro detenido.');
});

// Función para limpiar el gráfico y todo el historial
clearChartBtn.addEventListener('click', () => {
    clearInterval(recordingInterval);
    allCollectedHistoricalData = [];
    updateChartDisplay();
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    durationSelect.disabled = false;
    intervalSelect.disabled = false;

    limpiarMemoria();

    console.log('Gráfico y datos históricos limpiados.');
});

updateChartDisplay();
// ####################################################################### //
//                          PRUEBAS DE INICIALIZACION                      //
// ####################################################################### //
startSensor();
startGuardarDatos(30);