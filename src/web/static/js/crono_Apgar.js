const btn_playpause = document.getElementById("btn-play-pause");
const img_playpause = btn_playpause.querySelector("img");

const btn_reset = document.getElementById("btn-reset");
const img_reset = btn_reset.querySelector("img");

const timer_crono = document.getElementById("timer-crono");

const num_1 = document.querySelector(".nums-clk._1");
const num_5 = document.querySelector(".nums-clk._5");
const num_10 = document.querySelector(".nums-clk._10");

const sliderApgar = document.getElementById("apgarSlider");

const mp_atpiel_mc_ttl = document.querySelector(".mp-atpiel-mc-ttl");

/**
 * Número total de segmentos en el slider circular
 * Cada segmento representa 1 minuto (10 segmentos = 10 minutos máximo)
 * @type {number}
 */
const TOTAL_SEGMENTS = 10;

/**
 * Configuración geométrica del slider circular
 * Define el tamaño y posición de los anillos SVG
 * @type {Object}
 */
const sliderGeometry = {
    centerX: 123,      // Coordenada X del centro del círculo
    centerY: 124,      // Coordenada Y del centro del círculo
    outerRadius: 122,  // Radio exterior del anillo (límite externo)
    innerRadius: 90,   // Radio interior del anillo (límite interno)
    gapDegrees: 0      // Espacio en grados entre segmentos
};

let tiempoTranscurrido = 0;
let intervaloCronometro = null;

let pause = false;

/**************************
 *   GESTIÓN DE BOTONES   *
 **************************/
// ============== Start / Pause ============== //
btn_playpause?.addEventListener("pointerdown", () => {
    if (pause) {
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Pause_Active.svg"
    } else {
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Active.svg"
    }
});
btn_playpause?.addEventListener("pointerup", () => {
    pause = !pause;

    if (pause) {
        startCrono(10 * 60);
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Pause_Default.svg"
    } else {
        pauseCrono();
        img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Default.svg"
    }
});

// ================== Reset ================== //
btn_reset?.addEventListener("pointerdown", () => {
    img_reset.src = "../static/icon/Apgar/btns/Icon_Regresar_Active.svg"
});
btn_reset?.addEventListener("pointerup", () => {
    restartCrono();
    pause = false;
    img_reset.src = "../static/icon/Apgar/btns/Icon_Regresar_Default.svg"
    img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Default.svg"
});

/**
 * FUNCIONES DEL CRONÓMETRO
 * Gestión de tiempo, visualización y actualización de marcadores
 */

/**
 * Actualiza los marcadores visuales del cronómetro
 * Activa los marcadores de 1, 5 y 10 minutos cuando se alcanzan
 * También activa los segmentos correspondientes en el slider circular
 * 
 * @function
 */
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

/**
 * Limpia todos los marcadores visuales del cronómetro
 * Desactiva los marcadores de 1, 5 y 10 minutos
 * Utilizado al reiniciar el cronómetro
 * 
 * @function
 */
function borrarMarcadoresCrono(){
    num_1?.classList.remove("enable");
    num_5?.classList.remove("enable");
    num_10?.classList.remove("enable");
}

/**
 * Inicia el cronómetro y actualiza la visualización cada segundo
 * Solo inicia si no hay un intervalo ya en ejecución
 * Se detiene automáticamente al alcanzar la duración especificada
 * 
 * @function
 * @param {number} duracion - Duración máxima del cronómetro en segundos (ej: 600 para 10 minutos)
 */
function startCrono(duracion) {
    if (intervaloCronometro !== null || tiempoTranscurrido >= (duracion)) {
        return;
    }

    intervaloCronometro = setInterval(() => {
        tiempoTranscurrido++;

        const minutos = String(Math.floor(tiempoTranscurrido / 60)).padStart(2, "0");
        const segundos = String(tiempoTranscurrido % 60).padStart(2, "0");

        timer_crono.textContent = `${minutos}:${segundos}`;
        actualizarMarcadoresCrono();

        if (tiempoTranscurrido >= (duracion)) {
            pauseCrono();
        }
    }, 1000);
}

/**
 * Pausa el cronómetro sin reiniciar el contador de tiempo
 * Permite reanudar el cronómetro desde donde se pausó
 * 
 * @function
 */
function pauseCrono() {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;
}

/**
 * Reinicia completamente el cronómetro
 * Detiene el contador, limpia el display, y resetea todos los marcadores y segmentos
 * Restaura el estado inicial como si nunca se hubiera iniciado
 * 
 * @function
 */
function restartCrono() {
    pauseCrono();

    tiempoTranscurrido = 0;

    const minutos = String(Math.floor(tiempoTranscurrido / 60)).padStart(2, "0");
    const segundos = String(tiempoTranscurrido % 60).padStart(2, "0");

    timer_crono.textContent = `${minutos}:${segundos}`;
    borrarMarcadoresCrono();
    clearAllSegments();
}

/******************************
 * FUNCIONES DE GEOMETRÍA SVG *
 ******************************/

/**
 * Convierte coordenadas polares (ángulo y radio) a cartesianas (x, y)
 * Utilizado para calcular puntos en la circunferencia del slider
 * La conversión toma en cuenta que el ángulo 0 está a las 12 horas (arriba)
 * 
 * @function
 * @param {number} centerX - Coordenada X del centro
 * @param {number} centerY - Coordenada Y del centro
 * @param {number} radius - Distancia del centro al punto
 * @param {number} angleDegrees - Ángulo en grados (0-360, donde 0 = arriba)
 * @returns {Object} Objeto con propiedades x e y
 * @example
 * polarToCartesian(123, 124, 122, 90); // Retorna punto a la derecha del círculo
 */
function polarToCartesian(
    centerX,
    centerY,
    radius,
    angleDegrees
) {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180;

    return {
        x: centerX + radius * Math.cos(angleRadians),
        y: centerY + radius * Math.sin(angleRadians)
    };
}

/**
 * Genera el comando SVG path para un segmento de anillo circular
 * Crea un segmento tipo "dona" entre dos ángulos y dos radios
 * Utilizado para construir cada segmento del slider circular
 * 
 * @function
 * @param {number} centerX - Coordenada X del centro del círculo
 * @param {number} centerY - Coordenada Y del centro del círculo
 * @param {number} innerRadius - Radio interior (hueco del anillo)
 * @param {number} outerRadius - Radio exterior (borde externo del anillo)
 * @param {number} startAngle - Ángulo inicial en grados (0-360)
 * @param {number} endAngle - Ángulo final en grados (0-360)
 * @returns {string} Comando SVG path que define la forma del segmento
 * 
 * @example
 * createRingSegmentPath(123, 124, 90, 122, 0, 36);
 * // Retorna: "M 123 2 A 122 122 0 0 1 230.76 28.24 L ... Z"
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
 * FUNCIONES DE SEGMENTOS
 * Creación y gestión de segmentos visuales del slider circular
 */

/**
 * Crea los 10 segmentos del slider circular Apgar
 * Genera elementos SVG path que forman un anillo dividido en segmentos
 * Cada segmento puede activarse/desactivarse para mostrar el progreso del tiempo
 * 
 * @function
 * @param {string} modoControl - Clase CSS para aplicar tema/modo visual al slider
 * @example
 * createApgarSegments("light-theme"); // Crea segmentos con tema claro
 * 
 * Genera:
 * - 10 segmentos SVG path (uno por cada minuto)
 * - Cada segmento ocupa 36° del círculo (360° / 10)
 * - Todos comienzan en estado "inactive" (desactivado)
 * - Los segmentos se activan dinámicamente según avanza el cronómetro
 */
export function createApgarSegments(modoControl) {
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

        segment.classList.add("ctrl-cronometro", modoControl, "inactive");

        segment.dataset.segment = index;
        segment.setAttribute("aria-label", `Segmento ${index + 1}`);

        sliderApgar.appendChild(segment);
    }

    restartCrono();
    pause = false;
    img_reset.src = "../static/icon/Apgar/btns/Icon_Regresar_Default.svg"
    img_playpause.src = "../static/icon/Apgar/btns/Icon_Play_Default.svg"
}

/**
 * Obtiene el elemento SVG del segmento en el índice especificado
 * Busca dentro del contenedor sliderApgar el segmento con data-segment igual al índice
 * 
 * @function
 * @param {number} index - Índice del segmento a obtener (0-9)
 * @returns {SVGPathElement|undefined} Elemento SVG path del segmento o undefined si no existe
 */
function getSegment(index) {
    return sliderApgar?.querySelector(`[data-segment="${index}"]`);
}

/**
 * Cambia el estado de un segmento individual (activo/inactivo)
 * Actualiza las clases CSS y el atributo aria-pressed para accesibilidad
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
 * Utilizado para mostrar visualmente el progreso del cronómetro
 * Cada segmento representa un minuto transcurrido
 * 
 * @function
 * @param {number} count - Número de segmentos a activar (0-10)
 * @example
 * setActiveSegmentCount(3); // Activa segmentos 0, 1, 2 (3 minutos)
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
 * Restaura el slider a su estado inicial (sin ningún segmento activado)
 * 
 * @function
 */
function clearAllSegments() {
    setActiveSegmentCount(0);
}