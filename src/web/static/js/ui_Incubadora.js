import {
    initTemperaturePowerSlider,
    initFototerapiaSlider,
    crearSliderPotCalef,
    createSliderIntensFot
} from "./slider.js";

let intervalEncod = null;
let updateSlider10Value = null;
let updateFotSliderValue = null;
let activeSlider = "slider10";
let valsCtrl = null;
let updateSliderPowCalef_pPrin = null;
let updateSliderIntenseFot_pPrin = null;

let timerChngAjst = null;
let fotoEn = false;
let secs2Conf = 4;

let sliderConfig = {
    min: 34.0,
    max: 38.0,
    step: 0.1,
    theme: "seg-t_piel"
};

const homeDiv = document.getElementById("home");
const panelControl = document.getElementById("panel-control");

const title_panel_prin = document.querySelector(".ttl-pnl-prin");
//---------------------------------------------------------------
// Vista principal (Home)
const tempProg = document.getElementById("tp_prog");
const humCtrl = document.getElementById("hum_prog");
const oxCtrl = document.getElementById("ox_prog");

//---------------------------------------------------------------
// Vista Panel de Control
const ttl_pnl_ctrl = document.getElementById("ttl-pnl-ctrl");
const slider10 = document.getElementById("tpielSlider");
const sliderFot = document.getElementById("fotSlider");

//---------------------------------------------------------------
// Control de Sensores
const ctrl_sens = document.getElementById("ctrl-sensores");
const view_tend = document.getElementById("view-tend");
const ctrl_basc = document.getElementById("ctrl-bascula");
const ctrl_apgar = document.getElementById("ctrl-apgar");
const view_fam = document.getElementById("view-fam");

//---------------------------------------------------------------
// Valor del encoder / control
const valCtrl = document.getElementById("val_Ctrl");
const unitsCtrl = document.getElementById("units_Ctrl");

//---------------------------------------------------------------
// Vista lateral
const ttl_programada = document.getElementById("ttl-programada")
const viewCtrl = document.getElementById("vw-valProg");

//---------------------------------------------------------------
// Panel de modulo de fototerapia
const ajstCtrlFot = document.getElementById("mod-fot");
const fot_panel = document.getElementById("fot-panel");
const confirmacion_fot = document.getElementById("confirmacion-fot");
const fot_ttl = document.getElementById("fot-ttl");
const fot_hrs = document.getElementById("fot-hrs");
const seg_potencia_fot = document.getElementById("seg-potencia-fot");

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

    if (typeof updateSlider10Value === "function" && value !== undefined) {
        updateSlider10Value(Number(value));
    }

    if (value !== undefined) {
        updateControlDisplay(Number(value), unit);
    }

    if (typeof tempPowerSliderController?.setConfig === "function") {
        tempPowerSliderController.setConfig({
            min,
            max,
            step,
            value,
            theme
        });
    }
}

// =======================================
// Configuración de Paneles de control
// =======================================
export function ajstCtrl_TPiel() {
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

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("tp_Prog");
};

export function ajstCtrl_TAire() {
    toggleHomePanel("tempAireProg");
    ttl_pnl_ctrl.textContent = "Ajuste de Control de Temperatura de Aire";
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
};

export function ajst_CtrlOx() {
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
};

export function ajst_CtrlHum() {
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

    slider10.classList.remove("slider-collapsed");
    sliderFot.classList.add("slider-collapsed");

    set_EditCtrlsEn("pot_Hum");
};

export function ajst_CtrlFot() {
    toggleHomePanel("ajstFot");
    ttl_pnl_ctrl.textContent = "Ajuste de Intensidad de Fototerapia";
    activeSlider = "sliderFot";

    const valor = valsCtrl?.vals?.pot_Fot ?? 1;

    updateControlDisplay(valor, "");

    if (typeof updateFotSliderValue === "function") {
        updateFotSliderValue(Number(valor));
    }

    slider10?.classList.add("slider-collapsed");
    sliderFot?.classList.remove("slider-collapsed");

    set_EditCtrlsEn("pot_Fot");
};

// -----------------------------
// Control de cambio de paneles
// -----------------------------
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
    const controles = document.querySelectorAll(".mp-atpiel-lat");

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
function habilitarControlesLaterales(controles, claseColor) {
    controles.forEach((nombreControl) => {
        const control = document.querySelector(`.mp-atpiel-lat[data-control="${nombreControl}"]`);

        if (!control) {
            console.warn(`No se encontró .mp-atpiel-lat[data-control="${nombreControl}"]`);

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
export function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) {
        return;
    }

    const mostrarHome = showPanelControl === "home";

    const configuracion = configuracionPaneles[showPanelControl];

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

        const visibilidad = visibilidadPaneles[panelKey] ?? visibilidadPaneles.default;

        habilitarEstadoElemento(infoCtrl, claseColor);
        habilitarEstadoElemento(tituloCtrl, claseColor);

        if (panelKey === "tempPiel" || panelKey === "tempAire" || panelKey === "oxigeno") {
            habilitarControlesLaterales(controles, claseColor);
        }

        ctrl_sens.style.display = visibilidad.ctrl_sens ? "block" : "none";
        view_fam.style.display = visibilidad.view_fam ? "block" : "none";
        view_tend.style.display = visibilidad.view_tend ? "block" : "none";
        ctrl_apgar.style.display = visibilidad.ctrl_apgar ? "block" : "none";
        ctrl_basc.style.display = visibilidad.ctrl_basc ? "block" : "none";

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

            if (ctrlLbl === "tp_Prog" || ctrlLbl === "ta_Prog") {
                updateControlDisplay(rt.valor, "°C");
            } else if (ctrlLbl === "pot_Fot") {
                updateControlDisplay(rt.valor, "");
            } else {
                updateControlDisplay(rt.valor, "%");
            }

            if (activeSlider === "sliderFot") {
                updateFotSliderValue?.(Number(rt.valor));
            } else {
                updateSlider10Value?.(Number(rt.valor));
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
 * Lee el valor actualizado desde la API.
 */
async function edit_valProg() {
    try {
        const res = await fetch("/api/editValProg",{
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            }
        });

        if (res.status === 200) {
            const encd = await res.json();
            const nuevoValor = Number(encd.val);

            if (encd.ctrl === "pot_Fot") {
                updateControlDisplay(nuevoValor, "");
                updateFotSliderValue?.(nuevoValor);
            } else {
                const unidad = encd.ctrl === "tp_Prog" || encd.ctrl === "ta_Prog" ? "°C" : "%";

                updateControlDisplay(nuevoValor, unidad);
                updateSlider10Value?.(nuevoValor);
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



// ================================================================
// PANELES: Cambio de modo T. Piel <-> T. Aire
// ================================================================
/**
Temporizador de ventana de cambio de modos
*/
export function iniTimerAjst(ajstPnl) {
    clearTimeout(timerChngAjst);

    timerChngAjst = setTimeout(() => {
        if(ajstPnl === "Foto")
            fotoActive();
        else if (ajstPnl.id === "pnl-modoAire"){
            chngModo(ajstPnl);
        }
        else if (ajstPnl.id === "pnl-modoBebe"){
            chngModo(ajstPnl);
        }

    }, (secs2Conf * 1000));
};

// Elementos del DOM - Paneles y controles
const t_aire = document.querySelector(".cont-taire");
const c_modo_Aire = document.querySelector(".pop-cmodo-aire");
const cont_vm_tpiel = document.querySelector(".cont-vm-tpiel");
const pop_mp_prin_mc_tpiel = document.querySelector(".pop-mp-prin-mc-tpiel");
const v_potcal = document.querySelector(".v-potcal");

// Elementos - Temperatura Piel
const lbl_temp_piel = document.querySelector(".lbl-temp-piel");
const line_01 = document.querySelector(".line-01");
const vaux = document.querySelector(".vaux");
const tprogp = document.querySelector(".tprogp");
const elementos_tpiel = document.querySelectorAll(".tpiel .m-Piel");
const elementos_vaux = document.querySelectorAll(".vaux .active");
const icon_tpiel = document.querySelector(".icon-tpiel");

// Elementos - Temperatura Aire
const elementos_taire = t_aire?.querySelectorAll(".taire .txt-Temps, .taire .units-tempAire-Prin");
const lbl_temp_aire = t_aire?.querySelector(".lbl-temp-aire");
const tprog_aire = document.querySelector(".tprog-aire");
const icon_taire = document.querySelector(".icon-taire");
const potcal_ind = v_potcal?.querySelectorAll(".potcal-ini, .perccal-ini");

/**
 * Configuración de modos para cambios de temperatura
 */
const modoConfig = {
    tAire: {
        titleClass: "bckgnd-ctrl-aire",
        titleClassRemove: "bckgnd-ctrl-piel",
        modeClass: "m-Aire",
        modeClassRemove: "m-Piel",
        activePanel: "pnl-modoAire",
        icon: { show: icon_taire, hide: icon_tpiel },
        elements: {
        aire: [t_aire, lbl_temp_aire, tprog_aire],
        piel: [lbl_temp_piel, tprogp, vaux, cont_vm_tpiel],
        hidden: [line_01],
        elementCollections: [
            { elements: elementos_taire, action: "add", class: "m-Aire" },
            { elements: potcal_ind, action: "add", class: "m-Aire" },
            { elements: elementos_vaux, action: "remove", class: "active" }
        ]
        }
    },
    tPiel: {
        titleClass: "bckgnd-ctrl-piel",
        titleClassRemove: "bckgnd-ctrl-aire",
        modeClass: "m-Piel",
        modeClassRemove: "m-Aire",
        activePanel: "pnl-modoBebe",
        icon: { show: icon_tpiel, hide: icon_taire },
        elements: {
        aire: [t_aire, lbl_temp_aire, tprog_aire],
        piel: [lbl_temp_piel, tprogp, vaux],
        visible: [line_01],
        elementCollections: [
            { elements: elementos_tpiel, action: "add", class: "m-Piel" },
            { elements: elementos_vaux, action: "add", class: "active" },
            { elements: elementos_taire, action: "remove", class: "m-Aire" },
            { elements: potcal_ind, action: "remove", class: "m-Aire" }
        ]
        }
    }
};

/**
 * Aplica cambios de clases a múltiples elementos
 * @param {HTMLElement[]} elements Array de elementos
 * @param {string} action "add" o "remove"
 * @param {string} className Clase a aplicar
 */
function toggleElementsClass(elements, action, className) {
    elements?.forEach(el => {
        if (el) el.classList[action](className);
    });
}

/**
 * Cambia entre modo Piel y Aire
 * @param {string} modo "tPiel" o "tAire"
 * @param {HTMLElement} pnlInactivo Panel a desactivar
 * @param {HTMLElement} pnlActivo Panel a activar
 */
function activarModo(modo, pnlInactivo, pnlActivo) {
    const config = modoConfig[modo];
    if (!config) return;

    // Cambiar título
    title_panel_prin.classList.remove(config.titleClassRemove);
    title_panel_prin.classList.add(config.titleClass);

    // Cambiar paneles activos
    pnlInactivo?.classList.remove("active");
    pnlActivo?.classList.add("active");

    // Cambiar iconos
    config.icon.show.style.display = "block";
    config.icon.hide.style.display = "none";

    // Cambiar clases de visibilidad para aire
    toggleElementsClass(config.elements.aire, "add", config.modeClass);
    toggleElementsClass(config.elements.aire, "remove", config.modeClassRemove);

    // Cambiar clases de visibilidad para piel
    toggleElementsClass(config.elements.piel, "add", config.modeClass);
    toggleElementsClass(config.elements.piel, "remove", config.modeClassRemove);

    // Elementos con propiedades específicas
    config.elements.hidden?.forEach(el => {
        if (el) el.style.display = "none";
    });
    config.elements.visible?.forEach(el => {
        if (el) el.style.display = "block";
    });

    // Procesar colecciones de elementos
    config.elements.elementCollections?.forEach(({ elements, action, class: className }) => {
        if (className) {
        toggleElementsClass(elements, action, className);
        }
    });
}

/**
 * Alterna entre modos y ejecuta la acción correspondiente del control
 * @param {HTMLElement} panel Panel que se está modificando
 * @param {string} modoAP Modo a aplicar ("tPiel" o "tAire")
 */
export function chngModo(panel, modoAP) {
    const isModoBebe = panel?.id === "pnl-modoBebe";
    const isModoAire = panel?.id === "pnl-modoAire";

    clearTimeout(timerChngAjst);

    // Cambios de modo confirmados
    if (modoAP === "tPiel" && isModoBebe) {
        ajstCtrl_TPiel();
    } 
    else if (modoAP === "tPiel" && isModoAire) {
        panel.classList.add("chng");
        t_aire.classList.add("disabled");
        c_modo_Aire.classList.add("enabled");
    } 
    else if (modoAP === "tAire" && isModoAire) {
        ajstCtrl_TAire();
    } 
    else if (modoAP === "tAire" && isModoBebe) {
        lbl_temp_piel.textContent = "Cambiar a Modo Piel";
        lbl_temp_piel.classList.remove("m-Aire");
        lbl_temp_piel.classList.add("m-Piel");
        panel.classList.add("chng");
        cont_vm_tpiel.classList.add("c-modo");
        pop_mp_prin_mc_tpiel.classList.add("c-modo");
    } 
    // Cancelación de cambio de modo
    else {
        panel.classList.remove("chng");
        
        if (isModoBebe) {
            lbl_temp_piel.textContent = "Temperatura Piel";
            lbl_temp_piel.classList.remove("m-Piel");
        }

        t_aire.classList.remove("disabled");
        c_modo_Aire.classList.remove("enabled");
        cont_vm_tpiel.classList.remove("c-modo");
        pop_mp_prin_mc_tpiel.classList.remove("c-modo");
    }
}

/**
 * Cambia a modo Aire
 * @param {HTMLElement} pnlB Panel Piel a desactivar
 * @param {HTMLElement} pnlA Panel Aire a activar
 */
export function modoAire(pnlB, pnlA) {
    clearTimeout(timerChngAjst);

    activarModo("tAire", pnlB, pnlA);
    c_modo_Aire?.classList.remove("enabled");
    t_aire?.classList.remove("disabled");
    cont_vm_tpiel.classList.add("m-Piel");

    elementos_tpiel.forEach((elemento) => {
        elemento.classList.remove("m-Piel");
    });
    elementos_taire?.forEach((elemento) => {
        elemento.classList.add("m-Aire");
    });
}

/**
 * Cambia a modo Piel
 * @param {HTMLElement} pnlA Panel Aire a desactivar
 * @param {HTMLElement} pnlB Panel Piel a activar
 */
export function modoPiel(pnlA, pnlB) {
    clearTimeout(timerChngAjst);

    lbl_temp_piel.textContent = "Temperatura Piel";
    activarModo("tPiel", pnlA, pnlB);
    pop_mp_prin_mc_tpiel.classList.remove("c-modo");
    cont_vm_tpiel.classList.remove("c-modo");
    cont_vm_tpiel.classList.remove("m-Piel");

    elementos_tpiel.forEach((elemento) => {
        elemento.classList.add("m-Piel");
    });
    elementos_taire?.forEach((elemento) => {
        elemento.classList.remove("m-Aire");
    });
}



// --------------------------------
// Panel de módulo de fototerapia
// --------------------------------

/**
 * Configuración de estados para el panel de fototerapia
 */
const fotoConfig = {
  active: {
    fot_panel: "block",
    confirmacion_fot: "none",
    ajstCtrlFot_active: false,
    elements: [fot_ttl, fot_hrs, seg_potencia_fot],
    elementAction: "add"
  },
  inactive: {
    fot_panel: "block",
    confirmacion_fot: "none",
    ajstCtrlFot_active: false,
    elements: [fot_ttl, fot_hrs, seg_potencia_fot],
    elementAction: "remove"
  }
};

/**
 * Establece el estado del panel de fototerapia
 * @param {string} estado "active" o "inactive"
 */
function setFotoState(estado) {
  const config = fotoConfig[estado];
  if (!config) return;

  clearTimeout(timerChngAjst);

  fot_panel.style.display = config.fot_panel;
  confirmacion_fot.style.display = config.confirmacion_fot;

  if (config.ajstCtrlFot_active) {
    ajstCtrlFot.classList.add("active");
  } else {
    ajstCtrlFot.classList.remove("active");
  }

  config.elements.forEach(el => {
    if (el) el.classList[config.elementAction]("active");
  });

  if (estado === "active") {
    fotoEn = true;
  }
}

/**
 * Activa el panel de fototerapia
 */
export function fotoActive() {
  setFotoState("active");
}

/**
 * Desactiva el panel de fototerapia
 */
export function fotoInactive() {
  setFotoState("inactive");
  fotoEn = false;
}

/**
 * Confirma o muestra el diálogo de confirmación de ajuste de fototerapia
 */
export function confAjstFoto() {
  if (!fotoEn) {
    clearTimeout(timerChngAjst);
    fot_panel.style.display = 'none';
    confirmacion_fot.style.display = 'block';
    iniTimerAjst("Foto");
  } else {
    ajst_CtrlFot();
    ajstCtrlFot.classList.remove("active");
  }
};


// ================================
// Slider Temperatura y Potencia
// ================================
let tempPowerSliderController = null;
let fotoSliderController = null;
let sliderIntensFot_pPrin = null;
let sliderPowCalef_pPrin = null;

document.addEventListener("DOMContentLoaded", () => {
    sliderPowCalef_pPrin = crearSliderPotCalef(
        "seg-calefactor",
        "potcal-ini",
        100
    );
    updateSliderPowCalef_pPrin = (value) => {
        sliderPowCalef_pPrin?.setLevel(value);
    }

    tempPowerSliderController = initTemperaturePowerSlider({
        sliderId: "tpielSlider",
        knobId: "tpielKnob",
        valCtrlEl: valCtrl,
        formatValueFn: formatValue,
        initialValue: Number(slider10?.dataset.value ?? sliderConfig.min)
    });
    updateSlider10Value = (value) => {
        tempPowerSliderController?.setValue(value);
    };

    sliderIntensFot_pPrin = createSliderIntensFot("seg-potencia-fot", 3);
    updateSliderIntenseFot_pPrin = (value) => {
        sliderIntensFot_pPrin?.setLevel(value);
    };

    fotoSliderController = initFototerapiaSlider({
        sliderId: "fotSlider",
        knobId: "fotKnob",
        initialValue: Number(sliderFot?.dataset.value ?? 1)
    });
    updateFotSliderValue = (value) => {
        fotoSliderController?.setValue(value);
    };
});



export function exitCancel(){
    toggleHomePanel("home");

    // Detiene las peticiones de actialización del Encoder
    clearInterval(intervalEncod);
    intervalEncod = null;

    if (fotoEn){
        fotoEn = !fotoEn;
        fotoInactive()
    }
};