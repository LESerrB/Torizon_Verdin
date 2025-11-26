import { 
    enablePacienteEditing,
    activarModo
} from './ui.js';

// Definición de Botones
const btn_Bebe = document.getElementById('modo-bebe');
const btn_Manual = document.getElementById('modo-manual');

const val_TempProg = document.getElementById('tempProg-val');
const val_potCalef = document.getElementById('potCalef-val');

const btn_tmpPrgMenos = document.getElementById('tempProgMenos');
const btn_tmpPrgAcept = document.getElementById('tempProgAceptar');
const btn_tmpPrgMas = document.getElementById('tempProgMas');

const btn_calefMenos = document.getElementById('calefMenos');
const btn_calefAceptar = document.getElementById('calefAceptar');
const btn_calefMas = document.getElementById('calefMas');

// Estado Inicial de Botones
// Temperatura Programada
btn_tmpPrgMenos.disabled = true;
btn_tmpPrgAcept.disabled = true;
btn_tmpPrgMas.disabled = true;
// Potencia del Calefactor
btn_calefMenos.disabled = true;
btn_calefAceptar.disabled = true;
btn_calefMas.disabled = true;

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<< Header >>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
document.getElementById('btn-mode').addEventListener('click', () => {
    console.log("Cambio Modo Operacion");
});

document.getElementById('btn-alarm').addEventListener('click', () => {
    console.log("Alarmas");
});

document.getElementById('btn-lock').addEventListener('click', () => {
    console.log("Bloqueo/Desbloqueo");
});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<< Body >>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

//{{{{{{{{{{{{{{{{{{{{{ Panel Principal }}}}}}}}}}}}}}}}}}}}//
//[[[[[[[[[[[[[[[[[[[[[[[[ MODO BEBÉ ]]]]]]]]]]]]]]]]]]]]]]]//
btn_Bebe.addEventListener('click', () => {
    activarModo('bebe');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.remove('parpadeo');
});

val_TempProg.addEventListener('click', () => {
    console.log('Programar Temperatura');

    val_TempProg.classList.add('parpadeo');

    btn_tmpPrgMenos.disabled = false;
    btn_tmpPrgAcept.disabled = false;
    btn_tmpPrgMas.disabled = false;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;
});
//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
btn_tmpPrgMenos.addEventListener('click', () => {
    console.log('tempProgMenos');
});

btn_tmpPrgAcept.addEventListener('click', () => {
    val_TempProg.classList.remove('parpadeo');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;
});

btn_tmpPrgMas.addEventListener('click', () => {
    console.log('tempProgMas');
});

//[[[[[[[[[[[[[[[[[[[ MODO MANUAL / AIRE ]]]]]]]]]]]]]]]]]]]//
btn_Manual.addEventListener('click', () => {
    activarModo('manual');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;

    val_TempProg.classList.remove('parpadeo');
    val_potCalef.classList.remove('parpadeo');
});

val_potCalef.addEventListener('click', () => {
    console.log('Potencia Calefactor');

    val_potCalef.classList.add('parpadeo');

    btn_tmpPrgMenos.disabled = true;
    btn_tmpPrgAcept.disabled = true;
    btn_tmpPrgMas.disabled = true;

    btn_calefMenos.disabled = false;
    btn_calefAceptar.disabled = false;
    btn_calefMas.disabled = false;
});
//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
btn_calefMenos.addEventListener('click', () => {
    console.log('calefMenos');
});

btn_calefAceptar.addEventListener('click', () => {
    val_potCalef.classList.remove('parpadeo');

    btn_calefMenos.disabled = true;
    btn_calefAceptar.disabled = true;
    btn_calefMas.disabled = true;
});

btn_calefMas.addEventListener('click', () => {
    console.log('calefMas');
});

//{{{{{{{{{{{{{{{{{{{{{{ Panel Lateral }}}}}}}}}}}}}}}}}}}}}//
//[[[[[[[[[[[[[[[[[[[[[[[[ BÁSCULA ]]]]]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('bascula').addEventListener('click', () => {
    console.log('bascula');
});

//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
document.getElementById('btn-pesar').addEventListener('click', () => {
    console.log('btn-pesar');
});

document.getElementById('btn-tara').addEventListener('click', () => {
    console.log('btn-tara');
});

// document.getElementById('btn-calib').addEventListener('click', () => {
//     console.log('btn-calib');
// });

//[[[[[[[[[[[[[[[[[[[[[[[ CRONOMETRO ]]]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('timer').addEventListener('click', () => {
    console.log('timer');
});

//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
document.getElementById('btn-start').addEventListener('click', () => {
    console.log('btn-start');
});

document.getElementById('btn-stop').addEventListener('click', () => {
    console.log('btn-stop');
});

//[[[[[[[[[[[[[[[[[[[[[[ FOTOTERAPIA ]]]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('photo').addEventListener('click', () => {
    console.log('photo');
});

//[[[[[[[[[[[[[[[[[[[[[[[[ HUMEDAD ]]]]]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('humed').addEventListener('click', () => {
    console.log('humed');
});

//[[[[[[[[[[[[[[[[[ SATURACIÓN DE OXIGENO ]]]]]]]]]]]]]]]]]]//
document.getElementById('satOx').addEventListener('click', () => {
    console.log('satOx');
});

//[[[[[[[[[[[[[[[[[[[[ ALTURA VARIABLE ]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('altVar').addEventListener('click', () => {
    console.log('altVar');
});

//((((((((((((((((((((( Altura Equipo ))))))))))))))))))))))//
document.getElementById('btn-up').addEventListener('click', () => {
    console.log('btn-up');
});

document.getElementById('btn-dwn').addEventListener('click', () => {
    console.log('btn-dwn');
});

//(((((((((((((((((( Inclinación Bacinete ))))))))))))))))))//
document.getElementById('btn-incLft').addEventListener('click', () => {
    console.log('btn-incLft');
});

document.getElementById('btn-incRgt').addEventListener('click', () => {
    console.log('btn-incRgt');
});

//((((((((((((((((((((( Altura Lampara )))))))))))))))))))))//
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