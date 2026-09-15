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
