Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function fromUidToStr(uid) {
    return cleanUsername(uid.replace("v2-").replace("_", " ").replace("-", " "))
}
function cleanUsername(string) {
    return string.trim().toLowerCase().split(" ").map(capitalizeFirstLetter).join(" ")
}

function computePrice(price, quantity) {
    const price_ = parseFloat(price.substring(0, price.length - 1))
    return price_ * quantity;
}

const loadMenus = async () => {
    const [menuA, menuB] = await Promise.all([
        fetch("/static/menu.json").then(r => r.json()),
        fetch("/static/menu-2025-10.json").then(r => r.json())
    ]);


    // Normalize and map the two datasets
    const entriesA = menuA.map(d => [d.id, d.Price]);
    const entriesB = menuB.map(d => [d.id, d.Price]);

    // Merge into a single Map (second array overrides first on duplicate IDs)
    const merged = new Map([...entriesA, ...entriesB]);
    return merged;
};


