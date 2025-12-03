//~~~~~~~~~~~~~~~~ Definición de Etiquetas ~~~~~~~~~~~~~~~~//
const lbl_tempSonda = document.getElementById('temp');
const lbl_tempSondaAux = document.getElementById('sondaAux');

const lbl_basculaVal = document.getElementById('peso');

const lbl_cronApgar = document.getElementById('cronApgar');

const lbl_tmrPhoto_P = document.getElementById('timer-value-P');
const lbl_tmrPhoto_S = document.getElementById('timer-value-S');

const lbl_valHR = document.getElementById('valHR');
const lbl_valsatOx = document.getElementById('valsatOx');

const lbl_valPhoto_P = document.getElementById("photo-value-P");
const lbl_valPhoto_S = document.getElementById("photo-value-S");
const lbl_val_LExam = document.getElementById("exam-value");

    //[[[[[[[[[[[[[[[[[[ TEMPERATURA ]]]]]]]]]]]]]]]]]]]//
/* Envío de valor de Temperatura Programada */
export function setTemp_prog(temp){
    console.log("Nueva temperatura:", temp.toFixed(1));
};

function get_TempSonda(){
    const tempSonda = 36.0;

    return tempSonda;
};

function get_TempSondaAux(){
    const tempSondaAux = 37.0;

    return tempSondaAux;
};

    //[[[[[[[[[[[[[[[[[[[ CALEFACTOR ]]]]]]]]]]]]]]]]]]]//
/* Envío de valor de Potencia de Calefactor */
export function setPot_prog(pot){
    console.log("Nueva potencia:", pot);
};

    //[[[[[[[[[[[[[[[[[[[[ BÁSCULA ]]]]]]]]]]]]]]]]]]]]]//
export function ctrls_Bascula(accion){
    const valPesoBebe = Array.from(lbl_basculaVal.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    const pesoBebe = 2.5;
    const tara = 0.0

    if (accion == 'pesar') {
        valPesoBebe.nodeValue = `${pesoBebe.toFixed(2).toString().padStart(2, '0')}`;
    } else if (accion == ('tarar' || 'calib')){
        valPesoBebe.nodeValue = `${tara.toFixed(2).toString().padStart(2, '0')}`;
    }
};

    //[[[[[[[[[[[[[[[[[[[ CRONOMETRO ]]]]]]]]]]]]]]]]]]]//
export function ctrls_CronmApgar(accion){
    const cronApgar = Array.from(lbl_cronApgar.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    if (accion == 'start') {
        cronApgar.nodeValue = "00:01";
    } else if (accion == 'clear'){
        cronApgar.nodeValue = "00:00";
    }
};

    //[[[[[[[[[[[[[[[[[[ FOTOTERAPIA ]]]]]]]]]]]]]]]]]]]//
export function setIntensVal(valFot, val_LExam){
    const val_Photo_P = Array.from(lbl_valPhoto_P.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const val_Photo_M = Array.from(lbl_valPhoto_S.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const val_LzExam = Array.from(lbl_val_LExam.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    val_Photo_P.nodeValue = valFot;
    val_Photo_M.nodeValue = valFot;
    val_LzExam.nodeValue = val_LExam;

    if (valFot != 0) {
        lbl_tmrPhoto_P.textContent = '00:01';
        lbl_tmrPhoto_S.textContent = '00:01';
    } else {
        lbl_tmrPhoto_P.textContent = '00:00';
        lbl_tmrPhoto_S.textContent = '00:00';
    }
};

    //[[[[[[[[[[[[[[[[[[[[ HUMEDAD ]]]]]]]]]]]]]]]]]]]]]//
function get_HumSensor(){
    const val_HR = 87.0;

    return val_HR;
};

    //[[[[[[[[[[[[[ SATURACIÓN DE OXIGENO ]]]]]]]]]]]]]]//
function get_SatOxSensor(){
    const val_satOx = 35.0;

    return val_satOx;
};

    //[[[[[[[[[[[[[[[[ ALTURA VARIABLE ]]]]]]]]]]]]]]]]]//
export function ctrl_AdjPos(accion){
    console.log("Ajuste de posición:", accion);
};

    //[[[[[[[[[[[[[[[[[[[[[  RELOJ ]]]]]]]]]]]]]]]]]]]]]//
function date(){
    const ahora = new Date();
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const DD = String(ahora.getDate()).padStart(2, '0');
    const MMM = meses[ahora.getMonth()];
    const AAAA = ahora.getFullYear();
    
    const HH = String(ahora.getHours()).padStart(2, '0');
    const mm = String(ahora.getMinutes()).padStart(2, '0');
    const ss = String(ahora.getSeconds()).padStart(2, '0');

    document.getElementById('date-clk').textContent = `${DD}/${MMM}/${AAAA} ${HH}:${mm}:${ss}`;
};

export function updateSensors(){
    const valTempNode = Array.from(lbl_tempSonda.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const valTempAuxNode = Array.from(lbl_tempSondaAux.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    const valHR = Array.from(lbl_valHR.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const valsatOx = Array.from(lbl_valsatOx.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    
    date();

    valTempNode.nodeValue = `${get_TempSonda().toFixed(1)}`;
    valTempAuxNode.nodeValue = `${get_TempSondaAux().toFixed(1)}`;

    valHR.nodeValue = `${get_HumSensor().toFixed(1)}`;
    valsatOx.nodeValue = `${get_SatOxSensor().toFixed(1)}`;
};