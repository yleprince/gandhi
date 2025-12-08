
let themes = ["light", "cupcake", "bumblebee", "emerald", "corporate", "valentine", "garden", "lofi", "pastel", "fantasy", "autumn", "halloween", "dark", "dracula", "forest", "aqua", "cmyk", "coffee", "winter", "sunset", "caramellatte", "abyss", "dim", "lemonade", "silk"];
let params = new URLSearchParams(document.location.search);
let theme = params.get("theme");
if (theme === null){
    theme = themes[Math.floor(Math.random() * themes.length)];
}
document.documentElement.setAttribute('data-theme', theme);

