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

    window.addEventListener("resize", scaleHMI);
    window.addEventListener("load", scaleHMI);

    window.scaleHMI = scaleHMI;
})();
