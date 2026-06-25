// savejob.js — أُعيدت كتابته بعد تلف RAR — حفظ الوظائف محليًا (bookmarks)
const KEY = "savedJobs";

export function getSavedJobs() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function isJobSaved(jobId) {
  return getSavedJobs().some((j) => String(j) === String(jobId));
}

export function toggleSaveJob(jobId) {
  const saved = getSavedJobs();
  const exists = saved.some((j) => String(j) === String(jobId));
  const next = exists ? saved.filter((j) => String(j) !== String(jobId)) : [...saved, jobId];
  localStorage.setItem(KEY, JSON.stringify(next));
  return !exists; // true = اتحفظ، false = اتشال
}
