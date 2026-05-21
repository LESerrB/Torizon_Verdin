let intervalId = null;

const tempPiel = document.getElementById("_36-5");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");
const tempProg = document.getElementById("_36-7");

const btn_pesaje = document.getElementById("pesar")
// const peso = document.getElementById("peso");

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
            tempProg.textContent = temperaturas.tempProg;

            peso.textContent = temperaturas.kgs + " kg";
        }
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

btn_pesaje.addEventListener('click', () => {
    console.log("Pesando...");
    
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