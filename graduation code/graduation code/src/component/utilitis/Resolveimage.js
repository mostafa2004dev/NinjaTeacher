const BASE_URL = "http://localhost:3000";

/**
 * يحول أي image path من الـ backend لـ URL صالح للعرض.
 * بيتعامل مع:
 *   - URL كامل:          "https://..."          → يرجعه زي ما هو
 *   - slash path:        "/uploads/..."         → BASE_URL + path
 *   - backslash path:    "uploads\\profiles\\"  → BASE_URL + "/" + path مع استبدال \ بـ /
 *   - null / undefined                          → null
 */
export function resolveImage(path) {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;

    // استبدل الـ backslashes بـ forward slashes
    const normalized = path.replace(/\\/g, "/");

    // تأكد إن في / في البداية
    const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;

    return `${BASE_URL}${withSlash}`;
}