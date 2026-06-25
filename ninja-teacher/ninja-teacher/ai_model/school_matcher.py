# ═══════════════════════════════════════════════════════════════════════
#  school_matcher.py  —  جسر أسئلة المدرسة ↔ الموديل
#  ملف جديد منفصل (لا يلمس full_system_v4.py)
#
#  المدرسة بتجاوب 5 أسئلة (صفات)، كل سؤال اختيارين. الكود ده:
#   1) يحوّل الـ5 إجابات → الشخصيات المفضّلة (من شخصيات الموديل الـ6)
#   2) يبني "مدرسة حية" بنفس شكل مدرسة الموديل بالظبط
#   3) يستخدم منطق ترتيب الموديل نفسه (نفس الـ weights والـ thresholds)
#      عشان يطلّع المعلمين المقبولين بالسكور والبيانات
# ═══════════════════════════════════════════════════════════════════════

import full_system_v4 as m

# ── الأسئلة الـ5 وكل إجابة بتميل لأنهي شخصيات (من الـ6 بتوع الموديل) ──────
#   الموديل عنده: emotional_leader, digital_innovator, methodical_professional,
#                 adaptive_coach, visionary_catalyst, developing_educator
SCHOOL_QUESTIONS = [
    {
        "id": "discipline",
        "question": "ما أسلوب الانضباط المفضّل في مدرستك؟",
        "options": {
            "Strict / Structured": ["methodical_professional", "emotional_leader"],
            "Flexible / Adaptive": ["adaptive_coach", "visionary_catalyst"],
        },
    },
    {
        "id": "energy",
        "question": "ما طاقة المعلم التي تبحث عنها؟",
        "options": {
            "Calm / Patient":  ["emotional_leader", "methodical_professional"],
            "Energetic / Dynamic": ["visionary_catalyst", "digital_innovator"],
        },
    },
    {
        "id": "leadership",
        "question": "ما الدور الأنسب للمعلم داخل الفريق؟",
        "options": {
            "Leader / Initiator":  ["visionary_catalyst", "emotional_leader"],
            "Supporter / Team-player": ["adaptive_coach", "developing_educator"],
        },
    },
    {
        "id": "communication",
        "question": "ما أسلوب التواصل المفضّل مع الطلاب؟",
        "options": {
            "Direct / Results-focused": ["methodical_professional", "visionary_catalyst"],
            "Empathetic / Relationship-focused": ["emotional_leader", "adaptive_coach"],
        },
    },
    {
        "id": "approach",
        "question": "ما المنهج التدريسي الذي تفضّله؟",
        "options": {
            "Analytical / Methodical": ["methodical_professional", "digital_innovator"],
            "Creative / Innovative":   ["digital_innovator", "visionary_catalyst"],
        },
    },
]


def school_answers_to_personalities(answers: dict, top_n: int = 2):
    """يحوّل إجابات المدرسة الـ5 → أكثر الشخصيات تكرارًا (المفضّلة)."""
    votes = {}
    for q in SCHOOL_QUESTIONS:
        chosen = answers.get(q["id"])
        if not chosen:
            continue
        for p in q["options"].get(chosen, []):
            votes[p] = votes.get(p, 0) + 1
    if not votes:
        return ["adaptive_coach"]
    ranked = sorted(votes.items(), key=lambda x: -x[1])
    return [p for p, _ in ranked[:top_n]] or ["adaptive_coach"]


def build_live_school(payload: dict):
    """
    يبني مدرسة بنفس شكل مدرسة الموديل من بيانات حيّة قادمة من الـ Backend.
    payload = {
      school_name, city, type,            # نص
      subjects_needed: ["Math","English"],# قائمة
      answers: {discipline:..., energy:...},  # إجابات الـ5 أسئلة (اختياري)
      min_classroom, min_professional, min_tech, threshold,  # أرقام (اختياري)
    }
    """
    raw_subjs = payload.get("subjects_needed") or ["Math"]
    known = {"Math", "Arabic", "English", "Science", "KG", "Social"}
    subjs = list(dict.fromkeys(m.SUBJECT_MAP.get(s, s) for s in raw_subjs))
    subjs = [s for s in subjs if s in known] or ["Math"]

    school_type = str(payload.get("type", "Private")).strip()
    weights = m._calc_weights(subjs, school_type)

    prefs = school_answers_to_personalities(payload.get("answers", {}))

    return {
        "name": str(payload.get("school_name", "Live School")).strip(),
        "type": school_type,
        "city": str(payload.get("city", "Cairo")).strip(),
        "subjects_needed": subjs,
        "subject_weights": weights,
        "min_scores": {
            "classroom":    min(int(payload.get("min_classroom", 60)), 90),
            "professional": min(int(payload.get("min_professional", 60)), 82),
            "tech":         min(int(payload.get("min_tech", 55)), 80),
        },
        "preferred_personalities": prefs,
        "school_threshold": int(payload.get("threshold", 62)),
        "notes": str(payload.get("notes", "")).strip(),
    }


def rank_teachers_for_live_school(payload: dict, teachers_db=None):
    """
    نفس منطق m.rank_teachers_for_school بالظبط، لكن لمدرسة حيّة (مش من الداتاسيت).
    يرجّع: { matched_personalities, teachers_by_subject{subj:[...candidates]} }
    """
    if teachers_db is None:
        teachers_db = m.REAL_TEACHERS_DB
    school = build_live_school(payload)

    mins = school["min_scores"]
    thr  = school["school_threshold"]
    by_subject = {}

    for subj in school["subjects_needed"]:
        w = school["subject_weights"].get(subj, {"classroom": 0.33, "professional": 0.33, "tech": 0.34})
        cands = []
        for t in teachers_db:
            cl = int(t["classroom"]); pr = int(t["professional"]); tc = int(t["tech"])
            if cl < mins["classroom"] or pr < mins["professional"] or tc < mins["tech"]:
                continue
            if subj not in t.get("accepted_subjects", []):
                continue
            sc = round(min(99, max(10, cl * w["classroom"] + pr * w["professional"] + tc * w["tech"])))
            if sc < thr:
                continue
            pm = t.get("personality_type") in school["preferred_personalities"]
            effective = min(99, sc + (5 if pm else 0))
            cands.append({
                "teacher_id": t["teacher_id"],
                "name": t["name"],
                "score": sc,
                "effective_score": effective,
                "personality_type": t.get("personality_type", "—"),
                "personality_match": pm,
                "classroom": cl, "professional": pr, "tech": tc,
                "stage": t.get("stage", "—"),
                "gender": t.get("gender", "—"),
                "gov": t.get("gov", "—"),
                "weights_used": f"CL:{int(w['classroom']*100)}% PR:{int(w['professional']*100)}% TC:{int(w['tech']*100)}%",
            })
        cands.sort(key=lambda x: -x["effective_score"])
        by_subject[subj] = cands

    return {
        "school": {
            "name": school["name"], "type": school["type"], "city": school["city"],
            "subjects_needed": school["subjects_needed"],
            "matched_personalities": school["preferred_personalities"],
            "min_scores": mins, "threshold": thr,
        },
        "teachers_by_subject": by_subject,
    }


# ═══════════════════════════════════════════════════════════════════════
#  تحويل صفات الفرونت (wizard إنشاء الوظيفة) → إجابات الأسئلة الـ5
#  الفرونت بيرسل: teachingStyle, classroomEnergy, leadershipStyle,
#                 communicationStyle, problemSolving  (قِيَم مثل strict/calm)
# ═══════════════════════════════════════════════════════════════════════
# كل صفة من الفرونت → الاختيار المقابل في أسئلتنا الـ5
FRONTEND_TRAIT_MAP = {
    # discipline (teachingStyle)
    "strict":        ("discipline", "Strict / Structured"),
    "structured":    ("discipline", "Strict / Structured"),
    "flexible":      ("discipline", "Flexible / Adaptive"),
    "free-flowing":  ("discipline", "Flexible / Adaptive"),
    # energy (classroomEnergy)
    "calm":          ("energy", "Calm / Patient"),
    "balanced":      ("energy", "Calm / Patient"),
    "energetic":     ("energy", "Energetic / Dynamic"),
    "playful":       ("energy", "Energetic / Dynamic"),
    # leadership (leadershipStyle)
    "leader":        ("leadership", "Leader / Initiator"),
    "mentor":        ("leadership", "Leader / Initiator"),
    "supporter":     ("leadership", "Supporter / Team-player"),
    "collaborator":  ("leadership", "Supporter / Team-player"),
    # communication (communicationStyle)
    "direct":        ("communication", "Direct / Results-focused"),
    "formal":        ("communication", "Direct / Results-focused"),
    "empathetic":    ("communication", "Empathetic / Relationship-focused"),
    "casual":        ("communication", "Empathetic / Relationship-focused"),
    # approach (problemSolving)
    "analytical":    ("approach", "Analytical / Methodical"),
    "practical":     ("approach", "Analytical / Methodical"),
    "creative":      ("approach", "Creative / Innovative"),
    "innovative":    ("approach", "Creative / Innovative"),
}


def frontend_traits_to_answers(personality: dict) -> dict:
    """
    يحوّل صفات الـ wizard → إجابات الأسئلة الـ5.
    personality = {
      "teachingStyle": ["strict"], "classroomEnergy": ["calm"],
      "leadershipStyle": ["leader","mentor"], "communicationStyle": ["direct"],
      "problemSolving": ["analytical"]
    }
    (كل قيمة ممكن تكون list أو string)
    """
    answers = {}
    for field_values in (personality or {}).values():
        vals = field_values if isinstance(field_values, list) else [field_values]
        for v in vals:
            key = str(v).strip().lower()
            if key in FRONTEND_TRAIT_MAP:
                qid, choice = FRONTEND_TRAIT_MAP[key]
                # أول قيمة تكسب (الاختيار الأساسي للمدرسة)
                answers.setdefault(qid, choice)
    return answers
