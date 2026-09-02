const PANEL_HOME = document.getElementById("home");
const PANEL_CONTROL = document.getElementById("panel-control");

/**
 * Realiza la animación de disolución entre el paneles.
 * @param {"home"|"control"} destino
 */
export async function dissolveToPanel(destino, cambiarContenido = null) {
    const panels = {
        home: PANEL_HOME,
        control: PANEL_CONTROL
    };
    const target = panels[destino];

    if (!target) {
        console.warn(`dissolveToPanel: destino desconocido "${destino}"`);

        return;
    }

    if (target.classList.contains("panel-active")) {
        target.classList.add("panel-dissolve");

        await transitionWait(target);

        if (typeof cambiarContenido === "function")
            cambiarContenido();

        await frameWait();

        target.classList.remove("panel-dissolve");

        return;
    }

    Object.values(panels).forEach((panel) => {
        panel.classList.toggle("panel-active", panel === target);
    });
}

function transitionWait(elemento) {
    return new Promise((resolve) => {
        elemento.addEventListener("transitionend", resolve, { once: true });
    });
}

function frameWait() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    });
}