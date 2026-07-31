const btn_tarar = document.getElementById('btn-tarar');
const timerTaraDigito1 = document.getElementById('timer-tara-digito-1');
const timerTaraDigito2 = document.getElementById('timer-tara-digito-2');
const contBasAnima = document.querySelector(".cont-bas-anima");
const lbl_tara = document.getElementById('lbl-tara');

let tiempoTranscurrido = 0;
let intervaloCronometro = null;

const sliderTmBasc = document.getElementById("bascTimerSlider");
const TOTAL_SEGMENTS = 10;

const sliderGeometry = {
    centerX: 123,
    centerY: 124,
    outerRadius: 122,
    innerRadius: 90,
    gapDegrees: 0
}

const pnlTara = document.getElementById("pnl-tara");
const pnlPesar = document.getElementById("pnl-pesar");

// // ########################
// // Paneles de Información
// // ########################
// function mostrarPanel(panelMostrar, panelOcultar, tiempoMs = 500) {
//   if (!panelMostrar || !panelOcultar) return;

//   panelMostrar.style.setProperty("--tiempo-panel", `${tiempoMs}ms`);
//   panelOcultar.style.setProperty("--tiempo-panel", `${tiempoMs}ms`);

//   panelOcultar.classList.add("panel-oculto");
//   panelMostrar.classList.remove("panel-oculto");
// }

// ##########
// Botones
// ##########
btn_tarar?.addEventListener("touchstart", () => {
    restartCrono();
    clearAllSegments();
    contBasAnima.classList.remove("mostrar-kg");
});

btn_tarar?.addEventListener("touchend", () => {
    startCrono();
    animBascula({tiempoDifuminado: 2000, tiempoMovimiento: 2000, tiempoFlecha: 1000});
});

// =================
// Funciones Timer
// =================
function actualizarTimerTara() {
    const valor = String(tiempoTranscurrido).padStart(2, "0");
    const [primerDigito, segundoDigito] = valor.split("");

    if (timerTaraDigito1) {
        timerTaraDigito1.textContent = primerDigito;
    }

    if (timerTaraDigito2) {
        timerTaraDigito2.textContent = segundoDigito;
    }

    if (tiempoTranscurrido >= 1) {
        setSegmentState(tiempoTranscurrido - 1, true);
    }
    else if (tiempoTranscurrido > 9) {
        setSegmentState(9, true);
    }
}

function startCrono(duracion = 10) {
    if (intervaloCronometro !== null || tiempoTranscurrido >= (duracion)) {
        return;
    }

    actualizarTimerTara();

    intervaloCronometro = setInterval(() => {
        tiempoTranscurrido++;
        actualizarTimerTara();

        if (tiempoTranscurrido >= (duracion)) {
            pauseCrono();

            lbl_tara.textContent = 'Presione el botón Pesar';
            contBasAnima.classList.add("mostrar-kg");

            pnlTara.classList.remove('enable');
            pnlPesar.classList.add('enable');
        }
    }, 1000);
}

function pauseCrono() {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;

    reiniciarAnimBascula();
}

function restartCrono() {
    pauseCrono();

    tiempoTranscurrido = 0;
    actualizarTimerTara();
}

// ======================
// Control Timer Bascula
// ======================
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
    if (!sliderTmBasc) {
        return;
    }

    sliderTmBasc.innerHTML = "";

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

        segment.classList.add("ctrl-timer", "inactive");

        segment.dataset.segment = index;
        segment.setAttribute("aria-label", `Segmento ${index + 1}`);

        sliderTmBasc.appendChild(segment);
    }
}

function getSegment(index) {
    return sliderTmBasc?.querySelector(`[data-segment="${index}"]`);
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

function setActiveSegmentCount(count) {
    const safeCount = Math.min(Math.max(Number(count), 0), TOTAL_SEGMENTS);

    for (let index = 0; index < TOTAL_SEGMENTS; index += 1) {
        setSegmentState(index, index < safeCount);
    }
}

function clearAllSegments() {
    setActiveSegmentCount(0);
}

// ///////////////////////
// Transición Tara
// ///////////////////////
function animBascula({tiempoDifuminado = 2000, tiempoMovimiento = 2000, tiempoFlecha = 1000} = {}) {
  if (!contBasAnima) return;

  contBasAnima.style.setProperty(
    "--tiempo-difuminado",
    `${tiempoDifuminado}ms`
  );

  contBasAnima.style.setProperty(
    "--tiempo-movimiento",
    `${tiempoMovimiento}ms`
  );

  contBasAnima.style.setProperty(
    "--tiempo-flecha",
    `${tiempoFlecha}ms`
  );

  contBasAnima.classList.add("animar");
}

function reiniciarAnimBascula() {
  if (!contBasAnima) return;

  contBasAnima.classList.remove("animar");
}

createApgarSegments();