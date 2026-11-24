import {
    addBlurScreen,
    blurCtrl_Panel,
    addBlurScreenFot,
    removeBlurScreen,
    removeBlurCtrl_Panel
} from "./anim.js";

const notif_Wndw = document.querySelector(".pop-notif");
const lbl_notif = document.querySelector(".lbl-notif");

const notif_cmci = document.getElementById("cuna-incb");
const notif_cmic = document.getElementById("incb-cuna");

let notifTimer = null;
let notifActiva = false;

let notif_CM = false;

export function showNotif(notif_txt, view = "gral", onFinish = null, time_in_secs  = null) {
    if (notifActiva) {
        return false;
    }

    notifActiva = true;

    lbl_notif.textContent = notif_txt;
    notif_Wndw.classList.add(view, "show");

    if(view == "gral")
        addBlurScreen(view);
    else
        blurCtrl_Panel();

    if (time_in_secs != null) {
        notifTimer = setTimeout(() => {
            hideNotif();

            notifActiva = false;
            notifTimer = null;

            onFinish?.();
        }, time_in_secs * 1000);
    }
}

export function hideNotif() {
    if (notifActiva) {
        notif_Wndw.classList.remove("show", "gral", "panel-ctrl");
    
        removeBlurScreen();
        removeBlurCtrl_Panel()
    
        clearTimeout(notifTimer);
        notifTimer = null;
        notifActiva = false;
    }
}

export function notif_Change(msg_Mode, mode_Cuna) {
    if (!notif_CM) {
        if (mode_Cuna) {
            notif_cmci.classList.remove("hide");
        } else {
            notif_cmic.classList.remove("hide");
        }
    }

    notif_CM = msg_Mode === 4;
}

export function hide_notif_Change(){
    notif_CM = false;

    notif_cmci.classList.add("hide");
    notif_cmic.classList.add("hide");
}