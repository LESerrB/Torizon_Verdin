const PANEL_HOME = document.getElementById("home");
const PANEL_CONTROL = document.getElementById("panel-control");

// =====================================
// Transiciones Paneles Home / Control 
// =====================================

/**
 * Cambia el panel visible entre Home y Control
 * Si el panel solicitado ya está activo y se proporciona una función de recarga,
 * ejecuta una transición de fundido cruzado para actualizar su contenido
 * 
 * @function
 * @async
 * @param {string} dest - Destino de navegación: "home" o "control"
 * @param {Function|null} [reloadContent=null] - Función opcional para recargar el contenido del panel activo
 * @returns {Promise<void>} Promesa que se resuelve cuando termina la transición
 * 
 * @example
 * await dissolveToPanel("home"); // Muestra el panel Home
 * await dissolveToPanel("control", actualizarControles); // Actualiza y anima el panel Control
 */
export async function dissolveToPanel(dest, reloadContent = null) {
    const panels = { home: PANEL_HOME, control: PANEL_CONTROL };
    const target = panels[dest];

    if (!target) {
        console.warn(`dissolveToPanel: destino desconocido "${dest}"`);
        return;
    }

    if (target.classList.contains("panel-active")) {
        if (typeof reloadContent === "function")
            await crossfadeContent(target, reloadContent);

        return;
    }

    Object.values(panels).forEach((panel) => {
        panel.classList.toggle("panel-active", panel === target);
    });
}

/**
 * Ejecuta un fundido cruzado del contenido de un panel
 * Crea una copia temporal del panel, recarga el contenido original,
 * desvanece la copia y finalmente la elimina del DOM
 * 
 * @function
 * @async
 * @param {HTMLElement} target - Panel cuyo contenido se actualizará
 * @param {Function} reloadContent - Función que modifica o recarga el contenido del panel
 * @returns {Promise<void>} Promesa que se resuelve cuando se elimina la copia temporal
 * 
 * @example
 * await crossfadeContent(panelControl, actualizarControles);
 */
async function crossfadeContent(target, reloadContent) {
    const snapshot = target.cloneNode(true);

    snapshot.removeAttribute("id");
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    snapshot.classList.add("panel-snapshot");

    target.insertAdjacentElement("afterend", snapshot);

    reloadContent();

    void snapshot.offsetWidth;
    await frameWait();

    snapshot.style.opacity = "0";
    await transitionWait(snapshot);

    snapshot.remove();
}

/**
 * Espera a que finalice una transición CSS de un elemento
 * Ignora eventos de otros elementos o de propiedades distintas a la indicada
 * 
 * @function
 * @param {HTMLElement} elemento - Elemento que emite el evento transitionend
 * @param {string} [prop="opacity"] - Propiedad CSS cuya transición debe esperarse
 * @returns {Promise<void>} Promesa que se resuelve al finalizar la transición
 * 
 * @example
 * await transitionWait(snapshot); // Espera el final de la transición de opacidad
 */
function transitionWait(elemento, prop = "opacity") {
    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.target !== elemento) return;

            if (prop && e.propertyName !== prop) return;

            elemento.removeEventListener("transitionend", handler);
            resolve();
        };

        elemento.addEventListener("transitionend", handler);
    });
}

/**
 * Espera dos ciclos de renderizado del navegador
 * Permite que el DOM y los estilos se actualicen antes de iniciar una transición
 * 
 * @function
 * @returns {Promise<void>} Promesa que se resuelve después de dos requestAnimationFrame
 * 
 * @example
 * await frameWait(); // Espera dos frames antes de continuar
 */
function frameWait() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}