let intervalEncod = null;

const btn_edit_tempProg = document.getElementById('edittemp');
const tempProg = document.getElementById("_36-7");

const controls = {
    // nombreControl: document.getElementById("id-elemento"),
    tempProg: tempProg,
};

tempProg.textContent = 34.0.toFixed(1);

async function set_EditCtrlsEn(ctrl_lbl) {
    const element = controls[ctrl_lbl];

    if (element) {
        element.classList.add('parpadeo');

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
                intervalEncod = setInterval(edit_valProg, 10);
            }
        } catch (error) {
            console.log("Error:", error);
        }
    }
};

btn_edit_tempProg.addEventListener('click', async () => {
    set_EditCtrlsEn("tempProg");
});

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

            tempProg.textContent = encd.val.toFixed(1);

            if ((!encd.confirm) && intervalEncod) {
                tempProg.classList.remove('parpadeo');

                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

