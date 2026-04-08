import { toggle_btnSG,
         set_EditCtrlsEn,
         chngMode,
 } from "./ui.js";

let encSince = 0;
let encPollTimer = null;
let editTimeout = null;

let editingEnabled = false;

(() => {
    // ====== Config ======
    const UI = {
        modoBebe:           "modo-bebe",        // <div id="modo-bebe">
        modoManual:         "modo-manual",      // <div id="modo-manual">

        tempProgText:       "tempProg",         // <span id="tempProg">
        lblTempProg:        "tempProg-val",     // <div id="tempProg-val">
    };

    const UI_btnsTempProg = {
        btnMenos:           "tempProgMenos",    // <button id="tempProgMenos">
        btnMas:             "tempProgMas",      // <button id="tempProgMas">
        btnSobreGiro:       "tmpPrgSobregiro",  // <button id="tmpPrgSobregiro">
        btn_tempProgAcpt:   "tempProgAceptar",  // <button id="tempProgAceptar">
    };

    // ====== Rutas ======
    const API = {
        tempProg:       "/api/tempProg",
        sobreGiro:      "/api/sobreGiro",
        encoderEvents:  "/api/encoder/events",
        startEdit:      "/api/tempProg/edit/start",
        acceptVal:      "/api/tempProg/edit/accept",
        cancelVal:      "/api/tempProg/edit/cancel",
    };

    // ====== Estado local ======
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
        if (!editingEnabled) return;

        if (st.sobreGiroInFlight) return;

        st.sobreGiroInFlight = true;

        try {
            const d = await apiPost(API.sobreGiro, {});
            syncFromServer(d);

            toggle_btnSG(st.sobreGiro);
        } catch (e) {
            console.error(e);
            await loadInit();
        } finally {
            st.sobreGiroInFlight = false;
        }
    }

    async function applyDeltaTempProg(delta) {
        if (!editingEnabled) return;

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
            if (!editingEnabled) return;

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
            editingEnabled = set_EditCtrlsEn(true, UI_btnsTempProg);

            if (!encPollTimer) encPollTimer = setInterval(pollEncoderEvents, 120);

            document.getElementById('tempProg-val').classList.add('parpadeo');
            const r = await fetch(API.startEdit, { method: "POST" });

            editTimeout = setTimeout(async () => {
                try {
                    const d = await apiPost(API.cancelVal, {});

                    syncFromServer(d);
                } catch (err) {
                    console.error(err);
                } finally {
                    clearInterval(encPollTimer);
                    encPollTimer = null;

                    document.getElementById('tempProg-val').classList.remove('parpadeo');
                }
            }, 30000);
        }
        else if (value == "swAceptado" || (value.target && value.target.id == "tempProgAceptar-lbl")) {
            clearInterval(encPollTimer);
            encPollTimer = null;

            clearInterval(editTimeout);
            editTimeout = null;

            const r = await fetch(API.acceptVal, { method: "POST" });

            editingEnabled = set_EditCtrlsEn(false, UI_btnsTempProg);

            document.getElementById('tempProg-val').classList.remove('parpadeo');
        }
    }

    
    // ====== Init UI_btnsTempProg ======
    window.addEventListener("load", async () => {
        await loadInit();

        editingEnabled = set_EditCtrlsEn(false, UI_btnsTempProg);

        const mBebe = $(UI.modoBebe);
        const mMan = $(UI.modoManual);

        const enEdit_TmpProg = $(UI.lblTempProg);

        const bMinus = $(UI_btnsTempProg.btnMenos);
        const bPlus = $(UI_btnsTempProg.btnMas);
        const bSG = $(UI_btnsTempProg.btnSobreGiro);
        const acpt_ValTempProg = $(UI_btnsTempProg.btn_tempProgAcpt);

        if (mBebe) mBebe.addEventListener("click", chngMode);
        if (mMan) mMan.addEventListener("click", chngMode);

        if (enEdit_TmpProg) enEdit_TmpProg.addEventListener("click", enable_Editing);

        if (bMinus) setupHoldButton(bMinus, -0.1);
        if (bPlus) setupHoldButton(bPlus, +0.1);
        if (bSG) bSG.addEventListener("click", toggleSobreGiro);

        if (acpt_ValTempProg) acpt_ValTempProg.addEventListener("click", enable_Editing);
    });
})();