const PANEL_HOME = document.getElementById("home");
const PANEL_CONTROL = document.getElementById("panel-control");
const DISSOLVE_DURATION = 1200; // ms

/**
 * Realiza la animación de disolución entre el panel Home y el panel Control.
 * @param {"home"|"control"} destino
 */
export function dissolveToPanel(destino) {
    const panels = { home: PANEL_HOME, control: PANEL_CONTROL };
    const target = panels[destino];

    if (!target) {
        console.warn(`dissolveToPanel: destino desconocido "${destino}"`);
        return;
    }

    // Evita re-disparar la transición si ya está activo
    if (target.classList.contains("panel-active")) return;

    Object.values(panels).forEach((panel) => {
        panel.classList.toggle("panel-active", panel === target);
    });
}

/**
 * Devuelve una Promise que resuelve cuando termina la animación,
 * útil si necesitas encadenar acciones (ej. actualizar contenido
 * justo después de que el panel quedó totalmente visible).
 */
export function dissolveToPanelAsync(destino) {
    return new Promise((resolve) => {
        dissolveToPanel(destino);
        setTimeout(resolve, DISSOLVE_DURATION);
    });
}