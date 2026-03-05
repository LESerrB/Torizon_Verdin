(() => {
    // ====== Config ======
    const UI = {
        tempProgText: "tempProg",          // <span id="tempProg">
        btnMenos: "tempProgMenos",         // <button id="tempProgMenos">
        btnMas: "tempProgMas",             // <button id="tempProgMas">
        btnSobreGiro: "tmpPrgSobregiro",   // <button id="tmpPrgSobregiro">
    };

    const API = {
        tempProg: "/api/tempProg",
        sobreGiro: "/api/sobreGiro",
    };

    // ====== Estado local (solo para render) ======
    const st = {
        tempProg: 34.0,
        sobreGiro: false,

        tempProgInFlight: false,
        sobreGiroInFlight: false,
        queuedDelta: 0,
    };

    // ====== Helpers ======
    const $ = (id) => document.getElementById(id);

    async function apiGet(url) {
        const r = await fetch(url, { method: "GET" });
        const d = await r.json();

        if (!r.ok || d.status !== "ok") throw new Error(d.error || `GET ${url} failed`);

        return d;
    }

    async function apiPost(url, body) {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body ?? {}),
        });

        const d = await r.json();

        if (!r.ok || d.status !== "ok") throw new Error(d.error || `POST ${url} failed`);

        return d;
    }

    function render() {
        const el = $(UI.tempProgText);
        if (el) el.textContent = Number(st.tempProg).toFixed(1);

        // const btn = $(UI.btnSobreGiro);
        // if (btn) {
        //   btn.classList.toggle("active", !!st.sobreGiro);
        //   btn.dataset.enabled = st.sobreGiro ? "1" : "0";
        //   // si quieres texto dinámico:
        // //   btn.textContent = st.sobreGiro ? "SOBREGIRO: ON" : "SOBREGIRO: OFF";
        // }
    }

    function syncFromServer(d) {
        // d debe traer tempProg y sobreGiro
        st.tempProg = Number(d.tempProg);
        st.sobreGiro = !!d.sobreGiro;

        render();
    }

    // ====== Carga inicial ======
    async function loadInit() {
        const d = await apiGet(API.tempProg);
        syncFromServer(d);
    }

    // ====== Acciones ======
    async function toggleSobreGiro() {
        if (st.sobreGiroInFlight) return;

        st.sobreGiroInFlight = true;

        try {
            const d = await apiPost(API.sobreGiro, {}); // toggle
            syncFromServer(d); // ojo: tempProg puede cambiar por clamp
        } catch (e) {
            console.error(e);
            await loadInit();
        } finally {
            st.sobreGiroInFlight = false;
        }
    }

    async function applyDeltaTempProg(delta) {
        st.queuedDelta += delta;

        if (st.tempProgInFlight) return;

        st.tempProgInFlight = true;

        try {
            while (Math.abs(st.queuedDelta) > 1e-9) {
                const dDelta = st.queuedDelta;
                st.queuedDelta = 0;

                const d = await apiPost(API.tempProg, { delta: dDelta });
                syncFromServer(d);
            }
        } catch (e) {
            console.error(e);
            await loadInit();
        } finally {
            st.tempProgInFlight = false;
        }
    }

    function setupHoldButton(btn, delta, periodMs = 120) {
        let timer = null;

        const start = (e) => {
            e?.preventDefault?.();
            applyDeltaTempProg(delta); // golpe inmediato
            timer = setInterval(() => applyDeltaTempProg(delta), periodMs);
            btn.setPointerCapture?.(e.pointerId);
        };

        const stop = () => {
            if (timer) clearInterval(timer);

            timer = null;
        };

        btn.addEventListener("pointerdown", start);
        btn.addEventListener("pointerup", stop);
        btn.addEventListener("pointercancel", stop);
        btn.addEventListener("lostpointercapture", stop);
        btn.addEventListener("pointerleave", stop);
    }

    // ====== Init UI ======
    window.addEventListener("load", async () => {
        await loadInit();

        const bMinus = $(UI.btnMenos);
        const bPlus = $(UI.btnMas);
        const bSG = $(UI.btnSobreGiro);

        if (bMinus) setupHoldButton(bMinus, -0.1);
        if (bPlus) setupHoldButton(bPlus, +0.1);
        if (bSG) bSG.addEventListener("click", toggleSobreGiro);
    });
})();