const PANEL_HOME = document.getElementById("home");
const PANEL_CONTROL = document.getElementById("panel-control");

const tittleBar = document.querySelector(".ttl-pnl-prin");

const pnlBebe = document.getElementById("pnl-modoBebe");
const pnlAire = document.getElementById("pnl-modoAire");
const modOx  = document.getElementById("mod-ox");
const modHum = document.getElementById("mod-hum");
const modFot = document.getElementById("mod-fot");

// =====================================
// Transiciones Paneles Home / Control 
// =====================================
// --- Transición de modos --- //
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

// --- Difuminado paneles de Confirmación de Modo --- //
const blurred_Op = new WeakMap();

function el_Add(elemento) {
    if (typeof elemento === "string")
        return document.querySelector(elemento);

    return elemento instanceof HTMLElement ? elemento : null;
}

function render_wait() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

function op_Start(elemento) {
    const nuevaOperacion = (blurred_Op.get(elemento) ?? 0) + 1;

    blurred_Op.set(elemento, nuevaOperacion);

    return nuevaOperacion;
}

function is_ActOp(elemento, operacion) {
    return (blurred_Op.get(elemento) === operacion);
}

function wait_BlurredOp(elemento, tiempoMs) {
    return new Promise((resolve) => {
        let terminado = false;

        const finalizar = () => {
            if (terminado) return;

            terminado = true;

            elemento.removeEventListener("transitionend", manejarTransition);

            window.clearTimeout(timer);
            resolve();
        };

        const manejarTransition = (event) => {
            if (event.target === elemento && event.propertyName === "opacity")
                finalizar();
        };

        const timer = window.setTimeout(finalizar, tiempoMs + 100);

        elemento.addEventListener("transitionend", manejarTransition);
    });
}

async function show_el(elemento, { tiempoMs = 500, claseOculta = "disabled", claseActiva = null } = {}) {
    const target = el_Add(elemento);

    if (!target) {
        console.warn("difuminado.mostrar: elemento no encontrado", elemento);

        return false;
    }

    const operacion = op_Start(target);

    target.style.setProperty("--tiempo-difuminado", `${tiempoMs}ms`);

    if (claseActiva) {
        if (target.classList.contains(claseActiva) && target.classList.contains("is-visible"))
            return true;

        target.classList.remove("is-visible");
        target.classList.add(claseActiva);

        await render_wait();

        if (!is_ActOp(target, operacion))
            return false;


        target.classList.add("is-visible");
        return true;
    }

    if (!target.classList.contains(claseOculta) && !target.classList.contains("fade-hidden"))
        return true;

    target.classList.add("fade-hidden");
    target.classList.remove(claseOculta);

    await render_wait();

    if (!is_ActOp(target, operacion))
        return false;

    target.classList.remove("fade-hidden");

    return true;
}

async function hide_el(elemento, { tiempoMs = 500, claseOculta = "disabled", claseActiva = null } = {}) {
    const target = el_Add(elemento);

    if (!target) {
        console.warn("difuminado.ocultar: elemento no encontrado", elemento);

        return false;
    }

    const operacion = op_Start(target);

    target.style.setProperty("--tiempo-difuminado", `${tiempoMs}ms`);

    if (claseActiva) {
        if (!target.classList.contains(claseActiva))
            return true;

        target.classList.remove("is-visible");

        await wait_BlurredOp(target, tiempoMs);

        if (!is_ActOp(target, operacion))
            return false;

        target.classList.remove(claseActiva);
        return true;
    }

    if (target.classList.contains(claseOculta))
        return true;

    target.classList.add("fade-hidden");

    await wait_BlurredOp(target, tiempoMs);

    if (!is_ActOp(target, operacion))
        return false;

    target.classList.add(claseOculta);
    target.classList.remove("fade-hidden");

    return true;
}

async function exchange(elementoSalida, elementoEntrada, { tiempoMs = 500, salida = {}, entrada = {} } = {}) {
  const out_Options = {
    ...salida,
    tiempoMs: salida.tiempoMs ?? tiempoMs
  };

  const in_Options = {
    ...entrada,
    tiempoMs: entrada.tiempoMs ?? tiempoMs
  };

  return Promise.all(
    [   hide_el(elementoSalida, out_Options),
        show_el(elementoEntrada, in_Options)   ]
    );
}

function create_El(elemento, opciones = {}) {
    return Object.freeze({
        show_el(tiempoMs = opciones.tiempoMs) {
            return show_el(elemento, {
                ...opciones,
                tiempoMs
            });
        },

        hide_el(tiempoMs = opciones.tiempoMs) {
        return hide_el(elemento, {
            ...opciones,
            tiempoMs
        });
        }
    });
}

export const blurring = Object.freeze({
  show_el,
  hide_el,
  exchange,
  create_El
});


// ======================
// Blureado de paneles
// ======================
/**
 * Aplica el efecto de desenfoque al panel activo y a los módulos de control principales
 * Se usa para resaltar visualmente el contenido que está en segundo plano al abrir un diálogo o modal
 * 
 * @function
 * @returns {void} No devuelve ningún valor
 * 
 * @example
 * addBlurScreen(); // Desenfoca el panel activo y los módulos de oxígeno, humedad y fototerapia
 */
export function addBlurScreen(view = null) {
    const panelActivo = pnlBebe?.classList.contains("active") ? pnlBebe : pnlAire;

    if (view == "gral") {
        const panelInactivo = pnlBebe?.classList.contains("active") ? pnlAire : pnlBebe;

        tittleBar?.classList.add("mica-effect");
        panelInactivo?.classList.add("mica-effect");
    }

    panelActivo?.classList.add("mica-effect");
    [modOx, modHum, modFot].forEach((el) => el?.classList.add("mica-effect"));
}

/**
 * Aplica el efecto de desenfoque a los paneles y módulos asociados a la vista fototerápica
 * Se utiliza cuando se requiere desactivar el fondo visual de la sección de fototerapia
 * 
 * @function
 * @returns {void} No devuelve ningún valor
 * 
 * @example
 * addBlurScreenFot(); // Desenfoca los módulos de bebé, aire, oxígeno y humedad
 */
export function addBlurScreenFot(){
    [pnlBebe, pnlAire, modOx, modHum].forEach((el) =>
        el?.classList.add("mica-effect"));
}

export function blurCtrl_Panel() {
    document.querySelector(".mp-atpiel-mc-ttl").classList.add("mica-effect");
    document.querySelector(".mp-info-ctrl").classList.add("mica-effect");
}

export function removeBlurCtrl_Panel() {
    document.querySelector(".mp-atpiel-mc-ttl").classList.remove("mica-effect");
    document.querySelector(".mp-info-ctrl").classList.remove("mica-effect");
}

/**
 * Elimina el efecto de desenfoque de todos los paneles y módulos afectados
 * Restaura la vista original para continuar la interactividad normal del contenido
 * 
 * @function
 * @returns {void} No devuelve ningún valor
 * 
 * @example
 * removeBlurScreen(); // Quita el efecto de desenfoque de toda la interfaz
 */
export function removeBlurScreen() {
    tittleBar?.classList.remove("mica-effect");

    [pnlBebe, pnlAire, modOx, modHum, modFot].forEach((el) =>
        el?.classList.remove("mica-effect")
    );
}