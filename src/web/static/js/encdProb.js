const svg = document.getElementById("slider-svg");
const grupoArco = document.getElementById("arco-segmentos");
const knob = document.getElementById("knob");
const textoValor = document.getElementById("texto-valor");
const displayCentral = document.getElementById("centro-color");
const contenedorTexto = document.getElementById("contenedor-texto");
const pistaFondo = document.getElementById("pista-fondo");
const pathMascara = document.getElementById("path-mascara");

const colores = [
    "#FEF9F6", "#F8E7E0", "#F1D3C8", "#EABCB0", "#DE9C91",
    "#C77A6C", "#A05B51", "#7A4038", "#5B322D"
];

const cx = 100, cy = 100, radio = 75, strokeWidth = 24;
const valMin = 34.0, valMax = 38.0;
const anguloInicio = 135, barridoTotal = 270;
const anguloFin = anguloInicio + barridoTotal;
const barridoPorSegmento = barridoTotal / colores.length;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// --- CORRECCIÓN AQUÍ: Dibujar de inicio a fin para que la máscara se llene correctamente ---
function getArcPathD(startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radio, startAngle);
    const end = polarToCartesian(cx, cy, radio, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radio, radio, 0, largeArcFlag, 1, end.x, end.y // El 1 aquí indica barrido positivo (sentido horario)
    ].join(" ");
}

const dArcoCompleto = getArcPathD(anguloInicio, anguloFin);
pistaFondo.setAttribute("d", dArcoCompleto);
pathMascara.setAttribute("d", dArcoCompleto);

const longitudTotalPath = pathMascara.getTotalLength();
pathMascara.style.strokeDasharray = longitudTotalPath;
pathMascara.style.strokeDashoffset = longitudTotalPath;

colores.forEach((color, i) => {
    const startA = anguloInicio + (i * barridoPorSegmento);
    const endA = startA + barridoPorSegmento + 1; 
    
    const pathSegmento = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathSegmento.setAttribute("d", getArcPathD(startA, endA));
    pathSegmento.setAttribute("fill", "none");
    pathSegmento.setAttribute("stroke", color);
    pathSegmento.setAttribute("stroke-width", strokeWidth);
    grupoArco.appendChild(pathSegmento);
});

let isDragging = false;

function getSVGCoordinates(evt) {
    let pt = svg.createSVGPoint();
    if (evt.touches) {
        pt.x = evt.touches[0].clientX; pt.y = evt.touches[0].clientY;
    } else {
        pt.x = evt.clientX; pt.y = evt.clientY;
    }
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function actualizarDesdeAngulo(anguloRaw) {
    let angulo = anguloRaw;
    if (angulo < 90) angulo += 360; 
    angulo = Math.max(anguloInicio, Math.min(anguloFin, angulo));

    const porcentaje = (angulo - anguloInicio) / barridoTotal;
    const valorActual = valMin + (porcentaje * (valMax - valMin));
    
    textoValor.textContent = valorActual.toFixed(1);

    const pos = polarToCartesian(cx, cy, radio, angulo);
    knob.setAttribute("cx", pos.x);
    knob.setAttribute("cy", pos.y);

    // La máscara se desfasa según el porcentaje
    pathMascara.style.strokeDashoffset = longitudTotalPath * (1 - porcentaje);

    let indiceColor = Math.floor((angulo - anguloInicio) / barridoPorSegmento);
    if (indiceColor >= colores.length) indiceColor = colores.length - 1;

    if (porcentaje === 0) {
        displayCentral.style.backgroundColor = "var(--track-bg)";
    } else {
        displayCentral.style.backgroundColor = colores[indiceColor];
    }

    if (indiceColor >= 5 && porcentaje > 0) {
        contenedorTexto.style.color = "#FFFFFF";
    } else {
        contenedorTexto.style.color = "#2c3e50"; 
    }
}

function onMove(evt) {
    if (!isDragging) return;
    evt.preventDefault(); 
    const coord = getSVGCoordinates(evt);
    const dy = coord.y - cy;
    const dx = coord.x - cx;
    let angulo = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angulo < 0) angulo += 360;
    actualizarDesdeAngulo(angulo);
}

function onStart(evt) {
    isDragging = true;
    onMove(evt);
}

function onEnd() {
    isDragging = false;
}

svg.addEventListener('mousedown', onStart);
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onEnd);
svg.addEventListener('touchstart', onStart, {passive: false});
window.addEventListener('touchmove', onMove, {passive: false});
window.addEventListener('touchend', onEnd);

export function actualizarDesdeValor(valor) {
    valor = Math.max(valMin, Math.min(valMax, valor));

    const porcentaje = (valor - valMin) / (valMax - valMin);

    const angulo = anguloInicio + (porcentaje * barridoTotal);

    actualizarDesdeAngulo(angulo);
}