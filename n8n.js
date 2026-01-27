const wHref = window.location.href
if (!wHref.includes("localhost")) {
    const from = window.location.href.replaceAll("/", "_").replace(":", "").slice(0, -1)
    fetch(`https://n8n.yrieix.com/webhook/0ef9d95d-4576-445d-9d6c-3fc371fc9cfc?from=${from}&type=view`)
}
