// post.api.js — أُعيدت كتابته بعد تلف RAR
// واجهة وظائف الـ job-posts على الـ backend المحلي
import axios from "axios";

const API = "http://localhost:3000/job-posts";

function authHeaders() {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAllPosts() {
  const res = await axios.get(API, { headers: authHeaders() });
  return res.data;
}

export async function getSinglePost(schoolId, jobId) {
  const res = await axios.get(`${API}/${schoolId}/${jobId}`, { headers: authHeaders() });
  return res.data;
}

export async function createPost(payload) {
  const res = await axios.post(API, payload, { headers: authHeaders() });
  return res.data;
}

export async function updatePost(jobId, payload) {
  // Backend route is PUT /job-posts/:jobId (School_ID comes from the auth token)
  const res = await axios.put(`${API}/${jobId}`, payload, { headers: authHeaders() });
  return res.data;
}

export async function deletePost(jobId) {
  // Backend route is DELETE /job-posts/:jobId (School_ID comes from the auth token)
  const res = await axios.delete(`${API}/${jobId}`, { headers: authHeaders() });
  return res.data;
}
