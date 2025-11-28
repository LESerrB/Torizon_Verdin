//====================== Sección Modo Bebé ======================//
const bebe = document.getElementById('modo-bebe');
//==================== Temperatura Principal ====================//
const temp = document.getElementById('temp');
//==================== Temperatura Programada ===================//
const tempProg_title = document.getElementById('tempProg-lbl');
const tempProg_val = document.getElementById('tempProg-val');
const tempProg = document.getElementById('tempProg');
//============ Botones Control Temperatura Programada ===========//
const btn_tmpPrgMenos = document.getElementById('tempProgMenos');
const btn_tmpPrgAcept = document.getElementById('tempProgAceptar');
const btn_tmpPrgMas = document.getElementById('tempProgMas');
const btn_sobreGiro = document.getElementById('tmpPrgSobregiro');
const btn_tmpPrgMenos_lbl = document.getElementById('tempProgMenos-lbl');
const btn_tmpPrgAcept_lbl = document.getElementById('tempProgAceptar-lbl');
const btn_tmpPrgMas_lbl = document.getElementById('tempProgMas-lbl');
const btn_sobreGiro_lbl = document.getElementById('tmpPrgSobregiro-lbl');
//==================== Temperatura Auxiliar =====================//
const tempAux_title = document.getElementById('tempAux-lbl');
const tempAux_val = document.getElementById('tempAux-val');

//===================== Sección Modo Manual =====================//
const manual = document.getElementById('modo-manual');
//=================== Potencia del Calefactor ===================//
const potCalef = document.getElementById('potCalef-val');
const bars = document.querySelectorAll('.pot-indicators .bar');
const span = potCalef.querySelector('.units');
//================= Botones Control Calefactor ==================//
const btn_calefMenos = document.getElementById('calefMenos');
const btn_calefMenos_lbl = document.getElementById('calefMenos-lbl');
const btn_calefAceptar = document.getElementById('calefAceptar');
const btn_calefAceptar_lbl = document.getElementById('calefAceptar-lbl');
const btn_calefMas = document.getElementById('calefMas');
const btn_calefMas_lbl = document.getElementById('calefMas-lbl');

//&&&&&&&&&&&&&&&&&&& Definición de Variables &&&&&&&&&&&&&&&&&&&//
const stepPerBar = 10;

////////////////////////////// MODOS DE OPERACIÓN //////////////////////////////
/* Cambio de modo entre Bebé y manual */
export function actvModo(modo) {
    if (modo === 'bebe') {
        bebe.classList.add('active');
        bebe.classList.remove('inactive');

        temp.classList.add('active');
        temp.classList.remove('inactive');

        tempProg_title.classList.add('active');
        tempProg_title.classList.remove('inactive');
        tempProg_val.classList.add('active');
        tempProg_val.classList.remove('inactive');

        btn_tmpPrgMenos.classList.add('active');
        btn_tmpPrgMenos_lbl.classList.add('active');
        btn_tmpPrgMenos.classList.remove('inactive');
        btn_tmpPrgMenos_lbl.classList.remove('inactive');
        btn_tmpPrgAcept.classList.add('active');
        btn_tmpPrgAcept_lbl.classList.add('active');
        btn_tmpPrgAcept.classList.remove('inactive');
        btn_tmpPrgAcept_lbl.classList.remove('inactive');
        btn_tmpPrgMas.classList.add('active');
        btn_tmpPrgMas_lbl.classList.add('active');
        btn_tmpPrgMas.classList.remove('inactive');
        btn_tmpPrgMas_lbl.classList.remove('inactive');
        btn_sobreGiro.classList.add('active');
        btn_sobreGiro_lbl.classList.add('active');
        btn_sobreGiro.classList.remove('inactive');
        btn_sobreGiro_lbl.classList.remove('inactive');
        tempAux_title.classList.add('active');
        tempAux_title.classList.remove('inactive');
        tempAux_val.classList.add('active');
        tempAux_val.classList.remove('inactive');

        manual.classList.add('inactive');
        manual.classList.remove('active');

        potCalef.classList.add('inactive');
        potCalef.classList.remove('active');
        btn_calefMenos.classList.add('inactive');
        btn_calefMenos_lbl.classList.add('inactive');
        btn_calefMenos.classList.remove('active');
        btn_calefMenos_lbl.classList.remove('active');
        btn_calefAceptar.classList.add('inactive');
        btn_calefAceptar_lbl.classList.add('inactive');
        btn_calefAceptar.classList.remove('active');
        btn_calefAceptar_lbl.classList.remove('active');
        btn_calefMas.classList.add('inactive');
        btn_calefMas_lbl.classList.add('inactive');
        btn_calefMas.classList.remove('active');
        btn_calefMas_lbl.classList.remove('active');
    } else if (modo === 'manual') {
        bebe.classList.add('inactive');
        bebe.classList.remove('active');

        temp.classList.add('inactive');
        temp.classList.remove('active');
        tempProg_title.classList.add('inactive');
        tempProg_title.classList.remove('active');
        tempProg_val.classList.add('inactive');
        tempProg_val.classList.remove('active');
        btn_tmpPrgMenos.classList.add('inactive');
        btn_tmpPrgMenos_lbl.classList.add('inactive');
        btn_tmpPrgMenos.classList.remove('active');
        btn_tmpPrgMenos_lbl.classList.remove('active');
        btn_tmpPrgAcept.classList.add('inactive');
        btn_tmpPrgAcept_lbl.classList.add('inactive');
        btn_tmpPrgAcept.classList.remove('active');
        btn_tmpPrgAcept_lbl.classList.remove('active');
        btn_tmpPrgMas.classList.add('inactive');
        btn_tmpPrgMas_lbl.classList.add('inactive');
        btn_tmpPrgMas.classList.remove('active');
        btn_tmpPrgMas_lbl.classList.remove('active');
        btn_sobreGiro.classList.add('inactive');
        btn_sobreGiro_lbl.classList.add('inactive');
        btn_sobreGiro.classList.remove('active');
        btn_sobreGiro_lbl.classList.remove('active');
        tempAux_title.classList.add('inactive');
        tempAux_title.classList.remove('active');
        tempAux_val.classList.add('inactive');
        tempAux_val.classList.remove('active');

        manual.classList.add('active');
        manual.classList.remove('inactive');

        potCalef.classList.add('active');
        potCalef.classList.remove('inactive');
        btn_calefMenos.classList.add('active');
        btn_calefMenos_lbl.classList.add('active');
        btn_calefMenos.classList.remove('inactive');
        btn_calefMenos_lbl.classList.remove('inactive');
        btn_calefAceptar.classList.add('active');
        btn_calefAceptar_lbl.classList.add('active');
        btn_calefAceptar.classList.remove('inactive');
        btn_calefAceptar_lbl.classList.remove('inactive');
        btn_calefMas.classList.add('active');
        btn_calefMas_lbl.classList.add('active');
        btn_calefMas.classList.remove('inactive');
        btn_calefMas_lbl.classList.remove('inactive');
    }
};

/* Indicador de barras de la potencia del calefactor y valor porcentual */
export function updtBars(calef_Lvl) {
    const activeBars = Math.floor(calef_Lvl / stepPerBar);

    bars.forEach((bar, index) => {
        if (manual.classList.contains("active")) {
            bar.classList.remove('inactive');

            if (index < activeBars) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        } else if (bebe.classList.contains("active")) {
            bar.classList.remove('active');

            if (index < activeBars) {
                bar.classList.add('inactive');
            } else {
                bar.classList.remove('inactive');
            }
        }
    });

    if (potCalef) {
        const valueTextNode = Array.from(potCalef.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

        if (valueTextNode) {
            valueTextNode.nodeValue = `${calef_Lvl}`;
        } else {
            potCalef.insertBefore(document.createTextNode(`${calef_Lvl}`), span);
        }
    }
};

/* Indicador de valor de Temperatura Programada */
export function updtTempProg(tempProg_Lvl){
    const t = parseFloat(tempProg_Lvl).toFixed(1);

    tempProg.textContent = t;

    if (t < 37.0) {
        btn_sobreGiro.style.display = 'none';

        btn_sobreGiro.classList.add('btn-sensor');
        btn_sobreGiro.classList.remove('btn-sensor-pressed');
    
        btn_sobreGiro_lbl.classList.add('btn-snsr-lbl');
        btn_sobreGiro_lbl.classList.remove('btn-sensor-lbl-pressed');
    }
    else if (t > 36.9) {
        btn_sobreGiro.style.display = '';
    }
};

///////////////////////////// FORMULARIO PACIENTE //////////////////////////////
/* Habilita edición de los datos del paciente */
export function enablePacienteEditing() {
    const spanDiv = document.getElementById('paciente');
    const inputDiv = document.getElementById('paciente-input');
    const btn_OK = document.getElementById('btn-OK');

    // Ingreso Nombre
    const nomI = document.getElementById("nom-input")
    const apPI = document.getElementById("apP-input")
    const apMI = document.getElementById("apM-input")

    spanDiv.addEventListener('click', () => {
        spanDiv.style.display = 'none';
        inputDiv.style.display = 'flex';
    });

    btn_OK.addEventListener('click', () => {
        const nombre = nomI.value.trim() !== "" ? nomI.value : "NOMBRE";
        const apP = apPI.value.trim() !== "" ? apPI.value : "AP PATERNO";
        const apM = apMI.value.trim() !== "" ? apMI.value : "AP MATERNO";

        document.getElementById("pacienteNom").textContent = nombre;
        document.getElementById("apP_Paciente").textContent = apP;
        document.getElementById("apM_Paciente").textContent = apM;


        spanDiv.style.display = 'flex';
        inputDiv.style.display = 'none';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};
