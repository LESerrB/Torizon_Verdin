const btn_playpause = document.getElementById("btn-play-pause");
const img_playpause = btn_playpause.querySelector("img");

const btn_reset = document.getElementById("btn-reset");
const img_reset = btn_reset.querySelector("img");

const timer_crono = document.getElementById("timer-crono");

const num_1 = document.querySelector(".nums-clk._1");
const num_5 = document.querySelector(".nums-clk._5");
const num_10 = document.querySelector(".nums-clk._10");

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
function actualizarMarcadoresCrono() {
    const minutosTranscurridos = Math.floor(tiempoTranscurrido / 60);

    if (minutosTranscurridos === 1) {
        num_1?.classList.add("enable");
    } else if (minutosTranscurridos === 5) {
        num_5?.classList.add("enable");
    } else if (minutosTranscurridos === 10) {
        num_10?.classList.add("enable");
    }

    if (minutosTranscurridos >= 1) {
        setSegmentState(minutosTranscurridos - 1, true);
    }
}

function borrarMarcadoresCrono(){
    num_1?.classList.remove("enable");
    num_5?.classList.remove("enable");
    num_10?.classList.remove("enable");
}

function startCrono(duracion = 10) {
    if (intervaloCronometro !== null || tiempoTranscurrido >= (duracion * 60)) {
        return;
    }

    intervaloCronometro = setInterval(() => {
        tiempoTranscurrido++;

        const minutos = String(Math.floor(tiempoTranscurrido / 60)).padStart(2, "0");
        const segundos = String(tiempoTranscurrido % 60).padStart(2, "0");

        timer_crono.textContent = `${minutos}:${segundos}`;
        actualizarMarcadoresCrono();

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
    borrarMarcadoresCrono();
    clearAllSegments();
}




const sliderApgar = document.getElementById("apgarSlider");

const TOTAL_SEGMENTS = 10;

const sliderGeometry = {
    centerX: 123,
    centerY: 124,
    outerRadius: 122,
    innerRadius: 90,
    gapDegrees: 0
};

function polarToCartesian(
    centerX,
    centerY,
    radius,
    angleDegrees
) {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180;

    return {
        x:
            centerX +
            radius * Math.cos(angleRadians),

        y:
            centerY +
            radius * Math.sin(angleRadians)
    };
}

function createRingSegmentPath(
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
) {
    const outerStart = polarToCartesian(
        centerX,
        centerY,
        outerRadius,
        startAngle
    );

    const outerEnd = polarToCartesian(
        centerX,
        centerY,
        outerRadius,
        endAngle
    );

    const innerEnd = polarToCartesian(
        centerX,
        centerY,
        innerRadius,
        endAngle
    );

    const innerStart = polarToCartesian(
        centerX,
        centerY,
        innerRadius,
        startAngle
    );

    const largeArcFlag =
        endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,

        `A ${outerRadius} ${outerRadius}`,
        `0 ${largeArcFlag} 1`,
        `${outerEnd.x} ${outerEnd.y}`,

        `L ${innerEnd.x} ${innerEnd.y}`,

        `A ${innerRadius} ${innerRadius}`,
        `0 ${largeArcFlag} 0`,
        `${innerStart.x} ${innerStart.y}`,

        "Z"
    ].join(" ");
}

function createApgarSegments() {
    if (!sliderApgar) {
        return;
    }

    sliderApgar.innerHTML = "";

    const {
        centerX,
        centerY,
        innerRadius,
        outerRadius,
        gapDegrees
    } = sliderGeometry;

    const segmentAngle = 360 / TOTAL_SEGMENTS;

    for ( let index = 0; index < TOTAL_SEGMENTS; index += 1 ) {
        const startAngle = index * segmentAngle + gapDegrees / 2;
        const endAngle = (index + 1) * segmentAngle - gapDegrees / 2;

        const segment = document.createElementNS("http://www.w3.org/2000/svg", "path");

        segment.setAttribute("d", createRingSegmentPath(
            centerX,
            centerY,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle
        ));

        segment.classList.add("ctrl-cronometro", "inactive");

        segment.dataset.segment = index;
        segment.setAttribute("aria-label", `Segmento ${index + 1}`);

        sliderApgar.appendChild(segment);
    }
}

function getSegment(index) {
    return sliderApgar?.querySelector(`[data-segment="${index}"]`);
}


function setSegmentState(index, enabled) {
    const segment = getSegment(index);

    if (!segment) {
        return;
    }

    segment.classList.toggle("active", enabled);
    segment.classList.toggle("inactive", !enabled);
    segment.setAttribute("aria-pressed", String(enabled));
}

function toggleSegment(index) {
    const segment = getSegment(index);

    if (!segment) {
        return;
    }

    const isActive = segment.classList.contains("active");

    setSegmentState(index, !isActive);
}

function setActiveSegmentCount(count) {
    const safeCount = Math.min(Math.max(Number(count), 0), TOTAL_SEGMENTS);

    for (let index = 0; index < TOTAL_SEGMENTS; index += 1) {
        setSegmentState(index, index < safeCount);
    }
}

// function setActiveSegments(activeIndexes) {
//     const enabledSegments = new Set(activeIndexes);

//     for (let index = 0; index < TOTAL_SEGMENTS; index += 1) {
//         setSegmentState(index, enabledSegments.has(index));
//     }
// }

function clearAllSegments() {
    setActiveSegmentCount(0);
}

createApgarSegments();
