let intervalId = null;

const tempPiel = document.getElementById("ti-vm-piel");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");

const sensOx = document.getElementById("valOx");
const sensHum = document.getElementById("valHum");

const btn_pesaje = document.getElementById("pesar")
const peso_Basc = document.getElementById("peso");

peso_Basc.textContent = "-.---"

async function getTemp() {
    try {
        const res = await fetch('/api/getTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const vls_snsrsTCD = await res.json();
            
            tempPiel.textContent = vls_snsrsTCD.vls_snsrsTCD.t_Piel.toFixed(1);
            tempAire.textContent = vls_snsrsTCD.vls_snsrsTCD.t_Aire.toFixed(1);
            tempSondaAux.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Aux.toFixed(1);

            sensOx.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Ox;
            sensHum.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Hum;
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

export function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(getTemp, 500);
    }
};

export function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// =======================================
// Próxima actualización en un nuevo panel
// =======================================
// btn_pesaje.addEventListener('click', async () => {
//     try {
//         const res = await fetch('/api/pesar', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if(res.status == 200){
//             const peso = await res.json();
//             console.log(peso.peso);
            
//             peso_Basc.textContent = peso.peso.toFixed(3);
//         }
//     } catch (error) {
//         console.log("Error:", error);
//     }
// });