const periodoActVals = 0.5 // segundos

let intervalId = null;

const tempPiel = document.getElementById("ti-vm-piel");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");

const sensOx = document.getElementById("valOx");
const sensHum = document.getElementById("valHum");

const viewLat_tp = document.getElementById("vw-val-tp-Sns");
const viewLat_ta = document.getElementById("vw-val-ta-Sns");
const viewLat_ox = document.getElementById("vw-val-ox-Sns");

const btn_pesaje = document.getElementById("pesar")
const peso_Basc = document.getElementById("peso");

peso_Basc.textContent = "-.---"

const fecha = document.getElementById("fecha");
const hora = document.getElementById("hora");
const am_pm = document.getElementById("am-pm");

/**
 * Obtiene los últimos datos de sensores desde la API y actualiza los elementos
 * de la interfaz con los valores actuales de temperatura, humedad y oxígeno.
 *
 * La función realiza una petición POST a /api/getDtSensores. Si la respuesta
 * tiene estado 200, interpreta el JSON recibido y lo muestra con una cifra
 * decimal para las temperaturas. En caso de error o respuesta no válida,
 * reemplaza los valores por placeholders. Además, actualiza la fecha y la hora
 * local en formato español para que se reflejen en la vista.
 */
async function get_DtSensores() {
    try {
        const res = await fetch('/api/getDtSensores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const vls_snsrsTCD = await res.json();

            viewLat_tp.textContent = tempPiel.textContent = vls_snsrsTCD.vls_snsrsTCD.t_Piel.toFixed(1);
            viewLat_ta.textContent = tempAire.textContent = vls_snsrsTCD.vls_snsrsTCD.t_Aire.toFixed(1);
            tempSondaAux.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Aux.toFixed(1);

            viewLat_ox.textContent = sensOx.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Ox;
            sensHum.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Hum;
        }
        else{
            viewLat_tp.textContent = tempPiel.textContent = "--.-";
            viewLat_ta.textContent = tempAire.textContent = "--.-";
            tempSondaAux.textContent = "--.-";

            viewLat_ox.textContent = sensOx.textContent = "--"
            sensHum.textContent = "--"
        }

        /****** Hora / Fecha ******/
        const hoy = new Date();
        const fecha_actual = hoy.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        }).replace('.', '');
        const hora_12 = hoy.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const [_, Hora, amPm] = hora_12.match(/^([\d:]+)\s+(.+)$/);

        fecha.textContent = fecha_actual;
        hora.textContent = Hora;
        am_pm.textContent = amPm;
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

export function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(get_DtSensores, (periodoActVals * 1000));
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