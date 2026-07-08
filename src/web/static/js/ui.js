// ========== Provisional
import { actualizarDesdeValor } from "./encdProb.js";
let intervalEncod = null;

const pnlBebe = document.getElementById('pnl-modoBebe');
const pnlAire = document.getElementById('pnl-modoAire');

const ajstCtrl_Ox = document.getElementById('mod-ox');
const ajstCtrl_Hum = document.getElementById('mod-hum');
const ajstCtrl_Fot = document.getElementById('mod-fot');

const homeDiv = document.getElementById('home');
const panelControl = document.getElementById('panel-control');

const btn_cancel = document.getElementById('cancel-ctrl');

function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) return;

    if (showPanelControl) {
        homeDiv.style.display = 'none';
        panelControl.style.display = 'block';
    } else {
        homeDiv.style.display = 'block';
        panelControl.style.display = 'none';
    }
}

pnlBebe.addEventListener('click', () => {
    toggleHomePanel(true);
    set_EditCtrlsEn("tempProg");
});

pnlAire.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Bebe");
});

ajstCtrl_Ox.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Oxigeno")
});

ajstCtrl_Hum.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Humedad")
});

ajstCtrl_Fot.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Fototerapia")
});


// Boton Cancelar
btn_cancel.addEventListener('click', () => {
    clearInterval(intervalEncod);
    intervalEncod = null;
    toggleHomePanel(false);
});



const tempProg = document.getElementById("tp_prog");
const val_Ctrl = document.getElementById("texto-valor");

const controls = {
    // nombreControl: document.getElementById("id-elemento"),
    tempProg: tempProg,
};

tempProg.textContent = 34.0.toFixed(1);
val_Ctrl.textContent = tempProg.textContent;

async function set_EditCtrlsEn(ctrl_lbl) {
    try {
        const res = await fetch('/api/enEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Ctrl: ctrl_lbl,
                Enable: true,
            })
        });

        if (!intervalEncod) {
            intervalEncod = setInterval(edit_valProg, 100);
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

async function edit_valProg(){
    try {
        const res = await fetch('/api/editValProg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const encd = await res.json();

            val_Ctrl.textContent = encd.val.toFixed(1);
            actualizarDesdeValor(encd.val.toFixed(1));

            if ((!encd.confirm) && intervalEncod) {
                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

