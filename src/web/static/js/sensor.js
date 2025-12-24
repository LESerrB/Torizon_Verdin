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

//==================== Botones Grafica ====================//
const durationSelect = document.getElementById('duration-select');
const intervalSelect = document.getElementById('interval-select');

const startRecordingBtn = document.getElementById('start-recording-btn');
const stopRecordingBtn = document.getElementById('stop-recording-btn');
const clearChartBtn = document.getElementById('clear-chart-btn');

//~~~~~~~~~~~~~~ Inicialización de Variables ~~~~~~~~~~~~~~//
let cronIntervalApgar = null;
let cronIntervalFot = null;

let segTotApgar = 0;
let segTotFot = 0;

const temperatureChartCanvas = document.getElementById('temperatureChart');

let temperatureChart;   // Variable para la instancia del gráfico
// let recordingInterval;  // Variable para el ID del setInterval

let intervalDatos = null;
// let intervalId = null;

let lstDtTemp = null;
let inTime = null;

let allCollectedHistoricalData = [];

    //[[[[[[[[[[[[[[[[[[ TEMPERATURA ]]]]]]]]]]]]]]]]]]]//
/* Envío de valor de Temperatura Programada */
export async function setTemp_prog(temp, prev_temp){
    const nTempProg = temp.toFixed(1);
    const aTempProg = prev_temp.toFixed(1);

    try {
        const response = await fetch('/api/setTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                tempProg: nTempProg
            })
        });

        if (response.status == 200) {
            return nTempProg;
        } else {
            return aTempProg;
        }
    } catch (error) {
        console.log("Error al configurar la Temperatura Programada");
    }
};
/* Obtiene las temperaturas de la sonda de piel principal
 * y la auxiliar */
async function get_TempSonda(){
    const valTempNode = Array.from(lbl_tempSonda.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const valTempAuxNode = Array.from(lbl_tempSondaAux.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    try {
        const response = await fetch('/api/getTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const temperaturas = await response.json();

        const tempPiel = (temperaturas && typeof temperaturas.tempSondaPiel === 'number') ? temperaturas.tempSondaPiel : null;
        const tempAux = (temperaturas && typeof temperaturas.tempSondaAux === 'number') ? temperaturas.tempSondaAux : null;

        lstDtTemp = tempPiel !== null ? tempPiel.toFixed(1) : null;

        if (response.status == 200) {
            // console.log("Lectura Sondas:", temperaturas.status, "Código de Error:", response.status);

            const mainDisplay = tempPiel !== null ? lstDtTemp : "--.-";
            const auxDisplay = tempAux !== null ? tempAux.toFixed(1) : "--.-";

            if (valTempNode) valTempNode.nodeValue = `${mainDisplay}`;
            else lbl_tempSonda.textContent = `${mainDisplay}`;

            if (valTempAuxNode) valTempAuxNode.nodeValue = `${auxDisplay}`;
            else lbl_tempSondaAux.textContent = `${auxDisplay}`;
        } else if (response.status == 206){
            // console.log("Error en Sonda Aux:", temperaturas.status, "Código de Error:", response.status);

            const mainDisplay = tempPiel !== null ? tempPiel.toFixed(1) : "--.-";
            const auxDisplay = "--.-";

            if (valTempNode) valTempNode.nodeValue = `${mainDisplay}`;
            else lbl_tempSonda.textContent = `${mainDisplay}`;

            if (valTempAuxNode) valTempAuxNode.nodeValue = auxDisplay;
            else lbl_tempSondaAux.textContent = auxDisplay;
        }
        else{
            // console.log("ERROR CRÍTICO DE LECTURA DE TEMPERATUA", temperaturas.status, "Código de Error:", response.status);

            const dash = "--.-";
            if (valTempNode) valTempNode.nodeValue = dash;
            else lbl_tempSonda.textContent = dash;

            if (valTempAuxNode) valTempAuxNode.nodeValue = dash;
            else lbl_tempSondaAux.textContent = dash;
        }
    } catch (error) {
        console.log("Error obteniendo la temperatura de las sondas:", error);
    }
};

    //[[[[[[[[[[[[[[[[[[[ CALEFACTOR ]]]]]]]]]]]]]]]]]]]//
/* Envío de valor de Potencia de Calefactor */
export async function setPot_prog(potCalef){
    const response = await fetch('/api/potCalef', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            potCalef: potCalef
        })
    });
};

    //[[[[[[[[[[[[[[[[[[[[ BÁSCULA ]]]]]]]]]]]]]]]]]]]]]//
export async function ctrls_Bascula(accion){
    let pesoBebe;

    const valPesoBebe = Array.from(lbl_basculaVal.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    if (accion == 'pesar') {
        const response = await fetch('/api/bascPeso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        pesoBebe = await response.json();

        if (response.status == 200) {
            valPesoBebe.nodeValue = `${pesoBebe.peso.toFixed(2).toString().padStart(2, '0')}`;
        } else {
            valPesoBebe.nodeValue = "-.--";
        }
    } else if (accion == 'tarar'){
        const response = await fetch('/api/bascTar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        pesoBebe = await response.json();

        if (response.status == 200) {
            valPesoBebe.nodeValue = `${pesoBebe.peso.toFixed(2).toString().padStart(2, '0')}`;
        } else {
            valPesoBebe.nodeValue = "-.--";
        }
    } else if (accion == 'calib'){
        const response = await fetch('/api/bascCalib', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        pesoBebe = await response.json();

        if (response.status == 200) {
            valPesoBebe.nodeValue = `${pesoBebe.peso.toFixed(2).toString().padStart(2, '0')}`;
        } else {
            valPesoBebe.nodeValue = "-.--";
        }
    }
};

    //[[[[[[[[[[[[[[[[[[[ CRONOMETRO ]]]]]]]]]]]]]]]]]]]//
export function ctrls_CronmApgar(accion){
    if (accion == 'start') {
        if (segTotApgar == 0)
            lbl_cronApgar.textContent = "00:00";

        cronIntervalApgar = setInterval(() => {
            segTotApgar++;

            const minutos = String(Math.floor(segTotApgar / 60)).padStart(2, '0');
            const segundos = String(segTotApgar % 60).padStart(2, '0');

            lbl_cronApgar.textContent = `${minutos}:${segundos}`;
        }, 1000);
    } else if (accion == 'pause'){
        clearInterval(cronIntervalApgar);
        cronIntervalApgar = null;
    } else if (accion == 'clear'){
        segTotApgar = 0;
        lbl_cronApgar.textContent = "mm:ss";
    }
};

    //[[[[[[[[[[[[[[[[[[ FOTOTERAPIA ]]]]]]]]]]]]]]]]]]]//
export async function setIntensVal(valFot, val_LExam){
    const val_Photo_P = Array.from(lbl_valPhoto_P.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const val_Photo_M = Array.from(lbl_valPhoto_S.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const val_LzExam = Array.from(lbl_val_LExam.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    val_Photo_P.nodeValue = valFot;
    val_Photo_M.nodeValue = valFot;
    val_LzExam.nodeValue = val_LExam;

    try {
        const response = await fetch('/api/nvlFototerapia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nvlFototerapia: valFot,
                nvlExam: val_LExam
            })
        });

        if (valFot != 0) {
            if (cronIntervalFot == null) {
                if (segTotFot == 0) {
                    lbl_tmrPhoto_P.textContent = "HH:mm";
                    lbl_tmrPhoto_S.textContent = "00:00";
                }

                cronIntervalFot = setInterval(() => {
                    segTotFot++;

                    const minutos = String(Math.floor(segTotFot / 60)).padStart(2, '0');
                    const segundos = String(segTotFot % 60).padStart(2, '0');

                    lbl_tmrPhoto_P.textContent = `${minutos}:${segundos}`;
                    lbl_tmrPhoto_S.textContent = `${minutos}:${segundos}`;
                }, 60*1000);
            }
        } else {
            if (cronIntervalFot != null) {
                clearInterval(cronIntervalFot);
                cronIntervalFot = null;
            }

            segTotFot = 0;
            lbl_tmrPhoto_P.textContent = 'HH:mm';
            lbl_tmrPhoto_S.textContent = '00:00';
        }
    } catch (error) {
        console.error('Error al guardar los datos:', error);
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
export async function ctrl_AdjPos(accion){
    try {
        const response = await fetch('/api/ctrlPos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: accion
            })
        });
    } catch (error) {
        console.log("Error:", error);
    }
};

    //[[[[[[[[[[[[[[[[[[[[[ RELOJ ]]]]]]]]]]]]]]]]]]]]]]//
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
    inTime = `${HH}:${mm}`;
};

    //[[[[[[[[[[[[[[[ MODO DE OPERACIÓN ]]]]]]]]]]]]]]]]//
export async function modoOp() {
    try {
        const response = await fetch('/api/chng_modoFunc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log("Error en cambio de modo de Operación:", error);
    }
};

// ####################################################################### //
//                           FUNCIONES DE GRÁFICA                          //
// ####################################################################### //
temperatureChart = new Chart(temperatureChartCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'HH:mm:ss',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                title: {
                    display: true,
                    text: 'Tiempo'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Temperatura (°C)'
                },
                min: 20,
                max: 40
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    }
});

function updateChartDisplay() {
    if (!temperatureChart) return;

    let chartDisplayData = allCollectedHistoricalData;

    if (chartDisplayData.length === 0) {
        temperatureChart.data.labels = [];
        temperatureChart.data.datasets[0].data = [];
        temperatureChart.update();

        return;
    }

    const maxPointsForDisplay = 2000;

    if (chartDisplayData.length > maxPointsForDisplay) {
        const downsampleFactor = Math.ceil(chartDisplayData.length / maxPointsForDisplay);

        chartDisplayData = chartDisplayData.filter((_, index) => index % downsampleFactor === 0);
        console.log(`Datos downsampleados para visualización. Original: ${allCollectedHistoricalData.length}, Mostrando: ${chartDisplayData.length}`);
    }

    temperatureChart.data.labels = chartDisplayData.map(point => point.time);
    temperatureChart.data.datasets[0].data = chartDisplayData.map(point => point.value);
    temperatureChart.update();
};

//////////////////////////// BOTONES DE GRÁFICA /////////////////////////////
durationSelect.addEventListener('change', updateChartDisplay);
intervalSelect.addEventListener('change', updateChartDisplay);

startRecordingBtn.addEventListener('click', () => {
    startGuardarDatos(intervalSelect.value);

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    clearChartBtn.disabled = true;

    durationSelect.disabled = true;
    intervalSelect.disabled = true;
});

stopRecordingBtn.addEventListener('click', () => {
    stopGuardarDatos();

    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    clearChartBtn.disabled = false;

    durationSelect.disabled = false;
    intervalSelect.disabled = false;
});

clearChartBtn.addEventListener('click', async () => {
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;

    durationSelect.disabled = false;
    intervalSelect.disabled = false;

    allCollectedHistoricalData = [];

    updateChartDisplay();
});

////////////////////// TEMPORIZADORES DE GRAFICACIÓN ////////////////////////
function startGuardarDatos(intervalo) {
    if (!intervalDatos) {
        intervalDatos = setInterval(guardarDatos, 1000 * 60 * intervalo);
    }
};

function stopGuardarDatos() {
    if (intervalDatos) {
        clearInterval(intervalDatos);
        intervalDatos = null;
    }
};

async function guardarDatos() {
    const nwDt = {
        time: inTime,
        value: lstDtTemp
    };

    allCollectedHistoricalData.push(nwDt);

    updateChartDisplay();
};
//~~~~~~~~~~~~~~~~~~ Lecturas Periódicas ~~~~~~~~~~~~~~~~~~//
export function updateSensors(){
    const valHR = Array.from(lbl_valHR.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    const valsatOx = Array.from(lbl_valsatOx.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

    date();
    get_TempSonda();

    valHR.nodeValue = `${get_HumSensor().toFixed(1)}`;
    valsatOx.nodeValue = `${get_SatOxSensor().toFixed(1)}`;

    // updateChartDisplay();
};