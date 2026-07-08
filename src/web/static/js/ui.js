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
    console.log("Ajuste de Ctrl de Temperatura de Piel");
    toggleHomePanel(true);
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
    toggleHomePanel(false);
});