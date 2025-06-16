console.log("script.js se está ejecutando!"); // LOG DE DEPURACIÓN INICIAL

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Botones de la Barra Superior ---

    // Botón de foco (azul)
    const lightbulbButton = document.getElementById('lightbulb-button');
    lightbulbButton.addEventListener('click', () => {
        lightbulbButton.classList.toggle('purple-lightbulb');
        fetch('/api/lightbulb', { method: 'POST' });
    });

    // Botón de campana (naranja)
    const bellButton = document.getElementById('bell-button');
    let isBellMuted = false;
    bellButton.addEventListener('click', () => {
        const bellIcon = bellButton.querySelector('i');
        fetch('/api/bellButton', { method: 'POST' });
        if (isBellMuted) {
            bellIcon.classList.remove('fa-bell-slash');
            bellIcon.classList.add('fa-bell');
        } else {
            bellIcon.classList.remove('fa-bell');
            bellIcon.classList.add('fa-bell-slash');
        }
        isBellMuted = !isBellMuted;
    });

    // --- Lógica de Botones Sensores Verdes (AHORA INDIVIDUALES) ---

    // Botón STH21
    const sensorSth21Button = document.getElementById('sensor-sth21');
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

    // Botón BME280
    const sensorBme280Button = document.getElementById('sensor-bme280');
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

    // Botón HX711
    const sensorHx711Button = document.getElementById('sensor-hx711');
    sensorHx711Button.addEventListener('click', async () => {
        let messageDiv = sensorHx711Button.querySelector('.message');
        if (messageDiv) {
            messageDiv.classList.toggle('hidden');
        } else {
            messageDiv = document.createElement('span');
            messageDiv.classList.add('message');

            const peso = await updateSensors().then(data => data.peso711 || '00.00');

            console.log("Peso del HX711:", peso);
            
            messageDiv.textContent = peso;

            console.log("Peso del HX711:");
            sensorHx711Button.appendChild(messageDiv);
        }
    });

    // Botón HW-504
    const sensorHw504Button = document.getElementById('sensor-hw504');
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
    const mainGrayDisplay = document.getElementById('main-gray-display'); // Panel gris principal

    const heaterPowerButton = document.getElementById('heater-power-button');
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

    const decrementHeaterButton = document.getElementById('decrement-heater');
    const incrementHeaterButton = document.getElementById('increment-heater');
    const acceptHeaterButton = document.getElementById('accept-heater');

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

    // --- NUEVA FUNCIONALIDAD: Botón amarillo para alternar pantallas ---
    const yellowBarButton = document.getElementById('yellow-bar-button');
    const alternateScreen = document.getElementById('alternate-screen'); // Nueva pantalla azul

    // NUEVAS REFERENCIAS PARA EL ÍCONO Y TEXTO DEL BOTÓN AMARILLO
    const chartIcon = yellowBarButton.querySelector('.chart-icon');
    const chartText = yellowBarButton.querySelector('.chart-text');

    yellowBarButton.addEventListener('click', () => {
        mainGrayDisplay.classList.toggle('hidden');
        alternateScreen.classList.toggle('hidden');

        // Lógica para mostrar/ocultar el ícono y texto del botón amarillo
        if (alternateScreen.classList.contains('hidden')) {
            // Si la pantalla alternativa (gráficos) está oculta, ocultar ícono y texto
            chartIcon.classList.add('hidden');
            chartText.classList.add('hidden');
        } else {
            // Si la pantalla alternativa (gráficos) está visible, mostrar ícono y texto
            chartIcon.classList.remove('hidden');
            chartText.classList.remove('hidden');
        }
    });


    // --- LÓGICA DE GRÁFICOS DE TENDENCIAS EN PANTALLA AZUL ---

    const durationSelect = document.getElementById('duration-select');
    const intervalSelect = document.getElementById('interval-select');
    const startRecordingBtn = document.getElementById('start-recording-btn');
    const stopRecordingBtn = document.getElementById('stop-recording-btn');
    const clearChartBtn = document.getElementById('clear-chart-btn');
    const temperatureChartCanvas = document.getElementById('temperatureChart');

    // **LOG DE DEPURACIÓN PARA EL BOTÓN INICIAR**
    console.log("Referencia a startRecordingBtn:", startRecordingBtn);

    console.log("Inicializando Chart.js..."); // LOG DE DEPURACIÓN DE INICIALIZACIÓN

    let temperatureChart; // Variable para almacenar la instancia del gráfico
    let recordingInterval; // Variable para almacenar el ID del setInterval
    let dataPoints = []; // Almacena objetos { time: Date, value: Number }
    let maxDataPoints = 0; // Se calculará en base a la duración y el intervalo

    // Función para simular la lectura de temperatura
    // function getSimulatedTemperature() {
        // Simula una temperatura entre 36.0 y 38.0 °C
    //     return (Math.random() * (38.0 - 36.0) + 36.0).toFixed(2);
    // }

    // Inicializar el gráfico al cargar la página (aunque esté oculto)
    // Se inicializa con datos vacíos
    temperatureChart = new Chart(temperatureChartCanvas, {
        type: 'line', // Tipo de gráfico de línea
        data: {
            labels: [], // Etiquetas de tiempo (eje X)
            datasets: [{
                label: 'Temperatura (°C)',
                data: [], // Datos de temperatura (eje Y)
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el gráfico se ajuste al contenedor
            scales: {
                x: {
                    type: 'time', // Usar escala de tiempo para el eje X
                    time: {
                        unit: 'minute', // La unidad base será el minuto
                        tooltipFormat: 'HH:mm:ss', // Formato para el tooltip
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
                    min: 20, // Rango mínimo del eje Y
                    max: 30  // Rango máximo del eje Y
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

    // Función para actualizar el gráfico con nuevos datos
    function updateChart() {
        console.log("Actualizando gráfico. Puntos de datos actuales:", dataPoints.length); // LOG DE DEPURACIÓN
        temperatureChart.data.labels = dataPoints.map(point => point.time);
        temperatureChart.data.datasets[0].data = dataPoints.map(point => point.value);
        temperatureChart.update();
    }

    // Función para iniciar la grabación de datos
    startRecordingBtn.addEventListener('click', () => {
        console.log("Botón 'Iniciar Registro' presionado."); // LOG DE DEPURACIÓN

        const durationHours = parseInt(durationSelect.value); // Duración en horas
        const intervalMs = parseInt(intervalSelect.value); // Intervalo en milisegundos

        console.log(`Duración seleccionada: ${durationHours} horas, Intervalo: ${intervalMs} ms`); // LOG DE DEPURACIÓN

        // Calcular el número máximo de puntos de datos
        maxDataPoints = (durationHours * 60 * 60 * 1000) / intervalMs;
        console.log(`Máximo de puntos de datos: ${maxDataPoints}`); // LOG DE DEPURACIÓN

        dataPoints = []; // Limpiar datos anteriores
        updateChart(); // Limpiar el gráfico visualmente también

        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        durationSelect.disabled = true;
        intervalSelect.disabled = true;

        // Iniciar el intervalo para guardar datos
        recordingInterval = setInterval(async () => {
            // const temp = getSimulatedTemperature();

            const temp = await updateSensors().then(data => data.temp || '00.00');
            console.log(temp + " °C");

            const now = new Date(); // Guardar el tiempo actual

            dataPoints.push({ time: now, value: temp });
            console.log(`Dato guardado: Tiempo=${now.toLocaleTimeString()}, Temp=${temp}. Total puntos: ${dataPoints.length}`); // LOG DE DEPURACIÓN

            // Si excedemos la duración, eliminamos el punto más antiguo
            if (dataPoints.length > maxDataPoints) {
                dataPoints.shift(); // Elimina el punto más antiguo
            }

            updateChart(); // Actualizar el gráfico
        }, intervalMs);

        console.log(`Iniciando registro por ${durationHours} horas, cada ${intervalMs / 1000} segundos.`); // LOG DE DEPURACIÓN
    });

    // Función para detener la grabación de datos
    stopRecordingBtn.addEventListener('click', () => {
        clearInterval(recordingInterval); // Detener el intervalo
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        durationSelect.disabled = false;
        intervalSelect.disabled = false;
        console.log('Registro detenido.'); // LOG DE DEPURACIÓN
    });

    // Función para limpiar el gráfico
    clearChartBtn.addEventListener('click', () => {
        clearInterval(recordingInterval); // Asegurarse de detener el registro
        dataPoints = []; // Vaciar los datos
        updateChart(); // Actualizar el gráfico (lo dejará vacío)
        startRecordingBtn.disabled = false; // Habilitar inicio
        stopRecordingBtn.disabled = true; // Deshabilitar detener
        durationSelect.disabled = false; // Habilitar selectores
        intervalSelect.disabled = false; // Habilitar selectores
        console.log('Gráfico limpiado.'); // LOG DE DEPURACIÓN
    });

    // --- Fin de la Lógica de Gráficos ---

});

async function updateSensors() {
    let data = {};

    try {
        const response = await fetch('/api/sensores');
        data = await response.json();

        // console.log('Datos de sensores recibidos:', data);

        document.getElementById('temp').textContent = data.temp ?? '00.00';
        document.getElementById('hum').textContent = data.hum ?? '00.00';
        // document.getElementById('temp280').textContent = data.temp280;
        // document.getElementById('pres280').textContent = data.pres280;
        // document.getElementById('hum280').textContent = data.hum280;
        document.getElementById('peso711').textContent = data.peso711 ?? '00.00';
        // document.getElementById('x_val').textContent = data.x_val;
        // document.getElementById('y_val').textContent = data.y_val;
        // document.getElementById('button_val').textContent = data.button_val;
    } catch (e) {
        console.error('Error fetching sensor data:', e);
    }

    return data;
}

setInterval(updateSensors, 1000);
updateSensors();