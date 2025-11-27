import { 
    enablePacienteEditing,
    actvModo,
    updtBars,
    updtTempProg
} from './ui.js';

//~~~~~~~~~~~~~~~~ Definición de Variables ~~~~~~~~~~~~~~~~//
let calef_Lvl = 100;
const maxLvl = 100;

let tempProg_Lvl = 34.0;
let sobreGiro = false;

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

//~~~~~~~~~~~~~~~~~~~~~ Estado Inicial ~~~~~~~~~~~~~~~~~~~~~//
updtBars(calef_Lvl);
updtTempProg(tempProg_Lvl);

// Temperatura Programada
btn_tmpPrgMenos.disabled = true;
btn_tmpPrgAcept.disabled = true;
btn_tmpPrgMas.disabled = true;
btn_sobreGiro.disabled = true;

btn_sobreGiro.style.display = 'none'

// Potencia del Calefactor
btn_calefMenos.disabled = true;
btn_calefAceptar.disabled = true;
btn_calefMas.disabled = true;

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
    console.log("Bloqueo/Desbloqueo");
});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<< Body >>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

//{{{{{{{{{{{{{{{{{{{{{ Panel Principal }}}}}}}}}}}}}}}}}}}}//
    //[[[[[[[[[[[[[[[[[[[[ MODO BEBÉ ]]]]]]]]]]]]]]]]]]]//
btn_Bebe.addEventListener('click', () => {
    actvModo('bebe');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;
    btn_sobreGiro.disabled = true;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.remove('parpadeo');

    updtBars(calef_Lvl);
    updtTempProg(tempProg_Lvl);
});

val_TempProg.addEventListener('click', () => {
    val_TempProg.classList.add('parpadeo');

    btn_tmpPrgMenos.disabled = false;
    btn_tmpPrgAcept.disabled = false;
    btn_tmpPrgMas.disabled = false;
    btn_sobreGiro.disabled = false;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;
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

btn_tmpPrgAcept.addEventListener('click', () => {
    val_TempProg.classList.remove('parpadeo');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;
    btn_sobreGiro.disabled = true;
});

btn_tmpPrgMas.addEventListener('click', () => {
    if (tempProg_Lvl < 37.0) {
        tempProg_Lvl += 0.1;
    }

    if (sobreGiro) {
        if (tempProg_Lvl < 38.0) {
            tempProg_Lvl += 0.1;
        }
    }

    updtTempProg(tempProg_Lvl);
});

btn_sobreGiro.addEventListener('click', () => {
    sobreGiro = !(sobreGiro);

    if(!sobreGiro){
        tempProg_Lvl = parseFloat(37.0).toFixed(1);
        updtTempProg(tempProg_Lvl);
    }

    // Alternar clase del botón
    btn_sobreGiro.classList.toggle('btn-sensor-pressed');
    // btn_sobreGiro.classList.toggle('active');

    // Alternar clase del label
    btn_sobreGiro_lbl.classList.toggle('btn-sensor-lbl-pressed');
    // btn_sobreGiro_lbl.classList.toggle('active');
});
    //[[[[[[[[[[[[[[[ MODO MANUAL / AIRE ]]]]]]]]]]]]]]]//
btn_Manual.addEventListener('click', () => {
    actvModo('manual');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;
    btn_sobreGiro.disabled = true;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.remove('parpadeo');

    updtBars(calef_Lvl);
    updtTempProg(tempProg_Lvl);
});

val_potCalef.addEventListener('click', () => {
    val_potCalef.classList.add('parpadeo');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;
    btn_sobreGiro.disabled = true;

    btn_calefMenos.disabled = false;
    btn_calefAceptar.disabled = false;
    btn_calefMas.disabled = false;
});
        //((((((((((((((( Controles ))))))))))))))))//
btn_calefMenos.addEventListener('click', () => {
    if (calef_Lvl > 0) {
        calef_Lvl -= 1;
        updtBars(calef_Lvl);
    }
});

btn_calefAceptar.addEventListener('click', () => {
    val_potCalef.classList.remove('parpadeo');

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;
});

btn_calefMas.addEventListener('click', () => {
    if (calef_Lvl < maxLvl) {
        calef_Lvl += 1;
        updtBars(calef_Lvl);
    }
});

//{{{{{{{{{{{{{{{{{{{{{{ Panel Lateral }}}}}}}}}}}}}}}}}}}}}//
    //[[[[[[[[[[[[[[[[[[[[ BÁSCULA ]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('bascula').addEventListener('click', () => {
    console.log('bascula');
});

        //((((((((((((((( Controles ))))))))))))))))//
document.getElementById('btn-pesar').addEventListener('click', () => {
    console.log('btn-pesar');
});

document.getElementById('btn-tara').addEventListener('click', () => {
    console.log('btn-tara');
});

// document.getElementById('btn-calib').addEventListener('click', () => {
//     console.log('btn-calib');
// });

    //[[[[[[[[[[[[[[[[[[[ CRONOMETRO ]]]]]]]]]]]]]]]]]]]//
document.getElementById('timer').addEventListener('click', () => {
    console.log('timer');
});

        //((((((((((((((( Controles ))))))))))))))))//
document.getElementById('btn-start').addEventListener('click', () => {
    console.log('btn-start');
});

document.getElementById('btn-stop').addEventListener('click', () => {
    console.log('btn-stop');
});

    //[[[[[[[[[[[[[[[[[[ FOTOTERAPIA ]]]]]]]]]]]]]]]]]]]//
document.getElementById('photo').addEventListener('click', () => {
    console.log('photo');
});

    //[[[[[[[[[[[[[[[[[[[[ HUMEDAD ]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('humed').addEventListener('click', () => {
    console.log('humed');
});

    //[[[[[[[[[[[[[ SATURACIÓN DE OXIGENO ]]]]]]]]]]]]]]//
document.getElementById('satOx').addEventListener('click', () => {
    console.log('satOx');
});

    //[[[[[[[[[[[[[[[[ ALTURA VARIABLE ]]]]]]]]]]]]]]]]]//
document.getElementById('altVar').addEventListener('click', () => {
    console.log('altVar');
});
        //((((((((((((((( Controles ))))))))))))))))//
// Altura Equipo 
document.getElementById('btn-up').addEventListener('click', () => {
    console.log('btn-up');
});

document.getElementById('btn-dwn').addEventListener('click', () => {
    console.log('btn-dwn');
});

// Inclinación Bacinete
document.getElementById('btn-incLft').addEventListener('click', () => {
    console.log('btn-incLft');
});

document.getElementById('btn-incRgt').addEventListener('click', () => {
    console.log('btn-incRgt');
});

// Altura Lampara
document.getElementById('btn-upLmp').addEventListener('click', () => {
    console.log('btn-upLmp');
});

document.getElementById('btn-dwnLmp').addEventListener('click', () => {
    console.log('btn-dwnLmp');
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