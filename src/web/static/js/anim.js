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

/**
 * Resuelve un selector CSS o valida que el argumento sea un elemento HTML
 * 
 * @function
 * @param {string|HTMLElement} elemento - Selector CSS o elemento que se utilizará
 * @returns {HTMLElement|null} Elemento encontrado o null si no es válido
 * 
 * @example
 * const panel = el_Add("#panel-control");
 */
function el_Add(elemento) {
    if (typeof elemento === "string")
        return document.querySelector(elemento);

    return elemento instanceof HTMLElement ? elemento : null;
}

/**
 * Espera dos ciclos de renderizado del navegador
 * Permite que el DOM y los estilos se actualicen antes de continuar una transición
 * 
 * @function
 * @returns {Promise<void>} Promesa que se resuelve después de dos requestAnimationFrame
 * 
 * @example
 * await render_wait(); // Espera dos frames antes de continuar
 */
function render_wait() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

/**
 * Inicia una nueva operación de desenfoque para un elemento
 * Incrementa y registra su identificador para distinguirla de operaciones anteriores
 * 
 * @function
 * @param {HTMLElement} elemento - Elemento asociado a la operación
 * @returns {number} Identificador de la nueva operación
 */
function op_Start(elemento) {
    const nuevaOperacion = (blurred_Op.get(elemento) ?? 0) + 1;

    blurred_Op.set(elemento, nuevaOperacion);

    return nuevaOperacion;
}

/**
 * Comprueba si una operación sigue siendo la más reciente para el elemento
 * 
 * @function
 * @param {HTMLElement} elemento - Elemento cuya operación se comprobará
 * @param {number} operacion - Identificador de la operación que se quiere validar
 * @returns {boolean} true si la operación continúa activa; false si fue reemplazada
 */
function is_ActOp(elemento, operacion) {
    return (blurred_Op.get(elemento) === operacion);
}

/**
 * Espera a que termine la transición de opacidad de un elemento
 * También finaliza la espera al vencer el tiempo indicado más un margen de 100 ms
 * 
 * @function
 * @param {HTMLElement} elemento - Elemento cuya transición se esperará
 * @param {number} tiempoMs - Duración esperada de la transición en milisegundos
 * @returns {Promise<void>} Promesa que se resuelve al finalizar la transición o el tiempo límite
 */
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

/**
 * Muestra un elemento mediante una transición de opacidad
 * Puede retirar una clase de ocultación o activar una clase específica
 * La operación devuelve false si el elemento no existe o si otra operación la reemplaza
 * 
 * @function
 * @async
 * @param {string|HTMLElement} elemento - Selector CSS o elemento que se mostrará
 * @param {Object} [opciones={}] - Opciones de visualización
 * @param {number} [opciones.tiempoMs=500] - Duración de la transición en milisegundos
 * @param {string} [opciones.claseOculta="disabled"] - Clase que se retirará para mostrar el elemento
 * @param {string|null} [opciones.claseActiva=null] - Clase que se activará para el modo de visibilidad alternativo
 * @returns {Promise<boolean>} true si el elemento queda visible; false si no existe o la operación fue reemplazada
 * 
 * @example
 * await show_el("#panel-control", { tiempoMs: 300 });
 */
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

/**
 * Oculta un elemento mediante una transición de opacidad
 * Puede aplicar una clase de ocultación o retirar una clase activa específica
 * La operación devuelve false si el elemento no existe o si otra operación la reemplaza
 * 
 * @function
 * @async
 * @param {string|HTMLElement} elemento - Selector CSS o elemento que se ocultará
 * @param {Object} [opciones={}] - Opciones de ocultación
 * @param {number} [opciones.tiempoMs=500] - Duración de la transición en milisegundos
 * @param {string} [opciones.claseOculta="disabled"] - Clase que se aplicará para ocultar el elemento
 * @param {string|null} [opciones.claseActiva=null] - Clase que se retirará para el modo de visibilidad alternativo
 * @returns {Promise<boolean>} true si el elemento queda oculto; false si no existe o la operación fue reemplazada
 * 
 * @example
 * await hide_el("#panel-control", { tiempoMs: 300 });
 */
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

/**
 * Oculta un elemento mientras muestra otro
 * Permite definir opciones generales y opciones independientes para cada elemento
 * 
 * @function
 * @async
 * @param {string|HTMLElement} elementoSalida - Selector o elemento que se ocultará
 * @param {string|HTMLElement} elementoEntrada - Selector o elemento que se mostrará
 * @param {Object} [opciones={}] - Opciones generales y específicas de las transiciones
 * @param {number} [opciones.tiempoMs=500] - Duración predeterminada de ambas transiciones en milisegundos
 * @param {Object} [opciones.salida={}] - Opciones adicionales para la función hide_el
 * @param {Object} [opciones.entrada={}] - Opciones adicionales para la función show_el
 * @returns {Promise<boolean[]>} Promesa con los resultados de ocultar y mostrar, en ese orden
 * 
 * @example
 * await exchange("#panel-a", "#panel-b", { tiempoMs: 300 });
 */
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

/**
 * Crea un controlador reutilizable para mostrar u ocultar un elemento
 * Devuelve métodos que aplican las opciones configuradas al elemento asociado
 * 
 * @function
 * @param {string|HTMLElement} elemento - Selector CSS o elemento que controlará el objeto
 * @param {Object} [opciones={}] - Opciones predeterminadas para las transiciones
 * @returns {Readonly<Object>} Objeto inmutable con los métodos show_el y hide_el
 * @returns {Function} returns.show_el(tiempoMs) - Muestra el elemento y devuelve Promise<boolean>
 * @returns {Function} returns.hide_el(tiempoMs) - Oculta el elemento y devuelve Promise<boolean>
 * 
 * @example
 * const panel = create_El("#panel-control", { tiempoMs: 300 });
 * await panel.show_el();
 * await panel.hide_el();
 */
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

/**
 * Aplica el efecto de desenfoque al título y al panel de información de control
 * Se utiliza para atenuar visualmente estos elementos mientras otra interfaz está activa
 * 
 * @function
 * @returns {void} No devuelve ningún valor
 * 
 * @example
 * blurCtrl_Panel(); // Desenfoca el título y la información de control
 */
export function blurCtrl_Panel() {
    document.querySelector(".mp-atpiel-mc-ttl").classList.add("mica-effect");
    document.querySelector(".mp-info-ctrl").classList.add("mica-effect");
}

/**
 * Elimina el efecto de desenfoque del título y del panel de información de control
 * Restaura su apariencia normal para continuar la interacción con el panel
 * 
 * @function
 * @returns {void} No devuelve ningún valor
 * 
 * @example
 * removeBlurCtrl_Panel(); // Quita el desenfoque del título y la información de control
 */
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