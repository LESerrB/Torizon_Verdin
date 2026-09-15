export function reload_Btns(modoOperacion) {
    const btnApgr = document.getElementById("btn-apgr");
    const contBtnsMenu = btnApgr?.parentElement;
    const hideApgar = modoOperacion === "Incubadora";

    btnApgr?.classList.toggle("hide", hideApgar);
    contBtnsMenu?.classList.toggle("no-apgar", hideApgar);
}
