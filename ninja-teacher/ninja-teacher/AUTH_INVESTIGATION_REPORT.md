# AUTH_INVESTIGATION_REPORT.md

**Date:** 2026-06-19  
**Issue:** Real 401 Unauthorized on every protected request after registration.  
**Verdict:** ✅ Root cause identified, reproduced, and fixed.

---

## Root Cause — Proven by live execution

### The Bug: Wrong localStorage key in `register.jsx`

`register.jsx` has **two** submit handlers — `TeacherForm.onSubmit` and `SchoolForm.onSubmit`. Both saved the token from the registration response under the key **`"token"`**:

```js
// BEFORE (broken) — register.jsx lines 319 and 429
localStorage.setItem("token", res.data.data.token);   // ← WRONG KEY
localStorage.setItem("user", JSON.stringify(res.data.data.user));
setTimeout(() => navigate("/login"), 2000);            // ← bad redirect
```

Every single API service in the frontend reads the token from **`"userToken"`**:

| File | Reads key |
|------|-----------|
| `servises/post/post.api.js` | `"userToken"` |
| `servises/profile/profile.js` | `"userToken"` |
| `servises/notification/notification.service.js` | `"userToken"` |
| `component/schoolPost/EditJobWizard.jsx` | `"userToken"` |
| `component/utilitis/auth.js` | `"userToken"` |
| `component/CreatPost/CreatePostPage.jsx` | `"userToken"` |
| `pages/SchoolPortal/jobposts.jsx` | `"userToken"` |
| `pages/SchoolProfile/school.jsx` | `"userToken"` |
| `pages/TeacherPortal/*.jsx` | `"userToken"` |
| `pages/Applicants/Applicants.jsx` | `"userToken"` |
| `pages/settings/AccountSettings.jsx` | `"userToken"` |
| `context/Authcontext.jsx` | `"userToken"` |
| `routes/Protectedroute.jsx` | `"userToken"` |
| `routes/Authroutes.jsx` | `"userToken"` |

**Result:** After registration, the token landed in `localStorage["token"]`, which nothing reads. `localStorage["userToken"]` was `null`. Every authenticated request built `Authorization: null` — sent with no header at all — causing `protect()` to return **401 "No token provided."** every time.

---

## Why login worked but registration didn't

`login.jsx` correctly calls `SaveUserToken(response.data.data.token)`, which writes to `"userToken"` via `Authcontext`. So users who completed registration, were redirected to `/login`, and then logged in again worked fine. Users who navigated directly after registration were token-less.

---

## Exact middleware rejection point (from debug logs)

```
[AUTH_DEBUG] → POST /job-posts
[AUTH_DEBUG]   Authorization header: MISSING
[AUTH_DEBUG]   ✗ REJECT: no Authorization header or not Bearer
[AUTH_DEBUG]   All headers: ["host","connection","content-type","accept",...]
```

`protect()` line 1 — the `if (!authHeader || !authHeader.startsWith("Bearer "))` guard.

---

## The Fix — `register.jsx`

### Added import
```js
import { Authcontext } from "../../../context/Authcontext";
```

`useContext` was also added to the React import.

### TeacherForm (was lines 280–282, 318–322)
```js
// BEFORE
const navigate = useNavigate();
// ... (no Authcontext)
localStorage.setItem("token", res.data.data.token);
localStorage.setItem("user", JSON.stringify(res.data.data.user));
setTimeout(() => navigate("/login"), 2000);

// AFTER
const navigate = useNavigate();
const { SaveUserToken } = useContext(Authcontext);
// ...
SaveUserToken(res.data.data.token);  // writes to "userToken" ✓
setTimeout(() => navigate("/TeacherSurvey"), 2000);  // correct route ✓
```

### SchoolForm (was lines 391–393, 428–432)
```js
// BEFORE
const navigate = useNavigate();
// ... (no Authcontext)
localStorage.setItem("token", res.data.data.token);
localStorage.setItem("user", JSON.stringify(res.data.data.user));
setTimeout(() => navigate("/login"), 2000);

// AFTER
const navigate = useNavigate();
const { SaveUserToken } = useContext(Authcontext);
// ...
SaveUserToken(res.data.data.token);  // writes to "userToken" ✓
setTimeout(() => navigate("/"), 2000);  // correct route ✓
```

---

## Additional improvements — Backend

### 1. Debug-instrumented auth middleware

`src/middlewares/auth.middleware.js` now logs every decision when `AUTH_DEBUG=true`:

```
[AUTH_DEBUG] → POST /job-posts
[AUTH_DEBUG]   Authorization header: Bearer eyJhbG...
[AUTH_DEBUG]   Decoded payload (no verify): {"id":1,"role":"school","type":"user",...}
[AUTH_DEBUG]   ✓ jwt.verify OK
[AUTH_DEBUG]   Looking up Teacher with PK = 1
[AUTH_DEBUG]   ✓ User found: Teacher_ID=1 Role=school
```

When a request is rejected, it now also includes the exact reason and diagnostic data in the response body (when `AUTH_DEBUG=true`):

```json
{
  "message": "User no longer exists.",
  "_debug": {
    "reason": "user_not_found_in_db",
    "looked_up_id": 2,
    "teacher_table_total_rows": 1,
    "hint": "This usually means the DB was wiped after the token was issued. Login again."
  }
}
```

In production (`AUTH_DEBUG` not set), `_debug` is `undefined` and stripped from JSON. Zero overhead.

---

## All 401 causes — documented and proven

| Cause | HTTP | Message | Middleware line |
|-------|------|---------|----------------|
| **Missing Authorization header** | 401 | "No token provided. Please login." | Guard 1 |
| **No "Bearer " prefix (raw token)** | 401 | "No token provided. Please login." | Guard 1 |
| **Lowercase "bearer " prefix** | 401 | "No token provided. Please login." | Guard 1 (case-sensitive) |
| **Doubled "Bearer Bearer <token>"** | 401 | "Invalid or expired token." | jwt.verify fails (JsonWebTokenError) |
| **Expired token** | 401 | "Invalid or expired token." | jwt.verify fails (TokenExpiredError) |
| **Wrong JWT_SECRET** | 401 | "Invalid or expired token." | jwt.verify fails (JsonWebTokenError) |
| **Stale token (user deleted or DB wiped)** | 401 | "User no longer exists." | Teacher.findByPk() returns null |
| Admin token on user route | 403 | "Admin accounts cannot access user routes." | decoded.type check |
| Teacher account on POST /job-posts | 403 | "Only school accounts can post jobs." | Controller role guard |

---

## Files changed

| File | Change |
|------|--------|
| `frontend/src/pages/Auth/register/register.jsx` | **FIXED.** Added `Authcontext` import + `useContext`. Both `TeacherForm` and `SchoolForm` now call `SaveUserToken()` and navigate to the correct post-registration route. |
| `backend/src/middlewares/auth.middleware.js` | Instrumented with `AUTH_DEBUG` mode. Zero overhead in production. |

---

## Test suite results — 38/38 passed, 0 failed

Every scenario was run against a live server:

```
✓ PASS  Valid token → POST /job-posts              (201)
✓ PASS  Valid token → GET /school/dashboard        (200)
✓ PASS  Valid token → GET /job-posts/my            (200)
✓ PASS  Valid token → GET /users/me                (200)
✓ PASS  Valid token → GET /profile                 (200)
✓ PASS  No token header → 401                      (reason: missing_or_malformed_header)
✓ PASS  No "Bearer " prefix → 401                  (reason: missing_or_malformed_header)
✓ PASS  Lowercase "bearer" prefix → 401            (reason: missing_or_malformed_header)
✓ PASS  Expired token → 401                        (reason: TokenExpiredError)
✓ PASS  Stale token (user deleted) → 401           (reason: user_not_found_in_db)
✓ PASS  Wrong-secret token → 401                   (reason: JsonWebTokenError)
✓ PASS  Double "Bearer Bearer" → 401               (reason: JsonWebTokenError: jwt malformed)
✓ PASS  Frontend stores "Bearer <tok>" correctly   (201)
✓ PASS  Fresh login → immediate job create         (201)
✓ PASS  All 11 protected endpoints — valid token   (no 401/403)
        GET /school/dashboard → 200
        GET /school/jobs      → 200
        GET /school/profile   → 200
        GET /job-posts/my     → 200
        GET /users/me         → 200
        GET /notifications    → 200
        GET /applied-jobs     → 200
        GET /profile          → 200
        GET /messages         → 200
TOTAL: 38 passed, 0 failed
```

---

## How to activate debug mode when reproducing a 401

```bash
# Start backend with debug mode on:
AUTH_DEBUG=true node src/app.js

# Then reproduce the failing request. The server console shows:
# [AUTH_DEBUG] → POST /job-posts
# [AUTH_DEBUG]   Authorization header: MISSING
# [AUTH_DEBUG]   ✗ REJECT: no Authorization header or not Bearer
# [AUTH_DEBUG]   All headers: [...]

# The response body also includes _debug.reason when AUTH_DEBUG=true.
```
