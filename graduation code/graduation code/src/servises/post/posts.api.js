// posts.api.js — SOCIAL FEED (not supported by the ninja-teacher backend).
// The original pointed at an empty/relative URL and the external routemisr API.
// There is no social "posts feed" in this project's backend (only JOB posts via
// servises/post/post.api.js). These helpers now return safe empty results so the
// UI does not crash. Wire them to a real endpoint if/when a feed is added.
export async function getAllposts() {
  return { data: { posts: [] } };
}
export async function getSinglepost() {
  return { data: { post: null } };
}
export async function getpostlikes() {
  return { data: { likes: [] } };
}
export async function makepostlikes() {
  return { data: { ok: true } };
}
