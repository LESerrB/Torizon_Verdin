document.addEventListener('DOMContentLoaded', () => {
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

    // Botones de sensor (verdes, los 4 primeros)
    const sensorButtons = document.querySelectorAll('.sensor-button:not(#heater-power-button)');
    sensorButtons.forEach(button => {
        button.addEventListener('click', () => {
            let messageDiv = button.querySelector('.message');

            if (messageDiv) {
                messageDiv.classList.toggle('hidden');
            } else {
                messageDiv = document.createElement('span');
                messageDiv.classList.add('message');
                messageDiv.textContent = 'Hola';
                button.appendChild(messageDiv);
            }
        });
    });

    // Referencia al panel derecho COMPLETO (sección melón)
    const rightHeaterPanel = document.getElementById('right-heater-panel');
    // Referencia al panel central
    const centerDisplay = document.querySelector('.center-display');

    // Estado inicial: Asegurar que el panel melón esté oculto y el centro expandido
    // Esto se maneja en el HTML con la clase 'hidden' y en el CSS con flex: 3 para center-display
    // No necesitamos JavaScript adicional aquí para el estado inicial.

    // Botón "Potencia calefactor"
    const heaterPowerButton = document.getElementById('heater-power-button');
    const heaterPercentageSpan = document.getElementById('heater-percentage');

    let currentHeaterPercentage = 100; // Valor inicial para el calefactor

    // Función para actualizar el porcentaje
    function updateHeaterPercentageDisplay() {
        heaterPercentageSpan.textContent = `${currentHeaterPercentage} %`;
    }
    updateHeaterPercentageDisplay(); // Llamar al inicio para establecer el valor inicial

    // Evento para el botón "Potencia calefactor"
    heaterPowerButton.addEventListener('click', () => {
        // Alternar la clase 'hidden' en todo el panel derecho
        rightHeaterPanel.classList.toggle('hidden');

        // Ajustar el flex-grow del center-display para que ocupe el espacio
        if (rightHeaterPanel.classList.contains('hidden')) {
            centerDisplay.style.flex = '3'; // Ocupa más espacio
        } else {
            centerDisplay.style.flex = '2'; // Vuelve a su tamaño original
        }
    });

    // Control de porcentaje del calefactor
    const decrementHeaterButton = document.getElementById('decrement-heater');
    const incrementHeaterButton = document.getElementById('increment-heater');
    const acceptHeaterButton = document.getElementById('accept-heater');

    decrementHeaterButton.addEventListener('click', () => {
        if (currentHeaterPercentage > 0) {
            currentHeaterPercentage -= 1; // Decremento de 10%
            updateHeaterPercentageDisplay();
        }
    });

    incrementHeaterButton.addEventListener('click', () => {
        if (currentHeaterPercentage < 100) {
            currentHeaterPercentage += 1; // Incremento de 10%
            updateHeaterPercentageDisplay();
        }
    });

    acceptHeaterButton.addEventListener('click', () => {
        alert(`Potencia del calefactor establecida a: ${currentHeaterPercentage}%`);
        // Opcional: Ocultar el panel derecho después de aceptar (si se desea)
        // rightHeaterPanel.classList.add('hidden');
        // centerDisplay.style.flex = '3';
        // Aquí podrías enviar este valor a un servidor o realizar otra acción
    });
});

async function updateSensors() {
    try {
        const response = await fetch('/api/sensores');
        const data = await response.json();

        document.getElementById('temp').textContent = data.temp;
        document.getElementById('hum').textContent = data.hum;
        document.getElementById('temp280').textContent = data.temp280;
        document.getElementById('pres280').textContent = data.pres280;
        document.getElementById('hum280').textContent = data.hum280;
        document.getElementById('peso711').textContent = data.peso711;
        document.getElementById('x_val').textContent = data.x_val;
        document.getElementById('y_val').textContent = data.y_val;
        document.getElementById('button_val').textContent = data.button_val;
    } catch (e) {
        console.error('Error fetching sensor data:', e);
    }

}

setInterval(updateSensors, 1000);
updateSensors();