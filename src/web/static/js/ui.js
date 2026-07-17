let intervalEncod = null;
let updateSliderValue = null;
let sliderConfig = { min: 34.0, max: 38.0, step: 0.1 };
let valsCtrl = null;

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

// Valor del encoder / control
const valCtrl = document.getElementById("val_Ctrl");
const unitsCtrl = document.getElementById("units_Ctrl");

// Vista lateral
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

            if (tempProg) {
                tempProg.textContent = valsCtrl.vals.tp_Prog.toFixed(1);
            }
            if (humCtrl) {
                humCtrl.textContent = valsCtrl.vals.pot_Hum.toFixed(0);
            }
            if (oxCtrl) {
                oxCtrl.textContent = valsCtrl.vals.pot_Ox.toFixed(0);
            }
            if (viewCtrl) {
                viewCtrl.textContent = valsCtrl.vals.tp_Prog.toFixed(1);
            }
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
    if (valCtrl) {
        valCtrl.textContent = formatValue(value, sliderConfig.step);
    }
    if (unitsCtrl) {
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
        step: Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : defaults.step
    };
}

// =============================
// Paneles de control
// =============================
pnlBebe?.addEventListener("click", () => {
    set_EditCtrlsEn("tp_Prog");
    toggleHomePanel("tempPielProg");

    sliderConfig = { min: 34.0, max: 38.0, step: 0.1 };

    if (valsCtrl?.vals) {
        updateControlDisplay(valsCtrl.vals.tp_Prog, "°C");
    }
});

pnlAire?.addEventListener("click", () => {
    toggleHomePanel("tempAireProg");
});

ajstCtrlOx?.addEventListener("click", () => {
    toggleHomePanel("ajstOx");
});

ajstCtrlHum?.addEventListener("click", () => {
    set_EditCtrlsEn("pot_Hum");
    toggleHomePanel("ajstHum");

    sliderConfig = { min: 0, max: 100, step: 1 };

    if (valsCtrl?.vals) {
        updateControlDisplay(valsCtrl.vals.pot_Hum, "%");
    }
});

ajstCtrlFot?.addEventListener("click", () => {
    toggleHomePanel("ajstFot");
});

// =================================
// Configuración de botones de menú
// =================================
const botones = {
    familiar: {
        btn: document.getElementById("btn-md-fam"),
        off: "../static/icon/Home/ICON_FAMILIAR.svg",
        on: "../static/icon/Home/btns_pressed/ICON_HOME.svg",
        activo: false
    },

    tendencias: {
        btn: document.getElementById("btn-tend"),
        off: "../static/icon/Home/ICON_TENDENCIAS.svg",
        on: "../static/icon/Home/btns_pressed/ICON_HOME.svg",
        activo: false
    },

    bascula: {
        btn: document.getElementById("btn-basc"),
        off: "../static/icon/Home/ICON_BASCULA.svg",
        on: "../static/icon/Home/btns_pressed/ICON_BASCULA.svg",
        activo: false
    },

    apgar: {
        btn: document.getElementById("btn-apgr"),
        off: "../static/icon/Home/ICON_APGAR.svg",
        on: "../static/icon/Home/btns_pressed/ICON_APGAR.svg",
        activo: false
    }
};

Object.values(botones).forEach((item) => {
    item.img = item.btn?.querySelector("img");
});

// --------------------------------
// Funciones auxiliares de botones
// --------------------------------
function setBoton(nombre, activo) {
    const item = botones[nombre];

    if (!item) {
        return;
    }

    item.activo = activo;
    if (item.img) {
        item.img.src = activo ? item.on : item.off;
    }

    if (nombre !== "familiar" && item.btn) {
        item.btn.classList.toggle("pressed", activo);
    }
}

function desactivarSubBotones(excepto = null) {
    ["tendencias", "bascula", "apgar"].forEach((nombre) => {
        if (nombre !== excepto) {
            setBoton(nombre, false);
        }
    });
}

function activarFamiliar() {
    setBoton("familiar", true);
}

function desactivarTodo() {
    setBoton("familiar", false);
    desactivarSubBotones();
}

// ------------------------
// Eventos de menú
// ------------------------
botones.familiar.btn?.addEventListener("click", () => {
    const nuevoEstado = !botones.familiar.activo;

    if (nuevoEstado) {
        setBoton("familiar", true);
    } else {
        desactivarTodo();
    }
});

["tendencias", "bascula", "apgar"].forEach((nombre) => {
    botones[nombre].btn?.addEventListener("click", () => {
        const nuevoEstado = !botones[nombre].activo;

        activarFamiliar();
        desactivarSubBotones(nombre);
        setBoton(nombre, nuevoEstado);
    });
});

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

    elemento.classList.remove(...CLASES_CONTROL, "enable");
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
            elemento.classList.add("enable");
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

        if (controles[0] !== "humedad" && controles[0] !== "fototerapia") {
            habilitarControlesLaterales(controles, claseColor);
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
        await fetch("/api/enEdit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Ctrl: ctrlLbl,
                Enable: true
            })
        });

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

            if (valCtrl) {
                valCtrl.textContent = formatValue(nuevoValor, sliderConfig.step);
            }
            // if (typeof updateSliderValue === "function") {
            //     updateSliderValue(nuevoValor);
            // }

            if (!encd.confirm && intervalEncod) {
                if (viewCtrl) {
                    viewCtrl.textContent = formatValue(nuevoValor, sliderConfig.step);
                }

                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

// ------------------------------
// Animación del slider de encoder
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("tpielSlider");
    const knob = document.getElementById("tpielKnob");

    if (!slider || !knob) {
        return;
    }

    sliderConfig = getSliderConfig(slider);
    const { min, max, step } = sliderConfig;
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
        return Math.round(value / step) * step;
    }

    function valueToSegment(value) {
        const ratio = (value - min) / (max - min);
        return clamp(Math.round(ratio * 9), 0, 9);
    }

    function updateSlider(value) {
        const clampedValue = clamp(roundToStep(value), min, max);
        const selectedSegment = valueToSegment(clampedValue);
        const point = points[selectedSegment];

        knob.setAttribute("cx", point.x);
        knob.setAttribute("cy", point.y);

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);
            seg.classList.toggle("active", index <= selectedSegment);
            seg.classList.toggle("selected", index === selectedSegment);
        });

        slider.dataset.value = formatValue(clampedValue, step);
        if (valCtrl) {
            valCtrl.textContent = formatValue(clampedValue, step);
        }

        slider.dispatchEvent(
            new CustomEvent("tpiel-slider-change", {
                detail: {
                    value: clampedValue,
                    segment: selectedSegment
                }
            })
        );
    }

    updateSliderValue = updateSlider;
});

// Botón Cancelar
btnCancel?.addEventListener("click", () => {
    clearInterval(intervalEncod);
    intervalEncod = null;
    toggleHomePanel("home");
});