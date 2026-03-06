const val_TempProg = document.getElementById('tempProg-val');

export function en_editValue(btn){
    if (btn.target.id == "tempProg") {
        val_TempProg.classList.toggle('parpadeo');
    }
};