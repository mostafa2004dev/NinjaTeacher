const Assessment = require("./assessment.model");
const Teacher    = require("../users/users.model");
const ai         = require("../../utils/ai.client");

// ── callAIModel ────────────────────────────────────────────────────────────
// كان: spawn("python3", predictor.py) → يعيد تدريب الموديل بالكامل لكل طلب.
// أصبح: نداء HTTP لخدمة FastAPI الدائمة (ai_model/ai_service.py) — ميلي ثانية.
// النتيجة المُعادة superset من القديمة (decision/confidence/raw_score/reason
// + dimensions/personality/recommended_schools)، فكل ما بعدها يعمل كما هو.
async function callAIModel(answers) {
  return await ai.predict(answers);
}

// ── submitAssessment ───────────────────────────────────────────────────────
// 1. Save answers to DB (status: pending)
// 2. Call AI model
// 3. Update DB with result
// 4. Update teacher's Big5_Score with raw_score
async function submitAssessment(teacherId, answers) {
  // Validate required fields
  const required = [
    "Tech use", "Integrate AI", "Disruptive", "slow learners",
    "Disinterested", "Parent objections", "High performers",
    "AI homework", "AI app concerns",
    "I disagreed with a fellow teacher or administrator (regarding teaching methods).",
    "Age", "Experience", "Gender", "Teacher for the stage",
    "Languages", "Compensation", "chronic disease",
    "I noticed that one of the students' performance levels started to decline and he became withdrawn.",
    "Engagement", "New skill",
  ];

  const missing = required.filter(f => !answers[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  // Save pending record
  const assessment = await Assessment.create({
    teacher_id: teacherId,
    answers,
    status: "pending",
  });

  try {
    // Call the AI model
    const result = await callAIModel(answers);

    // Update record with result
    await assessment.update({
      decision:         result.decision,
      confidence:       result.confidence,
      raw_score:        result.raw_score,
      reason:           result.reason,
      positive_factors: result.positive_factors,
      negative_factors: result.negative_factors,
      suggestions:      result.suggestions,
      status:           "completed",
    });

    // Persist AI scores to Teacher record for use in job matching
    // Big5_Score: overall score (scalar) — existing field, unchanged
    // Big5_Scores: JSON with dimension breakdown + stage + trait_profile
    //   trait_profile is the 8-trait vector from personality_stage_engine.py
    //   It enables the JS matching layer to use real trait scores instead of
    //   the cl/pr/tc dimension approximation.
    const traitData = result.trait_profile?.traits ?? null;
    const big5Json = {
      classroom:    result.dimensions?.classroom    ?? 0,
      professional: result.dimensions?.professional ?? 0,
      tech:         result.dimensions?.tech         ?? 0,
      overall:      result.raw_score,
      stage:        result.teacher_stage            ?? "unknown",
      personality_type: result.personality?.type   ?? "developing_educator",
      // NEW: real 8-trait scores from survey answers
      trait_profile: traitData,
      evaluationLevel: result.evaluationLevel ?? null,
    };
    await Teacher.update(
      {
        Big5_Score:  result.evaluationScore ?? result.raw_score,
        Big5_Scores: big5Json,
      },
      { where: { Teacher_ID: teacherId } }
    );

    return {
      assessment_id:    assessment.id,
      decision:         result.decision,
      confidence:       result.confidence,
      raw_score:        result.raw_score,
      evaluationScore:  result.evaluationScore ?? result.raw_score,
      evaluationLevel:  result.evaluationLevel ?? null,
      reason:           result.reason,
      positive_factors: result.positive_factors,
      negative_factors: result.negative_factors,
      suggestions:      result.suggestions,
    };

  } catch (err) {
    // Mark as failed but don't delete — keep answers for retry
    await assessment.update({
      status:        "failed",
      error_message: err.message,
    });
    throw err;
  }
}

// ── getMyAssessments ───────────────────────────────────────────────────────
async function getMyAssessments(teacherId) {
  return await Assessment.findAll({
    where:  { teacher_id: teacherId },
    order:  [["createdAt", "DESC"]],
    attributes: { exclude: ["answers"] }, // don't return full answers in list
  });
}

// ── getLatestAssessment ────────────────────────────────────────────────────
async function getLatestAssessment(teacherId) {
  return await Assessment.findOne({
    where: { teacher_id: teacherId, status: "completed" },
    order: [["createdAt", "DESC"]],
  });
}

// ── getAssessmentById ─────────────────────────────────────────────────────
async function getAssessmentById(id, teacherId) {
  const assessment = await Assessment.findOne({
    where: { id, teacher_id: teacherId },
  });
  if (!assessment) throw new Error("Assessment not found.");
  return assessment;
}

module.exports = {
  submitAssessment,
  getMyAssessments,
  getLatestAssessment,
  getAssessmentById,
};
