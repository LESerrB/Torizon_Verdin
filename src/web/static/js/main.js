let intervalId = null;

const tempPiel = document.getElementById("_36-5");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");

startSensor();

async function getTemp() {
    try {
        const res = await fetch('/api/getTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const temperaturas = await res.json();
        console.log(temperaturas);
        

        tempPiel.textContent = temperaturas.temPiel;
        tempAire.textContent = temperaturas.temAire;
        tempSondaAux.textContent = temperaturas.temSondaAux;
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(getTemp, 1000);
    }
};