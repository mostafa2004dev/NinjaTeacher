const Teacher = require("../users/users.model");

// Question IDs grouped by step — same order as frontend
const STEP_GROUPS = {
  Survey_Classroom_Management: [1, 2, 3, 4, 5],
  Survey_Professional_Skills:  [6, 7, 8, 9, 10],
  Survey_AI_Technology:        [11, 12, 13, 14],
};

// ── B-05: Frontend answer text → AI model expected text ──────────────────────
// Each key is questionId (1-14); each value maps frontend display text → AI model text.
// The AI model uses abbreviated/variant strings in its QUESTIONS[].map and SCORE_MAP_RAW.
// Frontend sends full English sentences; they must be normalised before calling the AI.
const FRONTEND_TO_AI_MAP = {
  1: {
    "Calm them down and explain classroom rules":       "Calm then explain",
    "Ignore the situation":                             "Ignore",
    "Talk to them individually and understand them":    "Talk individually",
    "Punish them immediately":                          "Punish",
  },
  2: {
    "Adjust my teaching method to suit the student's level": "Adjust by level",
    "Use simplified examples sometimes":                "Use simple examples. Sometimes",
    "Explain in the same way":                          "Explain same",
  },
  3: {
    "Use encouragement methods and incentives":         "Encouragement",
    "Design engaging activities to motivate everyone":  "Engaging activities",
    "Forcefully ask them to participate":               "Participate",
  },
  4: {
    "Calmly explain the grading system":                "Explain calmly",
    "Ask to speak later outside the classroom":         "I'm asking to speak. No, really, outside of class.",
    "Apply the policy directly":                        "Apply policy",
  },
  5: {
    "Talk to them to understand the reason and support them": "Talk support",
    "Contact parents directly":                         "I contact the parents directly",
    "Adjust my approach to meet their needs":           "Adjust approach",
  },
  6: {
    "Present my point of view calmly":                  "Present calmly",
    "Look for a middle ground":                         "Compromise",
    "Comply with the policy to avoid conflict":         "Adhere policy",
  },
  7: {
    "Interaction is weak and density strongly affects it":                   "Weak interaction, strong effect",
    "Interaction is average and density sometimes affects it":               "Average interaction, some effect",
    "Interaction is good and density somewhat affects it":                   "Good interaction, slight effect",
    "Interaction is very good and density doesn't affect it":                "Very good interaction, no effect",
    "Interaction is excellent and density doesn't affect my teaching quality": "Excellent interaction, no effect on quality",
  },
  8: {
    "I haven't learned a new skill recently":                         "None",
    "I learned a simple skill but haven't applied it yet":            "Learned, not applied",
    "I learned a skill and started applying it occasionally":         "Applying occasionally",
    "I learned a skill and apply it consistently in class":           "Applying consistently in class every day",
  },
  9: {
    "Ask them to stay quiet until classmates finish":   "I asked him to be quiet until his colleague finished.",
    "Have them help weaker classmates":                 "Make him help his weaker colleagues.",
    "Give them additional questions and challenges":    "Challenges",
    "Nothing specific":                                 "Nothing specific",
  },
  10: {
    "Strongly agree":    "I strongly agree",
    "Agree":             "Agree",
    "Neutral":           "Neutral",
    "Disagree":          "No Agree",
    "Strongly disagree": "Strongly No Agree",
  },
  11: {
    "I don't use it":      "No, use it",
    "I use it a little":   "Use it a little.",
    "Sometimes":           "Sometimes",
    "Effectively":         "Effectively",
    "Always and skillfully": "Always",
  },
  12: {
    "Reject the assignment immediately and give a zero":                   "Reject homework",
    "Ask them to redo it under my supervision in class":                   "I ask him to return it under my supervision inside the classroom.",
    "Discuss the written content with them to verify understanding":       "Discuss content",
    "Encourage them to use it as a support tool while clarifying sources": "Use as aid",
  },
  13: {
    "I don't use them and prefer traditional methods entirely":                     "No, I don't use it and I prefer the traditional methods completely.",
    "I use them only to save time in preparation and writing tests":                "I only use it to save time in preparing and writing No tests",
    "I use them in class to create interactive activities with students":           "I use it in the classroom to create interactive activities with the students.",
    "I train students on how to correctly write prompts for research":              "I train Nob on how to correctly formulate commands (prompts) for searching.",
  },
  14: {
    "Ease of use and the app's interface":                   "The ease of use and design of the application.",
    "Whether the app is free or paid":                       "Free or paid",
    "Student data safety and privacy on the app":            "How secure and private is Noob's data on this application?",
    "Whether it will save me effort in grading or not":      "Will it save me the effort of correcting, or no?",
  },
};

// Question ID → AI model column name (exact strings used as keys in assessment payload)
const Q_TO_COL = {
  1:  "Disruptive",
  2:  "slow learners",
  3:  "Disinterested",
  4:  "Parent objections",
  5:  "I noticed that one of the students' performance levels started to decline and he became withdrawn.",
  6:  "I disagreed with a fellow teacher or administrator (regarding teaching methods).",
  7:  "Engagement",
  8:  "New skill",
  9:  "High performers",
  10: "Compensation",
  11: "Tech use",
  12: "AI homework",
  13: "Integrate AI",
  14: "AI app concerns",
};

// Convert Date_of_Birth → age range string expected by the AI model's _convert_age()
function _ageToRange(dob) {
  if (!dob) return "26-30";
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  if (age < 26) return "18-25";
  if (age < 31) return "26-30";
  if (age < 36) return "31-35";
  if (age < 41) return "36-40";
  if (age < 46) return "41-45";
  if (age < 51) return "46-50";
  return "51+";
}

// Convert Years_of_Experience integer → range string expected by the AI model's _convert_exp()
function _expToRange(years) {
  const y = parseInt(years, 10) || 0;
  if (y <= 1)  return "1yr";
  if (y <= 2)  return "2yrs";
  if (y <= 5)  return "3-5 years";
  if (y <= 10) return "5-10 years";
  return "10+ years";
}

// ── submitSurvey ──────────────────────────────────────────────────────────────
async function submitSurvey(teacherId, answers) {
  // answers: [{ questionId: 1, answer: "..." }, ...]
  const answersMap = {};
  for (const { questionId, answer } of answers) {
    answersMap[questionId] = answer;
  }

  // Split answers into 3 groups by step
  const classroomManagement = {};
  const professionalSkills  = {};
  const aiTechnology        = {};

  for (const id of STEP_GROUPS.Survey_Classroom_Management) {
    classroomManagement[id] = answersMap[id] ?? null;
  }
  for (const id of STEP_GROUPS.Survey_Professional_Skills) {
    professionalSkills[id] = answersMap[id] ?? null;
  }
  for (const id of STEP_GROUPS.Survey_AI_Technology) {
    aiTechnology[id] = answersMap[id] ?? null;
  }

  await Teacher.update(
    {
      Survey_Classroom_Management: JSON.stringify(classroomManagement),
      Survey_Professional_Skills:  JSON.stringify(professionalSkills),
      Survey_AI_Technology:        JSON.stringify(aiTechnology),
      Survey_Submitted_At:         new Date(),
    },
    { where: { Teacher_ID: teacherId } }
  );

  // ── B-05 FIX: trigger AI assessment immediately after survey is stored ──────
  // Non-fatal: if the AI call fails, the survey is still successfully saved.
  try {
    // Lazy require avoids any potential circular-dependency issues at module load
    const { submitAssessment } = require("../assessment/assessment.service");

    // Build the AI payload: normalise each frontend answer text → AI model text
    const aiPayload = {};
    for (const { questionId, answer } of answers) {
      const col = Q_TO_COL[questionId];
      if (!col) continue;
      const mapped = FRONTEND_TO_AI_MAP[questionId]?.[answer];
      // Use mapped value; fall back to raw answer if somehow not in the map
      aiPayload[col] = mapped !== undefined ? mapped : answer;
    }

    // Supplement with teacher profile fields (not in the 14 survey questions)
    const teacher = await Teacher.findByPk(teacherId, {
      attributes: ["Date_of_Birth", "Gender", "Years_of_Experience", "Specialization"],
    });

    aiPayload["Age"]                  = _ageToRange(teacher?.Date_of_Birth);
    aiPayload["Experience"]           = _expToRange(teacher?.Years_of_Experience);
    aiPayload["Gender"]               = teacher?.Gender
      ? teacher.Gender.charAt(0).toUpperCase() + teacher.Gender.slice(1).toLowerCase()
      : "Female";
    // Specialization holds the teaching subject; Stage defaults to "Primary" as in
    // the AI model's DEFAULT_PROFILE when no explicit stage field is present.
    aiPayload["Teacher for the stage"] = "Primary";
    aiPayload["Languages"]            = "Arabic;English";
    aiPayload["chronic disease"]      = "No";

    await submitAssessment(teacherId, aiPayload);
  } catch (assessErr) {
    // Log but do not surface — survey response is already committed above
    console.warn("[survey] AI assessment trigger failed:", assessErr.message);
  }
  // ── end B-05 FIX ────────────────────────────────────────────────────────────

  return {
    classroom_management: classroomManagement,
    professional_skills:  professionalSkills,
    ai_technology:        aiTechnology,
  };
}

// ── getSurveyAnswers ───────────────────────────────────────────────────────────
async function getSurveyAnswers(teacherId) {
  const teacher = await Teacher.findByPk(teacherId, {
    attributes: [
      "Survey_Classroom_Management",
      "Survey_Professional_Skills",
      "Survey_AI_Technology",
      "Survey_Submitted_At",
    ],
  });

  if (!teacher) throw new Error("Teacher not found.");

  const parse = (val) => {
    try { return val ? JSON.parse(val) : null; }
    catch { return null; }
  };

  return {
    classroom_management: parse(teacher.Survey_Classroom_Management),
    professional_skills:  parse(teacher.Survey_Professional_Skills),
    ai_technology:        parse(teacher.Survey_AI_Technology),
    submitted_at:         teacher.Survey_Submitted_At ?? null,
  };
}

module.exports = { submitSurvey, getSurveyAnswers };
