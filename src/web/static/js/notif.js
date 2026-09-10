import { 
    dissolveToPanel,
    addBlurScreen,
    blurCtrl_Panel,
    addBlurScreenFot,
    removeBlurScreen,
    removeBlurCtrl_Panel
} from "./anim.js";

const notif_Wndw = document.querySelector(".pop-notif");
const lbl_notif = document.querySelector(".lbl-notif");

let notifTimer = null;

export function showNotif(notif_txt, view = "gral", onFinish = null) {
    clearTimeout(notifTimer);

    lbl_notif.textContent = notif_txt;
    notif_Wndw.classList.add(view);
    notif_Wndw.classList.add("show");

    if(view == "gral")
        addBlurScreen(view);
    else
        blurCtrl_Panel();

    notifTimer = setTimeout(() => {
        hideNotif();
        onFinish?.();
    }, 3000);
}

export function hideNotif() {
    notif_Wndw.classList.remove("show");
    notif_Wndw.classList.remove("gral");
    notif_Wndw.classList.remove("panel-ctrl");

    removeBlurScreen();
    removeBlurCtrl_Panel()

    clearTimeout(notifTimer);
    notifTimer = null;
}