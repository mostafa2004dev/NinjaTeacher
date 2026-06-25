# ═══════════════════════════════════════════════════════════════════════
#  personality_stage_engine.py  —  v2  (Trait-Based Personality Scoring)
#  ─────────────────────────────────────────────────────────────────────
#  Replaces the predefined-category approach with a continuous trait
#  scoring system derived directly from questionnaire answers.
#
#  Architecture:
#    STEP 1 — extract_trait_scores(ua)
#               reads ua (question-index → answer-index dict, same format
#               as full_system_v4.compute_dimension_scores uses)
#               → returns TraitProfile: 8 continuous scores 0-100
#
#    STEP 2 — compute_personality_match_score(trait_profile, job_stage)
#               dot-product of teacher's trait vector against the job
#               stage's trait-requirement vector
#               → 0-100 score + multiplier factor
#               → NO predefined categories, NO tier lookup
#
#    STEP 3 — compute_stage_match_score(teacher_stage, job_stage, exp, cl, pr, tc)
#               stage alignment + stage-weighted dimension score + exp bonus
#               → 0-100 score + multiplier factor (unchanged from v1)
#
#    STEP 4 — enhance_recommendation(existing_score, ...)
#               Final Score = existing × personality_factor × stage_factor
#
#  Backward compatibility:
#    All v1 public functions still exist and have unchanged signatures.
#    The old personality_type label is still returned for display purposes
#    but is no longer used in scoring.
# ═══════════════════════════════════════════════════════════════════════

from __future__ import annotations
from typing import Optional


# ── TRAITS ────────────────────────────────────────────────────────────────────
TRAITS = [
    "patience",
    "empathy",
    "creativity",
    "leadership",
    "communication",
    "discipline",
    "analytical_thinking",
    "child_engagement",
]

# Human-readable labels used in API responses
TRAIT_LABELS = {
    "patience":           "Patience",
    "empathy":            "Empathy",
    "creativity":         "Creativity",
    "leadership":         "Leadership",
    "communication":      "Communication",
    "discipline":         "Discipline",
    "analytical_thinking":"Analytical Thinking",
    "child_engagement":   "Child Engagement",
}


# ── STEP 1: TRAIT EXTRACTION FROM SURVEY ANSWERS ─────────────────────────────
#
# ua = {question_id (int): answer_index (int)}
# This is exactly the same format that full_system_v4.compute_dimension_scores
# receives, so no new data pipeline is needed.
#
# Each answer maps to a partial score on one or more traits.
# The score for each trait is the mean of all available signals for that trait.
#
# Signal weights sum to 1.0 per question because each question is one piece
# of evidence; its contribution to a trait averages with other questions.

# Q1 — "How do you handle a disruptive student?"
#   0 = Calm then explain
#   1 = Ignore
#   2 = Talk individually (most empathetic / patient)
#   3 = Punish (high discipline signal)
_Q1 = {
    "patience": {
        0: 0.80,   # Calm → patient approach
        1: 0.10,   # Ignore → avoidant, not patient
        2: 1.00,   # Talk individually → highest patience
        3: 0.10,   # Punish → impatient
    },
    "empathy": {
        0: 0.65,
        1: 0.00,
        2: 1.00,
        3: 0.05,
    },
    "discipline": {
        0: 0.70,   # Calm but rules-based
        1: 0.00,
        2: 0.40,   # Individual talk ≠ structural discipline
        3: 1.00,   # Punish = strong discipline signal
    },
}

# Q2 — "How do you help a slow learner?"
#   0 = Adjust by level
#   1 = Use simplified examples sometimes
#   2 = Explain in the same way
_Q2 = {
    "patience": {
        0: 1.00,
        1: 0.65,
        2: 0.15,
    },
    "child_engagement": {
        0: 1.00,
        1: 0.70,
        2: 0.15,
    },
    "creativity": {
        0: 0.80,   # Adjusting method = creative adaptation
        1: 0.50,
        2: 0.05,
    },
}

# Q3 — "How do you get uninterested students to participate?"
#   0 = Encouragement methods and incentives
#   1 = Design engaging activities
#   2 = Forcefully ask them to participate
_Q3 = {
    "creativity": {
        0: 0.60,
        1: 1.00,
        2: 0.05,
    },
    "child_engagement": {
        0: 0.85,
        1: 1.00,
        2: 0.20,
    },
    "communication": {
        0: 0.80,
        1: 0.75,
        2: 0.20,
    },
}

# Q4 — "How do you deal with a parent who objects to their child's grades?"
#   0 = Calmly explain the grading system
#   1 = Ask to speak later outside the classroom
#   2 = Apply the policy directly
_Q4 = {
    "communication": {
        0: 1.00,
        1: 0.65,
        2: 0.35,
    },
    "empathy": {
        0: 0.90,
        1: 0.65,
        2: 0.20,
    },
    "discipline": {
        0: 0.55,
        1: 0.40,
        2: 1.00,
    },
}

# Q5 — "Student declining and becoming withdrawn — what do you do?"
#   0 = Talk to them to understand and support
#   1 = Contact parents directly
#   2 = Adjust my approach to meet their needs
_Q5 = {
    "empathy": {
        0: 1.00,
        1: 0.55,
        2: 0.75,
    },
    "patience": {
        0: 0.90,
        1: 0.45,
        2: 0.80,
    },
    "child_engagement": {
        0: 1.00,
        1: 0.50,
        2: 0.85,
    },
}

# Q6 — "Disagreed with colleague/admin — what do you do?"
#   0 = Present my point of view calmly
#   1 = Look for a middle ground
#   2 = Comply with the policy to avoid conflict
_Q6 = {
    "leadership": {
        0: 1.00,   # Assertive, takes a stance
        1: 0.65,
        2: 0.15,
    },
    "communication": {
        0: 1.00,
        1: 0.80,
        2: 0.30,
    },
    "discipline": {
        0: 0.50,
        1: 0.45,
        2: 1.00,   # Full policy compliance = high discipline
    },
}

# Q7 — "How do you evaluate student interaction / class size effect?"
#   0 = Weak interaction, density strongly affects
#   1 = Average interaction, sometimes affects
#   2 = Good interaction, slight effect
#   3 = Very good interaction, no effect
#   4 = Excellent interaction, no effect on quality
_Q7 = {
    "communication": {
        0: 0.10,
        1: 0.35,
        2: 0.60,
        3: 0.85,
        4: 1.00,
    },
    "child_engagement": {
        0: 0.10,
        1: 0.35,
        2: 0.60,
        3: 0.85,
        4: 1.00,
    },
}

# Q8 — "New skill recently learned and applied?"
#   0 = Haven't learned a new skill recently
#   1 = Learned a simple skill but haven't applied it
#   2 = Learned and applying occasionally
#   3 = Learned and applying consistently every day
_Q8 = {
    "analytical_thinking": {
        0: 0.05,
        1: 0.35,
        2: 0.70,
        3: 1.00,
    },
}

# Q9 — "Top student finishes early — what do you do?"
#   0 = Ask to stay quiet until classmates finish
#   1 = Have them help weaker classmates
#   2 = Give additional questions and challenges
#   3 = Nothing specific
_Q9 = {
    "leadership": {
        0: 0.10,
        1: 0.65,   # Facilitating peer mentoring = leadership
        2: 0.90,   # Stretching gifted = leadership
        3: 0.05,
    },
    "analytical_thinking": {
        0: 0.05,
        1: 0.50,
        2: 1.00,
        3: 0.05,
    },
}

# Q12 — "Student used AI for entire assignment?"
#   0 = Reject immediately / zero
#   1 = Ask to redo under supervision
#   2 = Discuss content to verify understanding
#   3 = Encourage as support tool with clarification
_Q12 = {
    "analytical_thinking": {
        0: 0.30,
        1: 0.55,
        2: 0.90,
        3: 0.85,
    },
    "discipline": {
        0: 1.00,   # Strict enforcement = high discipline
        1: 0.75,
        2: 0.40,
        3: 0.30,
    },
}

# Q13 — "How do you integrate AI tools?"
#   0 = Don't use, prefer traditional methods
#   1 = Only to save time in prep/tests
#   2 = In class to create interactive activities
#   3 = Train students on prompt formulation
_Q13 = {
    "creativity": {
        0: 0.05,
        1: 0.30,
        2: 0.85,
        3: 1.00,
    },
    "analytical_thinking": {
        0: 0.10,
        1: 0.45,
        2: 0.70,
        3: 1.00,
    },
    "leadership": {
        0: 0.10,
        1: 0.30,
        2: 0.65,
        3: 1.00,   # Teaching meta-skills = leadership
    },
}

# Q14 — "When using new AI app, first concern?"
#   0 = Ease of use and interface
#   1 = Free or paid
#   2 = Student data safety and privacy
#   3 = Will it save grading effort
_Q14 = {
    "analytical_thinking": {
        0: 0.45,
        1: 0.20,
        2: 1.00,   # Privacy focus = analytical, thorough
        3: 0.35,
    },
}

# Master signal table: question_id → {trait → {answer_index → score}}
_SIGNALS: dict[int, dict[str, dict[int, float]]] = {
    1:  _Q1,
    2:  _Q2,
    3:  _Q3,
    4:  _Q4,
    5:  _Q5,
    6:  _Q6,
    7:  _Q7,
    8:  _Q8,
    9:  _Q9,
    12: _Q12,
    13: _Q13,
    14: _Q14,
}


class TraitProfile:
    """
    Holds 8 continuous personality trait scores (0-100) derived
    directly from questionnaire answers.

    Attributes:
        scores: dict  {trait_name: float 0-100}
        coverage: dict {trait_name: int}  — how many questions contributed
        raw: dict {trait_name: float 0-1}  — pre-scaling values
    """
    __slots__ = ("scores", "coverage", "raw")

    def __init__(self, scores: dict[str, float], coverage: dict[str, int], raw: dict[str, float]):
        self.scores = scores
        self.coverage = coverage
        self.raw = raw

    def vector(self) -> list[float]:
        """Return trait scores as a list in TRAITS order (0-100)."""
        return [self.scores.get(t, 50.0) for t in TRAITS]

    def to_dict(self) -> dict:
        return {
            "traits": {t: round(self.scores.get(t, 50.0), 1) for t in TRAITS},
            "trait_labels": {t: TRAIT_LABELS[t] for t in TRAITS},
            "coverage": {t: self.coverage.get(t, 0) for t in TRAITS},
        }


def extract_trait_scores(ua: dict) -> TraitProfile:
    """
    Derive 8 personality trait scores from questionnaire answers.

    Parameters:
        ua: {question_id (int): answer_index (int)}
            — same dict produced by full_system_v4._answers_to_ua()

    Returns:
        TraitProfile with scores 0-100.

    Missing answers: if a question is unanswered, its signals are skipped
    and the trait is scored from remaining questions only.
    If NO questions contribute to a trait, it defaults to 50 (neutral).
    """
    accum: dict[str, list[float]] = {t: [] for t in TRAITS}

    for qid, answer_idx in ua.items():
        q_signals = _SIGNALS.get(qid)
        if q_signals is None:
            continue
        for trait, answer_map in q_signals.items():
            val = answer_map.get(answer_idx)
            if val is not None:
                accum[trait].append(val)

    scores: dict[str, float] = {}
    coverage: dict[str, int] = {}
    raw: dict[str, float] = {}

    for trait in TRAITS:
        vals = accum[trait]
        if vals:
            mean_val = sum(vals) / len(vals)
            raw[trait] = mean_val
            scores[trait] = round(mean_val * 100, 1)
            coverage[trait] = len(vals)
        else:
            raw[trait] = 0.50
            scores[trait] = 50.0
            coverage[trait] = 0

    return TraitProfile(scores, coverage, raw)


# ── STEP 2: JOB STAGE TRAIT REQUIREMENTS ─────────────────────────────────────
#
# Each stage defines the IMPORTANCE of each trait (0.0-1.0).
# These weights represent how critical each trait is for success at that stage.
# Values are normalised so each stage's weights sum to 1.0 (for dot-product).

_RAW_STAGE_REQUIREMENTS: dict[str, dict[str, float]] = {
    "kindergarten": {
        "patience":           1.00,
        "empathy":            1.00,
        "child_engagement":   1.00,
        "creativity":         0.80,
        "communication":      0.70,
        "leadership":         0.30,
        "discipline":         0.25,
        "analytical_thinking":0.15,
    },
    "primary": {
        "patience":           0.70,
        "empathy":            0.80,
        "child_engagement":   0.90,
        "creativity":         0.70,
        "communication":      0.90,
        "leadership":         0.50,
        "discipline":         0.40,
        "analytical_thinking":0.40,
    },
    "middle_school": {
        "patience":           0.50,
        "empathy":            0.50,
        "child_engagement":   0.65,
        "creativity":         0.55,
        "communication":      0.80,
        "leadership":         0.90,
        "discipline":         0.80,
        "analytical_thinking":0.65,
    },
    "secondary": {
        "patience":           0.30,
        "empathy":            0.30,
        "child_engagement":   0.35,
        "creativity":         0.55,
        "communication":      0.70,
        "leadership":         0.90,
        "discipline":         0.80,
        "analytical_thinking":1.00,
    },
}

def _normalise_weights(weights: dict[str, float]) -> dict[str, float]:
    total = sum(weights.values())
    if total == 0:
        return {k: 1.0 / len(weights) for k in weights}
    return {k: v / total for k, v in weights.items()}

# Pre-normalise at import time
STAGE_REQUIREMENTS: dict[str, dict[str, float]] = {
    stage: _normalise_weights(req)
    for stage, req in _RAW_STAGE_REQUIREMENTS.items()
}


# ── STEP 2 (continued): PERSONALITY MATCH SCORE ──────────────────────────────

def compute_personality_match_score(
    trait_profile: TraitProfile,
    job_stage: str,
) -> dict:
    """
    Compute the Personality Match Score using a weighted dot-product between
    the teacher's trait scores and the job stage's trait requirements.

    Unlike the previous version, this produces a CONTINUOUS 0-100 score
    with no predefined categories or tier lookups.

    Score formula:
        raw = sum(trait_score[t] * stage_weight[t]  for t in TRAITS)
        — trait_score is 0-100
        — stage_weight is normalised (sums to 1.0)
        → raw is 0-100 directly

    Multiplier:
        Anchored at 100 being a perfect teacher (all traits = 100):
        factor = 0.80 + (raw / 100) * 0.45   → range [0.80, 1.25]
        A perfectly aligned teacher gets 1.25×, a complete mismatch gets 0.80×.

    Returns:
        {
          "raw_score": float 0-100,
          "factor": float 0.80-1.25,
          "verdict": str,
          "trait_contributions": {trait: contribution_score},
          "strongest_traits": [top-3 contributing traits],
          "weakest_traits": [bottom-2 contributing traits],
          "explanation": str,
        }
    """
    if job_stage not in STAGE_REQUIREMENTS:
        # Unknown stage: factor is 1.00 (neutral), score is the unweighted mean
        unweighted_mean = sum(trait_profile.scores.values()) / len(TRAITS)
        return {
            "raw_score": round(unweighted_mean, 1),
            "factor": 1.00,
            "verdict": "neutral",
            "trait_contributions": {},
            "strongest_traits": [],
            "weakest_traits": [],
            "explanation": "Stage not identified — personality match defaulted to neutral.",
            "stage": "unknown",
            "stage_label": "Unknown",
        }

    weights = STAGE_REQUIREMENTS[job_stage]
    stage_label = _STAGE_LABELS.get(job_stage, job_stage)

    # Weighted dot-product (trait scores are 0-100, weights normalised to sum=1)
    trait_contributions: dict[str, float] = {}
    raw_score = 0.0

    for trait in TRAITS:
        t_score = trait_profile.scores.get(trait, 50.0)   # 0-100
        w = weights.get(trait, 0.0)
        contribution = t_score * w
        raw_score += contribution
        trait_contributions[trait] = round(contribution, 2)

    raw_score = round(max(0.0, min(100.0, raw_score)), 1)

    # Multiplier: linear mapping from 0-100 score → 0.80-1.25
    factor = round(0.80 + (raw_score / 100.0) * 0.45, 4)
    factor = max(0.80, min(1.25, factor))

    # Verdict
    if raw_score >= 82:   verdict = "excellent"
    elif raw_score >= 66: verdict = "good"
    elif raw_score >= 50: verdict = "neutral"
    else:                 verdict = "poor"

    # Strongest / weakest contributing traits (by weighted contribution)
    sorted_contribs = sorted(trait_contributions.items(), key=lambda x: -x[1])
    strongest = [{"trait": t, "label": TRAIT_LABELS[t], "score": trait_profile.scores.get(t, 50.0), "contribution": c}
                 for t, c in sorted_contribs[:3]]
    weakest   = [{"trait": t, "label": TRAIT_LABELS[t], "score": trait_profile.scores.get(t, 50.0), "contribution": c}
                 for t, c in sorted_contribs[-2:]]

    explanation = (
        f"Trait-based personality match for {stage_label}: {raw_score}/100. "
        f"Strongest contributing traits: {', '.join(s['label'] for s in strongest[:2])}. "
        f"Factor applied: {factor}×."
    )

    return {
        "raw_score": raw_score,
        "factor": factor,
        "verdict": verdict,
        "trait_contributions": trait_contributions,
        "strongest_traits": strongest,
        "weakest_traits": weakest,
        "explanation": explanation,
        "stage": job_stage,
        "stage_label": stage_label,
    }


# ── STEP 3: STAGE MATCH SCORE (unchanged logic from v1) ─────────────────────

_STAGE_LABELS: dict[str, str] = {
    "kindergarten": "Kindergarten / Early Years",
    "primary":      "Primary School",
    "middle_school":"Middle School",
    "secondary":    "Secondary / High School",
}

STAGE_PROFILES: dict[str, dict] = {
    "kindergarten": {
        "label": "Kindergarten / Early Years",
        "dimension_weights": {"classroom": 0.65, "professional": 0.25, "tech": 0.10},
        "min_experience_preferred": 0,
        "stage_keywords": [
            "kindergarten", r"\bkg\b", "early years", "early childhood",
            "nursery", "preschool", r"\bk1\b", r"\bk2\b",
        ],
    },
    "primary": {
        "label": "Primary School",
        "dimension_weights": {"classroom": 0.50, "professional": 0.35, "tech": 0.15},
        "min_experience_preferred": 1,
        "stage_keywords": [
            "primary", "elementary",
            r"\bgrade [1-5]\b", r"\bgrades [1-5]\b",
            r"\byear [1-5]\b",
        ],
    },
    "middle_school": {
        "label": "Middle School",
        "dimension_weights": {"classroom": 0.42, "professional": 0.42, "tech": 0.16},
        "min_experience_preferred": 2,
        "stage_keywords": [
            "middle school", r"\bmiddle\b", r"\bgrade [6-8]\b", r"\bgrades [6-8]\b",
            r"\bprep\b", "preparatory",
        ],
    },
    "secondary": {
        "label": "Secondary / High School",
        "dimension_weights": {"classroom": 0.25, "professional": 0.45, "tech": 0.30},
        "min_experience_preferred": 3,
        "stage_keywords": [
            "secondary", "high school",
            r"\bgrade (9|10|11|12)\b", r"\bgrades (9|10|11|12)\b",
            "a-level", "igcse", r"\bsat\b", "thanawy", "thanawi",
        ],
    },
}


def detect_stage(job_title: str, job_description: str = "", job_stage_field: str = "") -> str:
    """Detect educational stage from text. Returns stage key or 'unknown'."""
    import re as _re
    combined = " ".join([
        str(job_stage_field).lower(),
        str(job_title).lower(),
        str(job_description).lower(),
    ])
    direct_map = {
        "kg": "kindergarten", "kindergarten": "kindergarten",
        "early years": "kindergarten", "nursery": "kindergarten",
        "primary": "primary", "elementary": "primary",
        "middle": "middle_school", "prep": "middle_school",
        "preparatory": "middle_school",
        "secondary": "secondary", "high school": "secondary",
        "thanawy": "secondary", "thanawi": "secondary",
    }
    for key, stage in direct_map.items():
        if _re.search(r"\b" + _re.escape(key) + r"\b", combined):
            return stage
    for stage_key, profile in STAGE_PROFILES.items():
        for kw in profile["stage_keywords"]:
            if _re.search(kw, combined):
                return stage_key
    return "unknown"


def detect_teacher_stage(stage_str: str) -> str:
    """Map a teacher's survey stage answer to a stage key."""
    s = str(stage_str).strip().lower()
    if not s or s == "nan":
        return "unknown"
    if "kg" in s or "kindergarten" in s or "early" in s or "nursery" in s:
        return "kindergarten"
    if "primary" in s or "elementary" in s:
        return "primary"
    if "middle" in s or "prep" in s:
        return "middle_school"
    if "secondary" in s or "high" in s or "thanawy" in s:
        return "secondary"
    return "unknown"


def compute_stage_match_score(
    teacher_stage: str,
    job_stage: str,
    teacher_experience_years: int = 0,
    teacher_cl_score: int = 0,
    teacher_pr_score: int = 0,
    teacher_tc_score: int = 0,
) -> dict:
    """
    Stage Match Score — unchanged from v1 logic.
    Returns {"raw_score", "factor", "verdict", ...}
    """
    if not job_stage or job_stage == "unknown":
        return {
            "raw_score": 70, "factor": 1.00, "verdict": "neutral",
            "explanation": "Job stage not identified — stage match defaulted to neutral.",
            "stage": "unknown", "stage_label": "Unknown",
            "teacher_stage": teacher_stage,
        }

    profile = STAGE_PROFILES[job_stage]

    ADJACENCY = {
        ("kindergarten", "primary"):    0.75,
        ("primary",      "kindergarten"):0.75,
        ("primary",      "middle_school"):0.75,
        ("middle_school","primary"):    0.75,
        ("middle_school","secondary"):  0.80,
        ("secondary",    "middle_school"):0.80,
    }

    if teacher_stage == "unknown" or not teacher_stage:
        alignment = 0.70
    elif teacher_stage == job_stage:
        alignment = 1.00
    else:
        alignment = ADJACENCY.get((teacher_stage, job_stage), 0.55)

    w = profile["dimension_weights"]
    if teacher_cl_score or teacher_pr_score or teacher_tc_score:
        dim_score = (teacher_cl_score * w["classroom"]
                     + teacher_pr_score * w["professional"]
                     + teacher_tc_score * w["tech"])
        dim_norm = max(0.0, min(1.0, dim_score / 100.0))
    else:
        dim_norm = 0.60

    min_exp = profile["min_experience_preferred"]
    if teacher_experience_years >= min_exp + 3:
        exp_bonus = 0.05
    elif teacher_experience_years >= min_exp:
        exp_bonus = 0.02
    else:
        exp_bonus = -0.03

    base = alignment * 0.50 + dim_norm * 0.40
    raw_score = round((base + 0.10) * 100 + exp_bonus * 100)
    raw_score = max(30, min(100, raw_score))

    if raw_score >= 85:   factor = 1.18
    elif raw_score >= 75: factor = 1.10
    elif raw_score >= 60: factor = 1.00
    elif raw_score >= 45: factor = 0.92
    else:                 factor = 0.82

    if raw_score >= 80:   verdict = "excellent"
    elif raw_score >= 65: verdict = "good"
    elif raw_score >= 50: verdict = "neutral"
    else:                 verdict = "poor"

    explanation = (
        f"Teacher stage '{teacher_stage}' vs job stage '{job_stage}'. "
        f"Alignment: {round(alignment * 100)}%. "
        f"Stage-weighted score: {round(dim_norm * 100)}%. "
        f"Stage match score: {raw_score}."
    )

    return {
        "raw_score": raw_score,
        "factor": factor,
        "verdict": verdict,
        "explanation": explanation,
        "alignment_pct": round(alignment * 100),
        "stage_weighted_dim_pct": round(dim_norm * 100),
        "experience_bonus": round(exp_bonus * 100),
        "stage": job_stage,
        "stage_label": profile["label"],
        "teacher_stage": teacher_stage,
    }


# ── STEP 4: APPLY ENHANCEMENT FACTORS ────────────────────────────────────────

# Blend weights — must sum to 1.0
# Existing score is dominant so that the existing qualification/experience/
# specialization logic remains the primary ranking signal.
# Personality and stage each contribute a bounded 15% adjustment.
BLEND_WEIGHT_EXISTING     = 0.70
BLEND_WEIGHT_PERSONALITY  = 0.15
BLEND_WEIGHT_STAGE        = 0.15


def apply_enhancement_factors(
    existing_score: float,
    personality_raw_score: float,
    stage_raw_score: float,
) -> float:
    """
    Weighted additive blend:

        Final Score = (existing × 0.70)
                    + (personality_raw_score × 0.15)
                    + (stage_raw_score × 0.15)

    All three inputs are on the same 0-100 scale, so this is a
    true weighted average — clamped to [10, 99].

    Why additive instead of multiplicative:
        Multiplicative factors compound unpredictably — a combined factor
        of 1.21 applied to an existing score of 80 pushes it to 96.8, making
        virtually every competent teacher converge on the 99 cap and erasing
        the differentiation the existing scoring worked to establish.
        The additive blend preserves the existing score's rank ordering while
        allowing personality and stage to contribute meaningful adjustments.
    """
    blended = (
        existing_score     * BLEND_WEIGHT_EXISTING
        + personality_raw_score * BLEND_WEIGHT_PERSONALITY
        + stage_raw_score       * BLEND_WEIGHT_STAGE
    )
    return round(max(10.0, min(99.0, blended)), 1)


def enhance_recommendation(
    existing_score: float,
    teacher_personality_type: str,   # kept for backward compat; NOT used in scoring
    teacher_stage: str,
    teacher_experience_years: int,
    teacher_cl_score: int,
    teacher_pr_score: int,
    teacher_tc_score: int,
    job_stage: str,
    trait_profile: Optional[TraitProfile] = None,
    ua: Optional[dict] = None,
) -> dict:
    """
    Compute the full enhanced recommendation for one teacher↔job pair.

    Accepts either a pre-computed TraitProfile or a raw ua dict to derive it from.
    If neither is provided, falls back to a neutral trait profile (all traits = 50).

    Returns:
        {
          "final_score", "existing_score",
          "personality_match", "stage_match",
          "personality_factor", "stage_factor",
          "trait_profile",
        }
    """
    # Resolve trait profile
    if trait_profile is None:
        if ua is not None:
            trait_profile = extract_trait_scores(ua)
        else:
            # Fallback: neutral profile — this happens when scoring teachers
            # from the XLSX DB who don't have ua available.
            neutral_scores = {t: 50.0 for t in TRAITS}
            neutral_cov    = {t: 0 for t in TRAITS}
            neutral_raw    = {t: 0.5 for t in TRAITS}
            trait_profile  = TraitProfile(neutral_scores, neutral_cov, neutral_raw)

    personality_result = compute_personality_match_score(trait_profile, job_stage)
    stage_result       = compute_stage_match_score(
        teacher_stage, job_stage,
        teacher_experience_years,
        teacher_cl_score, teacher_pr_score, teacher_tc_score,
    )

    final_score = apply_enhancement_factors(
        existing_score,
        personality_result["raw_score"],
        stage_result["raw_score"],
    )

    return {
        "final_score":        final_score,
        "existing_score":     existing_score,
        "personality_match":  personality_result,
        "stage_match":        stage_result,
        "personality_factor": personality_result["factor"],
        "stage_factor":       stage_result["factor"],
        "trait_profile":      trait_profile.to_dict(),
    }


# ── SUBJECT RELEVANCE (unchanged from v1) ────────────────────────────────────

SUBJECT_GROUPS: dict[str, list[str]] = {
    "mathematics": ["math","mathematics","maths","algebra","geometry","calculus","statistics","arithmetic"],
    "arabic":      ["arabic","arabic language","arabic literature","islamic studies","religion","quran"],
    "english":     ["english","english language","english literature","french","german","spanish"],
    "science":     ["science","physics","chemistry","biology","earth science","computer science",
                    "robotics","ict","it","technology","environmental science"],
    "social":      ["social studies","social","history","geography","civics","economics","politics"],
    "arts_pe":     ["art","arts","fine arts","music","drama","physical education","pe","sports"],
    "kg_general":  ["kg","kindergarten","early years","nursery","pre-school"],
}


def get_subject_group(subject: str) -> Optional[str]:
    if not subject:
        return None
    s = str(subject).lower()
    for group, keywords in SUBJECT_GROUPS.items():
        if any(kw in s or s in kw for kw in keywords):
            return group
    return None


def compute_job_relevance_score(
    teacher_specialization: str,
    teacher_stage: str,
    job_title: str,
    job_specialization: str,
    job_stage: str,
    job_description: str = "",
) -> dict:
    """Subject + stage relevance for Teacher-to-Job Recommendations. Unchanged from v1."""
    teacher_spec   = str(teacher_specialization).lower().strip()
    job_spec       = str(job_specialization).lower().strip()
    job_title_low  = str(job_title).lower()
    job_desc_low   = str(job_description).lower()
    combined_job   = f"{job_spec} {job_title_low} {job_desc_low}"

    if teacher_spec and (teacher_spec in combined_job or job_spec in teacher_spec):
        subject_match = "exact"; subject_score = 100
    else:
        t_group = get_subject_group(teacher_spec)
        j_group = get_subject_group(f"{job_spec} {job_title_low}")
        if t_group and j_group and t_group == j_group:
            subject_match = "group"; subject_score = 75
        elif teacher_spec and any(
            w in combined_job for w in teacher_spec.split() if len(w) > 3
        ):
            subject_match = "partial"; subject_score = 45
        else:
            subject_match = "none"; subject_score = 0

    if teacher_stage == "unknown" or job_stage == "unknown":
        stage_relevant = True; stage_score = 65
    elif teacher_stage == job_stage:
        stage_relevant = True; stage_score = 100
    else:
        ADJ = {
            ("kindergarten", "primary"):    70, ("primary", "kindergarten"):    70,
            ("primary",      "middle_school"):70, ("middle_school","primary"):  70,
            ("middle_school","secondary"):  75, ("secondary","middle_school"):   75,
        }
        stage_score    = ADJ.get((teacher_stage, job_stage), 40)
        stage_relevant = stage_score >= 60

    relevance_score = round(subject_score * 0.70 + stage_score * 0.30)
    return {
        "relevance_score": relevance_score,
        "is_relevant":     relevance_score >= 45,
        "subject_match":   subject_match,
        "stage_relevant":  stage_relevant,
        "subject_score":   subject_score,
        "stage_score":     stage_score,
        "explanation": (f"Subject match: {subject_match} ({subject_score}%). "
                        f"Stage relevance: {stage_score}%. "
                        f"Overall relevance: {relevance_score}%."),
    }
