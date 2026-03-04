import { 
    enablePacienteEditing,
    actvModo,
    updtBars,
    updtTempProg,
    openModule,
    closeModule,
    shwAlert,
    hdAlerta,
    encdCtrl
} from './ui.js';

import { 
    setTemp_prog,
    setPot_prog,
    ctrls_Bascula,
    ctrls_CronmApgar,
    setIntensVal,
    ctrl_AdjPos,
    updateSensors,
    modoOp
} from './sensor.js';

let cFW = 0;
const vFW = "0.22";
const releaseDate = "3/Marzo/2026"

//~~~~~~~~~~~~~~~~ Definición de Variables ~~~~~~~~~~~~~~~~//
let calef_Lvl = 100;
const maxLvl = 100;

let tempProg_Lvl = 34.0;
let sobreGiro = false;

let tempProg_ant = 34.0;

let tempProgInterval;
let tempProgStatus;

// Pantalla Base //
const pantallaBase = document.querySelector('.pantalla-base');

//~~~~~~~~~~~~~~~~~ Definición de Botones ~~~~~~~~~~~~~~~~~//
const btn_modoOP = document.getElementById('btn-mode');
const btn_Alerta = document.getElementById('btn-alarm');
const btn_lock = document.getElementById('btn-lock');

const btn_Bebe = document.getElementById('modo-bebe');
const btn_Manual = document.getElementById('modo-manual');

const val_TempProg = document.getElementById('tempProg-val');
const val_potCalef = document.getElementById('potCalef-val');

const btn_tmpPrgMenos = document.getElementById('tempProgMenos');
const btn_tmpPrgAcept = document.getElementById('tempProgAceptar');
const btn_tmpPrgMas = document.getElementById('tempProgMas');

const btn_sobreGiro = document.getElementById('tmpPrgSobregiro');
const btn_sobreGiro_lbl = document.getElementById('tmpPrgSobregiro-lbl');

const btn_calefMenos = document.getElementById('calefMenos');
const btn_calefAceptar = document.getElementById('calefAceptar');
const btn_calefMas = document.getElementById('calefMas');

const sld_Photo = document.getElementById("photo-intensity");
const sld_Exam = document.getElementById("exam-intensity");

const btn_cronStartPause = document.getElementById('btn-startpause');
const btn_cronClear = document.getElementById('btn-clear');

const btn_Up = document.getElementById('btn-up');
const btn_Down = document.getElementById('btn-dwn');
const btn_Left = document.getElementById('btn-incLft');
const btn_Right = document.getElementById('btn-incRgt');
const btn_L_Up = document.getElementById('btn-upLmp');
const btn_L_Down = document.getElementById('btn-dwnLmp');

const footer = document.getElementById("footer");

//~~~~~~~~~~~~~~~~~~~~~ Estado Inicial ~~~~~~~~~~~~~~~~~~~~//
// Temperatura Programada //
let btnsCtrl_tmpProgDisabled = true;

btn_tmpPrgMenos.disabled = true;
btn_tmpPrgAcept.disabled = true;
btn_tmpPrgMas.disabled = true;
btn_sobreGiro.disabled = true;

btn_sobreGiro.style.display = 'none'

let val = 0;

// Potencia del Calefactor //
let btnsCtrl_potCalefDisabled = true;

btn_calefMenos.disabled = true;
btn_calefAceptar.disabled = true;
btn_calefMas.disabled = true;

// Fototerapia //
sld_Photo.disabled = true;

let intervalId = null;

let lockState = false;

// Funciones Iniciales //
startSensor();
setIntensVal(sld_Photo.value, sld_Exam.value);

updtBars(calef_Lvl);
updtTempProg(tempProg_Lvl);

setPot_prog(calef_Lvl);
setTemp_prog(tempProg_Lvl, tempProg_ant);

//~~~~~~~~~~~~~~~~~~ FUNCIONES PERIÓDICAS ~~~~~~~~~~~~~~~~~//
function startSensor(){
    if (!intervalId) {
        intervalId = setInterval(updateSensors, 1000);
    }
};

function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

function focusElement(index) {
    const el = document.querySelector(`[tabindex="${index}"]`);
    if (el) el.focus();
}

function getNextTabindex(direction = 'forward') {
    const focusables = Array.from(document.querySelectorAll('[tabindex]'))
        .filter(el => !el.disabled && el.offsetParent !== null)
        .sort((a, b) => a.tabIndex - b.tabIndex);

    const active = document.activeElement;
    const current = focusables.indexOf(active);

    if (direction === 'forward')
        return focusables[(current + 1) % focusables.length].tabIndex;
    else
        return focusables[(current - 1 + focusables.length) % focusables.length].tabIndex;
}

function simulateArrowKey(key) {
    const event = new KeyboardEvent("keydown", {
        key: key,
        bubbles: true,
        cancelable: true,
    });

    document.activeElement.dispatchEvent(event);
}

setInterval(async () => {
    const active = document.activeElement;
    const res = await fetch("/api/ctrls");
    const js = await res.json();

    if(js.Alerta == "ALERTA DE SUMINISTRO DE ENERGÍA"){
        shwAlert(js.Alerta, "danger");
    }
    else if(js.Alerta == "Suministro de Energia Restablecido"){
        hdAlerta();
        shwAlert(js.Alerta, "success", 0.3);
    }

}, 300);

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<< Header >>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
btn_modoOP.addEventListener('click', () => {
    modoOp();
});

btn_Alerta.addEventListener('click', () => {
    shwAlert("Prueba \n De salto de linea", "success", 5);
});

btn_lock.addEventListener('click', () => {
    lockState = !lockState;

    pantallaBase.classList.toggle('no-clicks');
    btn_lock.classList.toggle('pressed');

    if(btn_Manual.classList[1] == 'active'){
        val_potCalef.style.pointerEvents = lockState ? 'none' : '';
    }

    if(btn_Bebe.classList[1] == 'active'){
        val_TempProg.style.pointerEvents = lockState ? 'none' : '';
    }
    
    btn_modoOP.classList.toggle('no-clicks');

    document.getElementById('footer').classList.toggle('no-clicks');
});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<< Body >>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

//{{{{{{{{{{{{{{{{{{{{{ Panel Principal }}}}}}}}}}}}}}}}}}}}//
    //[[[[[[[[[[[[[[[[[[[[ MODO BEBÉ ]]]]]]]]]]]]]]]]]]]//
btn_Bebe.addEventListener('click', () => {
    actvModo('bebe');

    btnsCtrl_tmpProgDisabled = true;
    btnsCtrl_potCalefDisabled = true;

    btn_tmpPrgMenos.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgAcept.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgMas.disabled = btnsCtrl_tmpProgDisabled;
    btn_sobreGiro.disabled = btnsCtrl_tmpProgDisabled;

    btn_calefMenos.disabled = btnsCtrl_potCalefDisabled;
    btn_calefAceptar.disabled = btnsCtrl_potCalefDisabled;
    btn_calefMas.disabled = btnsCtrl_potCalefDisabled;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.remove('parpadeo');

    updtBars(calef_Lvl);
    updtTempProg(tempProg_Lvl);
});

val_TempProg.addEventListener('click', async () => {
    val_TempProg.classList.add('parpadeo');

    tempProgStatus = setInterval(async () => {
        val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
        tempProg_Lvl = val;
    }, 50);

    tempProg_ant = tempProg_Lvl;

    btnsCtrl_tmpProgDisabled = false;
    btnsCtrl_potCalefDisabled = true;

    btn_tmpPrgMenos.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgAcept.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgMas.disabled = btnsCtrl_tmpProgDisabled;
    btn_sobreGiro.disabled = btnsCtrl_tmpProgDisabled;

    btn_calefMenos.disabled = btnsCtrl_potCalefDisabled;
    btn_calefAceptar.disabled = btnsCtrl_potCalefDisabled;
    btn_calefMas.disabled = btnsCtrl_potCalefDisabled;
});
        //(((((((((((((((( Controles ))))))))))))))))//
btn_tmpPrgMenos.addEventListener('click', async () => {
    if (tempProg_Lvl > 34.0) {
        tempProg_Lvl -= 0.1

        val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);

        if (tempProg_Lvl < 37.0) {
            sobreGiro = false;
        }
    }

    updtTempProg(tempProg_Lvl);
});

btn_tmpPrgMenos.addEventListener('touchstart', async () => {
    tempProgInterval = setInterval(async () => {
        if (tempProg_Lvl >= 34.1 && !(btnsCtrl_tmpProgDisabled)) {
            tempProg_Lvl -= 0.2;

            val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
            console.log(val);

            if (tempProg_Lvl < 37.0) 
                sobreGiro = false;

            updtTempProg(tempProg_Lvl);
        }
    }, 200);
});

btn_tmpPrgMenos.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
});

btn_tmpPrgAcept.addEventListener('click', async () => {
    clearInterval(tempProgInterval);
    clearInterval(tempProgStatus);

    val_TempProg.classList.remove('parpadeo');
    btnsCtrl_tmpProgDisabled = true;

    btn_tmpPrgMenos.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgAcept.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgMas.disabled = btnsCtrl_tmpProgDisabled;
    btn_sobreGiro.disabled = btnsCtrl_tmpProgDisabled;

    try {
        const t = await setTemp_prog(tempProg_Lvl, tempProg_ant);
        updtTempProg(t);
    } catch (error) {
        console.log("Error al configurar la Temperatura Programada");
    }
});

btn_tmpPrgMas.addEventListener('click', async () => {
    if (tempProg_Lvl < 37.0) {
        tempProg_Lvl += 0.1;

        val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
    }

    if (sobreGiro) {
        if (tempProg_Lvl < 38.0){
            tempProg_Lvl += 0.1;

            val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
        }
    }

    updtTempProg(tempProg_Lvl);
});

btn_tmpPrgMas.addEventListener('touchstart', async () => {
    tempProgInterval = setInterval(async () => {
        if (tempProg_Lvl <= 36.9 && !(btnsCtrl_tmpProgDisabled)) {
            tempProg_Lvl += 0.2;

            val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
        }

        if (sobreGiro) {
            if (tempProg_Lvl < 38.0 && !(btnsCtrl_tmpProgDisabled)){
                tempProg_Lvl += 0.2;

                val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
            }
        }

        updtTempProg(tempProg_Lvl);
    }, 200);
});

btn_tmpPrgMas.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
});

btn_sobreGiro.addEventListener('click', async () => {
    sobreGiro = !(sobreGiro);

    if(!sobreGiro){
        tempProg_Lvl = parseFloat(37.0).toFixed(1);

        updtTempProg(tempProg_Lvl);

        val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
        tempProg_Lvl = val;

        btn_sobreGiro.classList.add('btn-sensor');
        btn_sobreGiro.classList.remove('btn-sensor-pressed');
    
        btn_sobreGiro_lbl.classList.add('btn-snsr-lbl');
        btn_sobreGiro_lbl.classList.remove('btn-sensor-lbl-pressed');
    }
    else{
        val = await encdCtrl(tempProg_Lvl, "temProg", sobreGiro);
        tempProg_Lvl = val;

        btn_sobreGiro.classList.remove('btn-sensor');
        btn_sobreGiro.classList.add('btn-sensor-pressed');
    
        btn_sobreGiro_lbl.classList.remove('btn-snsr-lbl');
        btn_sobreGiro_lbl.classList.add('btn-sensor-lbl-pressed');
    }

});
    //[[[[[[[[[[[[[[[ MODO MANUAL / AIRE ]]]]]]]]]]]]]]]//
btn_Manual.addEventListener('click', () => {
    actvModo('manual');

    btnsCtrl_tmpProgDisabled = true;
    btnsCtrl_potCalefDisabled = false;

    btn_tmpPrgMenos.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgAcept.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgMas.disabled = btnsCtrl_tmpProgDisabled;
    btn_sobreGiro.disabled = btnsCtrl_tmpProgDisabled;

    btn_calefMenos.disabled = btnsCtrl_potCalefDisabled;
    btn_calefAceptar.disabled = btnsCtrl_potCalefDisabled;
    btn_calefMas.disabled = btnsCtrl_potCalefDisabled;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.add('parpadeo');

    updtBars(calef_Lvl);
    updtTempProg(tempProg_Lvl);
});

val_potCalef.addEventListener('click', () => {
    val_potCalef.classList.add('parpadeo');

    btnsCtrl_tmpProgDisabled = true;
    btnsCtrl_potCalefDisabled = false;

    btn_tmpPrgMenos.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgAcept.disabled = btnsCtrl_tmpProgDisabled;
    btn_tmpPrgMas.disabled = btnsCtrl_tmpProgDisabled;
    btn_sobreGiro.disabled = btnsCtrl_tmpProgDisabled;

    btn_calefMenos.disabled = btnsCtrl_potCalefDisabled;
    btn_calefAceptar.disabled = btnsCtrl_potCalefDisabled;
    btn_calefMas.disabled = btnsCtrl_potCalefDisabled;
});
        //((((((((((((((( Controles ))))))))))))))))//
btn_calefMenos.addEventListener('click', () => {
    if (calef_Lvl > 0) {
        calef_Lvl -= 1;
        updtBars(calef_Lvl);
    }
});

btn_calefMenos.addEventListener('touchstart', () => {
    tempProgInterval = setInterval(() => {
        if (calef_Lvl > 4 && !(btnsCtrl_potCalefDisabled)) {
            calef_Lvl -= 5;

            updtBars(calef_Lvl);
        }
    }, 200);
});

btn_calefMenos.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
});

btn_calefAceptar.addEventListener('click', () => {
    val_potCalef.classList.remove('parpadeo');

    btnsCtrl_potCalefDisabled = true;

    btn_calefMenos.disabled = btnsCtrl_potCalefDisabled;
    btn_calefAceptar.disabled = btnsCtrl_potCalefDisabled;
    btn_calefMas.disabled = btnsCtrl_potCalefDisabled;

    setPot_prog(calef_Lvl);
});

btn_calefMas.addEventListener('click', () => {
    if (calef_Lvl < maxLvl) {
        calef_Lvl += 1;
        updtBars(calef_Lvl);
    }
});

btn_calefMas.addEventListener('touchstart', () => {
    tempProgInterval = setInterval(() => {
        if (calef_Lvl < 94 && !(btnsCtrl_potCalefDisabled)) {
            calef_Lvl += 5;

            updtBars(calef_Lvl);
        }
    }, 200);
});

btn_calefMas.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
});

//{{{{{{{{{{{{{{{{{{{{{{ Panel Lateral }}}}}}}}}}}}}}}}}}}}}//
    //[[[[[[[[[[[[[[[[[[[[ BÁSCULA ]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('bascula').addEventListener('click', () => {
    openModule('mdcnt-bascula', 'btn-close-Scale');
    document.getElementById('hc-scale').style.display = 'flex';
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-Scale').addEventListener('click', () => {
    closeModule('mdcnt-bascula', 'btn-close-Scale');
    document.getElementById('hc-scale').style.display = 'none';
});
        //((((((((((((((( Controles ))))))))))))))))//
document.getElementById('btn-pesar').addEventListener('click', () => {
    ctrls_Bascula('pesar');
});

document.getElementById('btn-tara').addEventListener('click', () => {
    ctrls_Bascula('tarar');
});

document.getElementById('btn-calib').addEventListener('click', () => {
    ctrls_Bascula('calib');
});

    //[[[[[[[[[[[[[[[[[[[ CRONOMETRO ]]]]]]]]]]]]]]]]]]]//
document.getElementById('timer').addEventListener('click', () => {
    openModule('mdcnt-timer', 'btn-close-Timer');
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-Timer').addEventListener('click', () => {
    closeModule('mdcnt-timer', 'btn-close-Timer');
});
        //((((((((((((((( Controles ))))))))))))))))//
btn_cronStartPause.addEventListener('click', () => {
    if (btn_cronStartPause.textContent == "Iniciar") {
        ctrls_CronmApgar('start');
        btn_cronStartPause.textContent = "Pausa";
        btn_cronClear.disabled = true;
    } else if (btn_cronStartPause.textContent == "Pausa") {
        ctrls_CronmApgar('pause');
        btn_cronStartPause.textContent = "Iniciar";
        btn_cronClear.disabled = false;
    }

    btn_cronStartPause.classList.add('btn-snsr-lbl');
});

btn_cronClear.addEventListener('click', () => {
    ctrls_CronmApgar('clear');
});

    //[[[[[[[[[[[[[[[[[[ FOTOTERAPIA ]]]]]]]]]]]]]]]]]]]//
document.getElementById('photo').addEventListener('click', () => {
    openModule('mdcnt-photo', 'btn-close-Photo');

    document.getElementById('sc-photo').style.display = 'none';
    document.getElementById('hc-photo').style.display = 'block'

    document.querySelector('.bckgnd-btns').classList.add('lock-scroll');
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-Photo').addEventListener('click', () => {
    closeModule('mdcnt-photo', 'btn-close-Photo');

    document.getElementById('sc-photo').style.display = 'block';
    document.getElementById('hc-photo').style.display = 'none';

    document.querySelector('.bckgnd-btns').classList.remove('lock-scroll');
});
        //((((((((((((((( Controles ))))))))))))))))//
sld_Photo.addEventListener("input", () => {
    setIntensVal(sld_Photo.value, sld_Photo.value);
    sld_Exam.value = sld_Photo.value;
});

sld_Exam.addEventListener("input", () => {
    if(sld_Exam.value != 0)
        sld_Photo.disabled = false;
    else{
        sld_Photo.value = 0;
        sld_Photo.disabled = true;
        setIntensVal(0, sld_Exam.value);
    }

    setIntensVal(sld_Photo.value, sld_Exam.value);
});

    //[[[[[[[[[[[[[[[[[[[[ HUMEDAD ]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('humed').addEventListener('click', () => {
    openModule('mdcnt-humed', 'btn-close-Humed');
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-Humed').addEventListener('click', () => {
    closeModule('mdcnt-humed', 'btn-close-Humed');
});

    //[[[[[[[[[[[[[ SATURACIÓN DE OXIGENO ]]]]]]]]]]]]]]//
document.getElementById('satOx').addEventListener('click', () => {
    openModule('mdcnt-satOx', 'btn-close-satOx');
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-satOx').addEventListener('click', () => {
    closeModule('mdcnt-satOx', 'btn-close-satOx');
});

    //[[[[[[[[[[[[[[[[ ALTURA VARIABLE ]]]]]]]]]]]]]]]]]//
document.getElementById('altVar').addEventListener('click', () => {
    openModule('mdcnt-altVar', 'btn-close-altVar');
});
        //((((((((((((((((( Close ))))))))))))))))))//
document.getElementById('btn-close-altVar').addEventListener('click', () => {
    closeModule('mdcnt-altVar', 'btn-close-altVar');
});
        //((((((((((((((( Controles ))))))))))))))))//
/* Altura Equipo */
// Subir
btn_Up.addEventListener('touchstart', () => {
    ctrl_AdjPos('up-prsd');
});
btn_Up.addEventListener('touchend', () => {
    ctrl_AdjPos('up-rlsd');
});
// Bajar
btn_Down.addEventListener('touchstart', () => {
    ctrl_AdjPos('dwn-prsd');
});
btn_Down.addEventListener('touchend', () => {
    ctrl_AdjPos('dwn-rlsd');
});

/* Inclinación Bacinete */
// Izquierda
btn_Left.addEventListener('touchstart', () => {
    ctrl_AdjPos('incLft-prsd');
});
btn_Left.addEventListener('touchend', () => {
    ctrl_AdjPos('incLft-rlsd');
});
// Derecha
btn_Right.addEventListener('touchstart', () => {
    ctrl_AdjPos('incRgt-prsd');
});
btn_Right.addEventListener('touchend', () => {
    ctrl_AdjPos('incRgt-rlsd');
});

/* Altura Lampara */
// Subir
btn_L_Up.addEventListener('touchstart', () => {
    ctrl_AdjPos('upLmp-prsd');
});
btn_L_Up.addEventListener('touchend', () => {
    ctrl_AdjPos('upLmp-rlsd');
});
// Bajar
btn_L_Down.addEventListener('touchstart', () => {
    ctrl_AdjPos('dwnLmp-prsd');
});
btn_L_Down.addEventListener('touchend', () => {
    ctrl_AdjPos('dwnLmp-rlsd');
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<< Footer >>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
document.addEventListener('DOMContentLoaded', () => {
    enablePacienteEditing();
});

document.getElementById('btn-tendencias').addEventListener('click', () => {
    footer.classList.toggle('expandido');

    if (footer.classList[1] == 'expandido') {
        document.getElementById('graf-tendencias').classList.add('active');
        document.getElementById('graf-tendencias').classList.remove('inactive');
    } else {
        document.getElementById('graf-tendencias').classList.add('inactive');
        document.getElementById('graf-tendencias').classList.remove('active');
    }
});

document.getElementById('date-clk').addEventListener('click', () => {
    if (cFW >= 10) {
        shwAlert(`Versión de FW \n v${vFW} \n Fecha de Liberación: ${releaseDate}`, "success", 2);
        cFW = 0;
    } else {
        cFW++;
    }
});