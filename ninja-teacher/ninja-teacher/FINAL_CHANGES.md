# FINAL_CHANGES.md

Scope of this round: fix the **Job Posting flow** and the **Create Post feature**
(the project's `Post` entity, created from the frontend "Post a Teaching Position"
wizard via `POST /job-posts`), then verify the full path end‑to‑end.

The School Profile work was already completed before this round and was left
untouched except for confirming it still passes (regression).

---

## 1. Root cause of the Job Posting failure

**File:** `src/modules/jobPosts/jobPosts.controller.js` → `createJobPost`

The controller derived the school identifier with:

```js
const schoolId = req.user.id;   // undefined
```

`req.user` is the Sequelize **Teacher** instance, whose primary key is
`Teacher_ID` — there is no `id` attribute on the model. So `req.user.id` was
always `undefined`, the guard tripped, and **every** create returned:

```
400  { "status": "fail", "message": "School_ID is required." }
```

Every other handler in the codebase (`updateJobPost`, `deleteJobPost`, and the
entire `school.controller.js`) already used `req.user.Teacher_ID`. The create
handler was the lone inconsistency.

### Fix

```js
// School_ID is derived ONLY from the authenticated JWT context, never the client.
const schoolId = parseInt(req.user?.Teacher_ID ?? req.user?.id, 10);
if (!schoolId || Number.isNaN(schoolId)) {
  return res.status(401).json({ status: "fail", message: "Authenticated school account is required." });
}
if (req.user?.Role && req.user.Role !== "school") {
  return res.status(403).json({ status: "fail", message: "Only school accounts can post jobs." });
}
```

This satisfies the requirement that **`School_ID` comes from the token, not the
client**. The frontend payload already sends no `School_ID`, so no frontend
change was required for this. `Job_ID` continues to be generated server‑side as a
per‑school auto‑increment sequence inside `jobPosts.service.createJobPost`.

---

## 2. Enum mismatch on Classroom Energy

**Files:** `src/modules/jobPosts/jobPosts.model.js`, `database_schema_clean.sql`

The Create Post wizard offers a **"Balanced"** option for Classroom Energy
(`personality.classroomEnergy = ["balanced"]`), but the model enum only allowed
`('calm','energetic','collaborative','playful')`. A school selecting "Balanced"
would hit a Sequelize validation error on insert.

### Fix

`balanced` was **added** to the enum (non‑destructive — `collaborative` is kept
for backward compatibility with existing rows and the canonical SQL):

```js
type: DataTypes.ENUM("calm", "energetic", "collaborative", "playful", "balanced"),
```

The canonical schema in `database_schema_clean.sql` was updated to match.

---

## 3. Frontend / backend contract (verified, no change needed)

The wizard (`component/CreatPost/CreatePostPage.jsx`) posts exactly:

```jsonc
{
  "jobDetails": { "positionTitle", "location", "subjects": [...],
                  "salaryRange", "requiredExperience", "qualifications",
                  "startDate", "additionalInfo" },
  "personality": { "teachingStyle": [...], "classroomEnergy": [...],
                   "leadershipStyle": [...], "communicationStyle": [...],
                   "problemSolving": [...] },
  "submittedAt": "<ISO>"
}
```

The controller maps these correctly:
`positionTitle→Title`, `location→Location`, `subjects→Subjects`,
`salaryRange→Salary_Range`, `requiredExperience→Required_Experience` (parsed to
an integer, e.g. `"3-5 years"→3`), `qualifications→Required_Qualifications`,
`startDate→Start_Date`, `additionalInfo→Description`, and each personality array
is reduced to its first value (`firstOrNull`). This contract was confirmed
end‑to‑end; no schema or payload change was needed beyond items 1 and 2.

---

## 4. "Create Post" / social feed note

`servises/post/posts.api.js` (the social‑feed helpers) is intentionally stubbed
to return empty results — there is no social‑feed backend in this project. The
real "Post" entity is the **job post** (DB table `Post`), created via
`POST /job-posts`. Both the "Job Posting flow" and "Create Post feature" tasks
therefore converge on the same endpoint, which is now fixed and verified.

---

## Files changed

| File | Change |
|------|--------|
| `src/modules/jobPosts/jobPosts.controller.js` | `School_ID` from JWT (`Teacher_ID`), role guard, correct 401/403 |
| `src/modules/jobPosts/jobPosts.model.js` | Added `balanced` to `Classroom_Energy` enum |
| `database_schema_clean.sql` | Aligned `Classroom_Energy` enum |
| `package.json` | `optionalDependencies.sqlite3` corrected `^6.0.1` → `^5.1.7` (the `6.x` line has no working release for this stack; `5.1.7` installs and runs cleanly) |

## Files added (test artifacts)

| File | Purpose |
|------|---------|
| `e2e_test.js` | 36‑assertion end‑to‑end test of the full flow |
| `run_and_test.sh` | Boots the server, runs `e2e_test.js`, tears down |
| `FINAL_CHANGES.md`, `TEST_RESULTS.md` | This documentation |

---

## How to run

```bash
cd ninja-teacher
npm install            # node_modules is NOT shipped in the archive
npm start              # SQLite mode by default (.env: DB_DIALECT=sqlite)
# optional automated verification:
node e2e_test.js       # with the server already running
```

> Note: `node_modules` and the dev `ninja_teacher.sqlite` file are excluded from
> the archive. The `sqlite3` package contains a **platform‑specific native
> binary**, so it must be installed on the target machine via `npm install`
> rather than copied. For the MySQL target, set `DB_DIALECT=mysql` and the DB
> credentials in `.env` and import `database_schema_clean.sql`.
