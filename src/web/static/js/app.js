// (function () {
//     const BASE_W = 1024;
//     const BASE_H = 585;

//     function scaleHMI() {
//         const stage = document.getElementById("stage");
//         const shell = document.querySelector(".pant-shell");

//         if (!stage || !shell) return;

//         const vw = stage.clientWidth;
//         const vh = stage.clientHeight;

//         const scale = Math.min(vw / BASE_W, vh / BASE_H);

//         const left = Math.round((vw - BASE_W * scale) / 2);
//         const top  = Math.round((vh - BASE_H * scale) / 2);

//         shell.style.left = `${left}px`;
//         shell.style.top = `${top}px`;
//         shell.style.transform = `scale(${scale})`;
//     }

//     window.addEventListener("resize", scaleHMI);
//     window.addEventListener("load", scaleHMI);

//     window.scaleHMI = scaleHMI;
// })();

(function () {
  const BASE_W = 1024;
  const BASE_H = 585;

  function scaleHMI() {
    const stage = document.getElementById("stage");
    const shell = document.querySelector(".pant-shell");
    if (!stage || !shell) return;

    const vw = stage.clientWidth;
    const vh = stage.clientHeight;

    const scale = Math.min(vw / BASE_W, vh / BASE_H);
    const left = Math.round((vw - BASE_W * scale) / 2);
    const top  = Math.round((vh - BASE_H * scale) / 2);

    shell.style.left = `${left}px`;
    shell.style.top = `${top}px`;
    shell.style.transform = `scale(${scale})`;
  }

  function mountFooterFromView() {
    const slot = document.getElementById("footer-slot");
    const view = document.getElementById("view");
    if (!slot || !view) return;

    // busca el footer dentro de la vista actual
    const footer = view.querySelector("[data-footer]");

    // limpia el footer anterior
    slot.innerHTML = "";

    // si existe, muévelo al slot (se mantiene el DOM)
    if (footer) slot.appendChild(footer);
  }

  function onLayout() {
    mountFooterFromView();
    scaleHMI();
  }

  window.addEventListener("resize", scaleHMI);
  window.addEventListener("load", onLayout);

  // expón helpers por si luego cambias vistas con fetch()
  window.scaleHMI = scaleHMI;
  window.mountFooterFromView = mountFooterFromView;
})();
