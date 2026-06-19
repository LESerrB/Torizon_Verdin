const pnlBebe = document.getElementById('pnl-modoBebe');
const pnlAire = document.getElementById('pnl-modoAire');

const ajstCtrl_Ox = document.getElementById('mod-ox');
const ajstCtrl_Hum = document.getElementById('mod-hum');
const ajstCtrl_Fot = document.getElementById('mod-fot');



pnlBebe.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Piel")
});

pnlAire.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Bebe")
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