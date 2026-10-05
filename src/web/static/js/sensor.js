import {
    crearSliderPotCalef,
} from "./slider.js";

const periodoActVals = 0.5      // segundos

let intervalId = null;          // Timer de actualización de sensores

let timerFot = null;            // Timer de timepo de Fototerapia
let minsOn = 0;                 // Contador de minutos de Fototerapia

let TZ = "America/Mexico_City"; // CST UTC-6h Ciudad de México

const panelDer = document.querySelector(".mp-prin-mc-taire");

const tempPiel = document.getElementById("ti-vm-piel");
const tempAire = document.getElementById("_36-3");
const tempSondaAux = document.getElementById("_34-6");

const sensOx = document.getElementById("valOx");
const sensHum = document.getElementById("valHum");

const viewLat_tp = document.getElementById("vw-val-tp-Sns");
const viewLat_ta = document.getElementById("vw-val-ta-Sns");
const viewLat_ox = document.getElementById("vw-val-ox-Sns");

const clfCtrl = document.getElementById("potCalef");

const btn_pesaje = document.getElementById("pesar")
const peso_Basc = document.getElementById("peso");

peso_Basc.textContent = "-.---"

const fecha = document.getElementById("fecha");
const hora = document.getElementById("hora");
const am_pm = document.getElementById("am-pm");

const fot_hrs = document.getElementById("fot-hrs");

let updateSliderPowCalef_pPrin = null;
let sliderPowCalef_pPrin = null;

sliderPowCalef_pPrin = crearSliderPotCalef();

updateSliderPowCalef_pPrin = (value) => {
    sliderPowCalef_pPrin?.setLevel(value);
}

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
            const modoOpIncub = vls_snsrsTCD.modos.op === "Incubadora";

            viewLat_tp.textContent = tempPiel.textContent = vls_snsrsTCD.vls_snsrsTCD.t_Piel.toFixed(1);
            viewLat_ta.textContent = tempAire.textContent = modoOpIncub ? vls_snsrsTCD.vls_snsrsTCD.t_Aire.toFixed(1) : vls_snsrsTCD.vls_snsrsTCD.pot_Clf.toFixed(0);
            tempSondaAux.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Aux.toFixed(1);

            sensOx.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Ox;
            viewLat_ox.textContent = modoOpIncub ? sensOx.textContent : vls_snsrsTCD.vls_snsrsTCD.pot_Clf;
            sensHum.textContent = vls_snsrsTCD.vls_snsrsTCD.s_Hum;

            clfCtrl.textContent = vls_snsrsTCD.vls_snsrsTCD.pot_Clf;
            
            const nuevoValor = vls_snsrsTCD.vls_snsrsTCD.pot_Clf;
            updateSliderPowCalef_pPrin?.(nuevoValor);
        }
        else{
            viewLat_tp.textContent = tempPiel.textContent = "--.-";
            viewLat_ta.textContent = tempAire.textContent = (panelDer.classList.contains("m-Manual")) ? "--" : "--.-";
            tempSondaAux.textContent = "--.-";

            viewLat_ox.textContent = sensOx.textContent = "--"
            sensHum.textContent = "--"
        }

        /****** Hora / Fecha ******/
        getDateTime(TZ);
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

export function startSensors(){
    if (!intervalId)
        intervalId = setInterval(get_DtSensores, (periodoActVals * 1000));
};

export function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// =======================
// Cronómetro Fototerapia
// =======================
export function startTimerFot() {
    if (!timerFot)
        timerFot = setInterval(() => {
            minsOn++;

            const hours = String(Math.floor(minsOn / 60)).padStart(2, "0");
            const minutes = String(minsOn % 60).padStart(2, "0");

            fot_hrs.textContent = `${hours}:${minutes}`;

        }, (60 * 1000));
}

export function stopTimerFot() {
    if (timerFot) {
        clearInterval(timerFot);
        minsOn = 0;
        timerFot = null;

        fot_hrs.textContent = "00:00";
    }
};

// function timeOn_Fot() {
//     console.log("Timer fot");
// }
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

// ==============
// Fecha y Hora
// ==============
function getDateTime(timezone){
    const hoy = new Date();

    const fecha_actual = hoy.toLocaleDateString('es-ES', {
        timeZone: timezone,
        day: 'numeric',
        month: 'short'
    }).replace('.', '');

    const hora_12 = hoy.toLocaleTimeString('es-ES', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const [_, Hora, amPm] = hora_12.match(/^([\d:]+)\s+(.+)$/);

    fecha.textContent = fecha_actual;
    hora.textContent = Hora;
    am_pm.textContent = amPm;
}