const notif_Wndw = document.querySelector(".pop-notif");
const lbl_notif = document.querySelector(".lbl-notif");

let notifTimer = null;

export function showNotif(notif_txt) {
    lbl_notif.textContent = notif_txt;
    clearTimeout(notifTimer);
    notif_Wndw.classList.add("gral");
    // notif_Wndw.classList.add("panel-ctrl");
    notif_Wndw.classList.add("show");

    notifTimer = setTimeout(hideNotif, 3000);
}

export function hideNotif() {
    notif_Wndw.classList.remove("show");
    notif_Wndw.classList.remove("gral");

    clearTimeout(notifTimer);
    notifTimer = null;
}