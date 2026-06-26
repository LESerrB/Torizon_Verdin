let intervalEncod = null;

const btn_edit_tempProg = document.getElementById('edittemp');
const tempProg = document.getElementById("_36-7");

tempProg.textContent = 34.0.toFixed(1);

btn_edit_tempProg.addEventListener('click', async () => {
    tempProg.classList.add('parpadeo');
    console.log("Temperatura programada")

    if (!intervalEncod) {
        intervalEncod = setInterval(edit_valProg, 30);
    }
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

            if (encd.confirm && intervalEncod) {
                tempProg.classList.remove('parpadeo');
                clearInterval(intervalEncod);
                intervalEncod = null;
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};


export function set_EditValsEn(enabled, btns) {
    console.log("Clck");
};