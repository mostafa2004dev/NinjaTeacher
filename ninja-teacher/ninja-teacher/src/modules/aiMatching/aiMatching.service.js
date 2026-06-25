// ═══════════════════════════════════════════════════════════════════════════
//  aiMatching.service.js  —  Enhanced Recommendation Engine (Node.js layer)
//
//  Enhancements added (do NOT remove existing logic):
//    1. Personality Match Score   — teacher personality vs job stage profile
//    2. Stage Match Score         — teacher stage background vs job stage
//    3. Teacher-to-Job Recommendations — relevance-first filtering + ranking
//
//  All existing functions are unchanged and still exported.
// ═══════════════════════════════════════════════════════════════════════════

const Teacher    = require("../users/users.model");
const Post       = require("../jobPosts/jobPosts.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const { Op }     = require("sequelize");

// ── STAGE DETECTION ──────────────────────────────────────────────────────────

// Maps DB ENUM values → internal stage keys used throughout the engine.
function normalizeStageEnum(val) {
  if (!val) return null;
  const MAP = {
    "Kindergarten":   "kindergarten",
    "Primary School": "primary",
    "Middle School":  "middle_school",
    "High School":    "secondary",
  };
  return MAP[val] ?? null;
}

const STAGE_KEYWORDS = {
  kindergarten: ["kindergarten","kg","early years","nursery","preschool","k1","k2","early childhood"],
  primary:      ["primary","elementary","grade 1","grade 2","grade 3","grade 4","grade 5","year 1","year 2","year 3","year 4","year 5"],
  middle_school:["middle school","middle","grade 6","grade 7","grade 8","prep","preparatory"],
  secondary:    ["secondary","high school","grade 9","grade 10","grade 11","grade 12","a-level","igcse","sat","thanawy"],
};

const STAGE_PERSONALITY_PREFERENCE = {
  kindergarten:  { preferred: ["emotional_leader","adaptive_coach"],            unfavorable: ["digital_innovator"] },
  primary:       { preferred: ["adaptive_coach","emotional_leader"],             unfavorable: [] },
  middle_school: { preferred: ["methodical_professional","adaptive_coach"],      unfavorable: [] },
  secondary:     { preferred: ["digital_innovator","methodical_professional","visionary_catalyst"], unfavorable: [] },
};

/**
 * parseBig5Scores — safely parse Big5_Scores JSON from the Teacher record.
 * Big5_Scores is written by assessment.service.js after each AI assessment:
 *   { classroom, professional, tech, overall, stage, personality_type }
 */
function parseBig5Scores(raw) {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch { return null; }
}

/**
 * guessPersonalityFromBig5 — read the personality_type stored by assessment,
 * falling back to dimension-based heuristic when the field is absent.
 */
function guessPersonalityFromBig5(big5Scores) {
  const s = parseBig5Scores(big5Scores);
  if (!s) return "developing_educator";
  // Prefer the explicit personality_type saved by assessment service
  if (s.personality_type && s.personality_type !== "developing_educator") return s.personality_type;
  // Fallback: derive from dimension scores
  const cl = Number(s.classroom || s.cl || 0);
  const pr = Number(s.professional || s.pr || 0);
  const tc = Number(s.tech || s.tc || 0);
  if (cl >= 75 && pr >= 75 && tc >= 75) return "visionary_catalyst";
  if (cl >= 65 && tc < 65)              return "emotional_leader";
  if (tc >= 65)                          return "digital_innovator";
  if (cl >= 60)                          return "adaptive_coach";
  if (pr >= 65)                          return "methodical_professional";
  return "developing_educator";
}

function detectStage(text) {
  if (!text) return "unknown";
  const lower = String(text).toLowerCase();
  for (const [stage, keywords] of Object.entries(STAGE_KEYWORDS)) {
    // Use word-boundary matching to prevent "grade 1" matching "grade 10"
    if (keywords.some(kw => new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(lower))) return stage;
  }
  return "unknown";
}

/**
 * mapTeacherStage — prefer explicit Teacher_Stage DB ENUM field, then fall back to
 * Big5_Scores.stage (persisted by assessment service), then legacy text scan.
 */
function mapTeacherStage(big5ScoresOrString, explicitStage = null) {
  // Prefer the explicit Teacher_Stage ENUM value stored on the teacher record
  const fromEnum = normalizeStageEnum(explicitStage);
  if (fromEnum) return fromEnum;
  // Fall back to Big5_Scores.stage persisted by assessment service
  const parsed = parseBig5Scores(big5ScoresOrString);
  if (parsed && parsed.stage && parsed.stage !== "unknown") return parsed.stage;
  // Legacy fallback: scan raw text (e.g. Survey_Classroom_Management)
  if (!big5ScoresOrString) return "unknown";
  const s = String(big5ScoresOrString).toLowerCase();
  if (s.includes("kg") || s.includes("kindergarten") || s.includes("early") || s.includes("nursery")) return "kindergarten";
  if (s.includes("primary") || s.includes("elementary")) return "primary";
  if (s.includes("middle") || s.includes("prep"))        return "middle_school";
  if (s.includes("secondary") || s.includes("high"))     return "secondary";
  return "unknown";
}

/**
 * mapJobStage — prefer explicit Required_Stage DB ENUM field, then fall back to
 * keyword detection across Title + Description + Specialization text.
 */
function mapJobStage(job) {
  const fromEnum = normalizeStageEnum(job.Required_Stage);
  if (fromEnum) return fromEnum;
  return detectStage(`${job.Title || ""} ${job.Description || ""} ${job.Specialization || ""}`);
}

/**
 * computePersonalityMatchScore — derive trait-based personality score from
 * dimension scores stored in Big5_Scores, then compare against job stage profile.
 *
 * This is the JS-layer approximation of the Python trait dot-product.
 * When a teacher has completed an assessment, Big5_Scores holds cl/pr/tc which
 * are mapped to trait estimates. Teachers without an assessment get neutral (50).
 *
 * Trait estimates from dimensions (cl=classroom, pr=professional, tc=tech):
 *   patience        ≈ cl (classroom management reflects patience)
 *   empathy         ≈ cl
 *   creativity      ≈ (tc + cl) / 2
 *   leadership      ≈ pr
 *   communication   ≈ (cl + pr) / 2
 *   discipline      ≈ pr
 *   analytical      ≈ tc
 *   child_engagement≈ cl
 *
 * Stage requirements (importance weights, normalised to sum=1):
 *   KG:         cl×0.52 + pr×0.20 + tc×0.08   → weighted score
 *   Primary:    cl×0.36 + pr×0.28 + tc×0.12
 *   Middle:     cl×0.30 + pr×0.36 + tc×0.14
 *   Secondary:  cl×0.15 + pr×0.42 + tc×0.28
 */
const STAGE_DIM_WEIGHTS = {
  kindergarten:  { cl: 0.65, pr: 0.25, tc: 0.10 },
  primary:       { cl: 0.50, pr: 0.35, tc: 0.15 },
  middle_school: { cl: 0.42, pr: 0.42, tc: 0.16 },
  secondary:     { cl: 0.25, pr: 0.45, tc: 0.30 },
};

// ── TRAIT-BASED STAGE REQUIREMENTS (mirrors personality_stage_engine.py) ────
// Normalised weights for 8 traits per stage — must match Python constants exactly.
// These weights are the normalised versions of the raw requirements.
const STAGE_TRAIT_WEIGHTS = {
  kindergarten: {
    patience: 0.200, empathy: 0.200, child_engagement: 0.200,
    creativity: 0.160, communication: 0.140,
    leadership: 0.060, discipline: 0.050, analytical_thinking: 0.030,
  },
  primary: {
    patience: 0.110, empathy: 0.125, child_engagement: 0.141,
    creativity: 0.110, communication: 0.141,
    leadership: 0.078, discipline: 0.063, analytical_thinking: 0.063,
  },
  middle_school: {
    patience: 0.100, empathy: 0.100, child_engagement: 0.130,
    creativity: 0.110, communication: 0.160,
    leadership: 0.180, discipline: 0.160, analytical_thinking: 0.130,
  },
  secondary: {
    patience: 0.061, empathy: 0.061, child_engagement: 0.071,
    creativity: 0.112, communication: 0.143,
    leadership: 0.184, discipline: 0.163, analytical_thinking: 0.204,
  },
};

/**
 * computePersonalityMatchScore — trait-based dot-product matching.
 *
 * When Big5_Scores contains trait_profile (saved by assessment.service.js
 * after IMP1 fix), uses the real 8-trait scores.
 * Falls back to dimension-based trait estimation for legacy records.
 *
 * Returns { score: 0-100, factor: null, verdict, stage }
 * factor is null here because the blend uses raw score directly (not a multiplier).
 */
function computePersonalityMatchScore(personalityTypeOrBig5, jobStage) {
  if (!jobStage || jobStage === "unknown") return { score: 50, factor: 1.00, verdict: "neutral" };

  const weights = STAGE_TRAIT_WEIGHTS[jobStage];
  if (!weights) return { score: 50, factor: 1.00, verdict: "neutral" };

  const b5 = parseBig5Scores(personalityTypeOrBig5);
  let traits;

  if (b5 && b5.trait_profile) {
    // Real trait scores — written by assessment.service.js when trait_profile is present
    const tp = b5.trait_profile;
    traits = {
      patience:           Number(tp.patience          ?? 50),
      empathy:            Number(tp.empathy           ?? 50),
      creativity:         Number(tp.creativity        ?? 50),
      leadership:         Number(tp.leadership        ?? 50),
      communication:      Number(tp.communication     ?? 50),
      discipline:         Number(tp.discipline        ?? 50),
      analytical_thinking:Number(tp.analytical_thinking ?? 50),
      child_engagement:   Number(tp.child_engagement  ?? 50),
    };
  } else if (b5 && (b5.classroom !== undefined || b5.cl !== undefined)) {
    // Fallback: estimate traits from cl/pr/tc dimension scores.
    // Derived from the Python trait extraction signal patterns:
    //   patience & empathy & child_engagement ≈ classroom management score
    //   leadership & discipline ≈ professional skills score
    //   creativity & analytical_thinking ≈ average of all three
    //   communication ≈ mean of classroom and professional
    const cl = Number(b5.classroom ?? b5.cl ?? 50);
    const pr = Number(b5.professional ?? b5.pr ?? 50);
    const tc = Number(b5.tech ?? b5.tc ?? 50);
    const avg = (cl + pr + tc) / 3;
    traits = {
      patience:            cl,
      empathy:             cl,
      creativity:          avg,
      leadership:          pr,
      communication:       (cl + pr) / 2,
      discipline:          pr,
      analytical_thinking: tc,
      child_engagement:    cl,
    };
  } else {
    // No data: neutral
    traits = Object.fromEntries(Object.keys(weights).map(t => [t, 50]));
  }

  // Weighted dot-product
  let rawScore = 0;
  for (const [trait, w] of Object.entries(weights)) {
    rawScore += (traits[trait] ?? 50) * w;
  }
  rawScore = Math.max(10, Math.min(100, Math.round(rawScore)));

  let verdict;
  if (rawScore >= 82)      verdict = "excellent";
  else if (rawScore >= 66) verdict = "good";
  else if (rawScore >= 50) verdict = "neutral";
  else                      verdict = "poor";
  return { score: rawScore, factor: null, verdict, stage: jobStage };
}

function computeStageMatchScore(teacherStage, jobStage, teacherExpYears = 0) {
  if (!jobStage || jobStage === "unknown") return { score: 70, factor: 1.00, verdict: "neutral" };
  const ADJACENCY = {
    "kindergarten-primary": 0.75, "primary-kindergarten": 0.75,
    "primary-middle_school": 0.75, "middle_school-primary": 0.75,
    "middle_school-secondary": 0.80, "secondary-middle_school": 0.80,
  };
  let alignment;
  if (teacherStage === "unknown" || !teacherStage) alignment = 0.70;
  else if (teacherStage === jobStage)              alignment = 1.00;
  else                                              alignment = ADJACENCY[`${teacherStage}-${jobStage}`] || 0.55;
  const STAGE_MIN_EXP = { kindergarten: 0, primary: 1, middle_school: 2, secondary: 3 };
  const minExp = STAGE_MIN_EXP[jobStage] || 0;
  const expBonus = teacherExpYears >= minExp + 3 ? 5 : teacherExpYears >= minExp ? 2 : -3;
  const rawScore = Math.max(30, Math.min(100, Math.round(alignment * 90 + expBonus)));
  let factor, verdict;
  if (rawScore >= 85)      { factor = 1.18; verdict = "excellent"; }
  else if (rawScore >= 75) { factor = 1.10; verdict = "good"; }
  else if (rawScore >= 60) { factor = 1.00; verdict = "neutral"; }
  else if (rawScore >= 45) { factor = 0.92; verdict = "below"; }
  else                      { factor = 0.83; verdict = "poor"; }
  return { score: rawScore, factor, verdict, stage: jobStage, teacherStage, alignmentPct: Math.round(alignment * 100) };
}

// ── SUBJECT RELEVANCE ────────────────────────────────────────────────────────
// ── BLEND WEIGHTS ───────────────────────────────────────────────────────────
// Must match personality_stage_engine.py BLEND_WEIGHT_* constants exactly.
// Final Score = (existing × 0.70) + (personality_raw × 0.15) + (stage_raw × 0.15)
const BLEND_WEIGHT_EXISTING    = 0.70;
const BLEND_WEIGHT_PERSONALITY = 0.15;
const BLEND_WEIGHT_STAGE       = 0.15;

// Neutral raw scores returned when stage is unknown — keeps the blend mathematically
// consistent; a neutral personality and stage each score 50 (midpoint of 0-100).
const NEUTRAL_PERSONALITY_RAW = 50;
const NEUTRAL_STAGE_RAW       = 70;

function applyEnhancementBlend(existingScore, personalityRawScore, stageRawScore) {
  const blended = (
    existingScore      * BLEND_WEIGHT_EXISTING
    + personalityRawScore * BLEND_WEIGHT_PERSONALITY
    + stageRawScore       * BLEND_WEIGHT_STAGE
  );
  return Math.max(10, Math.min(99, Math.round(blended * 10) / 10));
}

const SUBJECT_GROUPS = {
  mathematics: ["math","mathematics","maths","algebra","geometry","calculus","statistics"],
  arabic:      ["arabic","arabic language","islamic studies","religion"],
  english:     ["english","english language","french","german","spanish"],
  science:     ["science","physics","chemistry","biology","computer science","robotics","ict"],
  social:      ["social studies","history","geography","civics","economics"],
  arts_pe:     ["art","arts","music","drama","physical education","pe","sports"],
  kg_general:  ["kg","kindergarten","early years","nursery"],
};

// Canonical subject name map — fixes "Mathematics" ≠ "math" and similar mismatches.
// Stripping trailing " teacher" and " language" is done before lookup so that
// "Physics Teacher" → "physics" and "Arabic Language" → "arabic" automatically.
const SUBJECT_CANONICAL = {
  mathematics: "math", maths: "math", math: "math",
  algebra: "math", geometry: "math", calculus: "math", statistics: "math",
  arabic: "arabic", "arabic language": "arabic", "islamic studies": "arabic", religion: "arabic",
  english: "english", "english language": "english",
  french: "french", "french language": "french",
  german: "german", spanish: "spanish",
  physics: "physics", chemistry: "chemistry", biology: "biology",
  "computer science": "computer_science", cs: "computer_science",
  ict: "computer_science", computing: "computer_science", robotics: "computer_science",
  science: "science", sciences: "science",
  "social studies": "social", social: "social",
  history: "social", geography: "social", civics: "social", economics: "social",
};

function normalizeSubject(str) {
  if (!str) return null;
  const s = String(str).toLowerCase().trim()
    .replace(/\s+teacher\b/, "")
    .replace(/\s+language\b/, "")
    .trim();
  return SUBJECT_CANONICAL[s] || s;
}

function parseJobSubjects(job) {
  let s = job.Subjects || job.subjects || [];
  if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = []; } }
  return Array.isArray(s) ? s : [];
}

function getSubjectGroup(subject) {
  if (!subject) return null;
  const s = String(subject).toLowerCase();
  for (const [group, keywords] of Object.entries(SUBJECT_GROUPS)) {
    if (keywords.some(kw => s.includes(kw) || kw.includes(s))) return group;
  }
  return null;
}

function computeJobRelevance(teacher, job) {
  const teacherSpec = String(teacher.Specialization || "").toLowerCase();
  const jobSpec     = String(job.Specialization || "").toLowerCase();
  const jobTitle    = String(job.Title || "").toLowerCase();
  const jobDesc     = String(job.Description || "").toLowerCase();
  const combined    = `${jobSpec} ${jobTitle} ${jobDesc}`;
  let subjectScore, subjectMatch;
  // Normalize teacher spec and all job subject candidates for canonical comparison.
  // This fixes mismatches like "Mathematics" teacher vs "math teacher" job title.
  const _tSpecNorm = normalizeSubject(teacherSpec);
  const _jSubjNorms = parseJobSubjects(job).map(normalizeSubject).filter(Boolean);
  const _jAllNormsRel = [...new Set([normalizeSubject(jobSpec), ..._jSubjNorms, normalizeSubject(jobTitle)].filter(Boolean))];
  if (teacherSpec && (
    (_tSpecNorm && _jAllNormsRel.includes(_tSpecNorm)) ||
    combined.includes(teacherSpec) ||
    (jobSpec && jobSpec.includes(teacherSpec))
  )) {
    subjectMatch = "exact";   subjectScore = 100;
  } else {
    const tGroup = getSubjectGroup(teacherSpec);
    const jGroup = getSubjectGroup(`${jobSpec} ${jobTitle}`);
    if (tGroup && jGroup && tGroup === jGroup)  { subjectMatch = "group";   subjectScore = 75; }
    else if (teacherSpec && teacherSpec.split(" ").some(w => w.length > 3 && combined.includes(w))) {
                                                  subjectMatch = "partial"; subjectScore = 45; }
    else                                        { subjectMatch = "none";    subjectScore = 0; }
  }
  const teacherStage = mapTeacherStage(teacher.Big5_Scores, teacher.Teacher_Stage);
  const jobStage = mapJobStage(job);
  let stageScore;
  if (teacherStage === "unknown" || jobStage === "unknown") {
    stageScore = 65;
  } else if (teacherStage === jobStage) {
    stageScore = 100;
  } else {
    const ADJ = {
      "kindergarten-primary": 70, "primary-kindergarten": 70,
      "primary-middle_school": 70, "middle_school-primary": 70,
      "middle_school-secondary": 75, "secondary-middle_school": 75,
    };
    stageScore = ADJ[`${teacherStage}-${jobStage}`] || 40;
  }
  const relevanceScore = Math.round(subjectScore * 0.70 + stageScore * 0.30);
  return { relevanceScore, isRelevant: relevanceScore >= 45, subjectMatch, subjectScore, stageScore, teacherStage, jobStage };
}

// ── calculateMatchScore (ENHANCED) ──────────────────────────────────────────
function calculateMatchScore(teacher, job) {
  let score = 0;
  const weights = { specialization: 30, experience: 25, teaching_style: 15, location: 15, qualifications: 15 };

  // Subject matching: normalize both sides and check job.Subjects array + Title
  // when job.Specialization is null (all active jobs in this platform).
  const _tNorm = normalizeSubject(teacher.Specialization);
  if (_tNorm) {
    const _jSubjects = parseJobSubjects(job).map(normalizeSubject).filter(Boolean);
    const _allJobNorms = [...new Set([normalizeSubject(job.Specialization), ..._jSubjects, normalizeSubject(job.Title)].filter(Boolean))];
    if (_allJobNorms.includes(_tNorm)) {
      score += weights.specialization;
    } else {
      const _tGroup = getSubjectGroup(String(teacher.Specialization));
      const _jGroup = getSubjectGroup([job.Specialization, job.Title, ...parseJobSubjects(job)].filter(Boolean).join(" "));
      if (_tGroup && _jGroup && _tGroup === _jGroup) score += weights.specialization * 0.6;
    }
  }
  const teacherExp  = Number(teacher.Years_of_Experience) || 0;
  const requiredExp = Number(job.Required_Experience) || 0;
  if (requiredExp <= 0)               score += weights.experience;
  else if (teacherExp >= requiredExp) score += weights.experience;
  else                                score += weights.experience * (teacherExp / requiredExp);
  if (teacher.Location && job.Location) {
    if (
      teacher.Location.toLowerCase().includes(job.Location.toLowerCase()) ||
      job.Location.toLowerCase().includes(teacher.Location.toLowerCase())
    ) score += weights.location;
  }
  if (teacher.Qualifications) {
    const tq = String(teacher.Qualifications).toLowerCase();
    const jq = job.Required_Qualifications ? String(job.Required_Qualifications).toLowerCase() : "";
    if (!jq) {
      score += weights.qualifications * 0.5;
    } else {
      const jobWords = jq.split(/[^a-z0-9]+/).filter(w => w.length > 3);
      if (jobWords.some(w => tq.includes(w))) score += weights.qualifications;
      else                                     score += weights.qualifications * 0.3;
    }
  }
  if (teacher.Big5_Scores && job.Teaching_Style) score += weights.teaching_style * 0.5;

  const existingScore   = Math.max(0, Math.min(Math.round(score) || 0, 100));
  const jobStage     = mapJobStage(job);
  const teacherStage = mapTeacherStage(teacher.Big5_Scores, teacher.Teacher_Stage);
  const pmatch       = computePersonalityMatchScore(teacher.Big5_Scores, jobStage);
  const smatch       = computeStageMatchScore(teacherStage, jobStage, teacherExp);

  // Final Score = (existing × 0.70) + (personality_raw × 0.15) + (stage_raw × 0.15)
  return applyEnhancementBlend(
    existingScore,
    pmatch.score ?? NEUTRAL_PERSONALITY_RAW,
    smatch.score ?? NEUTRAL_STAGE_RAW,
  );
}

function calculateMatchScoreDetailed(teacher, job) {
  let score = 0;
  const weights = { specialization: 30, experience: 25, teaching_style: 15, location: 15, qualifications: 15 };
  const _tNorm2 = normalizeSubject(teacher.Specialization);
  if (_tNorm2) {
    const _jSubjects2 = parseJobSubjects(job).map(normalizeSubject).filter(Boolean);
    const _allJobNorms2 = [...new Set([normalizeSubject(job.Specialization), ..._jSubjects2, normalizeSubject(job.Title)].filter(Boolean))];
    if (_allJobNorms2.includes(_tNorm2)) score += weights.specialization;
    else {
      const _tGroup2 = getSubjectGroup(String(teacher.Specialization));
      const _jGroup2 = getSubjectGroup([job.Specialization, job.Title, ...parseJobSubjects(job)].filter(Boolean).join(" "));
      if (_tGroup2 && _jGroup2 && _tGroup2 === _jGroup2) score += weights.specialization * 0.6;
    }
  }
  const teacherExp  = Number(teacher.Years_of_Experience) || 0;
  const requiredExp = Number(job.Required_Experience) || 0;
  if (requiredExp <= 0)               score += weights.experience;
  else if (teacherExp >= requiredExp) score += weights.experience;
  else                                score += weights.experience * (teacherExp / requiredExp);
  if (teacher.Location && job.Location) {
    if (
      teacher.Location.toLowerCase().includes(job.Location.toLowerCase()) ||
      job.Location.toLowerCase().includes(teacher.Location.toLowerCase())
    ) score += weights.location;
  }
  if (teacher.Qualifications) {
    const tq = String(teacher.Qualifications).toLowerCase();
    const jq = job.Required_Qualifications ? String(job.Required_Qualifications).toLowerCase() : "";
    if (!jq) score += weights.qualifications * 0.5;
    else {
      const jobWords = jq.split(/[^a-z0-9]+/).filter(w => w.length > 3);
      if (jobWords.some(w => tq.includes(w))) score += weights.qualifications;
      else                                     score += weights.qualifications * 0.3;
    }
  }
  if (teacher.Big5_Scores && job.Teaching_Style) score += weights.teaching_style * 0.5;
  const existingScore    = Math.max(0, Math.min(Math.round(score) || 0, 100));
  const jobStage         = mapJobStage(job);
  const teacherStage     = mapTeacherStage(teacher.Big5_Scores, teacher.Teacher_Stage);
  const personalityType  = guessPersonalityFromBig5(teacher.Big5_Scores) || "developing_educator";
  const pmatch           = computePersonalityMatchScore(teacher.Big5_Scores, jobStage);
  const smatch           = computeStageMatchScore(teacherStage, jobStage, teacherExp);
  const finalScore = applyEnhancementBlend(
    existingScore,
    pmatch.score ?? NEUTRAL_PERSONALITY_RAW,
    smatch.score ?? NEUTRAL_STAGE_RAW,
  );
  return { final_score: finalScore, existing_score: existingScore, personality_match: pmatch, stage_match: smatch, job_stage: jobStage, teacher_stage: teacherStage, teacher_personality: personalityType };
}

// ── getMatchesForJob ─────────────────────────────────────────────────────────
async function getMatchesForJob(schoolId, jobId, limit = 20) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");
  const teachers = await Teacher.findAll({ where: { Role: "teacher" }, attributes: { exclude: ["Password"] } });
  const allMatches = teachers.map(t => ({ teacher: t.toJSON(), match_score: calculateMatchScore(t, job) }))
    .sort((a, b) => b.match_score - a.match_score);
  const matches = allMatches.slice(0, parseInt(limit));
  return { job, matches, total_matches: allMatches.length };
}

// ── getMatchScoreForApplication ───────────────────────────────────────────────
async function getMatchScoreForApplication(teacherId, schoolId, jobId) {
  const [teacher, job] = await Promise.all([
    Teacher.findByPk(teacherId),
    Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } }),
  ]);
  if (!teacher) throw new Error("Teacher not found.");
  if (!job)     throw new Error("Job not found.");
  const score = calculateMatchScore(teacher, job);
  return { match_score: score, teacher_id: teacherId, job_id: jobId };
}

// ── getRecommendedJobsForTeacher (Enhancement 3) ─────────────────────────────
async function getRecommendedJobsForTeacher(teacherId, limit = 10) {
  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) throw new Error("Teacher not found.");

  const appliedRows = await AppliedJob.findAll({ where: { Teacher_ID: teacherId }, attributes: ["School_ID", "Job_ID"] });
  const appliedPairs = appliedRows.filter(a => a.School_ID != null).map(a => ({ School_ID: a.School_ID, Job_ID: a.Job_ID }));

  const where = { Status: "active" };
  if (appliedPairs.length) where[Op.not] = { [Op.or]: appliedPairs };

  const jobs = await Post.findAll({
    where,
    include: [{ model: Teacher, as: "School", attributes: ["Teacher_ID", "Name", "Email", "Image"] }],
  });

  const scored = jobs
    .map(j => {
      const jobObj = j.toJSON();
      const relevance = computeJobRelevance(teacher, jobObj);
      const detail    = calculateMatchScoreDetailed(teacher, jobObj);
      return {
        ...jobObj,
        match_score:             detail.final_score,
        existing_score:          detail.existing_score,
        relevance_score:         relevance.relevanceScore,
        subject_match:           relevance.subjectMatch,
        stage_relevant:          relevance.isRelevant,
        personality_match_score: detail.personality_match?.score ?? NEUTRAL_PERSONALITY_RAW,
        personality_verdict:     detail.personality_match?.verdict ?? "neutral",
        stage_match_score:       detail.stage_match?.score ?? NEUTRAL_STAGE_RAW,
        stage_verdict:           detail.stage_match?.verdict ?? "neutral",
        teacher_stage:           detail.teacher_stage,
        job_stage:               detail.job_stage,
      };
    })
    .sort((a, b) => b.match_score - a.match_score || b.relevance_score - a.relevance_score);

  // Gate 1 (subject): job must be an exact subject match
  // Gate 2 (stage): if both teacher and job have explicit stage AND they differ → reject
  const tStageExplicit = normalizeStageEnum(teacher.Teacher_Stage);
  const filtered = scored.filter(j => {
    if (j.subject_match !== "exact") return false;
    const jStageExplicit = normalizeStageEnum(j.Required_Stage);
    if (tStageExplicit && jStageExplicit && tStageExplicit !== jStageExplicit) return false;
    return true;
  });
  // Fall back to relevance-threshold list if explicit gates eliminate everything
  // (e.g. teacher has no specialization yet)
  if (filtered.length > 0) return filtered.slice(0, parseInt(limit));
  const fallback = scored.filter(j => j.relevance_score >= 40);
  return (fallback.length > 0 ? fallback : scored).slice(0, parseInt(limit));
}

// ── getBulkScoresForTeacher ────────────────────────────────────────────────────
async function getBulkScoresForTeacher(teacherId) {
  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) throw new Error("Teacher not found.");
  const jobs = await Post.findAll();
  const scores = {};
  jobs.forEach(j => {
    const job = j.toJSON();
    scores[`${job.School_ID}-${job.Job_ID}`] = calculateMatchScore(teacher, job);
  });
  return scores;
}

// ── getMatchesForJobDetailed (new) ─────────────────────────────────────────────
async function getMatchesForJobDetailed(schoolId, jobId, limit = 20) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");
  const teachers = await Teacher.findAll({ where: { Role: "teacher" }, attributes: { exclude: ["Password"] } });
  const matches = teachers.map(t => {
    const detail = calculateMatchScoreDetailed(t, job);
    return {
      teacher:                 t.toJSON(),
      match_score:             detail.final_score,
      existing_score:          detail.existing_score,
      personality_match_score: detail.personality_match.score,
      personality_verdict:     detail.personality_match.verdict,
      stage_match_score:       detail.stage_match.score,
      stage_verdict:           detail.stage_match.verdict,
      job_stage:               detail.job_stage,
      teacher_stage:           detail.teacher_stage,
      teacher_personality:     detail.teacher_personality,
    };
  }).sort((a, b) => b.match_score - a.match_score).slice(0, parseInt(limit));
  return { job, matches };
}

module.exports = {
  // Existing exports (unchanged)
  calculateMatchScore,
  getMatchesForJob,
  getMatchScoreForApplication,
  getRecommendedJobsForTeacher,
  getBulkScoresForTeacher,
  // New exports
  calculateMatchScoreDetailed,
  getMatchesForJobDetailed,
  computePersonalityMatchScore,
  computeStageMatchScore,
  computeJobRelevance,
  detectStage,
  mapTeacherStage,
  mapJobStage,
  normalizeStageEnum,
  guessPersonalityFromBig5,
};
