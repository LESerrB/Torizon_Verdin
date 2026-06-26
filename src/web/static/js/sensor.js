let intervalId = null;
let valueTimerId = null;
let counterSeconds = 0;

const tempPiel = document.getElementById("ti-vm-piel");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");

const sensOx = document.getElementById("percOx");
const sensHum = document.getElementById("percHum");

const btn_pesaje = document.getElementById("pesar")
const peso_Basc = document.getElementById("peso");

peso_Basc.textContent = "-.---"

function generateRandomFloat(base, variancePercent, decimals = 3) {
    const variance = base * variancePercent;
    const min = base - variance;
    const max = base + variance;
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
}

async function getTemp() {
    try {
        const res = await fetch('/api/getTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const temperaturas = await res.json();

            tempPiel.textContent = temperaturas.temPiel;
            tempAire.textContent = temperaturas.temAire;
            tempSondaAux.textContent = temperaturas.temSondaAux;

            sensOx.textContent = temperaturas.sensOx;
            sensHum.textContent = temperaturas.sensHum;
        }
        else{
            tempPiel.textContent = "--.-";
            tempAire.textContent = "--.-";
            tempSondaAux.textContent = "--.-";

            sensOx.textContent = "--"
            sensHum.textContent = "--"
        }
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

btn_pesaje.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/pesar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const peso = await res.json();
            console.log(peso.peso);
            
            peso_Basc.textContent = peso.peso.toFixed(3);
        }
    } catch (error) {
        console.log("Error:", error);
    }
});




export function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(getTemp, 300);
    }
};

export function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};