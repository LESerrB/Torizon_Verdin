import { 
    startSensor,
    pauseSensor,
} from "./sensor.js";

import { 
    setInitValues,
    ajstCtrl_TPiel,
    ajstCtrl_TAire,
    ajst_CtrlOx,
    ajst_CtrlHum,
    ajst_CtrlFot
} from "./ui.js";

import {  } from "./crono_Apgar.js";

import {  } from "./bascula.js";

// =============================
// Paneles de control
// =============================
const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const ajstCtrlOx = document.getElementById("mod-ox");
const ajstCtrlHum = document.getElementById("mod-hum");
const ajstCtrlFot = document.getElementById("mod-fot");

pnlBebe?.addEventListener("touchend", () => {
    ajstCtrl_TPiel();
});

pnlAire?.addEventListener("touchend", () => {
    ajstCtrl_TAire();
});

ajstCtrlOx?.addEventListener("touchend", () => {
    ajst_CtrlOx();
});

ajstCtrlHum?.addEventListener("touchend", () => {
    ajst_CtrlHum();
});

ajstCtrlFot?.addEventListener("touchend", () => {
    ajst_CtrlFot();
});



setInitValues();
startSensor();