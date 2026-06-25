# ═══════════════════════════════════════════════════════════════════════
#  NINJA-TEACHER · AI SERVICE  (Production FastAPI)
# ───────────────────────────────────────────────────────────────────────
#  يلفّ full_system_v4.py (الموديل الأقوى: تقييم + توصية 500 مدرسة)
#  ويحوّله إلى خدمة دائمة تُدرَّب مرة واحدة وتُحفظ على القرص.
#
#  Endpoints:
#    GET  /health                       فحص جاهزية
#    POST /ai/predict                   تقييم معلم كامل + توصية مدارس + SHAP
#    POST /ai/match                     مطابقة معلم↔مدارس مع فلاتر
#    GET  /recommend/teachers/{id}      ترتيب المعلمين لمدرسة
#    GET  /analytics/overview           إحصائيات النظام
#    GET  /analytics/predictions        توقعات لكل مادة
#
#  التشغيل:
#    cd ai_model
#    pip install -r requirements.txt
#    uvicorn ai_service:app --host 0.0.0.0 --port 8000 --workers 1
# ═══════════════════════════════════════════════════════════════════════

import os
import sys
import time
import logging
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger("ai_service")

import full_system_v4 as m  # noqa: E402  — منطق الموديل (لا يُدرّب عند الاستيراد)
import school_matcher as sm  # noqa: E402  — جسر أسئلة المدرسة ↔ الموديل
import personality_stage_engine as pse  # noqa: E402  — Enhancement: personality + stage scoring

CACHE = os.path.join(HERE, "model_cache.joblib")

# ── حالة الموديل في الذاكرة ──────────────────────────────────────────────
STATE = {"ens": None, "shap_exp": None, "le_dict": None, "csv_stats": None}

# خرائط مساعدة: عمود السؤال ← {نص الإجابة: index}
REVERSE_MAP = {q["col"]: {v: k for k, v in q["map"].items()} for q in m.QUESTIONS if q.get("col")}

# نصائح تحسين مبنية على أضعف العوامل (SHAP)
ADVICE = {
    "Tech use": "حسّن استخدام التكنولوجيا الفعّال داخل الفصل.",
    "Integrate AI": "ادمج أدوات الـ AI في التدريس نفسه، مش بس في التحضير.",
    "Disruptive": "تعامل مع الطلاب كثيري الحركة بشكل فردي، مش أمام الفصل.",
    "slow learners": "كيّف أسلوب الشرح حسب مستوى كل طالب.",
    "Disinterested": "صمّم أنشطة تفاعلية لرفع مشاركة الطلاب.",
    "Parent objections": "تواصل بهدوء مع أولياء الأمور واشرح معايير التقييم.",
    "High performers": "اعطِ المتفوقين تحديات إضافية بدل الانتظار.",
    "AI homework": "تبنَّ نهجًا متوازنًا تجاه الـ AI كأداة تعلّم.",
    "Experience": "اكتسب خبرة أكبر عبر برامج التدريب والإرشاد.",
    "NUM_LANGS": "تعلّم لغة إضافية (خصوصًا الإنجليزية) لتوسيع قدراتك.",
    "I disagreed with a fellow teacher or administrator (regarding teaching methods).":
        "طوّر مهارات حل الخلافات بشكل بنّاء مع الزملاء والإدارة.",
    "Engagement": "فكّر في مستوى تفاعل الطلاب واستراتيجيات إدارة الفصول الكبيرة.",
    "New skill": "التزم بالتعلّم المهني المستمر — مهارة جديدة كل فصل تحدث فرقًا.",
}


def _parse_experience(exp_val) -> int:
    """
    Convert the 'Experience' survey answer to integer years.
    Common values: '1-3 years', '3-5 years', '5+', '10', etc.
    Returns 0 on failure.
    """
    import re
    s = str(exp_val).strip().lower()
    if not s or s == "nan":
        return 0
    # Extract first number
    nums = re.findall(r"\d+", s)
    if nums:
        return int(nums[0])
    return 0


def _train_and_cache():
    log.info("⏳ Training model on real data (one time)...")
    t0 = time.time()
    ens, shap_exp, le_dict, csv_stats = m.load_and_train()
    STATE.update(ens=ens, shap_exp=shap_exp, le_dict=le_dict, csv_stats=csv_stats)
    try:
        joblib.dump(
            {"ens": ens, "le_dict": le_dict, "csv_stats": csv_stats,
             "schools": m.SCHOOLS, "teachers": m.REAL_TEACHERS_DB},
            CACHE,
        )
        log.info("💾 Cached model to %s", CACHE)
    except Exception as e:
        log.warning("Could not cache model: %s", e)
    log.info("✅ Model ready in %.1fs (schools=%d teachers=%d)",
             time.time() - t0, len(m.SCHOOLS), len(m.REAL_TEACHERS_DB))


def _load_from_cache():
    """تحميل سريع من الكاش. (SHAP يُعاد بناؤه لأنه غير قابل للحفظ بسهولة.)"""
    data = joblib.load(CACHE)
    STATE.update(ens=data["ens"], le_dict=data["le_dict"], csv_stats=data["csv_stats"])
    m.SCHOOLS = data["schools"]
    m.REAL_TEACHERS_DB = data["teachers"]
    # SHAP explainer: يُبنى من RF داخل الـ ensemble سريعًا
    try:
        import shap
        rf = data["ens"].calibrated_classifiers_[0].estimator.named_estimators_["rf"] \
            if hasattr(data["ens"], "calibrated_classifiers_") else None
        STATE["shap_exp"] = shap.TreeExplainer(rf) if rf is not None else None
    except Exception:
        STATE["shap_exp"] = None
    log.info("⚡ Loaded model from cache (schools=%d teachers=%d)",
             len(m.SCHOOLS), len(m.REAL_TEACHERS_DB))


@asynccontextmanager
async def lifespan(_app):
    use_cache = os.environ.get("AI_USE_CACHE", "1") == "1"
    if use_cache and os.path.exists(CACHE):
        try:
            _load_from_cache()
        except Exception as e:
            log.warning("Cache load failed (%s) — retraining", e)
            _train_and_cache()
    else:
        _train_and_cache()
    yield


from fastapi import FastAPI, Body, Header, HTTPException, Path, Query  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

app = FastAPI(title="Ninja-Teacher AI Service", version="2.0.0", lifespan=lifespan)

# CORS — يسمح لصفحة الاختبار / الـ Frontend بالاتصال مباشرة أثناء التطوير
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("AI_CORS", "*").split(","),
    allow_methods=["*"], allow_headers=["*"], allow_credentials=False,
)

API_KEY = os.environ.get("AI_SERVICE_KEY", "").strip()


def _check_key(x_api_key):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


def _answers_to_ua(answers: dict) -> dict:
    """يحوّل {اسم العمود: نص الإجابة} ← {رقم السؤال: index} الذي يفهمه الموديل."""
    ua = {}
    for q in m.QUESTIONS:
        col = q.get("col")
        if not col:
            continue
        val = answers.get(col)
        if val is None:
            continue
        idx = REVERSE_MAP[col].get(str(val).strip())
        if idx is not None:
            ua[q["id"]] = idx
    return ua


def _shap_factors(X):
    exp = STATE["shap_exp"]
    if exp is None:
        return [], []
    try:
        sv = exp.shap_values(X)
        if isinstance(sv, list):
            vals = sv[1][0]
        elif hasattr(sv, "ndim") and sv.ndim == 3:
            vals = sv[0, :, 1]
        else:
            vals = sv[0]
        s = pd.Series(vals, index=m.feature_cols)
        pos = s.sort_values(ascending=False).head(4)
        neg = s[s < 0].sort_values().head(3)
        en = m.EN_NAMES
        return (
            [{"feature": en.get(f, f), "key": f, "value": round(float(v), 4)} for f, v in pos.items()],
            [{"feature": en.get(f, f), "key": f, "value": round(float(v), 4)} for f, v in neg.items()],
        )
    except Exception as e:
        log.warning("SHAP failed: %s", e)
        return [], []


def _evaluate(answers: dict, top_n: int = 8):
    """التقييم الكامل: أبعاد + قرار + ثقة + شخصية + عوامل + توصية مدارس."""
    ua = _answers_to_ua(answers)
    cl, pr, tc, overall = m.compute_dimension_scores(ua)
    ptype = m.get_teacher_personality_type(cl, pr, tc, ua)
    pinfo = m.PERSONALITY_TYPES.get(ptype, {})

    X = m.build_feature_row(ua, STATE["le_dict"])
    proba = STATE["ens"].predict_proba(X)[0]
    pred = int(np.argmax(proba))
    confidence = round(float(max(proba)) * 100, 1)

    pos, neg = _shap_factors(X)
    seen, tips = set(), []
    for f in [d["key"] for d in neg] + [d["key"] for d in pos]:
        if f in ADVICE and f not in seen and len(tips) < 3:
            tips.append(ADVICE[f]); seen.add(f)

    # نتائج المواد
    subjects = {}
    for subj in ["KG", "Arabic", "Math", "Science", "English", "Social"]:
        sc, accepted, strengths, weaknesses, _ = m.get_subject_result(cl, pr, tc, subj, STATE["csv_stats"])
        subjects[subj] = {"score": sc, "accepted": bool(accepted)}

    schools = m.recommend_schools_for_teacher(cl, pr, tc, ptype, top_n=top_n)

    # ── Enhancement 1 & 2: apply personality + stage factors to school recommendations ──
    teacher_stage_raw = answers.get("Teacher for the stage", "")
    teacher_stage = pse.detect_teacher_stage(teacher_stage_raw)
    teacher_exp_years = _parse_experience(answers.get("Experience", "0"))

    # Derive trait profile once from the actual survey answers (ua dict)
    # This is the key change: traits are now computed from question answers,
    # not looked up from a predefined personality label.
    trait_profile = pse.extract_trait_scores(ua)

    enhanced_schools = []
    for s in schools:
        job_stage = pse.detect_stage(
            job_title=s.get("school_name", ""),
            job_description=s.get("notes", ""),
        )
        enhancement = pse.enhance_recommendation(
            existing_score=float(s["effective_score"]),
            teacher_personality_type=ptype,   # kept for display only
            teacher_stage=teacher_stage,
            teacher_experience_years=teacher_exp_years,
            teacher_cl_score=cl,
            teacher_pr_score=pr,
            teacher_tc_score=tc,
            job_stage=job_stage,
            trait_profile=trait_profile,       # pass pre-computed traits
        )
        enhanced_schools.append({
            "school_id": s["school_id"],
            "school_name": s["school_name"],
            "school_type": s["school_type"],
            "city": s["city"],
            "match_score": s["effective_score"],
            "enhanced_score": enhancement["final_score"],
            "status": s["status"],
            "personality_match": s["personality_match"],
            "matched_subjects": [{"subject": x[0], "score": x[1]} for x in s["matched_subjects"]],
            "personality_match_score": enhancement["personality_match"]["raw_score"],
            "personality_match_verdict": enhancement["personality_match"]["verdict"],
            "stage_match_score": enhancement["stage_match"]["raw_score"],
            "stage_match_verdict": enhancement["stage_match"]["verdict"],
            "personality_factor": enhancement["personality_factor"],
            "stage_factor": enhancement["stage_factor"],
        })

    enhanced_schools.sort(key=lambda x: -x["enhanced_score"])

    decision = "ACCEPTED" if pred == 1 else "REJECTED"
    # Score-based override: rule-based dimension score takes precedence over ML ensemble
    # when the signal is strong enough, avoiding demographic bias from Age/Gender features.
    if overall >= 75:
        decision = "ACCEPTED"
    elif overall < 50:
        decision = "REJECTED"
    return {
        "decision": decision,
        "confidence": confidence,
        "raw_score": overall,
        "reason": ("هذا المعلم يستوفي معايير القبول." if decision == "ACCEPTED"
                   else "هذا المعلم لا يستوفي معايير القبول حاليًا."),
        "overall_score": overall,
        "evaluationScore": overall,
        "evaluationLevel": "Excellent" if overall >= 80 else "Good" if overall >= 60 else "Average" if overall >= 40 else "Below Average",
        "dimensions": {"classroom": cl, "professional": pr, "tech": tc},
        "personality": {
            "type": ptype,
            "label": pinfo.get("label", ptype),
            "arabic": pinfo.get("arabic", ""),
            "description": pinfo.get("desc", ""),
            "growth": pinfo.get("growth", ""),
        },
        "positive_factors": pos,
        "negative_factors": neg,
        "suggestions": tips,
        "subjects": subjects,
        # Enhancement metadata
        "teacher_stage": teacher_stage,
        "teacher_experience_years": teacher_exp_years,
        "trait_profile": trait_profile.to_dict(),
        "recommended_schools": enhanced_schools,
    }


# ═══════════════════════════════ ENDPOINTS ═══════════════════════════════
@app.post("/school/match-from-wizard")
def school_match_from_wizard(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    يستقبل نفس صيغة wizard إنشاء الوظيفة بالظبط:
    payload = {
      "jobDetails": {"subject":"Math","city":"Cairo","schoolType":"Private",...},
      "personality": {"teachingStyle":["strict"],"classroomEnergy":["calm"],
                      "leadershipStyle":["leader"],"communicationStyle":["direct"],
                      "problemSolving":["analytical"]},
      "limit": 10
    }
    يحوّل الصفات → إجابات الأسئلة الـ5 → معلمين مقبولين بالسكور.
    """
    _check_key(x_api_key)
    job = payload.get("jobDetails") or {}
    answers = sm.frontend_traits_to_answers(payload.get("personality") or {})

    subj = job.get("subject") or job.get("Subject")
    subjects = [subj] if subj else (payload.get("subjects_needed") or ["Math"])

    inner = {
        "school_name": job.get("schoolName") or job.get("title") or "School",
        "city": job.get("city") or job.get("location") or "Cairo",
        "type": job.get("schoolType") or job.get("type") or "Private",
        "subjects_needed": subjects,
        "answers": answers,
        "limit": int(payload.get("limit", 10)),
    }
    try:
        result = sm.rank_teachers_for_live_school(inner)
    except Exception as e:
        log.exception("wizard match failed")
        raise HTTPException(status_code=422, detail=str(e))

    limit = int(payload.get("limit", 10))
    out = {s: c[:limit] for s, c in result["teachers_by_subject"].items()}
    total = sum(len(c) for c in result["teachers_by_subject"].values())
    return {**result, "teachers_by_subject": out, "total_accepted": total,
            "derived_answers": answers}


@app.post("/school/match-teachers")
def school_match_teachers(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    يطابق المعلمين لمدرسة حيّة بناءً على إجاباتها الـ5 (الصفات) + موادها.
    payload = {
      "school_name": "Al-Nour", "city": "Cairo", "type": "Private",
      "subjects_needed": ["Math","English"],
      "answers": {"discipline":"Strict / Structured","energy":"Calm / Patient",
                  "leadership":"Leader / Initiator","communication":"Direct / Results-focused",
                  "approach":"Analytical / Methodical"},
      "limit": 10
    }
    يرجّع المعلمين المقبولين (status accepted) مرتبين بالسكور + بياناتهم.
    """
    _check_key(x_api_key)
    try:
        result = sm.rank_teachers_for_live_school(payload)
    except Exception as e:
        log.exception("school match failed")
        raise HTTPException(status_code=422, detail=str(e))

    limit = int(payload.get("limit", 10))
    out = {subj: cands[:limit] for subj, cands in result["teachers_by_subject"].items()}
    total = sum(len(c) for c in result["teachers_by_subject"].values())
    return {**result, "teachers_by_subject": out, "total_accepted": total}


@app.get("/school/questions")
def school_questions(x_api_key: str = Header(default=None, alias="X-API-Key")):
    """الأسئلة الـ5 الخاصة بالمدرسة وخياراتها (للفرونت لو احتاجها)."""
    _check_key(x_api_key)
    return {"questions": [
        {"id": q["id"], "question": q["question"], "options": list(q["options"].keys())}
        for q in sm.SCHOOL_QUESTIONS
    ]}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": STATE["ens"] is not None,
            "schools": len(m.SCHOOLS), "teachers": len(m.REAL_TEACHERS_DB)}


@app.post("/ai/predict")
def ai_predict(answers: dict = Body(...), x_api_key: str = Header(default=None, alias="X-API-Key")):
    """تقييم معلم كامل بناءً على إجابات الاستبيان (نفس صيغة الـ Backend)."""
    _check_key(x_api_key)
    required = [q["col"] for q in m.QUESTIONS if q.get("col")]
    missing = [f for f in required if not answers.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")
    try:
        return _evaluate(answers)
    except Exception as e:
        log.exception("predict failed")
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/ai/match")
def ai_match(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    مطابقة معلم ↔ مدارس مع فلاتر اختيارية.
    payload = { "answers": {...}, "city": "Cairo"?, "type": "Private"?, "subject": "Math"?, "top_n": 10? }
    """
    _check_key(x_api_key)
    answers = payload.get("answers") or {}
    required = [q["col"] for q in m.QUESTIONS if q.get("col")]
    if [f for f in required if not answers.get(f)]:
        raise HTTPException(status_code=400, detail="answers incomplete")

    full = _evaluate(answers, top_n=500)
    schools = full["recommended_schools"]
    city = payload.get("city"); stype = payload.get("type"); subj = payload.get("subject")
    if city:
        schools = [s for s in schools if s["city"].lower() == str(city).lower()]
    if stype:
        schools = [s for s in schools if s["school_type"].lower() == str(stype).lower()]
    if subj:
        schools = [s for s in schools if any(x["subject"] == subj for x in s["matched_subjects"])]
    top_n = int(payload.get("top_n", 10))
    return {**full, "recommended_schools": schools[:top_n], "total_matches": len(schools)}


@app.get("/recommend/teachers/{school_id}")
def recommend_teachers(
    school_id: str = Path(...),
    limit: int = Query(10, ge=1, le=100),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """ترتيب أفضل المعلمين لمدرسة معيّنة، مقسّمين حسب المادة."""
    _check_key(x_api_key)
    if school_id not in m.SCHOOLS:
        raise HTTPException(status_code=404, detail="School not found")
    ranked = m.rank_teachers_for_school(school_id)
    out = {subj: [
        {"teacher_id": t["teacher_id"], "name": t["name"], "match_score": t["effective_score"],
         "classroom": t["classroom"], "professional": t["professional"], "tech": t["tech"],
         "personality_type": t["personality_type"], "personality_match": t["personality_match"]}
        for t in teachers[:limit]
    ] for subj, teachers in ranked.items()}
    school = m.SCHOOLS[school_id]
    return {"school": {"id": school_id, "name": school["name"], "type": school["type"], "city": school["city"]},
            "teachers_by_subject": out}


@app.get("/analytics/overview")
def analytics_overview(x_api_key: str = Header(default=None, alias="X-API-Key")):
    """إحصائيات النظام من الداتا الحقيقية (csv_stats + المدارس + المعلمين)."""
    _check_key(x_api_key)
    stats = STATE["csv_stats"] or {}

    # توزيع أنواع المدارس + أعلى المدن
    types, cities, subj_demand = {}, {}, {}
    for s in m.SCHOOLS.values():
        types[s["type"]] = types.get(s["type"], 0) + 1
        cities[s["city"]] = cities.get(s["city"], 0) + 1
        for sub in s["subjects_needed"]:
            subj_demand[sub] = subj_demand.get(sub, 0) + 1

    # نسبة المعلمين المؤهلين (overall>=62) كتقريب لمعدل القبول
    quals = sum(1 for t in m.REAL_TEACHERS_DB
                if (t["classroom"] + t["professional"] + t["tech"]) / 3 >= 62)
    total_t = max(len(m.REAL_TEACHERS_DB), 1)

    subjects = [{
        "subject": k,
        "avg_evaluation": round(v.get("avg_eval", 0), 2),
        "avg_tech": round(v.get("avg_tech", 0), 2),
        "pct_excellent": round(v.get("pct_excel", 0), 1),
        "count": int(v.get("count", 0)),
    } for k, v in stats.items()]

    return {
        "cards": {
            "total_schools": len(m.SCHOOLS),
            "total_teachers": len(m.REAL_TEACHERS_DB),
            "subjects_tracked": len(stats),
            "acceptance_rate": round(quals / total_t * 100, 1),
            "hiring_success_rate": round(quals / total_t * 100, 1),
        },
        "subjects_analysis": sorted(subjects, key=lambda x: -x["avg_evaluation"]),
        "top_locations": sorted(
            [{"city": c, "schools": n} for c, n in cities.items()],
            key=lambda x: -x["schools"])[:8],
        "school_types": [{"type": t, "count": n} for t, n in sorted(types.items(), key=lambda x: -x[1])],
        "subject_demand": sorted(
            [{"subject": s, "schools_needing": n} for s, n in subj_demand.items()],
            key=lambda x: -x["schools_needing"]),
        "ai_insights": [
            f"أعلى مادة في جودة التدريس: {max(stats, key=lambda k: stats[k].get('avg_eval', 0))}" if stats else "لا توجد بيانات",
            f"النوع الأكثر طلبًا للمدارس: {max(types, key=types.get)}" if types else "",
            f"نسبة المعلمين المؤهلين الحاليين ≈ {round(quals/total_t*100,1)}%",
        ],
    }


@app.get("/analytics/predictions")
def analytics_predictions(x_api_key: str = Header(default=None, alias="X-API-Key")):
    """توقّع بسيط لاتجاه جودة كل مادة بناءً على المتوسطات الحالية."""
    _check_key(x_api_key)
    stats = STATE["csv_stats"] or {}
    preds = []
    for k, v in stats.items():
        cur = v.get("avg_eval", 0)
        trend = "صاعد" if v.get("pct_excel", 0) > 18 else ("مستقر" if cur >= 7 else "يحتاج تحسين")
        preds.append({"subject": k, "current_avg": round(cur, 2),
                      "projected_next_term": round(min(10, cur * 1.03), 2), "trend": trend})
    return {"predictions": sorted(preds, key=lambda x: -x["current_avg"])}


@app.exception_handler(HTTPException)
def _exc(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"status": "fail", "error": exc.detail})


# ═══════════════════════════════════════════════════════════════════════
#  NEW ENDPOINTS — Enhancement 1, 2, 3
# ═══════════════════════════════════════════════════════════════════════

@app.post("/ai/personality-stage-score")
def personality_stage_score(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    Enhancement 1 & 2: Compute Personality Match Score + Stage Match Score
    for a teacher↔job pair.

    Trait scores are derived from actual survey answers (ua dict) when provided.
    If ua is omitted, falls back to a neutral 50/100 profile for all traits.

    payload = {
      // Option A — full survey answers (recommended, gives true trait scores)
      "ua": {1: 2, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0, 7: 3, 8: 3,
             9: 2, 12: 3, 13: 2, 14: 2},

      // Option B — pre-computed trait scores (if ua not available)
      "trait_scores": {
        "patience": 85, "empathy": 90, "creativity": 70,
        "leadership": 60, "communication": 80, "discipline": 55,
        "analytical_thinking": 65, "child_engagement": 88
      },

      // Job / teacher context
      "teacher_stage":            "primary",
      "teacher_experience_years": 4,
      "teacher_cl_score":         75,
      "teacher_pr_score":         68,
      "teacher_tc_score":         60,
      "job_title":                "Primary Mathematics Teacher",
      "job_stage":                "primary",
      "existing_score":           80
    }

    Returns:
      {
        "final_score":       float,
        "existing_score":    float,
        "personality_match": { "raw_score", "factor", "verdict",
                               "trait_contributions", "strongest_traits", ... },
        "stage_match":       { "raw_score", "factor", "verdict", ... },
        "trait_profile":     { "traits": {trait: score}, "coverage": {...} },
      }
    """
    _check_key(x_api_key)

    existing_score    = float(payload.get("existing_score", 70))
    t_stage_raw       = str(payload.get("teacher_stage", ""))
    teacher_stage     = pse.detect_teacher_stage(t_stage_raw)
    if teacher_stage == "unknown" and t_stage_raw in pse.STAGE_PROFILES:
        teacher_stage = t_stage_raw

    teacher_exp_years = int(payload.get("teacher_experience_years", 0))
    teacher_cl        = int(payload.get("teacher_cl_score", 0))
    teacher_pr        = int(payload.get("teacher_pr_score", 0))
    teacher_tc        = int(payload.get("teacher_tc_score", 0))

    j_stage_raw = str(payload.get("job_stage", ""))
    job_stage   = pse.detect_teacher_stage(j_stage_raw)
    if job_stage == "unknown":
        job_stage = pse.detect_stage(
            job_title=str(payload.get("job_title", "")),
            job_description=str(payload.get("job_description", "")),
            job_stage_field=j_stage_raw,
        )

    # Build trait profile: ua → derive, or use provided trait_scores, or neutral
    trait_profile = None
    if "ua" in payload:
        # ua keys may arrive as strings from JSON; convert to int
        raw_ua = payload["ua"]
        ua_int = {int(k): int(v) for k, v in raw_ua.items()}
        trait_profile = pse.extract_trait_scores(ua_int)
    elif "trait_scores" in payload:
        ts = payload["trait_scores"]
        scores   = {t: float(ts.get(t, 50)) for t in pse.TRAITS}
        coverage = {t: 1 if t in ts else 0 for t in pse.TRAITS}
        raw      = {t: scores[t] / 100.0 for t in pse.TRAITS}
        trait_profile = pse.TraitProfile(scores, coverage, raw)

    result = pse.enhance_recommendation(
        existing_score=existing_score,
        teacher_personality_type="",        # not used in scoring
        teacher_stage=teacher_stage,
        teacher_experience_years=teacher_exp_years,
        teacher_cl_score=teacher_cl,
        teacher_pr_score=teacher_pr,
        teacher_tc_score=teacher_tc,
        job_stage=job_stage,
        trait_profile=trait_profile,
    )
    return result


@app.post("/ai/recommend-jobs-for-teacher")
def recommend_jobs_for_teacher(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    Enhancement 3: Teacher-to-Job Recommendations.

    Receives the teacher's profile and a list of job postings,
    returns the jobs ranked by combined relevance + enhanced recommendation score.

    payload = {
      "teacher": {
        "teacher_id":           123,
        "specialization":       "Mathematics",
        "stage":                "Secondary",
        "experience_years":     5,
        "personality_type":     "digital_innovator",
        "cl_score":             78,
        "pr_score":             70,
        "tc_score":             82,
        "existing_match_scores": { "3-12": 85, "5-7": 70 }   # optional pre-computed scores
      },
      "jobs": [
        {
          "id":             "3-12",
          "school_id":      3,
          "job_id":         12,
          "title":          "Secondary Mathematics Teacher",
          "specialization": "Mathematics",
          "stage":          "Secondary",
          "description":    "..."
        },
        ...
      ],
      "limit": 10,
      "min_relevance": 40   # filter out jobs below this relevance score (default 40)
    }

    Returns:
      {
        "recommended_jobs": [
          {
            "job_id":             "3-12",
            "relevance_score":    85,
            "existing_score":     80,
            "final_score":        87.5,
            "personality_factor": 1.10,
            "stage_factor":       1.05,
            "subject_match":      "exact",
            "stage_relevant":     true,
            "personality_verdict":"good",
            "stage_verdict":      "excellent",
          }, ...
        ],
        "total_evaluated": N,
        "total_returned":  M,
      }
    """
    _check_key(x_api_key)

    teacher = payload.get("teacher") or {}
    jobs = payload.get("jobs") or []
    limit = int(payload.get("limit", 10))
    min_relevance = int(payload.get("min_relevance", 40))

    teacher_spec      = str(teacher.get("specialization", ""))
    teacher_stage_raw = str(teacher.get("stage", ""))
    teacher_stage     = pse.detect_teacher_stage(teacher_stage_raw)
    teacher_exp       = int(teacher.get("experience_years", 0))
    teacher_cl        = int(teacher.get("cl_score", 0))
    teacher_pr        = int(teacher.get("pr_score", 0))
    teacher_tc        = int(teacher.get("tc_score", 0))
    existing_scores   = teacher.get("existing_match_scores") or {}

    # Build teacher trait profile from ua (recommended) or trait_scores (fallback)
    teacher_trait_profile = None
    if "ua" in teacher:
        raw_ua = teacher["ua"]
        ua_int = {int(k): int(v) for k, v in raw_ua.items()}
        teacher_trait_profile = pse.extract_trait_scores(ua_int)
    elif "trait_scores" in teacher:
        ts = teacher["trait_scores"]
        scores   = {t: float(ts.get(t, 50)) for t in pse.TRAITS}
        coverage = {t: 1 if t in ts else 0 for t in pse.TRAITS}
        raw      = {t: scores[t] / 100.0 for t in pse.TRAITS}
        teacher_trait_profile = pse.TraitProfile(scores, coverage, raw)

    results = []
    for job in jobs:
        job_id    = str(job.get("id", f"{job.get('school_id','?')}-{job.get('job_id','?')}"))
        job_title = str(job.get("title", ""))
        job_spec  = str(job.get("specialization", ""))
        job_desc  = str(job.get("description", ""))
        job_stage_raw = str(job.get("stage", ""))

        # Detect job stage
        job_stage = pse.detect_teacher_stage(job_stage_raw)
        if job_stage == "unknown":
            job_stage = pse.detect_stage(
                job_title=job_title,
                job_description=job_desc,
                job_stage_field=job_stage_raw,
            )

        # Subject + stage relevance
        relevance = pse.compute_job_relevance_score(
            teacher_specialization=teacher_spec,
            teacher_stage=teacher_stage,
            job_title=job_title,
            job_specialization=job_spec,
            job_stage=job_stage,
            job_description=job_desc,
        )

        if relevance["relevance_score"] < min_relevance:
            continue

        existing_score = float(existing_scores.get(job_id, 70))

        # Apply personality + stage enhancement with trait profile
        enhancement = pse.enhance_recommendation(
            existing_score=existing_score,
            teacher_personality_type="",
            teacher_stage=teacher_stage,
            teacher_experience_years=teacher_exp,
            teacher_cl_score=teacher_cl,
            teacher_pr_score=teacher_pr,
            teacher_tc_score=teacher_tc,
            job_stage=job_stage,
            trait_profile=teacher_trait_profile,
        )

        results.append({
            "job_id":               job_id,
            "school_id":            job.get("school_id"),
            "title":                job_title,
            "specialization":       job_spec,
            "detected_stage":       job_stage,
            "relevance_score":      relevance["relevance_score"],
            "subject_match":        relevance["subject_match"],
            "stage_relevant":       relevance["stage_relevant"],
            "existing_score":       existing_score,
            "final_score":          enhancement["final_score"],
            "personality_factor":   enhancement["personality_factor"],
            "stage_factor":         enhancement["stage_factor"],
            "personality_match_score":  enhancement["personality_match"]["raw_score"],
            "personality_verdict":  enhancement["personality_match"]["verdict"],
            "stage_match_score":    enhancement["stage_match"]["raw_score"],
            "stage_verdict":        enhancement["stage_match"]["verdict"],
        })

    # Sort by final_score descending, then by relevance_score as tiebreaker
    results.sort(key=lambda x: (-x["final_score"], -x["relevance_score"]))

    return {
        "recommended_jobs": results[:limit],
        "total_evaluated":  len(jobs),
        "total_returned":   len(results[:limit]),
        "teacher_stage":    teacher_stage,
    }


@app.post("/ai/extract-traits")
def extract_traits(
    payload: dict = Body(...),
    x_api_key: str = Header(default=None, alias="X-API-Key"),
):
    """
    Derive the 8 personality trait scores directly from a teacher's survey
    answers (ua dict).

    payload = {
      "ua": {
        "1":  2,   // Q1 answer index (how to handle disruptive student)
        "2":  0,   // Q2 answer index (slow learner)
        "3":  1,   // Q3 answer index (unmotivated students)
        "4":  0,   // Q4 answer index (parent objection)
        "5":  0,   // Q5 answer index (withdrawn student)
        "6":  0,   // Q6 answer index (conflict with admin)
        "7":  3,   // Q7 answer index (class engagement)
        "8":  3,   // Q8 answer index (new skill)
        "9":  2,   // Q9 answer index (gifted student)
        "12": 3,   // Q12 answer index (AI homework)
        "13": 2,   // Q13 answer index (AI integration)
        "14": 2    // Q14 answer index (AI app priority)
      }
    }

    Returns:
      {
        "traits": {
          "patience": 87.5,
          "empathy": 91.7,
          "creativity": 72.5,
          "leadership": 63.3,
          "communication": 80.0,
          "discipline": 45.0,
          "analytical_thinking": 68.3,
          "child_engagement": 88.3
        },
        "trait_labels": {
          "patience": "Patience",
          ...
        },
        "coverage": {
          "patience": 3,   // derived from 3 questions
          ...
        }
      }
    """
    _check_key(x_api_key)
    raw_ua = payload.get("ua") or {}
    if not raw_ua:
        raise HTTPException(status_code=400, detail="'ua' dict is required")
    ua_int = {int(k): int(v) for k, v in raw_ua.items()}
    trait_profile = pse.extract_trait_scores(ua_int)
    return trait_profile.to_dict()


@app.get("/ai/stage-profiles")
def get_stage_profiles(x_api_key: str = Header(default=None, alias="X-API-Key")):
    """
    Returns the personality profiles required per educational stage.
    Useful for the frontend to explain why a teacher's score differs across stages.
    """
    _check_key(x_api_key)
    # Stage requirements derived from STAGE_REQUIREMENTS (normalised weights)
    return {
        stage_key: {
            "label": profile["label"],
            "dimension_focus": profile["dimension_weights"],
            "min_experience_preferred": profile["min_experience_preferred"],
            # Trait requirements come from the normalised STAGE_REQUIREMENTS dict
            "trait_requirements": {
                trait: round(weight, 4)
                for trait, weight in pse.STAGE_REQUIREMENTS.get(stage_key, {}).items()
            },
            # Top 3 traits by importance for this stage
            "top_traits": sorted(
                pse.STAGE_REQUIREMENTS.get(stage_key, {}).items(),
                key=lambda x: -x[1]
            )[:3],
        }
        for stage_key, profile in pse.STAGE_PROFILES.items()
    }
