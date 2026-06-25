-- ───────────────────────────────────────────────────────────────────────────
-- Fix: Application primary key must be (Teacher_ID, School_ID, Job_ID).
-- Job_ID is only unique per-school, so the old PK (Teacher_ID, Job_ID) allowed
-- collisions and caused wrong applicant/statistics/matching numbers.
--
-- Run ONCE against the existing database BEFORE starting the patched server.
-- Back up first.  (MySQL syntax.)
-- ───────────────────────────────────────────────────────────────────────────

-- 1) Backfill any NULL School_ID where the Job_ID maps to exactly one post.
UPDATE `Application` a
JOIN (
  SELECT Job_ID, MIN(School_ID) AS only_school, COUNT(DISTINCT School_ID) AS n
  FROM `Post` GROUP BY Job_ID
) p ON p.Job_ID = a.Job_ID AND p.n = 1
SET a.School_ID = p.only_school
WHERE a.School_ID IS NULL;

-- 2) Remove any rows still NULL/unmatched (cannot be safely keyed). Review first:
--    SELECT * FROM `Application` WHERE School_ID IS NULL;
DELETE FROM `Application` WHERE School_ID IS NULL;

-- 3) De-duplicate any accidental collisions, keeping the earliest application.
DELETE a1 FROM `Application` a1
JOIN `Application` a2
  ON a1.Teacher_ID = a2.Teacher_ID
 AND a1.School_ID  = a2.School_ID
 AND a1.Job_ID     = a2.Job_ID
 AND a1.Apply_Date > a2.Apply_Date;

-- 4) Swap the primary key.
ALTER TABLE `Application` MODIFY `School_ID` INT NOT NULL;
ALTER TABLE `Application` DROP PRIMARY KEY;
ALTER TABLE `Application` ADD PRIMARY KEY (`Teacher_ID`, `School_ID`, `Job_ID`);
