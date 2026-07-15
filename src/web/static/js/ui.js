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

function toggleHomePanel(showPanelControl) {
    if (!homeDiv || !panelControl) return;

    if (showPanelControl) {
        homeDiv.style.display = 'none';
        panelControl.style.display = 'block';
    } else {
        homeDiv.style.display = 'block';
        panelControl.style.display = 'none';
    }
};

pnlBebe.addEventListener('click', () => {
    toggleHomePanel(true);
    set_EditCtrlsEn("tempProg");
});

pnlAire.addEventListener('click', async () => {
    console.log("Ajuste de Ctrl de Temperatura de Aire");
    try {
        const res = await fetch('/api/editValProg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log("Error al obtener la Temperatura Programada");
    }
});

ajstCtrl_Ox.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Oxigeno")
});

ajstCtrl_Hum.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Humedad")
});

ajstCtrl_Fot.addEventListener('click', () => {
    console.log("Ajuste de Ctrl de Temperatura de Fototerapia")
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
    const valueProgDisplay = document.getElementById("vw-valProg");

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

        if (valueDisplay) {
            valueDisplay.textContent = value.toFixed(1);
        }

        if (valueProgDisplay) {
            valueProgDisplay.textContent = value.toFixed(1);
        }

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
    toggleHomePanel(false);
});