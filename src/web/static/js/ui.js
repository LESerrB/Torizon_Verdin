let intervalEncod = null;
let updateSliderValue = null;
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
function updateControlDisplay(value, unit = "°C") {
    valCtrl.textContent = formatValue(value, sliderConfig.step);
    unitsCtrl.textContent = unit;
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
        step: Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : defaults.step
    };
}

function setSliderConfig({ min, max, step, value, unit, theme }) {
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

    if (typeof updateSliderValue === "function" && value !== undefined) {
        updateSliderValue(Number(value));
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
    ttl_pnl_ctrl.textContent = "Ajuste de Control de Temperatura de Piel";
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

    set_EditCtrlsEn("tp_Prog");
});

pnlAire?.addEventListener("click", () => {
    toggleHomePanel("tempAireProg");
    ttl_pnl_ctrl.textContent = "Ajuste de Control de Temperatura de Aire"
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

    set_EditCtrlsEn("ta_Prog");
});

ajstCtrlOx?.addEventListener("click", () => {
    toggleHomePanel("ajstOx");
    ttl_pnl_ctrl.textContent = "Ajuste de Oxigeno Programado"

    const valor = valsCtrl?.vals?.pot_Ox ?? 0;

    setSliderConfig({
        min: 0,
        max: 100,
        step: 1,
        value: valor,
        unit: "%",
        theme: "seg-p_ox"
    });

    set_EditCtrlsEn("pot_Ox");
});

ajstCtrlHum?.addEventListener("click", () => {
    toggleHomePanel("ajstHum");
    ttl_pnl_ctrl.textContent = "Ajuste de Humedad Programada";

    const valor = valsCtrl?.vals?.pot_Hum ?? 0;

    setSliderConfig({
        min: 0,
        max: 100,
        step: 1,
        value: valor,
        unit: "%",
        theme: "seg-p_hum"
    });

    set_EditCtrlsEn("pot_Hum");
});

ajstCtrlFot?.addEventListener("click", () => {
    toggleHomePanel("ajstFot");
    ttl_pnl_ctrl.textContent = "Ajuste de Potencia de Fototerapia"
});

// =================================
// Botones Menú Inferior
// =================================
const btn_tend = document.getElementById("btn-tend");
const imgTendencias = btn_tend?.querySelector("img");
const tendencias = {
    off: "../static/icon/Home/btns/Icono_Tendencias_Default.svg",
    on: "../static/icon/Home/btns/Icono_Tendencias_Active.svg",
};

const btn_basc = document.getElementById("btn-basc");
const imgBascula = btn_basc?.querySelector("img");
const bascula = {
    off: "../static/icon/Home/btns/Icono_Bascula_Default.svg",
    on: "../static/icon/Home/btns/Icono_Bascula_Active.svg",
};

const btn_apgr = document.getElementById("btn-apgr");
const imgApgar = btn_apgr?.querySelector("img");
const apgar = {
    off: "../static/icon/Home/btns/Icono_APGAR_Default.svg",
    on: "../static/icon/Home/btns/Icono_APGAR_Active.svg",
};

const btn_md_fam = document.getElementById("btn-md-fam");
const imgFam = btn_md_fam?.querySelector("img");
const familiar = {
    off: "../static/icon/Home/btns/Icono_MFamiliar_Default.svg",
    on: "../static/icon/Home/btns/Icono_MFamiliar_Active.svg",
};

const btn_home = document.getElementById("btn-home");
const imgHome = btn_home?.querySelector("img");
const home = {
    off: "../static/icon/Home/btns/Icono_Home_Default.svg",
    on: "../static/icon/Home/btns/Icono_Home_Active.svg",
};

btn_tend?.addEventListener("mousedown", () => {
    clear_Btns();
    imgTendencias.src = tendencias.on;
});

btn_tend?.addEventListener("mouseup", () => {
    btn_md_fam.classList.add("btn-collapsed");
    btn_home.classList.remove("btn-collapsed");

    imgTendencias.src = tendencias.off;

    toggleHomePanel("tendencias");
    ttl_pnl_ctrl.textContent = "Tendencias";

    btn_tend.classList.add("pressed");
    imgTendencias.src = tendencias.on;
});

btn_basc?.addEventListener("mousedown", () => {
    clear_Btns();
    imgBascula.src = bascula.on;
});

btn_basc?.addEventListener("mouseup", () => {
    btn_md_fam.classList.add("btn-collapsed");
    btn_home.classList.remove("btn-collapsed");

    imgBascula.src = bascula.off;

    toggleHomePanel("bascula");
    ttl_pnl_ctrl.textContent = "Báscula";

    btn_basc.classList.add("pressed");
    imgBascula.src = bascula.on;
});

btn_apgr?.addEventListener("mousedown", () => {
    clear_Btns();
    imgApgar.src = apgar.on;
});

btn_apgr?.addEventListener("mouseup", () => {
    btn_md_fam.classList.add("btn-collapsed");
    btn_home.classList.remove("btn-collapsed");

    imgApgar.src = apgar.off;

    toggleHomePanel("apgar");
    ttl_pnl_ctrl.textContent = "Cronometro APGAR";

    btn_apgr.classList.add("pressed");
    imgApgar.src = apgar.on;
});

btn_md_fam?.addEventListener("mousedown", () => {
    clear_Btns();
    imgFam.src = familiar.on;
});

btn_md_fam?.addEventListener("mouseup", () => {
    btn_md_fam.classList.add("btn-collapsed");
    btn_home.classList.remove("btn-collapsed");

    imgFam.src = familiar.off;

    toggleHomePanel("familiar");
    ttl_pnl_ctrl.textContent = "Modo Familia";
});

btn_home?.addEventListener("mousedown", () => {
    clear_Btns();
    imgHome.src = home.on;
});

btn_home?.addEventListener("mouseup", () => {
    btn_home.classList.add("btn-collapsed");
    btn_md_fam.classList.remove("btn-collapsed");

    imgHome.src = home.off;

    toggleHomePanel("home");
});

// ====================
// Funciones Botones
// ====================
function clear_Btns() {
    imgFam.src = familiar.off;
    imgTendencias.src = tendencias.off;
    imgBascula.src = bascula.off;
    imgApgar.src = apgar.off;

    btn_md_fam?.classList.remove("pressed");
    btn_tend?.classList.remove("pressed");
    btn_basc?.classList.remove("pressed");
    btn_apgr?.classList.remove("pressed");
}

// =============================
// Control de cambio de paneles
// =============================
const infoCtrl = document.querySelector(".mp-info-ctrl");
const tituloCtrl = document.querySelector(".mp-atpiel-mc-ttl");
const iconoControl = document.querySelector(".icon-ctrl");

const CLASES_CONTROL = ["tp", "ta", "ox", "hum", "fot"];

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
        controles: ["tendencias"],
    },

    bascula: {
        claseColor: "tp",
        controles: ["bascula"],
    },

    apgar: {
        claseColor: "tp",
        controles: ["apgar"],
    },

    familiar: {
        claseColor: "tp",
        controles: ["familiar"],
    },
};

/**
 * Limpia los estados visuales aplicados a un elemento.
 * @param {HTMLElement|null} elemento Elemento a limpiar.
 */
function limpiarEstadoElemento(elemento) {
    if (!elemento) {
        return;
    }

    elemento.classList.remove(...CLASES_CONTROL, "enable");

    elemento.querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS).forEach((elementoInterno) => {
        elementoInterno.classList.remove(...CLASES_CONTROL, "enable");
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
    const controles = document.querySelectorAll(".mp-atpiel-lat");

    controles.forEach((control) => {
        limpiarEstadoElemento(control);

        control.querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS).forEach((elemento) => {
            elemento.classList.remove("enable");
        });
    });
}

/**
 * Habilita los controles laterales para un panel concreto.
 * @param {string[]} controles Lista de nombres de control.
 * @param {string} claseColor Clase de color a aplicar.
 */
function habilitarControlesLaterales(controles, claseColor) {
    controles.forEach((nombreControl) => {
        const control = document.querySelector(
            `.mp-atpiel-lat[data-control="${nombreControl}"]`
        );

        if (!control) {
            console.warn(`No se encontró .mp-atpiel-lat[data-control="${nombreControl}"]`);
            return;
        }

        habilitarEstadoElemento(control, claseColor);

        control.querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS).forEach((elemento) => {
            elemento.classList.add(claseColor, "enable");
        });
    });
}

/**
 * Cambia el panel activo de la interfaz y aplica el tema del control.
 * @param {string} showPanelControl Nombre del panel a mostrar.
 */
function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) {
        return;
    }

    const mostrarHome = showPanelControl === "home";
    const configuracion = configuracionPaneles[showPanelControl];

    limpiarEstadoElemento(infoCtrl);
    limpiarEstadoElemento(tituloCtrl);
    limpiarControlesLaterales();

    if (configuracion) {
        const { claseColor, controles, icono } = configuracion;

        habilitarEstadoElemento(infoCtrl, claseColor);
        habilitarEstadoElemento(tituloCtrl, claseColor);

        if (controles[0] == "tempPiel" || controles[0] == "tempAire" || controles[0] == "oxigeno") {
            habilitarControlesLaterales(controles, claseColor);
        }

        if (controles[0] == "bascula") {
            ctrl_sens.style.display = "none";
            view_fam.style.display = "none";
            view_tend.style.display = "none";
            ctrl_apgar.style.display = "none";
            ctrl_basc.style.display = "block";
        }
        else if (controles[0] == "apgar"){
            ctrl_sens.style.display = "none";
            view_fam.style.display = "none";
            view_tend.style.display = "none";
            ctrl_apgar.style.display = "block";
            ctrl_basc.style.display = "none";
        }
        else if (controles[0] == "tendencias"){
            ctrl_sens.style.display = "none";
            view_fam.style.display = "none";
            view_tend.style.display = "block";
            ctrl_apgar.style.display = "none";
            ctrl_basc.style.display = "none";
        }
        else if (controles[0] == "familiar"){
            ctrl_sens.style.display = "none";
            view_fam.style.display = "block";
            view_tend.style.display = "none";
            ctrl_apgar.style.display = "none";
            ctrl_basc.style.display = "none";
        }
        else {
            ctrl_sens.style.display = "block";
            view_fam.style.display = "none";
            view_tend.style.display = "none";
            ctrl_apgar.style.display = "none";
            ctrl_basc.style.display = "none";
        }

        if (iconoControl && icono) {
            iconoControl.src = icono;
        }
    } else if (!mostrarHome) {
        console.warn(`No existe configuración para el panel: "${showPanelControl}"`);
    }

    homeDiv.style.display = mostrarHome ? "block" : "none";
    panelControl.style.display = mostrarHome ? "none" : "block";
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

            if (ctrlLbl == "tp_Prog" || ctrlLbl == "ta_Prog") {
                updateControlDisplay(rt.valor, "°C");
            } else {
                updateControlDisplay(rt.valor, "%");
            }

            if (typeof updateSliderValue === "function") {
                updateSliderValue(Number(rt.valor));
            }
        }

        if (!intervalEncod) {
            intervalEncod = setInterval(edit_valProg, 100);
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

/**
 * Lee el valor actualizado desde la API y lo refleja en la interfaz.
 */
async function edit_valProg() {
    try {
        const res = await fetch("/api/editValProg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status === 200) {
            const encd = await res.json();
            const nuevoValor = Number(encd.val);

            
            valCtrl.textContent = formatValue(nuevoValor, sliderConfig.step);
            
            if (typeof updateSliderValue === "function") {
                updateSliderValue(nuevoValor);
            }
                
            if (!encd.confirm && intervalEncod) {
                switch (encd.ctrl) {
                    case "tp_Prog":
                        tempProg.textContent = formatValue(nuevoValor, sliderConfig.step);
                        viewCtrl.textContent = formatValue(nuevoValor, sliderConfig.step);
                    break;

                    case "pot_Hum":
                        humCtrl.textContent = formatValue(nuevoValor, sliderConfig.step);
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
    "seg-p_hum",
];

function setSegmentTheme(seg, index, theme) {
    SLIDER_THEMES.forEach((themeName) => {
        seg.classList.remove(`${themeName}-${index}`);
    });

    seg.classList.add(`${theme}-${index}`);
}
// --------------------------------
// Animación del slider de encoder
// --------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("tpielSlider");
    const knob = document.getElementById("tpielKnob");

    if (!slider || !knob) {
        return;
    }

    sliderConfig = getSliderConfig(slider);

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];

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

    function clamp(value, minValue, maxValue) {
        return Math.min(Math.max(value, minValue), maxValue);
    }

    function roundToStep(value) {
        const { step } = sliderConfig;
        return Math.round(value / step) * step;
    }

    function valueToSegment(value) {
        const { min, max } = sliderConfig;

        if (max <= min) {
            return 0;
        }

        const ratio = clamp((value - min) / (max - min), 0, 1);

        return clamp(Math.floor(ratio * 10), 0, 9);
    }

    function updateSlider(value) {
        const { min, max, step } = sliderConfig;

        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? numericValue : min;

        const clampedValue = clamp(roundToStep(safeValue), min, max);
        const selectedSegment = valueToSegment(clampedValue);
        const point = points[selectedSegment];

        knob.setAttribute("cx", point.x);
        knob.setAttribute("cy", point.y);

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);
            const isActive = index <= selectedSegment;
            const isSelected = index === selectedSegment;

            setSegmentTheme(seg, index, sliderConfig.theme);

            seg.classList.toggle("active", isActive);
            seg.classList.toggle("inactive", !isActive);
            seg.classList.toggle("selected", isSelected);
        });

        slider.dataset.value = formatValue(clampedValue, step);

        if (valCtrl) {
            valCtrl.textContent = formatValue(clampedValue, step);
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

    updateSliderValue = updateSlider;

    const initialValue = Number(slider.dataset.value ?? sliderConfig.min);
    updateSlider(initialValue);
});

// Botón Cancelar
btnCancel?.addEventListener("click", () => {
    clearInterval(intervalEncod);
    intervalEncod = null;
    toggleHomePanel("home");
});