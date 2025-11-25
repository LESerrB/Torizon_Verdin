////////////////////////////////////////////////////////////////////////////////
////////////////////////////// MODOS DE OPERACIÓN //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/* Cambio de modo entre Bebé y manual */
export function activarModo(modo) {
    const bebe = document.getElementById('modo-bebe');
    const manual = document.getElementById('modo-manual');

    if (modo === 'bebe') {
        bebe.classList.add('active');
        bebe.classList.remove('inactive');

        manual.classList.add('inactive');
        manual.classList.remove('active');
    } else if (modo === 'manual') {
        manual.classList.add('active');
        manual.classList.remove('inactive');

        bebe.classList.add('inactive');
        bebe.classList.remove('active');
    }
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FOOTER ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
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
        document.getElementById("pacienteNom").textContent = nomI.value;
        document.getElementById("apP_Paciente").textContent = apPI.value;
        document.getElementById("apM_Paciente").textContent = apMI.value;

        spanDiv.style.display = 'flex';
        inputDiv.style.display = 'none';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};
