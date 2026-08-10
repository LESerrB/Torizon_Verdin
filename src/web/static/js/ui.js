import {
    initTemperaturePowerSlider,
    initFototerapiaSlider
} from "./slider.js";

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

const homeDiv = document.getElementById("home");
const panelControl = document.getElementById("panel-control");
const btnCancel = document.getElementById("cancel-ctrl");

const title_panel_prin = document.querySelector(".ttl-pnl-prin");
// Vista principal (Home)
//---------------------------------------------------------------
const tempProg = document.getElementById("tp_prog");
const humCtrl = document.getElementById("hum_prog");
const oxCtrl = document.getElementById("ox_prog");

// Vista Panel de Control
//---------------------------------------------------------------
const ttl_pnl_ctrl = document.getElementById("ttl-pnl-ctrl");
const slider10 = document.getElementById("tpielSlider");
const sliderFot = document.getElementById("fotSlider");

// Control de Sensores 
//---------------------------------------------------------------
const ctrl_sens = document.getElementById("ctrl-sensores");
const view_tend = document.getElementById("view-tend");
const ctrl_basc = document.getElementById("ctrl-bascula");
const ctrl_apgar = document.getElementById("ctrl-apgar");
const view_fam = document.getElementById("view-fam");

// Valor del encoder / control
//---------------------------------------------------------------
const valCtrl = document.getElementById("val_Ctrl");
const unitsCtrl = document.getElementById("units_Ctrl");

// Vista lateral
//---------------------------------------------------------------
const ttl_programada = document.getElementById("ttl-programada")
const viewCtrl = document.getElementById("vw-valProg");

// Panel de modulo de fototerapia
//---------------------------------------------------------------
const ajstCtrlFot = document.getElementById("mod-fot");
const fot_panel = document.getElementById("fot-panel");
const confirmacion_fot = document.getElementById("confirmacion-fot");
const fot_ttl = document.getElementById("fot-ttl");
const fot_hrs = document.getElementById("fot-hrs");
const seg_potencia_fot = document.getElementById("seg-potencia-fot");
const btn_ajustar_foto = document.getElementById("btn-ajustar-foto");

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





let timerAjstFot = null;
let fotoEn = false;
let secs2Conf = 4;

function iniTimerAjst(ajstPnl) {
    clearTimeout(timerAjstFot);

    timerAjstFot = setTimeout(() => {
        if(ajstPnl === "foto")
            fotoActive();
        else if (ajstPnl === "tPiel"){
            console.log("Cancelando cambio de modo a tAire");
            chngModo();
        }

    }, (secs2Conf * 1000));
};

// -----------------------------------------
// Panel cambio de modo T. Piel -> T. Aire
// -----------------------------------------
const t_aire = document.querySelector(".cont-taire");
const c_modo_Aire = document.querySelector(".pop-cmodo-aire");

const btn_cnclChngMd = document.getElementById("cnclChngMd");
const btn_acptChngMd = document.getElementById("acptChngMd");

const pnlBebe = document.getElementById("pnl-modoBebe");

export function chngModo(modoAP) {
    if (modoAP === "tPiel") {
        t_aire.classList.add("disabled");
        c_modo_Aire.classList.add("enabled");

        // iniTimerAjst(modoAP);

        // return "tAire"
    } else {
        t_aire.classList.remove("disabled");
        c_modo_Aire.classList.remove("enabled");

        // return "tPiel"
    }
};

const pnlAire = document.getElementById("pnl-modoAire");
const lbl_temp_piel = document.querySelector(".lbl-temp-piel");
const tpiel_txt = document.querySelector(".tpiel");
const line_01 = document.querySelector(".line-01");
const vaux = document.querySelector(".vaux");

const tprogp = document.querySelector(".tprogp");

const elementos_tpiel = document.querySelectorAll(".tpiel .active");
const elementos_vaux = document.querySelectorAll(".vaux .active");

const icon_tpiel = document.querySelector(".icon-tpiel");
const icon_taire = document.querySelector(".icon-taire");

const elementos_taire = t_aire?.querySelectorAll(
  ".taire .text-Temps, .taire .units-tempAire-Prin"
);
const lbl_temp_aire = t_aire?.querySelector(".lbl-temp-aire");
const tprog_aire = document.querySelector(".tprog-aire");

btn_acptChngMd?.addEventListener("click", () => {
  title_panel_prin.classList.remove("bckgnd-ctrl-piel");
  title_panel_prin.classList.add("bckgnd-ctrl-aire");

  pnlBebe?.classList.remove("active");
  pnlAire?.classList.add("active");

  c_modo_Aire?.classList.remove("enabled");
  t_aire?.classList.remove("disabled");
  lbl_temp_piel?.classList.remove("active");

  elementos_tpiel.forEach((elemento) => {
    elemento.classList.remove("active");
  });

  elementos_vaux.forEach((elemento) => {
    elemento.classList.remove("active");
  });

  line_01.style.display = "none";
  tpiel_txt.style.left = "75px";

  tprogp.classList.remove("active");
  vaux.classList.remove("active");

  icon_tpiel.style.display = "none";
  icon_taire.style.display = "block";

  t_aire?.classList.add("active");

  lbl_temp_aire.classList.add("active");
  lbl_temp_aire.classList.add("m-aire");

  elementos_taire?.forEach((elemento) => {
    elemento.classList.add("active");
  });

  tprog_aire.classList.add("active");
});

btn_cnclChngMd?.addEventListener("click", () => {
    pnlAire.classList.remove("chng");
    c_modo_Aire.classList.remove("enabled");
    t_aire.classList.remove("disabled");
});

// --------------------------------
// Panel de módulo de fototerapia
// --------------------------------
export function fotoActive() {
    fot_panel.style.display = 'block';
    confirmacion_fot.style.display = 'none';

    ajstCtrlFot.classList.remove("active");

    fot_ttl.classList.add("active");
    fot_hrs.classList.add("active");
    seg_potencia_fot.classList.add("active");

    fotoEn = true;
};
export function fotoInactive() {
    fot_panel.style.display = 'block';
    confirmacion_fot.style.display = 'none';

    fot_ttl.classList.remove("active");
    fot_hrs.classList.remove("active");
    seg_potencia_fot.classList.remove("active");
};
export function confAjstFoto() {
    if (!fotoEn) {
        fot_panel.style.display = 'none';
        confirmacion_fot.style.display = 'block';
    
        iniTimerAjst("foto");
    } else {
        ajst_CtrlFot();
        ajstCtrlFot.classList.remove("active");
    }
};
// Botón Confirmar Ajuste
btn_ajustar_foto?.addEventListener("click", () => {
    clearTimeout(timerAjstFot);
    ajst_CtrlFot();
    fotoActive();
});




// --------------------------------
// Slider Temperatura y Potencia
// --------------------------------
let tempPowerSliderController = null;
let fototerapiaSliderController = null;

document.addEventListener("DOMContentLoaded", () => {
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

    fototerapiaSliderController = initFototerapiaSlider({
        sliderId: "fotSlider",
        knobId: "fotKnob",
        initialValue: Number(sliderFot?.dataset.value ?? 1)
    });

    updateFotSliderValue = (value) => {
        fototerapiaSliderController?.setValue(value);
    };
});



// Botón Cancelar General
btnCancel?.addEventListener("click", () => {
    clearInterval(intervalEncod);
    intervalEncod = null;

    if (fotoEn){
        fotoEn = !fotoEn;
        fotoInactive()
    }

    toggleHomePanel("home");
});