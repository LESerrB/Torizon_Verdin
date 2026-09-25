const panel_title = document.querySelector(".ttl-pnl-prin");
const panel_izq = document.querySelector(".mp-prin-mc-taire");
const title = document.querySelector(".lbl-temp-aire");
const val_Calef = document.querySelector(".taire");
const unitsVal = document.querySelector(".units-tempAire-Prin");
const contSec = document.querySelector(".tprog-aire");
const slider_numVal = document.querySelector(".potcal-ini")
const slider_unit = document.querySelector(".perccal-ini")
const icon = document.querySelector(".icon-taire");
const t_aire = document.querySelector(".cont-taire");

const controles = document.querySelectorAll(".mp-atpiel-lat");

// Elementos internos Báscula, Cronómetro
const ti_v_contapgar = document.querySelector(".ti-v-contapgar");
const cont_bas_anima = document.querySelector(".cont-bas-anima");
const ti_v_vpeso = document.querySelector(".ti-v-vpeso");
const botones = document.querySelectorAll(".btns-apgr.tPiel");
const ejes_reloj = document.querySelector(".ejes-reloj");

export function reload_Screen(modoOperacion) {
    const btnApgr = document.getElementById("btn-apgr");
    const contBtnsMenu = btnApgr?.parentElement;
    const menu_Modsns = document.querySelector(".mp-prin-mc-msoporte");
    const mod_Hum = document.getElementById("mod-hum");

    const hideApgar = modoOperacion === "Incubadora";

    btnApgr?.classList.toggle("hide", hideApgar);
    contBtnsMenu?.classList.toggle("no-apgar", hideApgar);
    menu_Modsns?.classList.toggle("disabled", !hideApgar);

    [mod_Hum, ...mod_Hum.querySelectorAll("*")].forEach((el) => {
        el.classList.toggle("disabled", !hideApgar);
    });
}

export function ModoCuna() {
    title.textContent = "Potencia del Calefactor";

    panel_title.classList.replace("bckgnd-ctrl-aire", "bckgnd-ctrl-calef");
    title.classList.replace("m-Aire", "m-Manual");
    slider_numVal.classList.replace("m-Aire", "m-Manual");
    slider_unit.classList.replace("m-Aire", "m-Manual");

    [ panel_izq,
      val_Calef,
      contSec ].forEach((el) => {
        el.classList.add("m-Manual");
    });

    val_Calef.querySelectorAll("*")?.forEach((el) => {
        el.classList.replace("m-Aire", "m-Manual");
    });
    unitsVal.textContent = "%";

    icon.classList.add("m-Manual");
    icon.src = "../static/icon/Control/Icon_Calefactor.svg";

    controles.forEach((control) => {
        control.classList.add("m-Manual");

        if (control.dataset.control === "tempAire")
            control.classList.add("disable");
        else if (control.dataset.control === "tempProg")
            control.querySelector(".lbl-ttl-cont-lat").textContent = "Temp. Piel Programada"
        else if (control.dataset.control === "oxigeno")
            control.querySelector(".lbl-ttl-cont-lat").textContent = "Potencia de Calefactor"
    });

    t_aire.querySelectorAll("*")?.forEach((el) => {
        el.classList.remove("disabled");
    });

    [ti_v_contapgar, cont_bas_anima, ti_v_vpeso].forEach((elemento) => {
        if (!elemento) return;

        elemento.classList.replace("tAire", "mManual");
    });
    botones.forEach((boton) => {
        boton.classList.replace("tAire", "mManual");
    });
}

export function revertModoCuna() {
    title.textContent = "Temperatura Aire";
    panel_title.classList.remove("bckgnd-ctrl-calef");

    [ panel_izq,
      title,
      val_Calef,
      contSec,
      slider_numVal,
      slider_unit ].forEach((el) => {
        el.classList.remove("m-Manual");
    });

    val_Calef.querySelectorAll("*")?.forEach((el) => {
        el.classList.remove("m-Manual");
    });
    unitsVal.textContent = "°C";

    icon.classList.remove("m-Manual");
    icon.src = "../static/icon/Control/Icon_ModoAire.svg";

    controles.forEach((control) => {
        control.classList.remove("m-Manual");

        if (control.dataset.control === "tempAire")
            control.classList.remove("disable");
        else if (control.dataset.control === "tempProg")
            control.querySelector(".lbl-ttl-cont-lat").textContent = "Temp. Aire Programada"
        else if (control.dataset.control === "oxigeno")
            control.querySelector(".lbl-ttl-cont-lat").textContent = "Oxígeno"
    });

    t_aire.classList.remove("m-Manual");
    t_aire.querySelectorAll("*")?.forEach((el) => {
        el.classList.remove("disabled");
    });

    [ti_v_contapgar, cont_bas_anima, ti_v_vpeso].forEach((elemento) => {
        if (!elemento) return;

        elemento.classList.replace("mManual", "tPiel");
    });
    botones.forEach((boton) => {
        boton.classList.replace("mManual", "tPiel");
    });
}

export function sidePnl_alt(controles, claseColor, SELECTOR_ELEMENTOS_INTERNOS, modoControl) {
    const tempProg = document.querySelector('.mp-atpiel-lat[data-control="tempProg"]');

    if (modoControl === "mManual")
        tempProg?.classList.add("disable");
    else
        tempProg?.classList.remove("disable");

    controles.forEach((nombreControl) => {
        const control = document.querySelector(`.mp-atpiel-lat[data-control="${nombreControl}"]`);

        if (!control) {
            console.warn(`No se encontró .mp-atpiel-lat[data-control="${nombreControl}"]`);

            return;
        }

        control
            .querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS)
            .forEach((elemento) => {
                elemento.classList.add(claseColor, "enable");
            });
    });

    if((controles[0] === "oxigeno" && modoControl !== "mManual") || (claseColor === "ox" && modoControl === "mManual")){
        const ctrl = document.querySelector(`.mp-atpiel-lat[data-control="${controles[0]}"]`)
        
        ctrl.classList.remove(claseColor);
        ctrl.querySelectorAll(SELECTOR_ELEMENTOS_INTERNOS)
            .forEach((elemento) => {
                elemento.classList.remove(claseColor);
            });
    }
}