function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('clock').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

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