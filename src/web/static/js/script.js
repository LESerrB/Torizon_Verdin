// --- Variables Globales para persistencia de datos ---
let allCollectedHistoricalData = []; // Este array guardará TODOS los puntos de temperatura históricos

document.addEventListener('DOMContentLoaded', () => {
// --- Obtener todas las referencias a los botones INTERACTIVOS al inicio ---
    const lightbulbButton = document.getElementById('lightbulb-button'); // Botón AZUL (es un button)
    const yellowBarButton = document.getElementById('yellow-bar-button'); // Botón AMARILLO (Campana) (es un button)
    const bellButton = document.getElementById('bell-button'); // Botón NARANJA (Tendencias) (es un button)

    const sensorSth21Button = document.getElementById('sensor-sth21');
    const sensorBme280Button = document.getElementById('sensor-bme280');
    const sensorHx711Button = document.getElementById('sensor-hx711');
    const sensorHw504Button = document.getElementById('sensor-hw504');

    const durationSelect = document.getElementById('duration-select');
    const intervalSelect = document.getElementById('interval-select');
    const startRecordingBtn = document.getElementById('start-recording-btn');
    const stopRecordingBtn = document.getElementById('stop-recording-btn');
    const clearChartBtn = document.getElementById('clear-chart-btn');

    const heaterPowerButton = document.getElementById('heater-power-button');
    const decrementHeaterButton = document.getElementById('decrement-heater');
    const incrementHeaterButton = document.getElementById('increment-heater');
    const acceptHeaterButton = document.getElementById('accept-heater');

    // --- Lógica del Botón AZUL (Foco) ---
    lightbulbButton.addEventListener('click', () => {
        lightbulbButton.classList.toggle('purple-lightbulb');
    });

    // --- Lista de TODOS los botones (excepto el botón amarillo que es el que controla) que deben ser BLOQUEADOS/DESBLOQUEADOS ---
    const buttonsToToggle = [
        lightbulbButton, // Incluido
        bellButton,      // Incluido
        sensorSth21Button,
        sensorBme280Button,
        sensorHx711Button,
        sensorHw504Button,
        heaterPowerButton,
        decrementHeaterButton,
        incrementHeaterButton,
        acceptHeaterButton,
        durationSelect,
        intervalSelect,
        startRecordingBtn,
        stopRecordingBtn,
        clearChartBtn
    ].filter(Boolean);


    // Función para bloquear/desbloquear otros botones
    function toggleAllOtherButtons(disable) {
        buttonsToToggle.forEach(button => {
            if (button) {
                button.disabled = disable; // Aplica la propiedad disabled (ahora que son <button> o <select>)
                if (disable) {
                    button.classList.add('disabled-visual');
                } else {
                    button.classList.remove('disabled-visual');
                }
            }
        });
        console.log(`Todos los botones (excepto el amarillo) han sido ${disable ? 'bloqueados' : 'desbloqueados'}.`);
    }

    // --- Lógica de Botón AMARILLO (Campana) ---
    let isBellMuted = false;
    yellowBarButton.addEventListener('click', () => {
        const bellIcon = yellowBarButton.querySelector('.fa-bell, .fa-bell-slash');
        if (bellIcon) {
            if (isBellMuted) {
                bellIcon.classList.remove('fa-bell-slash');
                bellIcon.classList.add('fa-bell');
            } else {
                bellIcon.classList.remove('fa-bell');
                bellIcon.classList.add('fa-bell-slash');
            }
            isBellMuted = !isBellMuted;

            toggleAllOtherButtons(isBellMuted);
        }
    });

    // --- Lógica de Botón NARANJA (Tendencias/Gráficos) ---
    const alternateScreen = document.getElementById('alternate-screen');
    const mainGrayDisplay = document.getElementById('main-gray-display');

    bellButton.addEventListener('click', () => {
        mainGrayDisplay.classList.toggle('hidden');
        alternateScreen.classList.toggle('hidden');
        // Cuando la pantalla de gráficos se muestra u oculta, actualizamos el gráfico
        if (!alternateScreen.classList.contains('hidden')) {
            updateChartDisplay(); // Mostrar datos cuando se activa la pantalla de gráficos
        }
    });

    // --- Lógica de Botones Sensores Verdes (SIN CAMBIOS) ---
    sensorSth21Button.addEventListener('click', () => {
        let messageDiv = sensorSth21Button.querySelector('.message');
        if (messageDiv) {
            messageDiv.classList.toggle('hidden');
        } else {
            messageDiv = document.createElement('span');
            messageDiv.classList.add('message');
            messageDiv.textContent = 'STH21 Activo';
            sensorSth21Button.appendChild(messageDiv);
        }
    });

    sensorBme280Button.addEventListener('click', () => {
        let messageDiv = sensorBme280Button.querySelector('.message');
        if (messageDiv) {
            messageDiv.classList.toggle('hidden');
        } else {
            messageDiv = document.createElement('span');
            messageDiv.classList.add('message');
            messageDiv.textContent = 'BME280 Conectado';
            sensorBme280Button.appendChild(messageDiv);
        }
    });

    sensorHx711Button.addEventListener('click', () => {
        let messageDiv = sensorHx711Button.querySelector('.message');
        if (messageDiv) {
            messageDiv.classList.toggle('hidden');
        } else {
            messageDiv = document.createElement('span');
            messageDiv.classList.add('message');
            messageDiv.textContent = 'HX711 Calibrando';
            sensorHx711Button.appendChild(messageDiv);
        }
    });

    sensorHw504Button.addEventListener('click', () => {
        let messageDiv = sensorHw504Button.querySelector('.message');
        if (messageDiv) {
            messageDiv.classList.toggle('hidden');
        } else {
            messageDiv = document.createElement('span');
            messageDiv.classList.add('message');
            messageDiv.textContent = 'HW-504 OK';
            sensorHw504Button.appendChild(messageDiv);
        }
    });

    // --- Lógica del Panel Calefactor (Melón) ---

    const rightHeaterPanel = document.getElementById('right-heater-panel');
    const heaterPercentageSpan = document.getElementById('heater-percentage');

    let currentHeaterPercentage = 100;

    function updateHeaterPercentageDisplay() {
        heaterPercentageSpan.textContent = `${currentHeaterPercentage} %`;
    }
    updateHeaterPercentageDisplay();

    heaterPowerButton.addEventListener('click', () => {
        rightHeaterPanel.classList.toggle('hidden');

        if (rightHeaterPanel.classList.contains('hidden')) {
            mainGrayDisplay.style.flex = '3';
        } else {
            mainGrayDisplay.style.flex = '2';
        }
    });

    decrementHeaterButton.addEventListener('click', () => {
        if (currentHeaterPercentage > 0) {
            currentHeaterPercentage -= 10;
            updateHeaterPercentageDisplay();
        }
    });

    incrementHeaterButton.addEventListener('click', () => {
        if (currentHeaterPercentage < 100) {
            currentHeaterPercentage += 10;
            updateHeaterPercentageDisplay();
        }
    });

    acceptHeaterButton.addEventListener('click', () => {
        alert(`Potencia del calefactor establecida a: ${currentHeaterPercentage}%`);
    });

    // --- LÓGICA DE GRÁFICOS DE TENDENCIAS EN PANTALLA AZUL ---

    const temperatureChartCanvas = document.getElementById('temperatureChart');

    let temperatureChart; // Variable para la instancia del gráfico
    let recordingInterval; // Variable para el ID del setInterval

    // Inicializar el gráfico al cargar la página (aunque esté oculto)
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

    // --- NUEVA FUNCIÓN: Actualiza el gráfico extrayendo datos del historial completo ---
    function updateChartDisplay() {
        if (!temperatureChart) return; // Asegurarse de que el gráfico esté inicializado

        // Usar los datos reales para determinar el rango
        let chartDisplayData = allCollectedHistoricalData;

        if (chartDisplayData.length === 0) {
            // Si no hay datos, limpiar el gráfico
            temperatureChart.data.labels = [];
            temperatureChart.data.datasets[0].data = [];
            temperatureChart.update();
            return;
        }

        // Ordenar los datos por tiempo por si acaso
        chartDisplayData = chartDisplayData.slice().sort((a, b) => a.time - b.time);

        // Tomar el primer y último punto como referencia
        const startTime = chartDisplayData[0].time;
        const endTime = chartDisplayData[chartDisplayData.length - 1].time;

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
        // console.log(`Gráfico actualizado con datos desde ${startTime.toLocaleTimeString()} hasta ${endTime.toLocaleTimeString()}. Puntos mostrados: ${chartDisplayData.length}`);
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

        const intervalMs = parseInt(intervalSelect.value); // Obtener el intervalo actual
///////////////////////////////////////////////////////////////////////////////
        // Iniciar el intervalo para guardar datos
        recordingInterval = setInterval(async () => {
            await obtenerTemperatura();

            const dtListaTemp = await leerDtTemperatura();

            if (Array.isArray(dtListaTemp)) {
                // Limpia el historial y agrega todos los puntos nuevos
                allCollectedHistoricalData = dtListaTemp.map(d => ({
                    time: convertirHoraAFechaHoy(d.hr),
                    value: d.temp
                }));
            } else if (dtListaTemp && dtListaTemp.temp && dtListaTemp.hr) {
                // Si solo es un objeto, agrega uno solo
                allCollectedHistoricalData.push({
                    time: convertirHoraAFechaHoy(dtListaTemp.hr),
                    value: dtListaTemp.temp
                });
            }

            // saveHistoricalDataToLocalStorage();
            updateChartDisplay();

            // Imprime los valores para depuración
            // allCollectedHistoricalData.forEach(point => {
            //     console.log("time:", point.time, "value:", point.value);
            // });
        }, intervalMs);
////////////////////////////////////////////////////////////////////////////////
        console.log(`Iniciando registro cada ${intervalMs / 1000} segundos.`);
    });

    // Función para detener la grabación de datos
    stopRecordingBtn.addEventListener('click', () => {
        clearInterval(recordingInterval); // Detener el intervalo
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        durationSelect.disabled = false;
        intervalSelect.disabled = false;
        console.log('Registro detenido.');
    });

    // Función para limpiar el gráfico y todo el historial
    clearChartBtn.addEventListener('click', () => {
        clearInterval(recordingInterval); // Asegurarse de detener el registro
        allCollectedHistoricalData = []; // Vaciar el historial completo
        // saveHistoricalDataToLocalStorage(); // Guardar el estado vacío en localStorage
        updateChartDisplay(); // Actualizar el gráfico (lo dejará vacío)
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        durationSelect.disabled = false;
        intervalSelect.disabled = false;

        limpiarMemoria(); // Limpiar memoria y datos de sensores

        console.log('Gráfico y datos históricos limpiados.');
    });

    // Llamada inicial para mostrar cualquier dato cargado o el gráfico vacío
    updateChartDisplay();

});

// ####################################################################### //
//                          ACTUALIZACION DE SENSORES                      //
// ####################################################################### //

async function updateSensors() {
    let data = {};

    try {
        const response = await fetch('/api/sensores');
        data = await response.json();

        document.getElementById('temp').textContent = (data.temp ?? '00.0') + ' °C';
        document.getElementById('hum').textContent = (data.hum ?? '00.0') + ' %';
        // document.getElementById('temp280').textContent = data.temp280;
        // document.getElementById('pres280').textContent = data.pres280;
        // document.getElementById('hum280').textContent = data.hum280;
        // document.getElementById('peso711').textContent = data.peso711 ?? '00.00';
        // document.getElementById('x_val').textContent = data.x_val;
        // document.getElementById('y_val').textContent = data.y_val;
        // document.getElementById('button_val').textContent = data.button_val;

        // console.log('Sensor data temp:', data.temp, "Hr:", data.hr);
        actualizarColorTemp();
    } catch (e) {
        console.error('Error fetching sensor data:', e);
    }

    return data; // Se debe usar await en las funciones que hace uso de los datos de los sensores para que la lectura sea correcta
}

setInterval(updateSensors, 1000);

async function obtenerTemperatura() {
    try {
        await fetch('/api/tendencias');
    } catch (e) {
        console.error('No se pudieron obtener los datos de tendencias:', e);
    }
}

async function leerDtTemperatura() {
    try {
        const response = await fetch('/api/obtTemp');
        const dtTemp = await response.json();

        return dtTemp;
    } catch (error) {
        console.error('Error al leer la temperatura:', error);
    }
}

function limpiarMemoria() {
    allCollectedHistoricalData = [];

    localStorage.removeItem('temperatureHistory');

    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }

    if (temperatureChart) {
        temperatureChart.data.labels = [];
        temperatureChart.data.datasets[0].data = [];
        temperatureChart.update();
    }

    document.getElementById('temp').textContent = '00.0';
    document.getElementById('hum').textContent = '00.0';

    const response = fetch('/api/limpiarVariables');

    console.log('Funcion nueva de limpieza de memoria');
}

function convertirHoraAFechaHoy(hr) {
    const [hours, minutes] = hr.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return new Date(now);
}

function actualizarColorTemp() {
    const tempSpan = document.getElementById('temp');
    const tempValor = parseFloat(tempSpan.textContent);

    if (tempValor > 40.0) {
        console.log("Temperatura alta detectada:", tempValor);
        tempSpan.innerHTML = `<span class="temp-roja">${tempValor}  °C</span>`;
    } else {
        tempSpan.innerHTML = `${tempValor} °C`;
    }
}