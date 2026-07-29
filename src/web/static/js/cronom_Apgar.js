const btn_playpause = document.getElementById("btn-play-pause");
const img_playpause = btn_playpause.querySelector("img");

const btn_reset = document.getElementById("btn-reset");
const img_reset = btn_reset.querySelector("img");

const timer_crono = document.getElementById("timer-crono");

let tiempoTranscurrido = 0;
let intervaloCronometro = null;

let pause = false;

// ###########
// Botones
// ###########
btn_playpause?.addEventListener("mousedown", () => {
    if (pause) {
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Pause_Active.svg"
    } else {
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Active.svg"
    }
});

btn_playpause?.addEventListener("mouseup", () => {
    pause = !pause;

    if (pause) {
        startCrono();
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Pause_Default.svg"
    } else {
        pauseCrono();
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Default.svg"
    }
});


btn_reset?.addEventListener("mousedown", () => {
    img_reset.src = "../static/icon/Apgar/btns/Icon_Regresar_Active.svg"
});

btn_reset?.addEventListener("mouseup", () => {
    restartCrono();
    pause = false;
    img_reset.src = "../static/icon/Apgar/btns/Icon_Regresar_Default.svg"
    img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Default.svg"
});

// ################################
// Funciones de Cronometro
// ################################
function startCrono(duracion = 10) {
    if (
        intervaloCronometro !== null ||
        tiempoTranscurrido >= (duracion * 60)
    ) {
        return;
    }

    intervaloCronometro = setInterval(() => {
        tiempoTranscurrido++;

        const minutos = String(Math.floor(tiempoTranscurrido / 60)).padStart(2, "0");
        const segundos = String(tiempoTranscurrido % 60).padStart(2, "0");

        timer_crono.textContent = `${minutos}:${segundos}`;

        if (tiempoTranscurrido >= (duracion * 60)) {
            pauseCrono();
        }
    }, 1000);
}

function pauseCrono() {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;
}

function restartCrono() {
    pauseCrono();

    tiempoTranscurrido = 0;

    const minutos = String(Math.floor(tiempoTranscurrido / 60)).padStart(2, "0");
    const segundos = String(tiempoTranscurrido % 60).padStart(2, "0");

    timer_crono.textContent = `${minutos}:${segundos}`;
}
