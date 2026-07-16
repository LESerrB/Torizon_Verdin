let intervalEncod = null;
let updateSliderValue = null;

const pnlBebe = document.getElementById('pnl-modoBebe');
const pnlAire = document.getElementById('pnl-modoAire');

const ajstCtrl_Ox = document.getElementById('mod-ox');
const ajstCtrl_Hum = document.getElementById('mod-hum');
const ajstCtrl_Fot = document.getElementById('mod-fot');

const homeDiv = document.getElementById('home');
const panelControl = document.getElementById('panel-control');

const btn_cancel = document.getElementById('cancel-ctrl');

const tempProg = document.getElementById("tp_prog");
const val_Ctrl = document.getElementById("val_Ctrl");
const view_Ctrl = document.getElementById("vw-valProg");

// ---------------------------------
// Configuración de botones de menú
// ---------------------------------
const botones = {
    familiar: {
        btn: document.getElementById("btn-md-fam"),
        off: "../static/icon/Home/ICON_FAMILIAR.svg",
        on: "../static/icon/Home/btns_pressed/ICON_HOME.svg",
        activo: false
    },

    tendencias: {
        btn: document.getElementById("btn-tend"),
        off: "../static/icon/Home/ICON_TENDENCIAS.svg",
        on: "../static/icon/Home/btns_pressed/ICON_HOME.svg",
        activo: false
    },

    bascula: {
        btn: document.getElementById("btn-basc"),
        off: "../static/icon/Home/ICON_BASCULA.svg",
        on: "../static/icon/Home/btns_pressed/ICON_BASCULA.svg",
        activo: false
    },

    apgar: {
        btn: document.getElementById("btn-apgr"),
        off: "../static/icon/Home/ICON_APGAR.svg",
        on: "../static/icon/Home/btns_pressed/ICON_APGAR.svg",
        activo: false
    }
};

Object.values(botones).forEach((item) => {
    item.img = item.btn.querySelector("img");
});

// ------------------------
// Funciones auxiliares
// ------------------------
function setBoton(nombre, activo) {
    const item = botones[nombre];

    item.activo = activo;
    item.img.src = activo ? item.on : item.off;

    if (nombre != "familiar")
        item.btn.classList.toggle("pressed", activo);
}

function desactivarSubBotones(excepto = null) {
    ["tendencias", "bascula", "apgar"].forEach((nombre) => {
        if (nombre !== excepto) {
            setBoton(nombre, false);
        }
    });
}

function activarFamiliar() {
    setBoton("familiar", true);
}

function desactivarTodo() {
    setBoton("familiar", false);
    desactivarSubBotones();
}

// ------------------------
// Eventos
// ------------------------
botones.familiar.btn.addEventListener("click", () => {
    const nuevoEstado = !botones.familiar.activo;

    if (nuevoEstado) {
        setBoton("familiar", true);
    } else {
        desactivarTodo();
    }
});

["tendencias", "bascula", "apgar"].forEach((nombre) => {
    botones[nombre].btn.addEventListener("click", () => {
        const nuevoEstado = !botones[nombre].activo;

        activarFamiliar();
        desactivarSubBotones(nombre);
        setBoton(nombre, nuevoEstado);
    });
});


// ==========================================================


export async function setInitValues(){
    try {
        const res = await fetch('/api/setInitVals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const vals_Ctrl = await res.json();

            tempProg.textContent = vals_Ctrl.vals.tp_Prog.toFixed(1);
            val_Ctrl.textContent = vals_Ctrl.vals.tp_Prog.toFixed(1);
            view_Ctrl.textContent = vals_Ctrl.vals.tp_Prog.toFixed(1);
        }
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
};

const infoCtrl = document.querySelector(".mp-info-ctrl");
const tituloCtrl = document.querySelector(".mp-atpiel-mc-ttl");

const controlesTempProg = document.querySelectorAll(
    '.mp-atpiel-lat[data-control="tempPiel"], ' +
    '.mp-atpiel-lat[data-control="tempProg"]'
);

const controlest_AireProg = document.querySelectorAll(
    '.mp-atpiel-lat[data-control="tempAire"], ' +
    '.mp-atpiel-lat[data-control="tempProg"]'
);

const controlesOxProg = document.querySelectorAll(
    '.mp-atpiel-lat[data-control="oxigeno"]'
);

function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) return;

    console.log(showPanelControl);

    const enabTempProg = showPanelControl === "tempPielProg";
    const enabT_AireProg = showPanelControl === "tempAireProg";
    const enabOxProg = showPanelControl === "ajstOx";
    const enabHumProg = showPanelControl === "ajstHum";
    const enabFotProg = showPanelControl === "ajstFot";

//     [infoCtrl, tituloCtrl].forEach(elemento => {
//         elemento?.classList.toggle("tp", enabTempProg);
//         elemento?.classList.toggle("enable", enabTempProg);
//     });

//     controlesTempProg.forEach(control => {
//         control.classList.toggle("tp", enabTempProg);
//         control.classList.toggle("enable", enabTempProg);

//         const elementosInternos = control.querySelectorAll(
//             ".lbl-ttl-cont-lat, " +
//             ".ti-vm-sens, " +
//             ".val-units-sens-cont-lat"
//         );

//         elementosInternos.forEach(elemento => {
//             elemento.classList.toggle("enable", enabTempProg);
//         });
//     });

//     [infoCtrl, tituloCtrl].forEach(elemento => {
//         elemento?.classList.toggle("ta", enabT_AireProg);
//         elemento?.classList.toggle("enable", enabT_AireProg);
//     });

//     controlest_AireProg.forEach(control => {
//         control.classList.toggle("ta", enabT_AireProg);
//         control.classList.toggle("enable", enabT_AireProg);

//         const elementosInternos = control.querySelectorAll(
//             ".lbl-ttl-cont-lat, " +
//             ".ti-vm-sens, " +
//             ".val-units-sens-cont-lat"
//         );

//         elementosInternos.forEach(elemento => {
//             elemento.classList.toggle("enable", enabT_AireProg);
//         });
//     });

//     [infoCtrl, tituloCtrl].forEach(elemento => {
//         elemento?.classList.toggle("ox", enabOxProg);
//         elemento?.classList.toggle("enable", enabOxProg);
//     });

//     controlesOxProg.forEach(control => {
//         control.classList.toggle("ox", enabOxProg);
//         control.classList.toggle("enable", enabOxProg);

//         const elementosInternos = control.querySelectorAll(
//             ".lbl-ttl-cont-lat, " +
//             ".ti-vm-sens, " +
//             ".val-units-sens-cont-lat"
//         );

//         elementosInternos.forEach(elemento => {
//             elemento.classList.toggle("enable", enabOxProg);
//         });
//     });

//     [infoCtrl, tituloCtrl].forEach(elemento => {
//         elemento?.classList.toggle("hum", enabHumProg);
//         elemento?.classList.toggle("enable", enabHumProg);
//     });
    [infoCtrl, tituloCtrl].forEach(elemento => {
        elemento?.classList.toggle("fot", enabFotProg);
        elemento?.classList.toggle("enable", enabFotProg);
    });

// *************************************************************
    if (showPanelControl === "home") {
        homeDiv.style.display = "block";
        panelControl.style.display = "none";
    } else {
        homeDiv.style.display = "none";
        panelControl.style.display = "block";
    }
}







// Paneles
pnlBebe.addEventListener('click', () => {
    toggleHomePanel("tempPielProg");
    set_EditCtrlsEn("tempProg");
});

pnlAire.addEventListener('click', () => {
    toggleHomePanel("tempAireProg");
});

ajstCtrl_Ox.addEventListener('click', () => {
    toggleHomePanel("ajstOx");
});

ajstCtrl_Hum.addEventListener('click', () => {
    toggleHomePanel("ajstHum");
});

ajstCtrl_Fot.addEventListener('click', () => {
    toggleHomePanel("ajstFot");
});






async function set_EditCtrlsEn(ctrl_lbl) {
    try {
        const res = await fetch('/api/enEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Ctrl: ctrl_lbl,
                Enable: true,
            })
        });

        if (!intervalEncod) {
            intervalEncod = setInterval(edit_valProg, 100);
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

async function edit_valProg(){
    try {
        const res = await fetch('/api/editValProg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const encd = await res.json();
            const nuevoValor = encd.val.toFixed(1);

            tempProg.textContent = nuevoValor;
            val_Ctrl.textContent = nuevoValor;
            updateSliderValue(parseFloat(nuevoValor));

            if ((!encd.confirm) && intervalEncod) {
                view_Ctrl.textContent = nuevoValor;

                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }   
    } catch (error) {
        console.log("Error:", error);
    }
};



// ------------------------------
// Animacion de Slider de Encoder
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("tpielSlider");
    const knob = document.getElementById("tpielKnob");
    const valueDisplay = document.getElementById("val_Ctrl");

    if (!slider || !knob) return;

    const min = parseFloat(slider.dataset.min ?? "34.0");
    const max = parseFloat(slider.dataset.max ?? "38.0");
    const step = parseFloat(slider.dataset.step ?? "0.1");

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];

    const points = [
        { x: 36,  y: 218 }, // segmento 0
        { x: 18,  y: 147 }, // segmento 1
        { x: 32,  y: 92  }, // segmento 2
        { x: 68,  y: 48  }, // segmento 3
        { x: 120, y: 20  }, // segmento 4
        { x: 176, y: 20  }, // segmento 5
        { x: 228, y: 48  }, // segmento 6
        { x: 264, y: 92  }, // segmento 7
        { x: 278, y: 147 }, // segmento 8
        { x: 260, y: 218 }  // segmento 9
    ];

    let isDragging = false;

    function clamp(value, minValue, maxValue) {
        return Math.min(Math.max(value, minValue), maxValue);
    }

    function roundToStep(value) {
        return Math.round(value / step) * step;
    }

    function valueToSegment(value) {
        const ratio = (value - min) / (max - min);

        return clamp(Math.round(ratio * 9), 0, 9);
    }

    function updateSlider(value) {
        value = clamp(roundToStep(value), min, max);

        const selectedSegment = valueToSegment(value);
        const point = points[selectedSegment];

        knob.setAttribute("cx", point.x);
        knob.setAttribute("cy", point.y);

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);

            seg.classList.toggle("active", index <= selectedSegment);
            seg.classList.toggle("selected", index === selectedSegment);
        });

        slider.dataset.value = value.toFixed(1);

        valueDisplay.textContent = value.toFixed(1);

        slider.dispatchEvent(
            new CustomEvent("tpiel-slider-change", {
                detail: {
                    value,
                    segment: selectedSegment
                }
            })
        );
    }

    updateSliderValue = updateSlider;
});



// Boton Cancelar
btn_cancel.addEventListener('click', () => {
    const valorActual = val_Ctrl.textContent;

    tempProg.textContent = valorActual;
    view_Ctrl.textContent = valorActual;

    clearInterval(intervalEncod);
    intervalEncod = null;
    toggleHomePanel("home");
});