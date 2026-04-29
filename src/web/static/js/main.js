async function getTemperatura() {
    try {
        const response = await fetch('/api/getSnsTHO', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const tpho = await response.json();
    
        document.getElementById('_36-5').textContent = tpho.snsTemp;
        document.getElementById('_36-3').textContent = tpho.snsTemp;
    } catch (error) {
        console.log("Error:", error);
    }
}

function iniciarGeneracionCadaSegundo() {
    return setInterval(async () => {
        const temperatura = await getTemperatura();
    }, 1000);
}

iniciarGeneracionCadaSegundo();