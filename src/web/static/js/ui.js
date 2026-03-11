export function chngMode(modo) {
    const panel = document.getElementById(modo.target.id);
    
    panel.classList.add('active');
    panel.classList.remove('inactive');

    if (modo.target.id == "modo-bebe") {
        document.getElementById("modo-manual").classList.add('inactive');
        document.getElementById("modo-manual").classList.remove('active');
    } else {
        document.getElementById("modo-bebe").classList.add('inactive');
        document.getElementById("modo-bebe").classList.remove('active');
    }
};

export function toggle_btnSG(btn_SG){
    const btn_sobreGiro = document.getElementById('tmpPrgSobregiro');
    const lbl_sobreGiro = document.getElementById('tmpPrgSobregiro-lbl');

    if(btn_SG){
        btn_sobreGiro.classList.remove('btn-sensor');
        btn_sobreGiro.classList.add('btn-sensor-pressed');
    
        lbl_sobreGiro.classList.remove('btn-snsr-lbl');
        lbl_sobreGiro.classList.add('btn-sensor-lbl-pressed');
    }
    else{
        btn_sobreGiro.classList.add('btn-sensor');
        btn_sobreGiro.classList.remove('btn-sensor-pressed');
    
        lbl_sobreGiro.classList.add('btn-snsr-lbl');
        lbl_sobreGiro.classList.remove('btn-sensor-lbl-pressed');
    }
};

export function set_EditCtrlsEn(enabled, btns) {
    Object.values(btns).forEach(btnId => {
        const btn = document.getElementById(btnId);

        if (btn) {
            btn.disabled = !enabled;
        }
    });

    return !!enabled;
};