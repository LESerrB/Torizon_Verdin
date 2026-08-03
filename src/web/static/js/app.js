import { 
    startSensor,
    pauseSensor,
} from "./sensor.js";

import {
    setInitValues,
    ajstCtrl_TPiel,
    ajstCtrl_TAire,
    ajst_CtrlOx,
    ajst_CtrlHum,
    ajst_CtrlFot,
    toggleHomePanel
} from "./ui.js";

import {  } from "./crono_Apgar.js";

import {  } from "./bascula.js";


// =============================
// Paneles de control
// =============================
const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const ajstCtrlOx = document.getElementById("mod-ox");
const ajstCtrlHum = document.getElementById("mod-hum");
const ajstCtrlFot = document.getElementById("mod-fot");

pnlBebe?.addEventListener("touchstart", () => {
    pnlBebe.classList.add();
});
pnlBebe?.addEventListener("touchend", () => {
    ajstCtrl_TPiel();
});

pnlAire?.addEventListener("touchstart", () => {
    pnlAire.classList.add();
});
pnlAire?.addEventListener("touchend", () => {
    ajstCtrl_TAire();
});

ajstCtrlOx?.addEventListener("touchstart", () => {
    ajstCtrlOx.classList.add();
});
ajstCtrlOx?.addEventListener("touchend", () => {
    ajst_CtrlOx();
});

ajstCtrlHum?.addEventListener("touchstart", () => {
    ajstCtrlHum.classList.add();
});
ajstCtrlHum?.addEventListener("touchend", () => {
    ajst_CtrlHum();
});

ajstCtrlFot?.addEventListener("touchstart", () => {
    ajstCtrlFot.classList.add();
});
ajstCtrlFot?.addEventListener("touchend", () => {
    ajst_CtrlFot();
});


// =================================
// Botones Menú Inferior
// =================================
const btn_md_fam = document.getElementById("btn-md-fam");
const btn_home = document.getElementById("btn-home");
const menuButtons = {};

// ====================
// Funciones Botones
// ====================
// Función para volver al Panel Principal
function updateBottomNavLayout(isHomeView = false) {
    if (isHomeView) {
        btn_home?.classList.add("btn-collapsed");
        btn_md_fam?.classList.remove("btn-collapsed");

        salirBascula();

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

    button?.addEventListener("touchstart", () => {
        clear_Btns();

        if (image) {
            image.src = config.icons.on;
        }
    });

    button?.addEventListener("touchend", () => {
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

function clear_Btns() {
    Object.values(menuButtons).forEach(({ button, image, icons }) => {
        if (image) {
            image.src = icons.off;
        }

        button?.classList.remove("pressed");
    });
}


setInitValues();
startSensor();