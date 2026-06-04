import { 
    startSensor,
    pauseSensor,
} from "./sensor.js";

let encSince = 0;
let encPollTimer = null;
let editTimeout = null;
let editingEnabled = false;

(() => {
    const UI = {
        tempProg: "_36-7",
        potCalef: "temp-medida-aire",
    };

    const API = {
        tempProg:       "/api/tempProg",
        encoderEvents:  "/api/encoder/events",
        startEdit:      "/api/tempProg/edit/start",
        acceptVal:      "/api/tempProg/edit/accept",
        cancelVal:      "/api/tempProg/edit/cancel",
    };

    const st = {
        tempProg: 34.0,
        tempProgDraft: 34.0,
        sobreGiro: false,
        editingTempProg: false,
    };

    const $ = (id) => document.getElementById(id);

    async function apiGet(url) {
        const r = await fetch(url, { method: "GET" });
        const d = await r.json();

        if (!r.ok || d.status !== "ok") {
            throw new Error(d.error || `GET ${url} failed`);
        }
        return d;
    }

    async function apiPost(url, body) {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body ?? {}),
        });

        const d = await r.json();

        if (!r.ok || d.status !== "ok") {
            throw new Error(d.error || `POST ${url} failed`);
        }
        return d;
    }

    function render() {
        const el = $(UI.tempProg);
        if (!el) return;

        const shown = st.editingTempProg ? st.tempProgDraft : st.tempProg;

        el.textContent = Number(shown).toFixed(1);
    }

    function syncFromServer(d) {
        st.tempProg = Number(d.tempProg);
        st.tempProgDraft = Number(d.tempProgDraft ?? d.tempProg);
        st.sobreGiro = !!d.sobreGiro;
        st.editingTempProg = !!d.editingTempProg;
        render();
    }

    async function loadInit() {
        const d = await apiGet(API.tempProg);
        syncFromServer(d);
    }

    function stopEditingUI() {
        if (encPollTimer) {
            clearInterval(encPollTimer);
            encPollTimer = null;
        }

        if (editTimeout) {
            clearTimeout(editTimeout);
            editTimeout = null;
        }

        editingEnabled = false;
        $(UI.tempProg)?.classList.remove("parpadeo");

        startSensor();
    }

    async function pollEncoderEvents() {
        try {
            const r = await fetch(`${API.encoderEvents}?since=${encSince}`, { method: "GET" });
            const d = await r.json();

            if (!r.ok || d.status !== "ok") return;

            const evts = Array.isArray(d.events) ? d.events : [];

            for (const e of evts) {
                encSince = Math.max(encSince, Number(e.id) || 0);

                if (e.type === "change" && e.payload) {
                    syncFromServer(e.payload);
                }

                if (e.type === "accept") {
                    try {
                        const dAccept = await apiPost(API.acceptVal, {});
                        syncFromServer(dAccept);
                        console.log("Valor aceptado desde encoder");
                    } catch (err) {
                        console.error(err);
                    } finally {
                        stopEditingUI();
                    }
                }

                if (e.type === "cancel") {
                    if (e.payload) syncFromServer(e.payload);
                    console.log(`Edición cancelada: ${e.payload?.reason ?? "timeout"}`);
                    stopEditingUI();
                }
            }
        } catch (err) {
            console.debug(err);
        }
    }

    async function enable_Editing(event) {
        if (!event?.target || event.target.id !== UI.tempProg) return;
        if (editingEnabled) return;
        pauseSensor();

        try {
            const d = await apiPost(API.startEdit, {});

            syncFromServer(d);

            editingEnabled = true;
            $(UI.tempProg)?.classList.add("parpadeo");

            if (!encPollTimer) {
                encPollTimer = setInterval(pollEncoderEvents, 120);
            }

            editTimeout = setTimeout(async () => {
                try {
                    const dCancel = await apiPost(API.cancelVal, {});
                    syncFromServer(dCancel);
                    console.log("Edición cancelada por timeout (30 s)");
                } catch (err) {
                    console.error(err);
                } finally {
                    stopEditingUI();
                }
            }, 30000);
        } catch (err) {
            console.error(err);
        }
    }

    window.addEventListener("load", async () => {
        await loadInit();

        const tempProgEl = $(UI.tempProg);
        const potCalefEl = $(UI.potCalef);

        startSensor();

        if (tempProgEl) {
            tempProgEl.addEventListener("click", enable_Editing);
        }
        if (potCalefEl) {
            potCalefEl.addEventListener("click", () => {
                console.log("potCalef clicked");
            });
        }
    });
})();