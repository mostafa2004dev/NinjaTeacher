# TEST_RESULTS.md

Environment: Node v22, Express + Sequelize, **SQLite** dialect (zero‑setup mode
from `.env`). The server was booted for real and exercised over HTTP; nothing
below is mocked.

## Before/after reproduction (the core bug)

With the original `const schoolId = req.user.id;` line in place, a real
school account + token attempting `POST /job-posts`:

```
BEFORE-FIX create status: 400 | msg: School_ID is required.
```

After the fix (`req.user.Teacher_ID`), the identical request returns `201` and
persists the row. See the full suite below.

## End-to-end suite (`e2e_test.js`) — 36/36 passed

Flow executed: register School → login → read dashboard baseline → create job
(full wizard payload, **no** client `School_ID`) → verify mapping & persistence
→ confirm visibility across all read endpoints → create a 2nd job → confirm
dashboard stats updated → validation & auth negatives → update / close / delete
regression.

```
PASS  register school -> 201
PASS  register returns school role
PASS  login -> 200
PASS  login returns token
PASS  login returns school id
PASS  dashboard before -> 200
PASS  create job -> 201
PASS  created job has school_id from token
PASS  created job has job_id
PASS  created job title mapped
PASS  created job location mapped
PASS  created job subjects mapped
PASS  created job experience parsed to int
PASS  created job classroom_energy=balanced persisted
PASS  created job leadership first-of-array
PASS  created job status active
PASS  get single job -> 200
PASS  single job matches title
PASS  get my posts -> 200
PASS  my posts contains created job
PASS  get all posts -> 200
PASS  public feed contains created job
PASS  school jobs listing -> 200
PASS  create 2nd job -> 201
PASS  2nd job_id increments
PASS  dashboard total_jobs +2
PASS  dashboard active_jobs +2
PASS  missing title -> 400 validation
PASS  no token -> 401
PASS  update job -> 200
PASS  update applied
PASS  close job -> 200
PASS  active_jobs drops after close
PASS  total_jobs unchanged after close
PASS  delete job -> 200
PASS  deleted job no longer listed
============================================
TOTAL: 36 passed, 0 failed
```

No server‑side errors were logged during the run.

## Coverage mapped to the requested checklist

| Requirement | Verified by |
|-------------|-------------|
| Frontend payload ↔ backend schema match | "created job *mapped" assertions |
| `School_ID` from token, never client | "school_id from token" + "no token -> 401" |
| `Job_ID` generation consistent | "2nd job_id increments" (per‑school sequence) |
| Database insertion works | "get single job -> 200" reads the persisted row back |
| Jobs appear in all related pages | my posts / public feed / school listing assertions |
| Dashboard statistics update | "total_jobs +2", "active_jobs +2", close/delete deltas |
| Dependent features still work | update / close / delete regression all PASS |
| Validation failing fixed | "missing title -> 400", create now 201 |
| Create Post persistence | same `/job-posts` path = the `Post` entity |

## Notes / residual items

- The social‑feed helpers in `servises/post/posts.api.js` remain stubbed (no
  feed backend exists). This is by design, not a regression.
- `node_modules` is excluded from the archive; `sqlite3` ships a native binary
  and must be installed per‑platform with `npm install`.
