import { 
    enablePacienteEditing,
    activarModo
} from './ui.js';

//<<<<<<<<<<<<<<<<<<<<<<<<< Header >>>>>>>>>>>>>>>>>>>>>>>>>//
document.getElementById('btn-mode').addEventListener('click', () => {
    console.log("Cambio Modo Operacion");
});

document.getElementById('btn-alarm').addEventListener('click', () => {
    console.log("Alarmas");
});

document.getElementById('btn-lock').addEventListener('click', () => {
    console.log("Bloqueo/Desbloqueo");
});

//<<<<<<<<<<<<<<<<<<<<<<<<<< Body >>>>>>>>>>>>>>>>>>>>>>>>>>//
//{{{{{{{{{{{{{{{{{{{{{ Panel Principal }}}}}}}}}}}}}}}}}}}}//
//[[[[[[[[[[[[[[[[[[[[[[[[ MODO BEBÉ ]]]]]]]]]]]]]]]]]]]]]]]//
document.getElementById('modo-bebe').addEventListener('click', () => {
    activarModo('bebe');
});

document.getElementById('enProgTemp').addEventListener('click', () => {
    console.log('Programar Temperatura');
});
//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
document.getElementById('tempProgMenos').addEventListener('click', () => {
    console.log('tempProgMenos');
});

document.getElementById('tempProgAceptar').addEventListener('click', () => {
    console.log('tempProgAceptar');
});

document.getElementById('tempProgMas').addEventListener('click', () => {
    console.log('tempProgMas');
});

//[[[[[[[[[[[[[[[[[[[ Modo Manual / Aire ]]]]]]]]]]]]]]]]]]]//
document.getElementById('modo-manual').addEventListener('click', () => {
    activarModo('manual');
});

//((((((((((((((((((((((( Controles ))))))))))))))))))))))))//
document.getElementById('calefMenos').addEventListener('click', () => {
    console.log('calefMenos');
});

document.getElementById('calefAceptar').addEventListener('click', () => {
    console.log('calefAceptar');
});

document.getElementById('calefMas').addEventListener('click', () => {
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

//<<<<<<<<<<<<<<<<<<<<<<<<< Footer >>>>>>>>>>>>>>>>>>>>>>>>>//
document.addEventListener('DOMContentLoaded', () => {
    enablePacienteEditing();
});

document.getElementById('tendencias').addEventListener('click', () => {
    console.log("Tendencias");
});