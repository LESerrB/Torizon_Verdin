let encSince = 0;
let encPollTimer = null;

(() => {
    // ====== Config ======
    const UI = {
        tempProgText:       "tempProg",         // <span id="tempProg">
        btnMenos:           "tempProgMenos",    // <button id="tempProgMenos">
        btnMas:             "tempProgMas",      // <button id="tempProgMas">
        btnSobreGiro:       "tmpPrgSobregiro",  // <button id="tmpPrgSobregiro">
        lblTempProg:        "tempProg-val",     // <div id="tempProg-val">
        btn_tempProgAcpt:   "tempProgAceptar"   // <button id="tempProgAceptar">
    };
    // ====== Rutas ======
    const API = {
        tempProg:       "/api/tempProg",
        sobreGiro:      "/api/sobreGiro",
        encoderEvents:  "/api/encoder/events",
        startEdit:      "/api/tempProg/edit/start",
        acceptVal:      "/api/tempProg/edit/accept",
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

        if (el) {
            const shown = st.editingTempProg ? st.tempProgDraft : st.tempProg;
            el.textContent = Number(shown).toFixed(1);
        }

        const btn = $(UI.btnSobreGiro);
        if (btn) {
            // Boton Sobregiro
        }
    }

    function syncFromServer(d) {
        st.tempProg = Number(d.tempProg);
        st.tempProgDraft = Number(d.tempProgDraft ?? d.tempProg);
        st.sobreGiro = !!d.sobreGiro;
        st.editingTempProg = !!d.editingTempProg;

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
            const d = await apiPost(API.sobreGiro, {});
            syncFromServer(d);
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
            applyDeltaTempProg(delta);
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

    async function pollEncoderEvents() {
        try {
            const r = await fetch(`${API.encoderEvents}?since=${encSince}`, { method: "GET" });
            const d = await r.json();

            if (!r.ok || d.status !== "ok") return;

            const evts = Array.isArray(d.events) ? d.events : [];

            for (const e of evts) {
                encSince = Math.max(encSince, Number(e.id) || 0);

                if (e.type === "change") {
                    if (e.payload) syncFromServer(e.payload);
                }

                if (e.type === "accept") {
                    const tp = e.payload?.tempProg;
                    const sg = e.payload?.sobreGiro;

                    enable_Editing("swAceptado")
                }
            }
        } catch (err) {
            console.debug(err);
        }
    }

    async function enable_Editing(value){
        if(value.target && value.target.id == "tempProg"){
            if (!encPollTimer) encPollTimer = setInterval(pollEncoderEvents, 120);

            document.getElementById('tempProg-val').classList.add('parpadeo');
            const r = await fetch(API.startEdit, { method: "POST" });
        }
        else if (value == "swAceptado" || (value.target && value.target.id == "tempProgAceptar-lbl")) {
            clearInterval(encPollTimer);
            encPollTimer = null;
            const r = await fetch(API.acceptVal, { method: "POST" });

            document.getElementById('tempProg-val').classList.remove('parpadeo');
        }
    }

    // ====== Init UI ======
    window.addEventListener("load", async () => {
        await loadInit();

        const bMinus = $(UI.btnMenos);
        const bPlus = $(UI.btnMas);
        const bSG = $(UI.btnSobreGiro);
        const enEdit_TmpProg = $(UI.lblTempProg);
        const acpt_ValTempProg = $(UI.btn_tempProgAcpt);

        if (bMinus) setupHoldButton(bMinus, -0.1);
        if (bPlus) setupHoldButton(bPlus, +0.1);
        if (bSG) bSG.addEventListener("click", toggleSobreGiro);

        if (enEdit_TmpProg) enEdit_TmpProg.addEventListener("click", enable_Editing);
        if (acpt_ValTempProg) acpt_ValTempProg.addEventListener("click", enable_Editing);

    });
})();