import warnings, sys; warnings.filterwarnings('ignore'); sys.path.insert(0, '.')
from fastapi.testclient import TestClient
import ai_service
def hr(t): print("\n" + "="*58 + "\n  " + t + "\n" + "="*58)
with TestClient(ai_service.app) as c:
    hr("Health - شريط الحالة")
    print("  ", c.get("/health").json())
    hr("تبويب 1: تقييم معلم + توصية")
    ans = {q["col"]: list(q["map"].values())[-1] for q in ai_service.m.QUESTIONS if q.get("col")}
    ans.update({"Disruptive":"Talk individually","Parent objections":"Explain calmly",
        "I noticed that one of the students' performance levels started to decline and he became withdrawn.":"Talk support",
        "I disagreed with a fellow teacher or administrator (regarding teaching methods).":"Present calmly",
        "Age":"26-30","Experience":"5-10 years","Gender":"Female","Teacher for the stage":"Primary","Languages":"Arabic;English","chronic disease":"No"})
    d = c.post("/ai/predict", json=ans).json()
    print("   decision:", d["decision"], "| conf:", d["confidence"], "| score:", d["overall_score"])
    print("   dims: CL%d PR%d TC%d" % (d["dimensions"]["classroom"], d["dimensions"]["professional"], d["dimensions"]["tech"]))
    print("   personality:", d["personality"]["label"])
    for s in d["recommended_schools"][:3]:
        print("      %d%% %s · %s" % (s["match_score"], s["school_name"][:36], s["city"]))
    hr("تبويب 2: Analytics")
    a = c.get("/analytics/overview").json(); cc = a["cards"]
    print("   cards: schools=%d teachers=%d accept=%s%%" % (cc["total_schools"], cc["total_teachers"], cc["acceptance_rate"]))
    print("   top subjects:", ", ".join("%s(%s)" % (s["subject"], s["avg_evaluation"]) for s in a["subjects_analysis"][:3]))
    hr("تبويب 4: اسئلة المدرسة الـ5 -> مطابقة AI")
    for x in c.get("/school/questions").json()["questions"]:
        print("   -", x["id"], ":", " / ".join(x["options"]))
    m = c.post("/school/match-teachers", json={"school_name":"Al-Nour","city":"Cairo","type":"Private","subjects_needed":["Math"],
        "answers":{"discipline":"Strict / Structured","energy":"Calm / Patient","leadership":"Leader / Initiator",
                   "communication":"Direct / Results-focused","approach":"Analytical / Methodical"},"limit":3}).json()
    print("   matched_personalities:", m["school"]["matched_personalities"])
    print("   total_accepted:", m["total_accepted"])
    for t in m["teachers_by_subject"]["Math"]:
        print("      %d%% %s CL%d PR%d TC%d %s%s" % (t["effective_score"], t["name"], t["classroom"], t["professional"], t["tech"], t["personality_type"], " *" if t["personality_match"] else ""))
print("\nDEMO_DONE")
