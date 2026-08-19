const btn_tarar = document.getElementById('btn-tarar');
const timerTaraDigito1 = document.getElementById('timer-tara-digito-1');
const timerTaraDigito2 = document.getElementById('timer-tara-digito-2');
const contBasAnima = document.querySelector(".cont-bas-anima");
const lbl_tara = document.getElementById('lbl-tara');
const icon_kg = document.querySelector('.icon-kg');

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

// ##########
// Botones
// ##########
btn_tarar?.addEventListener("pointerup", () => {
    startCrono();
    animBascula({tiempoDifuminado: 2000, tiempoMovimiento: 2000, tiempoFlecha: 1000});
});

// =================
// Funciones Timer
// =================

/**
 * Actualiza el display digital del cronómetro de tara
 * Muestra los dígitos individuales (decenas y unidades) en dos elementos separados
 * También activa los segmentos del slider circular correspondientes al tiempo transcurrido
 * 
 * @function
 */
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

/**
 * Inicia el cronómetro de tarado de la báscula (máximo 10 segundos)
 * Se ejecuta cada segundo actualizando el display y los segmentos visuales
 * Al completarse la duración:
 * - Pausa el cronómetro
 * - Muestra el icono de kg
 * - Cambia el texto de instrucciones
 * - Alterna los paneles (oculta tarar, muestra pesar)
 * 
 * @function
 * @param {number} [duracion=10] - Duración máxima del cronómetro en segundos
 */
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

            lbl_tara.textContent = 'Presione el botón Pesar.';
            contBasAnima.classList.add("mostrar-kg");

            pnlTara.classList.remove('enable');
            pnlPesar.classList.add('enable');
        }
    }, 1000);
}

/**
 * Pausa el cronómetro sin reiniciar el contador de tiempo
 * Detiene la animación de la báscula al pausar
 * 
 * @function
 */
function pauseCrono() {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;

    reiniciarAnimBascula();
}

/**
 * Reinicia completamente el cronómetro de tara
 * Detiene el contador, limpia el display a 00 y resetea los segmentos
 * Restaura el estado inicial para una nueva medición
 * 
 * @function
 */
function restartCrono() {
    pauseCrono();

    tiempoTranscurrido = 0;
    actualizarTimerTara();
}

// ======================
// Control Timer Bascula
// ======================

/**
 * Convierte coordenadas polares (ángulo y radio) a cartesianas (x, y)
 * Utilizado para calcular puntos en la circunferencia del slider circular
 * La conversión asume que el ángulo 0 está a las 12 horas (arriba)
 * 
 * @function
 * @param {number} centerX - Coordenada X del centro del círculo
 * @param {number} centerY - Coordenada Y del centro del círculo
 * @param {number} radius - Distancia del centro al punto (radio)
 * @param {number} angleDegrees - Ángulo en grados (0-360)
 * @returns {Object} Objeto con propiedades x e y
 * 
 * @example
 * polarToCartesian(123, 124, 122, 90); // Retorna punto a la derecha
 */
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

/**
 * Genera el comando SVG path para un segmento de anillo circular
 * Crea una forma de segmento tipo "dona" entre dos ángulos y dos radios
 * Utilizado para construir cada segmento del slider de tiempo de tara
 * 
 * @function
 * @param {number} centerX - Coordenada X del centro del círculo
 * @param {number} centerY - Coordenada Y del centro del círculo
 * @param {number} innerRadius - Radio interior (hueco del anillo)
 * @param {number} outerRadius - Radio exterior (borde externo)
 * @param {number} startAngle - Ángulo de inicio en grados (0-360)
 * @param {number} endAngle - Ángulo de fin en grados (0-360)
 * @returns {string} Comando SVG path que define la forma del segmento
 */
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

/**
 * Crea los 10 segmentos del slider circular para el cronómetro de tara
 * Genera elementos SVG path que forman un anillo dividido en segmentos
 * Configura el tema visual (temperatura piel o aire) y actualiza iconos
 * 
 * @function
 * @param {string} modoControl - Modo de control: "tPiel" o "tAire" determina tema y icono
 * 
 * @example
 * createTimerTaraSegments("tPiel"); // Crea segmentos con tema temperatura piel
 * createTimerTaraSegments("tAire"); // Crea segmentos con tema temperatura aire
 * 
 * Genera:
 * - 10 segmentos SVG (uno por cada segundo/minuto)
 * - Cada segmento ocupa 36° del círculo (360° / 10)
 * - Todos comienzan desactivados
 * - Icono y etiquetas ajustadas según el modo
 */
export function createTimerTaraSegments(modoControl) {
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

        segment.classList.add("ctrl-timer", modoControl, "inactive");

        segment.dataset.segment = index;
        segment.setAttribute("aria-label", `Segmento ${index + 1}`);

        sliderTmBasc.appendChild(segment);
        icon_kg.src = modoControl === "tAire" ? "../static/icon/Bascula/Kg_tAire.svg" : "../static/icon/Bascula/Kg_tPiel.svg";
        lbl_tara.classList.toggle("tAire", (modoControl === "tAire"));
    }
}

/**
 * Obtiene el elemento SVG del segmento en el índice especificado
 * Busca dentro del contenedor sliderTmBasc usando el atributo data-segment
 * 
 * @function
 * @param {number} index - Índice del segmento a obtener (0-9)
 * @returns {SVGPathElement|undefined} Elemento SVG path del segmento o undefined si no existe
 */
function getSegment(index) {
    return sliderTmBasc?.querySelector(`[data-segment="${index}"]`);
}

/**
 * Cambia el estado visual de un segmento individual (activo/inactivo)
 * Actualiza las clases CSS y el atributo de accesibilidad aria-pressed
 * 
 * @function
 * @param {number} index - Índice del segmento a modificar (0-9)
 * @param {boolean} enabled - true = activar, false = desactivar
 * 
 * @example
 * setSegmentState(2, true);  // Activa el segmento 2
 * setSegmentState(2, false); // Desactiva el segmento 2
 */
function setSegmentState(index, enabled) {
    const segment = getSegment(index);

    if (!segment) {
        return;
    }

    segment.classList.toggle("active", enabled);
    segment.classList.toggle("inactive", !enabled);
    segment.setAttribute("aria-pressed", String(enabled));
}

/**
 * Activa los primeros N segmentos y desactiva el resto
 * Utilizado para mostrar visualmente el progreso del cronómetro de tara
 * 
 * @function
 * @param {number} count - Número de segmentos a activar (0-10)
 * 
 * @example
 * setActiveSegmentCount(3); // Activa segmentos 0, 1, 2
 * setActiveSegmentCount(0); // Desactiva todos
 */
function setActiveSegmentCount(count) {
    const safeCount = Math.min(Math.max(Number(count), 0), TOTAL_SEGMENTS);

    for (let index = 0; index < TOTAL_SEGMENTS; index += 1) {
        setSegmentState(index, index < safeCount);
    }
}

/**
 * Desactiva todos los segmentos del slider circular
 * Restaura el slider a su estado inicial sin segmentos activados
 * 
 * @function
 */
function clearAllSegments() {
    setActiveSegmentCount(0);
}

// ///////////////////////
// Transición Tara
// ///////////////////////

/**
 * Inicia la animación de la báscula durante el proceso de tarado
 * Configura los tiempos CSS personalizados para diferentes efectos visuales
 * Aplica la clase "animar" que dispara las animaciones CSS definidas
 * 
 * @function
 * @param {Object} [options={}] - Opciones de temporización
 * @param {number} [options.tiempoDifuminado=2000] - Duración del efecto de desvanecimiento (ms)
 * @param {number} [options.tiempoMovimiento=2000] - Duración del movimiento de la báscula (ms)
 * @param {number} [options.tiempoFlecha=1000] - Duración de la animación de flecha (ms)
 * 
 * @example
 * animBascula({ tiempoDifuminado: 1500, tiempoMovimiento: 1500 });
 */
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

/** Retomar aqui la documentación
 * Detiene la animación de la báscula removiendo la clase animadora
 * Restaura el estado visual inicial de los elementos animados
 * 
 * @function
 */
function reiniciarAnimBascula() {
  if (!contBasAnima) return;

  contBasAnima.classList.remove("animar");
}

// Salir del Módulo Báscula
export function salirBascula() {
    lbl_tara.textContent = 'Presione la tecla TARAR y, a continuación, levante al paciente durante 10 segundos.';

    restartCrono();
    clearAllSegments();
    contBasAnima.classList.remove("mostrar-kg");

    pnlTara.classList.add('enable');
    pnlPesar.classList.remove('enable');
}