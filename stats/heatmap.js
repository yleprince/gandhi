function extractWeeklyData(data, priceMap, year) {
    return data
        .data
        .filter(d => new Date(d.datetime).getFullYear() === year)
        .map(d => (
            {
                'week': new Date(d.datetime).getWeekNumber(),
                'price': d.quantity * parseInt(priceMap.get(d.item).replace("€", ""))
            }
        ))
};

function computeWeeklySpend(weekData){
    var weekSpends = [];
    for (let i = 1; i < 53; i++) {
        const weekSpend = weekData
            .filter( d => d.week === i)
            .reduce((acc, curr) => acc + curr.price, 0)
        weekSpends.push(weekSpend ? weekSpend : 0)
    }
    return weekSpends;
}

function getDateOfWeek(y, w) {
    var d = (1 + (w - 1) * 7)-2; // 1st of January + 7 days for each week
    return new Date(y, 0, d);
}
function render52Tiles(containerName, values, opts = {}) {
    if (!Array.isArray(values) || values.length !== 52) {
        throw new Error(`render52Tiles: "values" must be an array of length 52 (got ${values?.length}).`);
    }

    const {
        cols = 13,
        tile = 24,
        gap = 6,
        pad = 8,
        radius = 4,
        // scale range (if not provided, inferred from data)
        vMin = Math.min(...values),
        vMax = Math.max(...values),
        // colormap endpoints
        colorLow = "#fff",
        colorHigh = "#FF8A00",
        // hover behavior: show random int but do NOT change the underlying input values
        hoverMin = 0,
        hoverMax = 100,
    } = opts;

    const rows = Math.ceil(52 / cols);
    const svgNS = "http://www.w3.org/2000/svg";
    const width  = pad * 2 + cols * tile + (cols - 1) * gap;
    const height = pad * 2 + rows * tile + (rows - 1) * gap;

    // --- color helpers ---
    const clamp01 = (t) => Math.max(0, Math.min(1, t));
    const lerp = (a, b, t) => a + (b - a) * t;

    function hexToRgb(hex) {
        const h = hex.replace("#", "").trim();
        const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
        const n = parseInt(full, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function rgbToHex(r, g, b) {
        const to2 = (x) => x.toString(16).padStart(2, "0");
        return `#${to2(r)}${to2(g)}${to2(b)}`;
    }

    const c0 = hexToRgb(colorLow);
    const c1 = hexToRgb(colorHigh);

    function valueToColor(v) {
        // handle constant range
        const denom = (vMax - vMin) || 1;
        const t = clamp01((v - vMin) / denom);
        const r = Math.round(lerp(c0[0], c1[0], t));
        const g = Math.round(lerp(c0[1], c1[1], t));
        const b = Math.round(lerp(c0[2], c1[2], t));
        return rgbToHex(r, g, b);
    }

    // Clear container (optional; remove if you want multiple svgs)
    let container = document.getElementById(containerName);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.classList.add("rounded-xl")
    svg.classList.add("bg-base-100")
    svg.classList.add("shadow")


    for (let i = 0; i < 52; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = pad + c * (tile + gap);
        const y = pad + r * (tile + gap);

        const g = document.createElementNS(svgNS, "g");
        g.classList.add("tile");
        g.classList.add("shadow-xl")


        const rect = document.createElementNS(svgNS, "rect");
        rect.classList.add("tile-rect");
        rect.classList.add("stroke-base-300");
        rect.classList.add("rounded-xl");
        rect.classList.add("shadow-xl")
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("rx", radius);
        rect.setAttribute("width", tile);
        rect.setAttribute("height", tile);
        rect.setAttribute("fill", valueToColor(values[51-i]));

        const text = document.createElementNS(svgNS, "text");
        text.classList.add("tile-label");
        text.setAttribute("x", x + tile / 2);
        text.setAttribute("y", y + tile / 2 + 4);
        text.setAttribute("text-anchor", "middle");

        g.addEventListener("mouseenter", () => {
            document
                .getElementById(containerName)
                .setAttribute("data-tip", `${values[51-i]}€ spent for week ${getDateOfWeek(2025, 51-i+1).toLocaleDateString()}`)
            rect.classList.add("stroke-base-content");
        });

        g.addEventListener("mouseleave", () => {
            rect.classList.remove("stroke-base-content");
        });

        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
    }
    container.appendChild(svg);
}
