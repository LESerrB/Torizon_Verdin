const SLIDER_THEMES = [
    "seg-t_piel",
    "seg-t_aire",
    "seg-p_ox",
    "seg-p_hum"
];

const TEMPERATURE_POINTS = [
    { x: 36, y: 218 },
    { x: 18, y: 147 },
    { x: 32, y: 92 },
    { x: 68, y: 48 },
    { x: 120, y: 20 },
    { x: 176, y: 20 },
    { x: 228, y: 48 },
    { x: 264, y: 92 },
    { x: 278, y: 147 },
    { x: 260, y: 218 }
];

const FOTOTHERAPY_POINTS = [
    { x: 36, y: 218 },
    { x: 148, y: 18.5 },
    { x: 260, y: 218 }
];

function clamp(value, minValue, maxValue) {
    return Math.min(Math.max(value, minValue), maxValue);
}

function roundToStep(value, step) {
    return Math.round(value / step) * step;
}

function valueToSegment(value, min, max) {
    if (max <= min) {
        return 0;
    }

    const ratio = clamp((value - min) / (max - min), 0, 1);

    return clamp(Math.floor(ratio * 10), 0, 9);
}

function setSegmentTheme(seg, index, theme) {
    SLIDER_THEMES.forEach((themeName) => {
        seg.classList.remove(`${themeName}-${index}`);
    });

    seg.classList.add(`${theme}-${index}`);
}

function getSliderConfig(slider) {
    const defaults = { min: 34.0, max: 38.0, step: 0.1 };

    if (!slider) {
        return defaults;
    }

    const parsedMin = Number.parseFloat(slider.dataset.min);
    const parsedMax = Number.parseFloat(slider.dataset.max);
    const parsedStep = Number.parseFloat(slider.dataset.step);

    return {
        min: Number.isFinite(parsedMin) ? parsedMin : defaults.min,
        max: Number.isFinite(parsedMax) ? parsedMax : defaults.max,
        step: Number.isFinite(parsedStep) && parsedStep > 0
            ? parsedStep
            : defaults.step
    };
}

function formatValue(value, step) {
    const precision = Math.max(0, getDecimalPlaces(step));
    return Number(value).toFixed(precision);
}

function getDecimalPlaces(value) {
    if (!Number.isFinite(value)) {
        return 1;
    }

    const parts = value.toString().split(".");
    return parts[1] ? parts[1].length : 0;
}

export function initTemperaturePowerSlider({
    sliderId = "tpielSlider",
    knobId = "tpielKnob",
    valCtrlEl = null,
    formatValueFn = formatValue,
    initialValue = null
} = {}) {
    const slider = document.getElementById(sliderId);
    const knob = document.getElementById(knobId);

    if (!slider || !knob) {
        return {
            setValue() {},
            setConfig() {}
        };
    }

    let sliderConfig = {
        ...getSliderConfig(slider),
        theme: slider.dataset.theme ?? "seg-t_piel"
    };

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];

    function updateSlider(value) {
        const {
            min,
            max,
            step,
            theme
        } = sliderConfig;

        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? numericValue : min;
        const clampedValue = clamp(roundToStep(safeValue, step), min, max);
        const selectedSegment = valueToSegment(clampedValue, min, max);
        const point = TEMPERATURE_POINTS[selectedSegment];

        knob.setAttribute("cx", point.x);
        knob.setAttribute("cy", point.y);

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);
            const isActive = index <= selectedSegment;
            const isSelected = index === selectedSegment;

            setSegmentTheme(seg, index, theme);

            seg.classList.toggle("active", isActive);
            seg.classList.toggle("inactive", !isActive);
            seg.classList.toggle("selected", isSelected);
        });

        slider.dataset.value = formatValueFn(clampedValue, step);

        if (valCtrlEl) {
            valCtrlEl.textContent = formatValueFn(clampedValue, step);
        }

        slider.dispatchEvent(
            new CustomEvent("tpiel-slider-change", {
                detail: {
                    value: clampedValue,
                    segment: selectedSegment,
                    min,
                    max,
                    step
                }
            })
        );
    }

    return {
        setValue(value) {
            updateSlider(value);
        },
        setConfig({ min, max, step, value, theme }) {
            sliderConfig = {
                min,
                max,
                step,
                theme: theme ?? sliderConfig.theme
            };

            if (slider) {
                slider.dataset.min = String(min);
                slider.dataset.max = String(max);
                slider.dataset.step = String(step);
                slider.dataset.theme = sliderConfig.theme;
            }

            if (value !== undefined) {
                updateSlider(value);
            }
        }
    };
}

export function initFototerapiaSlider({
    sliderId = "fotSlider",
    knobId = "fotKnob",
    initialValue = 1
} = {}) {
    const slider = document.getElementById(sliderId);
    const knob = document.getElementById(knobId);

    if (!slider) {
        return {
            setValue() {},
            setConfig() {}
        };
    }

    const segments = [...slider.querySelectorAll(".ctrl-slider-seg")];
    const min = 1;
    const max = 3;

    function updateFotSlider(value) {
        const numericValue = Number(value);
        const safeValue = Number.isFinite(numericValue) ? numericValue : min;
        const clampedValue = Math.min(Math.max(Math.round(safeValue), min), max);
        const selectedSegment = clampedValue - min;

        if (knob) {
            const point = FOTOTHERAPY_POINTS[selectedSegment];

            knob.setAttribute("cx", point.x);
            knob.setAttribute("cy", point.y);
        }

        segments.forEach((seg) => {
            const index = Number(seg.dataset.seg);

            seg.classList.toggle("active", index <= selectedSegment);
            seg.classList.toggle("inactive", index > selectedSegment);
            seg.classList.toggle("selected", index === selectedSegment);
        });

        slider.dataset.value = String(clampedValue);

        slider.dispatchEvent(
            new CustomEvent("fot-slider-change", {
                detail: {
                    value: clampedValue,
                    segment: selectedSegment,
                    min,
                    max,
                    step: 1
                }
            })
        );
    }

    updateFotSlider(initialValue);

    return {
        setValue(value) {
            updateFotSlider(value);
        }
    };
}
