import { 
    startSensors,
    pauseSensor,
} from "./sensor.js";

import {
    setInitValues,

    ajstCtrl,

    modoAire,
    modoPiel,

    chngModo,
    fotoActive,
    confAjstFoto,
    iniTimerAjst,
    toggleSobregiro,
    toogleOnOff_SensMod,
    exitCancel
} from "./ui_Incubadora.js";

import { 
    reload_Screen,
    ModoCuna,
    revertModoCuna
 } from "./ui_Cuna.js";

import { 
    createApgarSegments
 } from "./crono_Apgar.js";

import { 
    createTimerTaraSegments,
    salirBascula
} from "./bascula.js";

import { 
    showNotif,
    hideNotif 
} from "./notif.js";

const recursosVisuales = [
    // HOME //
    "../static/icon/Home/ICON_INCUBADORA.svg",
    "../static/icon/Home/ICON_CUNA.svg",
    "../static/icon/Home/ICON_INCLINACION.svg",
    // Iconos Botones Barra Menús
    "../static/icon/Home/btns/Icono_MFamiliar_Default.svg",
    "../static/icon/Home/btns/Icono_MFamiliar_Active.svg",
    "../static/icon/Home/btns/Icono_Home_Default.svg",
    "../static/icon/Home/btns/Icono_Home_Active.svg",
    "../static/icon/Home/btns/Icono_Tendencias_Default.svg",
    "../static/icon/Home/btns/Icono_Tendencias_Active.svg",
    "../static/icon/Home/btns/Icono_Bascula_Default.svg",
    "../static/icon/Home/btns/Icono_Bascula_Active.svg",
    "../static/icon/Home/btns/Icono_APGAR_Default.svg",
    "../static/icon/Home/btns/Icono_APGAR_Active.svg",
    // Panel de Control
    "../static/icon/Control/Icon_ModoAire.svg",
    "../static/icon/Control/Icon_Fototerapia.svg",
    "../static/icon/Control/Icon_Humedad.svg",
    "../static/icon/Control/Icon_Oxigeno.svg",
    "../static/icon/Control/Icon_Calefactor.svg",
    "../static/icon/Control/icons-mas-menos0.svg",
    "../static/icon/Control/igraf-tpiel0.svg",
    // Apgar
    "../static/icon/Apgar/ejes-reloj0-mp.svg",
    "../static/icon/Apgar/ejes-reloj0-ma.svg",
    "../static/icon/Apgar/ejes-reloj0-mm.svg",
    "../static/icon/Apgar/btns/Icon_Play_Default.svg",
    "../static/icon/Apgar/btns/Icon_Play_Active.svg",
    "../static/icon/Apgar/btns/Icon_Pause_Default.svg",
    "../static/icon/Apgar/btns/Icon_Pause_Active.svg",
    "../static/icon/Apgar/btns/Icon_Regresar_Default.svg",
    "../static/icon/Apgar/btns/Icon_Regresar_Active.svg",
    // Báscula
    "../static/icon/Bascula/Kg_tPiel.svg",
    "../static/icon/Bascula/Kg_tAire.svg",
    "../static/icon/Bascula/Kg_mManual.svg",

    "../static/icon/Home/cambio_Modo/CONT_ICONS_CMODOPM.svg",
];

let modoControl = "tPiel";
let modoOperacion = "Incubadora";

// =========================
// Botón Silenciar Alarmas
// =========================
const btn_alarma = document.getElementById("btn-alarma");

// ==================================
// Botones 
// ==================================
const modoSwitch = document.getElementById("modoSwitch");
const nom_Paciente = document.getElementById("nom_Paciente");

// ====================
// Paneles de control
// ====================
const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const ajstCtrlOx = document.getElementById("mod-ox");
const ajstCtrlHum = document.getElementById("mod-hum");
const ajstCtrlFot = document.getElementById("mod-fot");

const btn_Offmod = document.getElementById("off-ctrl")
const btn_sg = document.getElementById("btn-sg");

const ttl_pnl_ctrl = document.getElementById("ttl-pnl-ctrl");

// ===============================================
// Botones Confirmación Cambio de Modo de Control
// ===============================================
const btn_cnclChngMd = document.getElementById("cnclChngMd-tP-tA");
const btn_acptChngMd = document.getElementById("acptChngMd-tP-tA");

const btn_cnclChngMd2 = document.getElementById("cnclChngMd-tA-tP");
const btn_acptChngMd2 = document.getElementById("acptChngMd-tA-tP");

const btn_cnclChngMd3 = document.getElementById("cnclChngMd-tP-tC");
const btn_acptChngMd3 = document.getElementById("acptChngMd-tP-tC");

const btn_ajustar_foto = document.getElementById("btn-ajustar-foto");
const btnCancel = document.getElementById("cancel-ctrl");

const lbl_modo_ctrl = document.getElementById("lbl-modo-ctrl");

// ======================================
// Configuración global HMI
// ======================================
function cargarImagen(ruta) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve(ruta);
        };

        img.onerror = () => {
            reject(ruta);
        };

        img.src = ruta;
    });
}

async function preloadVisualRsrc() {
    try {
        await Promise.all(
            recursosVisuales.map((ruta) => cargarImagen(ruta))
        );

        console.log("Todos los recursos visuales fueron cargados");

    } catch (rutaError) {
        console.error(`Error cargando recurso: ${rutaError}`);
    }
}
// Evitar menú contextual
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

const isInteractiveControl = (event) => Boolean(
    event.target.closest("button, a, input, select, textarea, [role='button']")
);

function stopPanelPointerEvent(event) {
    event.stopPropagation();
}
[ btn_ajustar_foto,
  btn_cnclChngMd2,
  btn_acptChngMd2,
  btn_cnclChngMd,
  btn_acptChngMd,
  btnCancel ].forEach((button) => {
    button?.addEventListener("pointerdown", stopPanelPointerEvent);
    button?.addEventListener("pointerup", stopPanelPointerEvent);
    button?.addEventListener("pointercancel", stopPanelPointerEvent);
});

//============================================================================//
//                                Controles UI                                //
//============================================================================//
btn_alarma.addEventListener("click", () => {
    // ======= Función de bloqueo de pantalla ======= //
    const divs = [
        document.querySelector('.barra_Informacion'),
        document.querySelector('.panel-prin'),
        document.querySelector('.f-pp-menuprin')
    ];

    divs.forEach(div => {
        if (!div) return;

        div.classList.toggle('lock-screen');
    });
    // ============================================== //
    if(document.querySelector('.panel-prin').classList.contains('lock-screen'))
        showNotif("Pantalla bloqueada");
    else
        showNotif("Pantalla desbloqueada");
});

nom_Paciente.addEventListener("click", () => {
    nom_Paciente.contentEditable = "true";
});
nom_Paciente.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        console.log("Nombre:", nom_Paciente.textContent);
        nom_Paciente.contentEditable = "false";
    }
});
// **************** Switch Modo de Operación **************** //
function stablishSwOpMode(modo = "Incubadora") {
    exitCancel(modoControl, null, modoOperacion);
    clear_Btns();

    if (modo === "Incubadora") {
        modoSwitch.checked = true;
        lbl_modo_ctrl.textContent = "Incubadora Controlada por Piel";

        modoControl = "tPiel";
        modoPiel(pnlAire, pnlBebe, modoOperacion);

        revertModoCuna();
    } else if (modo === "Cuna") {
        modoSwitch.checked = false;
        lbl_modo_ctrl.textContent = "Cuna en Control Manual";

        modoAire(pnlBebe, pnlAire);
        modoControl = "mManual";

        ModoCuna();
    }
    else {
        console.warn(`Modo no válido: ${modo}`);
        return;
    }

    pnlBebe.classList.remove("chng");
    pnlAire.classList.remove("chng");
    reload_Screen(modoOperacion);
}
modoSwitch.addEventListener("change", () => {
    if (modoSwitch.checked)
        modoOperacion = "Incubadora";
    else
        modoOperacion = "Cuna";

    stablishSwOpMode(modoOperacion);
});

// ***************** Panel Temperatura Piel ***************** //
pnlBebe?.addEventListener("pointerdown", () => {
    if (isInteractiveControl(event)) return;

    pnlBebe.classList.add("pressed");
});
pnlBebe?.addEventListener("pointerup", () => {
    if (isInteractiveControl(event)) return;

    chngModo(pnlBebe, modoControl, modoOperacion);

    if(modoControl != "tPiel")
        iniTimerAjst(pnlBebe);

    pnlBebe.classList.remove("pressed");
});

// ***************** Panel Temperatura Aire ***************** //
pnlAire?.addEventListener("pointerdown", () => {
    if (isInteractiveControl(event)) return;

    pnlAire.classList.add("pressed");
});
pnlAire?.addEventListener("pointerup", () => {
    if (isInteractiveControl(event)) return;

    chngModo(pnlAire, modoControl, modoOperacion);

    if(modoControl != "tAire" && modoControl != "mManual")
        iniTimerAjst(pnlAire);

    pnlAire.classList.remove("pressed");
});

// ***************** Panel Control Oxigeno ****************** //
ajstCtrlOx?.addEventListener("pointerdown", () => {
    ajstCtrlOx.classList.add("pressed");
});
ajstCtrlOx?.addEventListener("pointerup", () => {
    ajstCtrl("pot_Ox", modoControl, modoOperacion);

    ajstCtrlOx.classList.remove("pressed");
});

// ***************** Panel Control Humedad ****************** //
ajstCtrlHum?.addEventListener("pointerdown", () => {
    ajstCtrlHum.classList.add("pressed");
});
ajstCtrlHum?.addEventListener("pointerup", () => {
    ajstCtrl("pot_Hum", modoControl, modoOperacion);

    ajstCtrlHum.classList.remove("pressed");
});

// **************** Panel Control Fototerapia *************** //
ajstCtrlFot?.addEventListener("pointerdown", () => {
    if (isInteractiveControl(event)) return;

    ajstCtrlFot.classList.add("active");
});
ajstCtrlFot?.addEventListener("pointerup", () => {
    if (isInteractiveControl(event)) return;

    confAjstFoto(modoControl, modoOperacion);
});

// Boton de Sobregiro
btn_sg?.addEventListener("pointerup", () => {
    toggleSobregiro(modoControl);
})

// Botón Apagar
btn_Offmod?.addEventListener("pointerup", () => {
    const off_Ox = document.getElementById("ctrl-sensores").classList.contains("ox")
    const off_Hum = document.getElementById("ctrl-sensores").classList.contains("hum")
    
    if (off_Ox){
        toogleOnOff_SensMod("mod-ox", !off_Ox)
        showNotif("Servocontrol de oxígeno apagado", "panel-ctrl", () =>
            exitCancel(modoControl));
    }
    else if (off_Hum){
        toogleOnOff_SensMod("mod-hum", !off_Hum)
        showNotif("Servocontrol de humedad apagado", "panel-ctrl", () =>
            exitCancel(modoControl));
    }

})
// ==================================
// Aceptar / Cancelar Cambio de Modo
// ==================================
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Panel Temp Piel
btn_acptChngMd?.addEventListener("pointerup", () => {
    event.stopPropagation();

    pnlBebe.classList.remove("chng");

    modoAire(pnlBebe, pnlAire, modoOperacion);

    lbl_modo_ctrl.textContent = "Incubadora Controlada por Aire";
    modoControl = modoControl === "tPiel" ? "tAire" : "tPiel";
});
btn_cnclChngMd?.addEventListener("pointerup", () => {
    event.stopPropagation();

    chngModo(pnlAire);
});

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Panel Temp Aire
btn_acptChngMd2?.addEventListener("pointerup", () => {
    event.stopPropagation();

    pnlAire.classList.remove("chng");

    modoPiel(pnlAire, pnlBebe, modoOperacion);

    if (modoOperacion == "Incubadora"){
        lbl_modo_ctrl.textContent = "Incubadora Controlada por Piel";
        modoControl = modoControl === "tAire" ? "tPiel" : "tAire";
    }
    else{
        lbl_modo_ctrl.textContent = "Cuna Controlada por Piel";
        modoControl = modoControl === "mManual" ? "tPiel" : "mManual";
    }

});
btn_cnclChngMd2?.addEventListener("pointerup", () => {
    event.stopPropagation();

    chngModo(pnlBebe);
});

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Panel Modo Manual
btn_acptChngMd3?.addEventListener("pointerup", () => {
    event.stopPropagation();

    pnlAire.classList.remove("chngClf");
    pnlBebe.classList.remove("chng");

    modoAire(pnlBebe, pnlAire);
    ModoCuna();
    chngModo(pnlAire);
    reload_Screen(modoOperacion);

    modoControl = modoControl === "mManual" ? "tPiel" : "mManual";
});
btn_cnclChngMd3?.addEventListener("pointerup", () => {
    event.stopPropagation();

    chngModo(pnlAire);
});

// Botón Confirmar Ajuste Fototerapia
btn_ajustar_foto?.addEventListener("pointerup", () => {
    event.stopPropagation();

    ajstCtrl("pot_Fot", modoControl, modoOperacion);
    fotoActive();
});
// Botón Cancelar General
btnCancel?.addEventListener("pointerup", () => {
    event.stopPropagation();

    exitCancel(modoControl);
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
function applyButtonVisualState(button, image, config, isPressed) {
    if (!button) return;

    if (isPressed) {
        button.classList.add("pressed");

        if (image)
            image.src = config.icons.on;
    } else {
        button.classList.remove("pressed");

        if (image)
            image.src = config.icons.off;
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
        if (button.id === "btn-apgr")
            createApgarSegments(modoControl);

        if (button.id === "btn-basc"){
            salirBascula();
            createTimerTaraSegments(modoControl);
        }

        exitCancel(modoControl, config.panel, modoOperacion);

        if (config.title)
            ttl_pnl_ctrl.textContent = config.title;

        if (state.isHomeView) {
            btn_home?.classList.add("btn-collapsed");
            btn_md_fam?.classList.remove("btn-collapsed");
        }else{
            btn_md_fam?.classList.add("btn-collapsed");
            btn_home?.classList.remove("btn-collapsed");
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
        if (button)
            button.classList.remove("pressed");

        if (image)
            image.src = icons.off;
    });
};

//============================================================================//
//                             Funciones inciales                             //
//============================================================================//
preloadVisualRsrc();                    // Precarga de iconos de aplicación
setInitValues();                        // Valores iniciales de control
reload_Screen(modoOperacion);           // Carga la configuración del modo de Operación
startSensors();                         // Inicio de sensado
stablishSwOpMode(modoOperacion);        // Estado Inicial del Equipo
createApgarSegments(modoControl);       // Configuración inicial color cronómetro
createTimerTaraSegments(modoControl);   // Configuración inicial color temporizador de tara