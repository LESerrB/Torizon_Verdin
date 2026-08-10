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

    toggleHomePanel,
    chngModo,
    fotoActive,
    confAjstFoto,
} from "./ui.js";

import {  } from "./crono_Apgar.js";

import { 
    salirBascula
} from "./bascula.js";

let modoControl = "tPiel"
let modoOperacion = "Incubadora"

// =============================
// Paneles de control
// =============================
const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const ajstCtrlOx = document.getElementById("mod-ox");
const ajstCtrlHum = document.getElementById("mod-hum");
const ajstCtrlFot = document.getElementById("mod-fot");

const ttl_pnl_ctrl = document.getElementById("ttl-pnl-ctrl");

// ***************** Panel Temperatura Piel ***************** //
pnlBebe?.addEventListener("pointerdown", () => {
    pnlBebe.classList.add("pressed");
});
pnlBebe?.addEventListener("pointerup", () => {
    pnlBebe.classList.remove("pressed");
    ajstCtrl_TPiel();
});

// ***************** Panel Temperatura Aire ***************** //
pnlAire?.addEventListener("pointerdown", () => {
    pnlAire.classList.add("pressed");
});
pnlAire?.addEventListener("pointerup", () => {
    pnlAire.classList.remove("pressed");
    pnlAire.classList.add("chng");

    chngModo(modoControl);

    // ajstCtrl_TAire();
});

// ***************** Panel Control Oxigeno ****************** //
ajstCtrlOx?.addEventListener("pointerdown", () => {
    ajstCtrlOx.classList.add("pressed");
});
ajstCtrlOx?.addEventListener("pointerup", () => {
    ajstCtrlOx.classList.remove("pressed");
    ajst_CtrlOx();
});

// ***************** Panel Control Humedad ****************** //
ajstCtrlHum?.addEventListener("pointerdown", () => {
    ajstCtrlHum.classList.add("pressed");
});
ajstCtrlHum?.addEventListener("pointerup", () => {
    ajstCtrlHum.classList.remove("pressed");
    ajst_CtrlHum();
});

// **************** Panel Control Fototerapia *************** //
ajstCtrlFot?.addEventListener("pointerdown", () => {
    ajstCtrlFot.classList.add("active");
});
ajstCtrlFot?.addEventListener("pointerup", () => {
    confAjstFoto();
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

function applyButtonVisualState(button, image, config, isPressed) {
    if (!button) {
        return;
    }

    if (isPressed) {
        button.classList.add("pressed");

        if (image) {
            image.src = config.icons.on;
        }
    } else {
        button.classList.remove("pressed");

        if (image) {
            image.src = config.icons.off;
        }
    }
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

    button?.addEventListener("pointerdown", () => {
        clear_Btns();
        applyButtonVisualState(button, image, config, true);
    });

    button?.addEventListener("pointerup", () => {
        updateBottomNavLayout(state.isHomeView);
        toggleHomePanel(config.panel);

        if (config.title) {
            ttl_pnl_ctrl.textContent = config.title;
        }

        applyButtonVisualState(button, image, config, state.pressed);
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
    pressed: true
});

bindMenuButton({
    key: "home",
    id: "btn-home",
    icons: {
        off: "../static/icon/Home/btns/Icono_Home_Default.svg",
        on: "../static/icon/Home/btns/Icono_Home_Active.svg"
    },
    panel: "home",
    pressed: true,
    isHomeView: true
});

function clear_Btns() {
    Object.values(menuButtons).forEach(({ button, image, icons }) => {
        if (button) {
            button.classList.remove("pressed");
        }

        if (image) {
            image.src = icons.off;
        }
    });
}


setInitValues();
// startSensor();