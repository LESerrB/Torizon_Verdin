import { 
    enablePacienteEditing,
    actvModo,
    updtBars,
    updtTempProg,
    openModule,
    closeModule
} from './ui.js';
    
import { 
    setTemp_prog,
    setPot_prog,
    ctrls_Bascula,
    ctrls_CronmApgar,
    setIntensVal,
    ctrl_AdjPos,
    updateSensors
} from './sensor.js'

//~~~~~~~~~~~~~~~~ Definición de Variables ~~~~~~~~~~~~~~~~//
let calef_Lvl = 100;
const maxLvl = 100;

let tempProg_Lvl = 34.0;
let sobreGiro = false;

let tempProg_ant = 34.0;

let tempProgInterval;
let isHolding = false;

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

//~~~~~~~~~~~~~~~~~~~~~ Estado Inicial ~~~~~~~~~~~~~~~~~~~~//
// Temperatura Programada //
let btnsCtrl_tmpProgDisabled = true;

btn_tmpPrgMenos.disabled = true;
btn_tmpPrgAcept.disabled = true;
btn_tmpPrgMas.disabled = true;
btn_sobreGiro.disabled = true;

btn_sobreGiro.style.display = 'none'

// Potencia del Calefactor //
let btnsCtrl_potCalefDisabled = true;

btn_calefMenos.disabled = true;
btn_calefAceptar.disabled = true;
btn_calefMas.disabled = true;

let intervalId = null;

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
}

function pauseSensor() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<< Header >>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
btn_modoOP.addEventListener('click', () => {
    console.log("Cambio Modo Operacion");
});

btn_Alerta.addEventListener('click', () => {
    console.log("Alarmas");
});

btn_lock.addEventListener('click', () => {
    btn_lock.style.opacity = '1'
    pantallaBase.classList.toggle('no-clicks');

    val_potCalef.classList.add('inactive');
    val_potCalef.classList.remove('active');

    val_TempProg.classList.add('inactive');
    val_TempProg.classList.remove('active');

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

val_TempProg.addEventListener('click', () => {
    val_TempProg.classList.add('parpadeo');
    
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
btn_tmpPrgMenos.addEventListener('click', () => {
    if (tempProg_Lvl > 34.0) {
        tempProg_Lvl -= 0.1

        if (tempProg_Lvl < 37.0) {
            sobreGiro = false;
        }
    }

    updtTempProg(tempProg_Lvl);
});

btn_tmpPrgMenos.addEventListener('touchstart', () => {
    isHolding = true;

    tempProgInterval = setInterval(() => {
        if (tempProg_Lvl >= 34.1 && !(btnsCtrl_tmpProgDisabled)) {
            tempProg_Lvl -= 0.2;

            if (tempProg_Lvl < 37.0) 
                sobreGiro = false;

            updtTempProg(tempProg_Lvl);
        }
    }, 200);
});

btn_tmpPrgMenos.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
    isHolding = false;
});

btn_tmpPrgAcept.addEventListener('click', async () => {
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

btn_tmpPrgMas.addEventListener('click', () => {
    if (tempProg_Lvl < 37.0) {
        tempProg_Lvl += 0.1;
    }

    if (sobreGiro) {
        if (tempProg_Lvl < 38.0)
            tempProg_Lvl += 0.1;
    }

    updtTempProg(tempProg_Lvl);
});

btn_tmpPrgMas.addEventListener('touchstart', () => {
    isHolding = true;

    tempProgInterval = setInterval(() => {
        if (tempProg_Lvl <= 36.9 && !(btnsCtrl_tmpProgDisabled)) {
            tempProg_Lvl += 0.2;

        }

        if (sobreGiro) {
            if (tempProg_Lvl < 38.0 && !(btnsCtrl_tmpProgDisabled))
                tempProg_Lvl += 0.2;
        }

        updtTempProg(tempProg_Lvl);
    }, 200);
});

btn_tmpPrgMas.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
    isHolding = false;
});

btn_sobreGiro.addEventListener('click', () => {
    sobreGiro = !(sobreGiro);

    if(!sobreGiro){
        tempProg_Lvl = parseFloat(37.0).toFixed(1);
        updtTempProg(tempProg_Lvl);

        btn_sobreGiro.classList.add('btn-sensor');
        btn_sobreGiro.classList.remove('btn-sensor-pressed');
    
        btn_sobreGiro_lbl.classList.add('btn-snsr-lbl');
        btn_sobreGiro_lbl.classList.remove('btn-sensor-lbl-pressed');
    }
    else{
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
    isHolding = true;

    tempProgInterval = setInterval(() => {
        if (calef_Lvl > 4 && !(btnsCtrl_potCalefDisabled)) {
            calef_Lvl -= 5;

            updtBars(calef_Lvl);
        }
    }, 200);
});

btn_calefMenos.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
    isHolding = false;
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
    isHolding = true;

    tempProgInterval = setInterval(() => {
        if (calef_Lvl < 94 && !(btnsCtrl_potCalefDisabled)) {
            calef_Lvl += 5;

            updtBars(calef_Lvl);
        }
    }, 200);
});

btn_calefMas.addEventListener('touchend', () => {
    clearInterval(tempProgInterval);
    isHolding = false;
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
    } else if (btn_cronStartPause.textContent == "Pausa") {
        ctrls_CronmApgar('pause');
        btn_cronStartPause.textContent = "Iniciar";
    }

    btn_cronStartPause.classList.add('btn-snsr-lbl');
});

document.getElementById('btn-clear').addEventListener('click', () => {
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
    setIntensVal(sld_Photo.value, sld_Exam.value);
});

sld_Exam.addEventListener("input", () => {
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
// Altura Equipo 
document.getElementById('btn-up').addEventListener('click', () => {
    ctrl_AdjPos('up');
});

document.getElementById('btn-dwn').addEventListener('click', () => {
    ctrl_AdjPos('dwn');
});

// Inclinación Bacinete
document.getElementById('btn-incLft').addEventListener('click', () => {
    ctrl_AdjPos('incLft');
});

document.getElementById('btn-incRgt').addEventListener('click', () => {
    ctrl_AdjPos('incRgt');
});

// Altura Lampara
document.getElementById('btn-upLmp').addEventListener('click', () => {
    ctrl_AdjPos('upLmp');
});

document.getElementById('btn-dwnLmp').addEventListener('click', () => {
    ctrl_AdjPos('dwnLmp');
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<< Footer >>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
document.addEventListener('DOMContentLoaded', () => {
    enablePacienteEditing();
});

document.getElementById('tendencias').addEventListener('click', () => {
    console.log("Tendencias");
});