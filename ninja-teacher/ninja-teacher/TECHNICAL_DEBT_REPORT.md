# TECHNICAL_DEBT_REPORT.md
**Date:** 2026-06-20 | **Regression result:** 29/29 passed · 0 failed · 0 server errors

---

## A. Subscription Enforcement

### Problem
`max_applications` and `max_job_posts` existed in `SubscriptionPlans` but were never read at runtime. Every teacher could apply to unlimited jobs; every school could post unlimited jobs.

### Root cause
The seeder created correct plan limits. No service called `getActivePlan()` before creating applications or posts.

### Fix applied — 3 new files / 4 surgical insertions

**New file:** `src/modules/subscriptions/subscription.limits.js`

Contains three functions:
- `getEffectivePlan(userId, role)` — looks up the user's active subscription; falls back to the free-tier limits from the DB if none exists (school_starter = 5 posts, teacher_free = 5 apps/month).
- `checkApplicationLimit(teacherId)` — counts applications made **this calendar month**; throws a descriptive 400 if the monthly cap is reached. `-1` = unlimited (Teacher Pro).
- `checkJobPostLimit(schoolId)` — counts **currently active** posts; throwing at the active-post cap means closing a job immediately frees a slot. `-1` = unlimited (School Pro).

**Modified:** `src/modules/appliedJobs/appliedJobs.service.js`
- Added `require("../subscriptions/subscription.limits")` at top
- Added `await checkApplicationLimit(teacherId)` as the **first** line of `applyToJob()`, before the duplicate check

**Modified:** `src/modules/jobPosts/jobPosts.service.js`
- Added require + `await checkJobPostLimit(schoolId)` as first line of `createJobPost()`

**Modified:** `src/modules/school/school.service.js`
- Same pattern — `await checkJobPostLimit(schoolId)` at top of `createJob()`

**Modified:** `src/modules/jobPosts/jobPosts.controller.js` and `src/modules/school/school.controller.js`
- Catch blocks now return `400` (not `500`) when the error message contains "limit" or "Upgrade"

### Verified behaviours
| Scenario | Expected | Result |
|----------|---------|--------|
| Teacher applies up to free-tier limit (5/month) | 201 each | ✓ |
| Teacher applies beyond limit | 400 + upgrade message | ✓ |
| School creates up to starter-plan limit (5 active) | 201 each | ✓ |
| School creates beyond limit | 400 + upgrade message | ✓ |
| Closing a job frees up the slot | Next create → 201 | ✓ |
| Duplicate apply still 409 (not affected) | 409 | ✓ |
| Teacher → 403 on job create (role guard intact) | 403 | ✓ |
| Enforcement via both `/job-posts` and `/school/jobs` | 400 | ✓ |

---

## B. Socket.IO Client Integration

### Problem
`socket.io-client` was not installed. There were zero socket listeners in the frontend. Notifications and messages appeared in real time on the server side but required a full page refresh to appear in the UI.

### Root cause
The backend socket infrastructure was complete (JWT auth middleware, `user:<id>` rooms, `emitToUser()` helper called from `notifications.service` and `messages.service`). The frontend had no socket connection at all.

### Fix applied — minimal, non-breaking

**New package:** `socket.io-client@^4.7.4` (matches backend Socket.IO 4 version)

**New file:** `src/context/SocketContext.jsx`

A singleton React context that:
- Creates **one** socket per session (prevents duplicate connections including React StrictMode double-invoke)
- Authenticates with `{ auth: { token: "Bearer <jwt>" } }` — matching exactly what the backend middleware expects
- On `"notification"` event → calls `queryClient.invalidateQueries({ queryKey: ["notifications"] })`
- On `"message"` event → calls `queryClient.invalidateQueries({ queryKey: ["messages"] })`
- Removes listeners and disconnects on cleanup (no memory leaks)
- Reconnects automatically via Socket.IO's built-in exponential backoff (5 attempts)
- Silently ignores `connect_error` when backend is down (doesn't crash the app)

**Modified:** `src/App.jsx`
- Added `import SocketProvider` (one line)
- Wrapped `<RouterProvider>` in `<SocketProvider>` (one wrapper)
- `SocketProvider` is inside `QueryClientProvider` (needs queryClient) and `AuthProvider` (needs token)

**Modified:** `src/component/layout/Navbar/Navbar.jsx`
- Added `useQuery` import + `getNotifications` import
- Added unread count query using the existing `["notifications"]` cache key (auto-updates when socket fires)
- Added red badge on Bell icon showing unread count (hidden when 0)
- Fallback polling interval: 60 seconds (in case socket is disconnected)

### What was NOT changed
- No existing component modified (other than Navbar badge addition)
- Backend socket config untouched
- `useNotification.js` hook untouched — still uses TanStack Query as before; socket just invalidates the cache
- No new event names introduced

---

## C. Technical Debt Cleanup

### Removed dead code

| File | Action | Proof of safety |
|------|--------|----------------|
| `src/servises/auth/auth.js` | Replaced 100% commented-out code with a one-line deprecation comment | `grep -r "from.*servises/auth"` → 0 imports anywhere |

### Not removed (imports exist but stubs are safe)

| File | Reason kept |
|------|------------|
| `servises/post/posts.api.js` | Imported by `Postlisting.jsx` and `postDetails.jsx` — already neutralised to return `{ data: { posts: [] } }`. Removing it would crash the import. |
| `servises/comments.api.js` | Imported by 3 comment components — already neutralised to no-ops. Safe as-is. |
| `servises/comment/comments.api.js` | Zero imports found — but kept as file (harmless). |

---

## D. Production Hardening

### Fixed

**Security:** `src/modules/auth/auth.service.js`
- Password reset token was logged in plaintext: `[PASSWORD RESET] Token for user@x.com: abc123...`
- This is a security vulnerability — anyone with server log access could use the token to hijack accounts
- **Fix:** Replaced with a conditional log that only logs the expiry time (not the token), and only in non-production (`NODE_ENV !== "production"`)
- Note: a real email integration is still TODO; the dev log is intentionally kept for local testing

### Unchanged (correct as-is)

| Item | Assessment |
|------|-----------|
| Payment provider console.log | Acceptable — operational logs for a manual payment flow, not sensitive |
| Subscription expiry console.log | Acceptable — server operational log |
| Admin seeder password warning | Correct — already warns operator via `⚠️` console message |
| `.env` default credentials | Correct — documented in `RELEASE_REPORT.md` pre-deployment checklist |

---

## Files Modified

### Backend
| File | Change |
|------|--------|
| `src/modules/subscriptions/subscription.limits.js` | **NEW** — enforcement helpers |
| `src/modules/appliedJobs/appliedJobs.service.js` | +2 lines (require + check call) |
| `src/modules/jobPosts/jobPosts.service.js` | +2 lines (require + check call) |
| `src/modules/school/school.service.js` | +2 lines (require + check call) |
| `src/modules/jobPosts/jobPosts.controller.js` | +2 lines (400 vs 500 for limit errors) |
| `src/modules/school/school.controller.js` | +2 lines (400 vs 500 for limit errors) |
| `src/modules/auth/auth.service.js` | Replace plaintext token log with safe conditional |

### Frontend
| File | Change |
|------|--------|
| `package.json` | Added `socket.io-client@^4.7.4` |
| `src/context/SocketContext.jsx` | **NEW** — singleton socket provider |
| `src/App.jsx` | +1 import, +1 wrapper (`<SocketProvider>`) |
| `src/component/layout/Navbar/Navbar.jsx` | +2 imports, +unread count hook, +badge on Bell |
| `src/servises/auth/auth.js` | Replaced dead commented-out code with deprecation comment |

---

## Regression Results

```
TOTAL: 29 passed · 0 failed · 0 server errors

Original functionality (all key paths):
  ✓ school register/login/dashboard/profile
  ✓ job post CRUD (create / read / update / delete)
  ✓ teacher apply flow (apply / duplicate guard / 403 role guard)
  ✓ notifications / survey / subscriptions/plans / admin users
  ✓ no-token → 401 / bad-role → 403 (auth regression checks)

New enforcement checks:
  ✓ teacher can apply up to 5 (free tier)
  ✓ 6th application → 400 (limit enforced)
  ✓ school can create 5 jobs (starter plan)
  ✓ 6th job post → 400 via /job-posts
  ✓ 6th job post → 400 via /school/jobs
  ✓ closing a job frees up the slot for a new one
  ✓ GET /subscriptions/my 200
  ✓ forgot-password still returns 200 (hardening regression)
```

---

## Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| No email transport for password reset | Medium | Token generated correctly; never delivered to user. Needs SMTP/SendGrid integration. |
| Socket client does not reconnect after token expiry (7d) | Low | Socket will silently fail after JWT expires. User must log in again. Expected behaviour. |
| Subscription enforcement is month-based for teachers | Low | The calendar month resets on the 1st. A teacher who applies on Jan 31 and Feb 1 gets two separate 5-app windows, which is correct. |
| Proration on subscription upgrade | Low | Upgrade cancels the old plan immediately with no credit. Documented as TODO in subscription.service.js. |
| File storage is local disk | Medium | `uploads/` not suitable for multi-server. Needs S3 or equivalent before horizontal scaling. |
| FastAPI AI service must start manually | Low | Graceful degradation is confirmed. Documented. |
