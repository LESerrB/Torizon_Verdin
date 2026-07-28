let intervalEncod = null;
let updateSlider10Value = null;
let updateFotSliderValue = null;
let activeSlider = "slider10";
let valsCtrl = null;

let sliderConfig = {
    min: 34.0,
    max: 38.0,
    step: 0.1,
    theme: "seg-t_piel"
};

const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const ajstCtrlOx = document.getElementById("mod-ox");
const ajstCtrlHum = document.getElementById("mod-hum");
const ajstCtrlFot = document.getElementById("mod-fot");

const homeDiv = document.getElementById("home");
const panelControl = document.getElementById("panel-control");
const btnCancel = document.getElementById("cancel-ctrl");

// Vista principal (Home)
const tempProg = document.getElementById("tp_prog");
const humCtrl = document.getElementById("hum_prog");
const oxCtrl = document.getElementById("ox_prog");

// Vista Panel de Control
const ttl_pnl_ctrl = document.getElementById("ttl-pnl-ctrl");
const slider10 = document.getElementById("tpielSlider");
const sliderFot = document.getElementById("fotSlider");

// Control de Sensores
const ctrl_sens = document.getElementById("ctrl-sensores");
const view_tend = document.getElementById("view-tend");
const ctrl_basc = document.getElementById("ctrl-bascula");
const ctrl_apgar = document.getElementById("ctrl-apgar");
const view_fam = document.getElementById("view-fam");

// Valor del encoder / control
const valCtrl = document.getElementById("val_Ctrl");
const unitsCtrl = document.getElementById("units_Ctrl");

// Vista lateral
const ttl_programada = document.getElementById("ttl-programada")
const viewCtrl = document.getElementById("vw-valProg");

/**
 * Obtiene los valores iniciales del control desde la API.
 */
export async function setInitValues() {
    try {
        const res = await fetch("/api/setInitVals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status === 200) {
            valsCtrl = await res.json();

            tempProg.textContent = valsCtrl.vals.tp_Prog.toFixed(1);
            humCtrl.textContent = valsCtrl.vals.pot_Hum;
            oxCtrl.textContent = valsCtrl.vals.pot_Ox;
            viewCtrl.textContent = valsCtrl.vals.tp_Prog.toFixed(1);
        }
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada", error);
    }
}

/**
 * Actualiza la visualización del valor del control.
 * @param {number|string} value Valor actual.
 * @param {string} unit Unidad de medición.
 */
function updateControlDisplay(value, unit) {
    if (unit === "") {
        unitsCtrl.textContent = "";

        const fototerapiaLabels = {
            1: "Bajo",
            2: "Medio",
            3: "Alto"
        };

        valCtrl.textContent = fototerapiaLabels[Number(value)] ?? "";
    } else {
        valCtrl.textContent = formatValue(value, sliderConfig.step);
        unitsCtrl.textContent = unit;
    }
}

/**
 * Formatea un valor usando la precisión definida por el paso del slider.
 * @param {number|string} value Valor a formatear.
 * @param {number} step Paso del slider.
 * @returns {string} Valor formateado.
 */
function formatValue(value, step) {
    const precision = Math.max(0, getDecimalPlaces(step));
    return Number(value).toFixed(precision);
}

/**
 * Obtiene la cantidad de decimales de un valor.
 * @param {number} value Valor numérico.
 * @returns {number} Cantidad de decimales.
 */
function getDecimalPlaces(value) {
    if (!Number.isFinite(value)) {
        return 1;
    }

    const parts = value.toString().split(".");
    return parts[1] ? parts[1].length : 0;
}

/**
 * Lee la configuración del slider desde los atributos data del elemento.
 * @param {HTMLElement|null} slider Elemento SVG/slider.
 * @returns {{min:number,max:number,step:number}} Configuración del slider.
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

function setSliderConfig({ min, max, step, value, unit, theme }) {
    activeSlider = "slider10";

    sliderConfig = {
        min,
        max,
        step,
        theme: theme ?? sliderConfig.theme
    };

    const slider = document.getElementById("tpielSlider");

    if (slider) {
        slider.dataset.min = String(min);
        slider.dataset.max = String(max);
        slider.dataset.step = String(step);
        slider.dataset.theme = sliderConfig.theme;
    }

    if (
        typeof updateSlider10Value === "function" &&
        value !== undefined
    ) {
        updateSlider10Value(Number(value));
    }

    if (value !== undefined) {
        updateControlDisplay(Number(value), unit);
    }
}

// =============================
// Paneles de control
// =============================
pnlBebe?.addEventListener("click", () => {
    toggleHomePanel("tempPielProg");

    ttl_pnl_ctrl.textContent =
        "Ajuste de Control de Temperatura de Piel";

    ttl_programada.textContent = "Temp. Piel Programada";

    const valor = valsCtrl?.vals?.tp_Prog ?? 34.0;

    setSliderConfig({
        min: 34.0,
        max: 38.0,
        step: 0.1,
        value: valor,
        unit: "°C",
        theme: "seg-t_piel"
    });

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("tp_Prog");
});

pnlAire?.addEventListener("click", () => {
    toggleHomePanel("tempAireProg");

    ttl_pnl_ctrl.textContent =
        "Ajuste de Control de Temperatura de Aire";

    ttl_programada.textContent = "Temp. Aire Programada";

    const valor = valsCtrl?.vals?.ta_Prog ?? 34.0;

    setSliderConfig({
        min: 34.0,
        max: 38.0,
        step: 0.1,
        value: valor,
        unit: "°C",
        theme: "seg-t_aire"
    });

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("ta_Prog");
});

ajstCtrlOx?.addEventListener("click", () => {
    toggleHomePanel("ajstOx");

    ttl_pnl_ctrl.textContent = "Ajuste de Oxigeno Programado";

    const valor = valsCtrl?.vals?.pot_Ox ?? 0;

    setSliderConfig({
        min: 0,
        max: 100,
        step: 1,
        value: valor,
        unit: "%",
        theme: "seg-p_ox"
    });

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("pot_Ox");
});

ajstCtrlHum?.addEventListener("click", () => {
    toggleHomePanel("ajstHum");

    ttl_pnl_ctrl.textContent =
        "Ajuste de Humedad Programada";

    const valor = valsCtrl?.vals?.pot_Hum ?? 0;

    setSliderConfig({
        min: 0,
        max: 100,
        step: 1,
        value: valor,
        unit: "%",
        theme: "seg-p_hum"
    });

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("pot_Hum");
});

ajstCtrlFot?.addEventListener("click", () => {
    toggleHomePanel("ajstFot");

    ttl_pnl_ctrl.textContent =
        "Ajuste de Intensidad de Fototerapia";

    activeSlider = "sliderFot";

    const valor = valsCtrl?.vals?.pot_Fot ?? 1;

    updateControlDisplay(valor, "");

    if (typeof updateFotSliderValue === "function") {
        updateFotSliderValue(Number(valor));
    }

    slider10?.classList.add("slider-collapsed");
    sliderFot?.classList.remove("slider-collapsed");

    set_EditCtrlsEn("pot_Fot");
});

// =================================
// Botones Menú Inferior
// =================================
const btn_md_fam = document.getElementById("btn-md-fam");
const btn_home = document.getElementById("btn-home");
const menuButtons = {};

function updateBottomNavLayout(isHomeView = false) {
    if (isHomeView) {
        btn_home?.classList.add("btn-collapsed");
        btn_md_fam?.classList.remove("btn-collapsed");
        return;
    }

    btn_md_fam?.classList.add("btn-collapsed");
    btn_home?.classList.remove("btn-collapsed");
}

function bindMenuButton(config) {
    const button = document.getElementById(config.id);
    const image = button?.querySelector("img");

    const state = {
        button,
        image,
        icons: config.icons,
        panel: config.panel,
        title: config.title,
        pressed: config.pressed ?? true,
        isHomeView: config.isHomeView ?? false
    };

    menuButtons[config.key] = state;

    button?.addEventListener("mousedown", () => {
        clear_Btns();

        if (image) {
            image.src = config.icons.on;
        }
    });

    button?.addEventListener("mouseup", () => {
        updateBottomNavLayout(state.isHomeView);

        if (image) {
            image.src = config.icons.off;
        }

        toggleHomePanel(config.panel);

        if (config.title) {
            ttl_pnl_ctrl.textContent = config.title;
        }

        if (state.pressed) {
            button?.classList.add("pressed");

            if (image) {
                image.src = config.icons.on;
            }
        }
    });

    return state;
}

bindMenuButton({
    key: "tendencias",
    id: "btn-tend",
    icons: {
        off: "../static/icon/Home/btns/Icono_Tendencias_Default.svg",
        on: "../static/icon/Home/btns/Icono_Tendencias_Active.svg"
    },
    panel: "tendencias",
    title: "Tendencias"
});

bindMenuButton({
    key: "bascula",
    id: "btn-basc",
    icons: {
        off: "../static/icon/Home/btns/Icono_Bascula_Default.svg",
        on: "../static/icon/Home/btns/Icono_Bascula_Active.svg"
    },
    panel: "bascula",
    title: "Báscula"
});

bindMenuButton({
    key: "apgar",
    id: "btn-apgr",
    icons: {
        off: "../static/icon/Home/btns/Icono_APGAR_Default.svg",
        on: "../static/icon/Home/btns/Icono_APGAR_Active.svg"
    },
    panel: "apgar",
    title: "Cronometro APGAR"
});

bindMenuButton({
    key: "familiar",
    id: "btn-md-fam",
    icons: {
        off: "../static/icon/Home/btns/Icono_MFamiliar_Default.svg",
        on: "../static/icon/Home/btns/Icono_MFamiliar_Active.svg"
    },
    panel: "familiar",
    title: "Modo Familia",
    pressed: false
});

bindMenuButton({
    key: "home",
    id: "btn-home",
    icons: {
        off: "../static/icon/Home/btns/Icono_Home_Default.svg",
        on: "../static/icon/Home/btns/Icono_Home_Active.svg"
    },
    panel: "home",
    pressed: false,
    isHomeView: true
});

// ====================
// Funciones Botones
// ====================
function clear_Btns() {
    Object.values(menuButtons).forEach(
        ({ button, image, icons }) => {
            if (image) {
                image.src = icons.off;
            }

            button?.classList.remove("pressed");
        }
    );
}

// =============================
// Control de cambio de paneles
// =============================
const infoCtrl = document.querySelector(".mp-info-ctrl");
const tituloCtrl = document.querySelector(".mp-atpiel-mc-ttl");
const iconoControl = document.querySelector(".icon-ctrl");

const CLASES_CONTROL = [
    "tp",
    "ta",
    "ox",
    "hum",
    "fot"
];

const SELECTOR_ELEMENTOS_INTERNOS = [
    ".lbl-ttl-cont-lat",
    ".ti-vm-sens",
    ".val-units-sens-cont-lat",
    ".val-perc-sens-cont-lat"
].join(", ");

const configuracionPaneles = {
    tempPielProg: {
        claseColor: "tp",
        controles: ["tempPiel", "tempProg"],
        icono: "../static/icon/Control/Icon_ModoBebe.svg"
    },

    tempAireProg: {
        claseColor: "ta",
        controles: ["tempAire", "tempProg"],
        icono: "../static/icon/Control/Icon_ModoAire.svg"
    },

    ajstOx: {
        claseColor: "ox",
        controles: ["oxigeno"],
        icono: "../static/icon/Control/Icon_Oxigeno.svg"
    },

    ajstHum: {
        claseColor: "hum",
        controles: ["humedad"],
        icono: "../static/icon/Control/Icon_Humedad.svg"
    },

    ajstFot: {
        claseColor: "fot",
        controles: ["fototerapia"],
        icono: "../static/icon/Control/Icon_Fototerapia.svg"
    },

    tendencias: {
        claseColor: "tp",
        controles: ["tendencias"]
    },

    bascula: {
        claseColor: "tp",
        controles: ["bascula"]
    },

    apgar: {
        claseColor: "tp",
        controles: ["apgar"]
    },

    familiar: {
        claseColor: "tp",
        controles: ["familiar"]
    }
};

const visibilidadPaneles = {
    bascula: {
        ctrl_sens: false,
        view_fam: false,
        view_tend: false,
        ctrl_apgar: false,
        ctrl_basc: true
    },

    apgar: {
        ctrl_sens: false,
        view_fam: false,
        view_tend: false,
        ctrl_apgar: true,
        ctrl_basc: false
    },

    tendencias: {
        ctrl_sens: false,
        view_fam: false,
        view_tend: true,
        ctrl_apgar: false,
        ctrl_basc: false
    },

    familiar: {
        ctrl_sens: false,
        view_fam: true,
        view_tend: false,
        ctrl_apgar: false,
        ctrl_basc: false
    },

    default: {
        ctrl_sens: true,
        view_fam: false,
        view_tend: false,
        ctrl_apgar: false,
        ctrl_basc: false
    }
};

/**
 * Limpia los estados visuales aplicados a un elemento.
 * @param {HTMLElement|null} elemento Elemento a limpiar.
 */
function limpiarEstadoElemento(elemento) {
    if (!elemento) {
        return;
    }

    elemento.classList.remove(
        ...CLASES_CONTROL,
        "enable"
    );

    elemento
        .querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS)
        .forEach((elementoInterno) => {
            elementoInterno.classList.remove(
                ...CLASES_CONTROL,
                "enable"
            );
        });
}

/**
 * Habilita el estado visual de un elemento con una clase de color.
 * @param {HTMLElement|null} elemento Elemento a modificar.
 * @param {string} claseColor Clase de color a aplicar.
 */
function habilitarEstadoElemento(elemento, claseColor) {
    if (!elemento) {
        return;
    }

    elemento.classList.add(claseColor, "enable");
}

/**
 * Limpia los estados visuales de los controles laterales.
 */
function limpiarControlesLaterales() {
    const controles = document.querySelectorAll(
        ".mp-atpiel-lat"
    );

    controles.forEach((control) => {
        limpiarEstadoElemento(control);

        control
            .querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS)
            .forEach((elemento) => {
                elemento.classList.remove("enable");
            });
    });
}

/**
 * Habilita los controles laterales para un panel concreto.
 * @param {string[]} controles Lista de nombres de control.
 * @param {string} claseColor Clase de color a aplicar.
 */
function habilitarControlesLaterales(
    controles,
    claseColor
) {
    controles.forEach((nombreControl) => {
        const control = document.querySelector(
            `.mp-atpiel-lat[data-control="${nombreControl}"]`
        );

        if (!control) {
            console.warn(
                `No se encontró .mp-atpiel-lat[data-control="${nombreControl}"]`
            );

            return;
        }

        habilitarEstadoElemento(control, claseColor);

        control
            .querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS)
            .forEach((elemento) => {
                elemento.classList.add(
                    claseColor,
                    "enable"
                );
            });
    });
}

/**
 * Cambia el panel activo de la interfaz y aplica el tema.
 * @param {string} showPanelControl Panel a mostrar.
 */
function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) {
        return;
    }

    const mostrarHome = showPanelControl === "home";

    const configuracion =
        configuracionPaneles[showPanelControl];

    limpiarEstadoElemento(infoCtrl);
    limpiarEstadoElemento(tituloCtrl);
    limpiarControlesLaterales();

    if (configuracion) {
        const {
            claseColor,
            controles,
            icono
        } = configuracion;

        const panelKey = controles[0];

        const visibilidad =
            visibilidadPaneles[panelKey] ??
            visibilidadPaneles.default;

        habilitarEstadoElemento(
            infoCtrl,
            claseColor
        );

        habilitarEstadoElemento(
            tituloCtrl,
            claseColor
        );

        if (
            panelKey === "tempPiel" ||
            panelKey === "tempAire" ||
            panelKey === "oxigeno"
        ) {
            habilitarControlesLaterales(
                controles,
                claseColor
            );
        }

        ctrl_sens.style.display =
            visibilidad.ctrl_sens
                ? "block"
                : "none";

        view_fam.style.display =
            visibilidad.view_fam
                ? "block"
                : "none";

        view_tend.style.display =
            visibilidad.view_tend
                ? "block"
                : "none";

        ctrl_apgar.style.display =
            visibilidad.ctrl_apgar
                ? "block"
                : "none";

        ctrl_basc.style.display =
            visibilidad.ctrl_basc
                ? "block"
                : "none";

        if (iconoControl && icono) {
            iconoControl.src = icono;
        }
    } else if (!mostrarHome) {
        console.warn(
            `No existe configuración para el panel: "${showPanelControl}"`
        );
    }

    homeDiv.style.display =
        mostrarHome
            ? "block"
            : "none";

    panelControl.style.display =
        mostrarHome
            ? "none"
            : "block";
}

/**
 * Habilita la edición del control indicado.
 * @param {string} ctrlLbl Etiqueta del control a editar.
 */
async function set_EditCtrlsEn(ctrlLbl) {
    try {
        const res = await fetch("/api/enEdit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Ctrl: ctrlLbl,
                Enable: true
            })
        });

        if (res.status === 200) {
            const rt = await res.json();

            if (
                ctrlLbl === "tp_Prog" ||
                ctrlLbl === "ta_Prog"
            ) {
                updateControlDisplay(
                    rt.valor,
                    "°C"
                );
            } else if (ctrlLbl === "pot_Fot") {
                updateControlDisplay(
                    rt.valor,
                    ""
                );
            } else {
                updateControlDisplay(
                    rt.valor,
                    "%"
                );
            }

            if (activeSlider === "sliderFot") {
                updateFotSliderValue?.(
                    Number(rt.valor)
                );
            } else {
                updateSlider10Value?.(
                    Number(rt.valor)
                );
            }
        }

        if (!intervalEncod) {
            intervalEncod = setInterval(
                edit_valProg,
                100
            );
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

/**
 * Lee el valor actualizado desde la API.
 */
async function edit_valProg() {
    try {
        const res = await fetch(
            "/api/editValProg",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

        if (res.status === 200) {
            const encd = await res.json();
            const nuevoValor = Number(encd.val);

            if (encd.ctrl === "pot_Fot") {
                updateControlDisplay(
                    nuevoValor,
                    ""
                );

                updateFotSliderValue?.(
                    nuevoValor
                );
            } else {
                const unidad =
                    encd.ctrl === "tp_Prog" ||
                    encd.ctrl === "ta_Prog"
                        ? "°C"
                        : "%";

                updateControlDisplay(
                    nuevoValor,
                    unidad
                );

                updateSlider10Value?.(
                    nuevoValor
                );
            }

            if (!encd.confirm && intervalEncod) {
                switch (encd.ctrl) {
                    case "tp_Prog":
                        tempProg.textContent =
                            formatValue(
                                nuevoValor,
                                sliderConfig.step
                            );

                        viewCtrl.textContent =
                            formatValue(
                                nuevoValor,
                                sliderConfig.step
                            );
                        break;

                    case "pot_Hum":
                        humCtrl.textContent =
                            formatValue(
                                nuevoValor,
                                sliderConfig.step
                            );
                        break;

                    default:
                        break;
                }

                toggleHomePanel("home");

                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const SLIDER_THEMES = [
    "seg-t_piel",
    "seg-t_aire",
    "seg-p_ox",
    "seg-p_hum"
];

function setSegmentTheme(seg, index, theme) {
    SLIDER_THEMES.forEach((themeName) => {
        seg.classList.remove(
            `${themeName}-${index}`
        );
    });

    seg.classList.add(`${theme}-${index}`);
}

// --------------------------------
// Slider de 10 segmentos
// --------------------------------
document.addEventListener(
    "DOMContentLoaded",
    () => {
        const slider =
            document.getElementById(
                "tpielSlider"
            );

        const knob =
            document.getElementById(
                "tpielKnob"
            );

        if (!slider || !knob) {
            return;
        }

        sliderConfig =
            getSliderConfig(slider);

        const segments = [
            ...slider.querySelectorAll(
                ".ctrl-slider-seg"
            )
        ];

        const points = [
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

        function clamp(
            value,
            minValue,
            maxValue
        ) {
            return Math.min(
                Math.max(value, minValue),
                maxValue
            );
        }

        function roundToStep(value) {
            const { step } = sliderConfig;

            return (
                Math.round(value / step) *
                step
            );
        }

        function valueToSegment(value) {
            const { min, max } =
                sliderConfig;

            if (max <= min) {
                return 0;
            }

            const ratio = clamp(
                (value - min) / (max - min),
                0,
                1
            );

            return clamp(
                Math.floor(ratio * 10),
                0,
                9
            );
        }

        function updateSlider(value) {
            const {
                min,
                max,
                step
            } = sliderConfig;

            const numericValue =
                Number(value);

            const safeValue =
                Number.isFinite(numericValue)
                    ? numericValue
                    : min;

            const clampedValue = clamp(
                roundToStep(safeValue),
                min,
                max
            );

            const selectedSegment =
                valueToSegment(clampedValue);

            const point =
                points[selectedSegment];

            knob.setAttribute(
                "cx",
                point.x
            );

            knob.setAttribute(
                "cy",
                point.y
            );

            segments.forEach((seg) => {
                const index =
                    Number(seg.dataset.seg);

                const isActive =
                    index <= selectedSegment;

                const isSelected =
                    index === selectedSegment;

                setSegmentTheme(
                    seg,
                    index,
                    sliderConfig.theme
                );

                seg.classList.toggle(
                    "active",
                    isActive
                );

                seg.classList.toggle(
                    "inactive",
                    !isActive
                );

                seg.classList.toggle(
                    "selected",
                    isSelected
                );
            });

            slider.dataset.value =
                formatValue(
                    clampedValue,
                    step
                );

            if (valCtrl) {
                valCtrl.textContent =
                    formatValue(
                        clampedValue,
                        step
                    );
            }

            slider.dispatchEvent(
                new CustomEvent(
                    "tpiel-slider-change",
                    {
                        detail: {
                            value:
                                clampedValue,
                            segment:
                                selectedSegment,
                            min,
                            max,
                            step
                        }
                    }
                )
            );
        }

        updateSlider10Value =
            updateSlider;

        const initialValue = Number(
            slider.dataset.value ??
            sliderConfig.min
        );

        updateSlider(initialValue);
    }
);

// --------------------------------
// Slider de Fototerapia
// 3 segmentos
// --------------------------------
document.addEventListener(
    "DOMContentLoaded",
    () => {
        const slider =
            document.getElementById(
                "fotSlider"
            );

        const knob =
            document.getElementById(
                "fotKnob"
            );

        if (!slider) {
            return;
        }

        const segments = [
            ...slider.querySelectorAll(
                ".ctrl-slider-seg"
            )
        ];

        const min = 1;
        const max = 3;

        const points = [
            { x: 36, y: 218 },
            { x: 148, y: 18.5 },
            { x: 260, y: 218 }
        ];

        function updateFotSlider(value) {
            const numericValue =
                Number(value);

            const safeValue =
                Number.isFinite(numericValue)
                    ? numericValue
                    : min;

            const clampedValue = Math.min(
                Math.max(
                    Math.round(safeValue),
                    min
                ),
                max
            );

            const selectedSegment =
                clampedValue - min;

            if (knob) {
                const point =
                    points[selectedSegment];

                knob.setAttribute(
                    "cx",
                    point.x
                );

                knob.setAttribute(
                    "cy",
                    point.y
                );
            }

            segments.forEach((seg) => {
                const index =
                    Number(seg.dataset.seg);

                seg.classList.toggle(
                    "active",
                    index <= selectedSegment
                );

                seg.classList.toggle(
                    "inactive",
                    index > selectedSegment
                );

                seg.classList.toggle(
                    "selected",
                    index === selectedSegment
                );
            });

            slider.dataset.value =
                String(clampedValue);

            if (
                activeSlider ===
                "sliderFot"
            ) {
                updateControlDisplay(
                    clampedValue,
                    ""
                );
            }

            slider.dispatchEvent(
                new CustomEvent(
                    "fot-slider-change",
                    {
                        detail: {
                            value:
                                clampedValue,
                            segment:
                                selectedSegment,
                            min,
                            max,
                            step: 1
                        }
                    }
                )
            );
        }

        updateFotSliderValue =
            updateFotSlider;

        updateFotSlider(
            Number(
                slider.dataset.value ??
                min
            )
        );
    }
);

// Botón Cancelar
btnCancel?.addEventListener("click", () => {
    clearInterval(intervalEncod);
    intervalEncod = null;

    toggleHomePanel("home");
});