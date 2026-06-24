let intervalEncod = null;

const btn_edit_tempProg = document.getElementById('edittemp');
const tempProg = document.getElementById("_36-7");


btn_edit_tempProg.addEventListener('click', async () => {
    tempProg.classList.add('parpadeo');

    if (!intervalEncod) {
        intervalEncod = setInterval(startEdit_tempProg, 100);
    }
});

async function startEdit_tempProg(){
    try {
        const res = await fetch('/api/temProg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(res.status == 200){
            const encd = await res.json();
            tempProg.textContent = encd.val
        }
    } catch (error) {
        console.log("Error:", error);
    }
}




export function set_EditCtrlsEn(enabled, btns) {
    console.log("Clck");
};