export function applyTheme(color, light, dim, swatchElement) {
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--accent-light", light);
    document.documentElement.style.setProperty("--accent-dim", dim);
    localStorage.setItem("themeColor", color);
    localStorage.setItem("themeLight", light);
    localStorage.setItem("themeDim", dim);
    document.querySelectorAll(".theme-swatch").forEach(swatch => swatch.classList.remove("active"));
    if (swatchElement) {
        swatchElement.classList.add("active");
    } else {
        document.querySelectorAll(".theme-swatch").forEach(swatch => {
            if (swatch.dataset.color === color && swatch.dataset.light === light && swatch.dataset.dim === dim) {
                swatch.classList.add("active");
            }
        });
    }
    const statsSection = document.getElementById("statistics");
    if (statsSection.classList.contains("active")) {
        requestAnimationFrame(() => {
            renderStatistics();
        });
    }
    document.getElementById("themeAccent").value = color;
    document.getElementById("themeLight").value = light;
    document.getElementById("themeDim").value = dim;
}

export function restoreThemeFromStorage() {
    const color = localStorage.getItem("themeColor");
    const light = localStorage.getItem("themeLight");
    const dim = localStorage.getItem("themeDim");
    if (color && light && dim) {
        applyTheme(color, light, dim);
        return;
    }
    const defaultSwatch = document.querySelector('.theme-swatch[data-color="#8b1a1a"]');
    if (defaultSwatch) {
        applyTheme("#8b1a1a", "#c0392b", "rgba(139,26,26,0.15)", defaultSwatch);
    }
}