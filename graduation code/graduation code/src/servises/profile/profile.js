// profile.js — repointed from the external tutorial API (route-posts.routemisr.com)
// to this project's local backend (http://localhost:3000).
//
// NOTE: the "social posts feed" these helpers were originally written for does
// NOT exist in the ninja-teacher backend (it only has JOB posts). getprofilepost
// therefore returns an empty list instead of calling a third-party server.
import axios from "axios";

const BASE_URL = "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Current logged-in user's full profile
export async function getprofile() {
  const res = await axios.get(`${BASE_URL}/profile`, { headers: authHeaders() });
  return res.data?.data ?? res.data;
}

// Public profile of another user by id
export async function getuserprofile(id) {
  const res = await axios.get(`${BASE_URL}/profile/public/${id}`, { headers: authHeaders() });
  return res.data?.data ?? res.data;
}

// No social-feed posts endpoint exists in this backend — return empty.
// If a social feed is added later, point this at the new endpoint.
export async function getprofilepost() {
  return { data: { posts: [] } };
}
