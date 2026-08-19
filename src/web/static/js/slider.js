/**
 * Temas de estilos disponibles para los sliders
 * Cada tema corresponde a un tipo de control diferente
 * @type {string[]}
 */
const SLIDER_THEMES = [
    "seg-t_piel",      // Temperatura piel
    "seg-t_aire",      // Temperatura aire
    "seg-p_ox",        // Porcentaje oxígeno
    "seg-p_hum"        // Porcentaje humedad
];

/**
 * Coordenadas SVG (x, y) para los puntos del slider de temperatura
 * Define 10 posiciones equidistantes para un control de 0-100%
 * Utilizado para posicionar el nodo (knob) del slider de temperatura
 * @type {Object[]}
 */
const TEMPERATURE_POINTS = [
    { x: 36, y: 218 },
    { x: 18, y: 147 },
    { x: 32, y: 92 },
    { x: 68, y: 48 },
    { x: 120, y: 20 },
    { x: 176, y: 20 },
    { x: 228, y: 48 },
    { x: 264, y: 92 },
    { x: 278, y: 147 },
    { x: 260, y: 218 }
];

/**
 * Coordenadas SVG (x, y) para los puntos del slider de fototerapia
 * Define 3 posiciones para los 3 niveles de intensidad de fototerapia
 * @type {Object[]}
 */
const FOTOTHERAPY_POINTS = [
    { x: 36, y: 218 },
    { x: 148, y: 18.5 },
    { x: 260, y: 218 }
];


/**
 * Limita un valor dentro de un rango específico
 * @param {number} value - Valor a limitar
 * @param {number} minValue - Valor mínimo del rango
 * @param {number} maxValue - Valor máximo del rango
 * @returns {number} El valor limitado dentro del rango
 */
function clamp(value, minValue, maxValue) {
    return Math.min(Math.max(value, minValue), maxValue);
}

/**
 * Redondea un valor al paso más cercano
 * Útil para valores discretos (ej: 0.1, 0.5, 1, etc.)
 * @param {number} value - Valor a redondear
 * @param {number} step - Incremento de redondeo
 * @returns {number} Valor redondeado al paso más cercano
 */
function roundToStep(value, step) {
    return Math.round(value / step) * step;
}

/**
 * Convierte un valor numérico a su segmento correspondiente (0-9)
 * Utilizado para determinar qué segmento del slider debe estar activo
 * @param {number} value - Valor a convertir
 * @param {number} min - Valor mínimo del rango
 * @param {number} max - Valor máximo del rango
 * @returns {number} Número de segmento (0-9), donde 0 es el mínimo y 9 el máximo
 */
function valueToSegment(value, min, max) {
    if (max <= min) {
        return 0;
    }

    const ratio = clamp((value - min) / (max - min), 0, 1);

    return clamp(Math.floor(ratio * 10), 0, 9);
}

/**
 * Aplica un tema de estilo a un segmento del slider
 * Elimina todas las clases de tema anteriores y aplica la nueva
 * @param {HTMLElement} seg - Elemento del segmento a estilizar
 * @param {number} index - Índice del segmento
 * @param {string} theme - Nombre del tema a aplicar (ej: "seg-t_piel")
 */
function setSegmentTheme(seg, index, theme) {
    SLIDER_THEMES.forEach((themeName) => {
        seg.classList.remove(`${themeName}-${index}`);
    });

    seg.classList.add(`${theme}-${index}`);
}

/**
 * Obtiene la configuración del slider desde sus atributos data
 * Proporciona valores por defecto si los atributos no existen o son inválidos
 * @param {HTMLElement} slider - Elemento del slider
 * @returns {Object} Objeto con propiedades min, max y step
 */
function getSliderConfig(slider) {
    const defaults = { min: 34.0, max: 38.0, step: 0.1 };

    if (!slider) {
        return defaults;
    }

    const parsedMin = Number.parseFloat(slider.dataset.min);
    const parsedMax = Number.parseFloat(slider.dataset.max);
    const parsedStep = Number.parseFloat(slider.dataset.step);

    return {
        min: Number.isFinite(parsedMin) ? parsedMin : defaults.min,
        max: Number.isFinite(parsedMax) ? parsedMax : defaults.max,
        step: Number.isFinite(parsedStep) && parsedStep > 0
            ? parsedStep
            : defaults.step
    };
}

/**
 * Formatea un valor numérico con la precisión decimal apropiada
 * Determina el número de decimales basándose en el step
 * @param {number} value - Valor a formatear
 * @param {number} step - Paso/incremento del slider
 * @returns {string} Valor formateado con decimales apropiados
 */
function formatValue(value, step) {
    const precision = Math.max(0, getDecimalPlaces(step));
    return Number(value).toFixed(precision);
}

/**
 * Calcula el número de lugares decimales de un número
 * @param {number} value - Número del cual extraer decimales
 * @returns {number} Cantidad de lugares decimales (máximo 1 si no es finito)
 */
function getDecimalPlaces(value) {
    if (!Number.isFinite(value)) {
        return 1;
    }

    const parts = value.toString().split(".");
    return parts[1] ? parts[1].length : 0;
}

//==================================================================
/**
 * SLIDER DE TEMPERATURA Y POTENCIA
 * Temperatura Programada Piel y Aire; Control de Oxígeno y Humedad
 * 
 * Inicializa un slider interactivo con 10 segmentos para controlar
 * valores de temperatura o potencia. Incluye visualización de valor
 * actual y emite eventos personalizados.
 */
//==================================================================

/**
 * Inicializa el slider de temperatura/potencia con todas sus funcionalidades
 * @param {Object} options - Configuración del slider
 * @param {string} [options.sliderId="tpielSlider"] - ID del elemento SVG slider
 * @param {string} [options.knobId="tpielKnob"] - ID del elemento knob (nodo) del slider
 * @param {HTMLElement|null} [options.valCtrlEl=null] - Elemento donde mostrar el valor actual
 * @param {Function} [options.formatValueFn=formatValue] - Función para formatear valores
 * @param {number|null} [options.initialValue=null] - Valor inicial del slider
 * 
 * @returns {Object} Objeto con métodos para controlar el slider
 * @returns {Function} .setValue(value) - Establece un nuevo valor en el slider
 * @returns {Function} .setConfig({min, max, step, value, theme}) - Reconfigura los parámetros del slider
 * 
 * @example
 * const slider = initTemperaturePowerSlider({
 *     sliderId: "tpielSlider",
 *     knobId: "tpielKnob",
 *     valCtrlEl: document.getElementById("tempValue"),
 *     initialValue: 36.5
 * });
 * slider.setValue(37.0); // Establece temperatura a 37°C
 * slider.setConfig({ min: 35, max: 39, step: 0.1, value: 37.5 });
 * 
 * @fires tpiel-slider-change - Evento emitido cuando el valor cambia
 * @listens tpiel-slider-change - Detalle: {value, segment, min, max, step}
 */
export function initTemperaturePowerSlider({
    sliderId = "tpielSlider",
    knobId = "tpielKnob",
    valCtrlEl = null,
    formatValueFn = formatValue,
    initialValue = null
} = {}) {
    const slider = document.getElementById(sliderId);
    const knob = document.getElementById(knobId);

    if (!slider || !knob) {
        return {
            setValue() {},
            setConfig() {}
        };
    }

    let sliderConfig = {
        ...getSliderConfig(slider),
        theme: slider.dataset.theme ?? "seg-t_piel"
    };

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];

    function updateSlider(value) {
        const {
            min,
            max,
            step,
            theme
        } = sliderConfig;

        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? numericValue : min;
        const clampedValue = clamp(roundToStep(safeValue, step), min, max);
        const selectedSegment = valueToSegment(clampedValue, min, max);
        const point = TEMPERATURE_POINTS[selectedSegment];

        knob.setAttribute("cx", point.x);
        knob.setAttribute("cy", point.y);

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);
            const isActive = index <= selectedSegment;
            const isSelected = index === selectedSegment;

            setSegmentTheme(seg, index, theme);

            seg.classList.toggle("active", isActive);
            seg.classList.toggle("inactive", !isActive);
            seg.classList.toggle("selected", isSelected);
        });

        slider.dataset.value = formatValueFn(clampedValue, step);

        if (valCtrlEl) {
            valCtrlEl.textContent = formatValueFn(clampedValue, step);
        }

        slider.dispatchEvent(
            new CustomEvent("tpiel-slider-change", {
                detail: {
                    value: clampedValue,
                    segment: selectedSegment,
                    min,
                    max,
                    step
                }
            })
        );
    }

    return {
        setValue(value) {
            updateSlider(value);
        },
        setConfig({ min, max, step, value, theme }) {
            sliderConfig = {
                min,
                max,
                step,
                theme: theme ?? sliderConfig.theme
            };

            if (slider) {
                slider.dataset.min = String(min);
                slider.dataset.max = String(max);
                slider.dataset.step = String(step);
                slider.dataset.theme = sliderConfig.theme;
            }

            if (value !== undefined) {
                updateSlider(value);
            }
        }
    };
};
/**
 * Crea un indicador visual de potencia del calefactor
 * Genera 10 segmentos que representan niveles de potencia (10%, 20%, ..., 100%)
 * Útil para mostrar visualmente la potencia actual del calefactor
 * 
 * @param {string} [containerId="seg-calefactor"] - ID del contenedor donde crear el slider
 * @param {string} [valueId="potcal-ini"] - Clase CSS del elemento que mostrará el valor
 * @param {number} [startLevel=100] - Nivel inicial de potencia (0-100)
 * 
 * @returns {Object|null} Objeto con método setLevel o null si el contenedor no existe
 * @returns {Function} .setLevel(value) - Establece el nivel de potencia (0-100)
 * 
 * @example
 * const slider = crearSliderPotCalef("seg-calefactor", "potcal-ini", 75);
 * slider.setLevel(50); // Establece potencia al 50%
 */
export function crearSliderPotCalef(containerId = "seg-calefactor", valueId = "potcal-ini", startLevel = 100) {
    const container = document.getElementById(containerId);
    const valueDisplay = valueId ? document.querySelector(`.${valueId}`) : null;

    if (!container) {
        console.warn(`No se encontró el contenedor: ${containerId}`);
        return null;
    }

    container.innerHTML = "";

    const Levels = [
        { level: 10, claseExtra: "top" },
        { level: 9 },
        { level: 8 },
        { level: 7 },
        { level: 6 },
        { level: 5 },
        { level: 4 },
        { level: 3 },
        { level: 2 },
        { level: 1, claseExtra: "bottom" }
    ];

    Levels.forEach((item) => {
        const seg = document.createElement("div");

        seg.classList.add("potcal-seg", `level-${item.level}`);

        if (item.claseExtra) {
            seg.classList.add(item.claseExtra);
        }

        seg.dataset.level = item.level;

        container.appendChild(seg);
    });

    function setLevel(value) {
        const level = Math.min(Math.max(Number(Math.floor(value / 10)), 0), 10);
        const segments = container.querySelectorAll(".potcal-seg");

        segments.forEach((seg) => {
            const segment_Level = Number(seg.dataset.level);

            seg.classList.toggle("active", segment_Level <= level);
        });

        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    }

    setLevel(startLevel);

    return {
        setLevel
    };
};

//====================
/**
 * SLIDER DE FOTOTERAPIA
 * Control de intensidad de fototerapia con 3 niveles (bajo, medio, alto)
 */
//====================

/**
 * Inicializa el slider de control de intensidad de fototerapia
 * Proporciona 3 niveles discretos de intensidad
 * 
 * @param {Object} options - Configuración del slider
 * @param {string} [options.sliderId="fotSlider"] - ID del elemento SVG slider
 * @param {string} [options.knobId="fotKnob"] - ID del elemento knob (nodo) del slider
 * @param {number} [options.initialValue=1] - Valor inicial (1-3)
 * 
 * @returns {Object} Objeto con método para controlar el slider
 * @returns {Function} .setValue(value) - Establece el nivel de intensidad (1-3)
 * 
 * @example
 * const fotoSlider = initFotoSlider({
 *     sliderId: "fotSlider",
 *     knobId: "fotKnob",
 *     initialValue: 1
 * });
 * fotoSlider.setValue(2); // Establece intensidad media
 * 
 * @fires fot-slider-change - Evento emitido cuando el valor cambia
 * @listens fot-slider-change - Detalle: {value, segment, min, max, step}
 */
export function initFotoSlider({
    sliderId = "fotSlider",
    knobId = "fotKnob",
    initialValue = 1
} = {}) {
    const slider = document.getElementById(sliderId);
    const knob = document.getElementById(knobId);

    if (!slider) {
        return {
            setValue() {},
            setConfig() {}
        };
    }

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];
    const min = 1;
    const max = 3;

    function updateFotSlider(value) {
        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? numericValue : min;
        const clampedValue = Math.min(Math.max(Math.round(safeValue), min), max);
        const selectedSegment = clampedValue - min;

        if (knob) {
            const point = FOTOTHERAPY_POINTS[selectedSegment];

            knob.setAttribute("cx", point.x);
            knob.setAttribute("cy", point.y);
        }

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);

            seg.classList.toggle("active", index <= selectedSegment);
            seg.classList.toggle("inactive", index > selectedSegment);
            seg.classList.toggle("selected", index === selectedSegment);
        });

        slider.dataset.value = String(clampedValue);

        slider.dispatchEvent(
            new CustomEvent("fot-slider-change", {
                detail: {
                    value: clampedValue,
                    segment: selectedSegment,
                    min,
                    max,
                    step: 1
                }
            })
        );
    }

    updateFotSlider(initialValue);

    return {
        setValue(value) {
            updateFotSlider(value);
        }
    };
};
/**
 * Crea un indicador visual de intensidad de fototerapia para el panel principal
 * Genera 3 segmentos que representan los niveles de intensidad (bajo, medio, alto)
 * Utilizado para mostrar visualmente el nivel actual de fototerapia
 * 
 * @param {string} [containerId="seg-potencia-fot"] - ID del contenedor donde crear el indicador
 * @param {number} [startLevel=0] - Nivel inicial (0-3)
 * 
 * @returns {Object|null} Objeto con método setLevel o null si el contenedor no existe
 * @returns {Function} .setLevel(value) - Establece el nivel de intensidad (0-3)
 * 
 * @example
 * const fotoIndicator = createSliderIntensFot("seg-potencia-fot", 1);
 * fotoIndicator.setLevel(2); // Establece indicador a nivel 2
 */
export function createSliderIntensFot(containerId = "seg-potencia-fot", startLevel = 0) {
    const container = document.getElementById(containerId);

    if (!container) {
        return null;
    }

    container.innerHTML = "";

    const segments = [
        {
            level: 1,
            clase: "fot-seg-1"
        },
        {
            level: 2,
            clase: "fot-seg-2"
        },
        {
            level: 3,
            clase: "fot-seg-3"
        }
    ];

    segments.forEach((segment) => {
        const div = document.createElement("div");

        div.classList.add("fot-seg", segment.clase);
        div.dataset.level = segment.level;

        container.appendChild(div);
    });

    function setLevel(value) {
        const level = Math.min(Math.max(Number(value), 0), 3);
        const segmentsDOM = container.querySelectorAll(".fot-seg");

        segmentsDOM.forEach((segment) => {
            const segment_Level = Number(segment.dataset.level);

            segment.classList.toggle("active", segment_Level <= level);
        });
    }

    setLevel(startLevel);

    return {
        setLevel
    };
};