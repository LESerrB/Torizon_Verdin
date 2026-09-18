const panel_title = document.querySelector(".ttl-pnl-prin");
const panel_izq = document.querySelector(".mp-prin-mc-taire");
const title = document.querySelector(".lbl-temp-aire");
const val_Calef = document.querySelector(".taire");
const unitsVal = document.querySelector(".units-tempAire-Prin");
const contSec = document.querySelector(".tprog-aire");
const slider_numVal = document.querySelector(".potcal-ini")
const slider_unit = document.querySelector(".perccal-ini")
const icon = document.querySelector(".icon-taire");

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

export function modoManual() {
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
}

export function revertmodoManual() {
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
}