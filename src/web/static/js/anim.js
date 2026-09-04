const PANEL_HOME = document.getElementById("home");
const PANEL_CONTROL = document.getElementById("panel-control");

export async function dissolveToPanel(destino, reloadContent = null) {
    const panels = { home: PANEL_HOME, control: PANEL_CONTROL };
    const target = panels[destino];

    if (!target) {
        console.warn(`dissolveToPanel: destino desconocido "${destino}"`);
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

function transitionWait(elemento, propiedad = "opacity") {
    return new Promise((resolve) => {
        const handler = (e) => {
            if (e.target !== elemento) return;

            if (propiedad && e.propertyName !== propiedad) return;

            elemento.removeEventListener("transitionend", handler);
            resolve();
        };

        elemento.addEventListener("transitionend", handler);
    });
}

function frameWait() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}