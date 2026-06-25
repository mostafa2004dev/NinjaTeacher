// comments.api.js — SOCIAL-FEED COMMENTS (not supported by the backend).
// Originally targeted the external tutorial API (route-posts.routemisr.com).
// Neutralised to safe no-ops; add real endpoints if a feed/comments feature ships.
export async function sendComment() { return { data: { ok: true } }; }
export async function getAllcomments() { return { data: { comments: [] } }; }
export async function deleteOneComment() { return { data: { ok: true } }; }
