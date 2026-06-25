# ═══════════════════════════════════════════════════════════════════════
# 🎓  TEACHER EVALUATION + SCHOOL RECOMMENDATION SYSTEM  v4.0
#     يدعم داتا المدارس الحقيقية (500 مدرسة)
# ═══════════════════════════════════════════════════════════════════════

import warnings
warnings.filterwarnings('ignore')
import os, sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import shap

# ═══════════════════════════════════════════════════════════════════════
# 1️⃣  COLUMN NAMES
# ═══════════════════════════════════════════════════════════════════════
C_TECH='Tech use'; C_AI='Integrate AI'; C_DISRUPT='Disruptive'
C_WEAK='slow learners'; C_UNMOTIV='Disinterested'; C_PARENT='Parent objections'
C_GIFTED='High performers'; C_AICHEAT='AI homework'; C_AIAPP='AI app concerns'
C_CONFLICT='I disagreed with a fellow teacher or administrator (regarding teaching methods).'
C_AGE='Age'; C_EXP='Experience'; C_GENDER='Gender'; C_STAGE='Teacher for the stage'
C_LANGS='Languages'; C_SALARY='Compensation'; C_CHRONIC='chronic disease'
C_WITHDRAWN="I noticed that one of the students' performance levels started to decline and he became withdrawn."
C_ENGAGESIZE='Engagement'; C_NEWSKILL='New skill'

EN_NAMES = {
    C_TECH:'Technology usage', C_AI:'AI tool integration',
    C_DISRUPT:'Handling disruptive students', C_WEAK:'Teaching weaker students',
    C_UNMOTIV:'Engaging unmotivated students', C_PARENT:'Handling parent objections',
    C_GIFTED:'Handling gifted students', C_AICHEAT:'Response to AI-assisted homework',
    C_AIAPP:'Priority when using new AI app', C_CONFLICT:'Handling conflict with colleagues',
    C_AGE:'Age', C_EXP:'Years of experience', C_GENDER:'Gender',
    C_STAGE:'Teaching stage', 'NUM_LANGS':'Number of languages spoken',
    'SALARY_SCORE':'Salary satisfaction', 'CHRONIC_INT':'Chronic illness',
    'WITHDRAWN_SC':'Handling withdrawn students',
    C_ENGAGESIZE:'Student engagement & class size', C_NEWSKILL:'New skill learned',
}

feature_cols = [
    C_AGE, C_EXP, 'NUM_LANGS', 'SALARY_SCORE', 'CHRONIC_INT', 'WITHDRAWN_SC',
    C_GENDER, C_STAGE, C_TECH, C_DISRUPT, C_WEAK, C_UNMOTIV, C_PARENT,
    C_GIFTED, C_AICHEAT, C_AI, C_AIAPP, C_CONFLICT, C_ENGAGESIZE, C_NEWSKILL,
]

# ═══════════════════════════════════════════════════════════════════════
# 2️⃣  SUBJECT MAPPING  (داتا المدارس → أسماء الكود)
# ═══════════════════════════════════════════════════════════════════════
# الداتا الجديدة بتستخدم أسماء مختلفة — هنعمل mapping موحد
SUBJECT_MAP = {
    'Mathematics':       'Math',
    'Arabic Language':   'Arabic',
    'English Language':  'English',
    'Science':           'Science',
    'Sciences':          'Science',
    'Computer Science':  'Science',
    'Physics':           'Science',
    'Chemistry':         'Science',
    'Biology':           'Science',
    'Social Studies':    'Social',
    'History':           'Social',
    'Geography':         'Social',
    'Civics':            'Social',
    'Islamic Studies':   'Arabic',
    'Religion':          'Arabic',
    'French Language':   'English',
    'Art':               'KG',
    'Arts':              'KG',
    'Music':             'KG',
    'Drama':             'KG',
    'Physical Education':'KG',
    'Robotics':          'Science',
}

# personality mapping من داتا المدارس → personality types بتاعت الكود
PERSONALITY_MAP = {
    'Tech-Savvy':        'digital_innovator',
    'Innovative':        'digital_innovator',
    'Analytical':        'digital_innovator',
    'Clear Communicator':'adaptive_coach',
    'Communicative':     'adaptive_coach',
    'Flexible':          'adaptive_coach',
    'Student-Friendly':  'emotional_leader',
    'Empathetic':        'emotional_leader',
    'Motivating':        'emotional_leader',
    'Patient':           'emotional_leader',
    'Disciplined':       'methodical_professional',
    'Organized':         'methodical_professional',
    'Punctual':          'methodical_professional',
    'Professional':      'methodical_professional',
    'Dedicated':         'methodical_professional',
    'Self-Developing':   'developing_educator',
    'Collaborative':     'adaptive_coach',
    'Creative':          'adaptive_coach',
}

# ═══════════════════════════════════════════════════════════════════════
# 3️⃣  LOAD SCHOOLS FROM CSV/XLSX
# ═══════════════════════════════════════════════════════════════════════
SCHOOLS = {}  # هيتملى من الداتا

def load_schools(path=None):
    """يحمّل المدارس من CSV أو XLSX ويبني dict جاهز"""
    global SCHOOLS

    # ابحث عن الملف
    candidates = [
        path,
        'schools_500_final.xlsx',
        'schools_500_dataset.csv',
        'schools_500_final (1).xlsx',
        'schools_500_dataset (1).csv',
    ]
    found = None
    for c in candidates:
        if c and os.path.exists(c):
            found = c
            break

    if not found:
        print("⚠️  No schools data file found — using built-in sample schools")
        SCHOOLS = _builtin_schools()
        return

    print(f"   📂 Loading schools from: {found}")
    if found.endswith('.xlsx'):
        df = pd.read_excel(found)
    else:
        df = pd.read_csv(found)

    df.columns = [c.strip() for c in df.columns]
    SCHOOLS = {}

    for _, row in df.iterrows():
        sid = str(row['school_id']).strip()

        # parse subjects
        raw_subjs = [s.strip() for s in str(row['subjects_needed']).split(',')]
        mapped_subjs = list(dict.fromkeys(
            SUBJECT_MAP.get(s, s) for s in raw_subjs
        ))
        # فلتر للمواد اللي عندنا criteria ليها
        known = {'Math','Arabic','English','Science','KG','Social'}
        mapped_subjs = [s for s in mapped_subjs if s in known]
        if not mapped_subjs:
            mapped_subjs = ['Math']  # fallback

        # parse personalities
        raw_pers = [p.strip() for p in str(row.get('preferred_personalities','')).split(',')]
        mapped_pers = list(dict.fromkeys(
            PERSONALITY_MAP.get(p, 'adaptive_coach') for p in raw_pers if p
        ))
        if not mapped_pers:
            mapped_pers = ['adaptive_coach']

        # weights بتتحدد حسب نوع المدرسة
        school_type = str(row.get('type','')).strip()
        subj_weights = _calc_weights(mapped_subjs, school_type)

        SCHOOLS[sid] = {
            'name':                  str(row['school_name']).strip(),
            'type':                  school_type,
            'city':                  str(row['city']).strip(),
            'subjects_needed':       mapped_subjs,
            'subject_weights':       subj_weights,
            'min_scores': {
                # Cap على قيم واقعية من توزيع المعلمين
                # p75: CL=94 PR=81 TC=79 — cap عند p75
                'classroom':   min(int(row.get('min_classroom',   60)), 90),
                'professional':min(int(row.get('min_professional', 60)), 82),
                'tech':        min(int(row.get('min_tech',         55)), 80),
            },
            'preferred_personalities': mapped_pers,
            'school_threshold':      int(row.get('threshold', 62)),
            'notes':                 str(row.get('notes','')).strip(),
        }

    print(f"   ✅ {len(SCHOOLS)} schools loaded")


def _calc_weights(subjects, school_type):
    """
    ✅ Data-driven weights من correlations الـ 1500 CSV:
    Base weights × school_type multiplier → normalize → clamp
    """
    BASE = {
        'Arabic':  {'classroom': 0.274, 'professional': 0.421, 'tech': 0.305},
        'English': {'classroom': 0.255, 'professional': 0.363, 'tech': 0.382},
        'KG':      {'classroom': 0.600, 'professional': 0.250, 'tech': 0.150},
        'Math':    {'classroom': 0.306, 'professional': 0.397, 'tech': 0.297},
        'Science': {'classroom': 0.312, 'professional': 0.379, 'tech': 0.309},
        'Social':  {'classroom': 0.350, 'professional': 0.400, 'tech': 0.250},
    }
    MULTS = {
        'International': {'classroom': 0.85, 'professional': 1.00, 'tech': 1.40},
        'Language':      {'classroom': 0.90, 'professional': 1.30, 'tech': 0.90},
        'Public':        {'classroom': 1.20, 'professional': 1.00, 'tech': 0.80},
        'Private':       {'classroom': 1.00, 'professional': 1.00, 'tech': 1.00},
        'Experimental':  {'classroom': 0.90, 'professional': 1.10, 'tech': 1.20},
    }
    mults = MULTS.get(school_type, MULTS['Private'])
    weights = {}
    for subj in subjects:
        if subj == 'KG':
            weights['KG'] = {'classroom': 0.60, 'professional': 0.25, 'tech': 0.15}
            continue
        base     = BASE.get(subj, BASE['Math'])
        raw_cl   = base['classroom']    * mults['classroom']
        raw_prof = base['professional'] * mults['professional']
        raw_tech = base['tech']         * mults['tech']
        total    = raw_cl + raw_prof + raw_tech
        w_cl   = max(0.10, min(0.70, raw_cl   / total))
        w_prof = max(0.10, min(0.70, raw_prof / total))
        w_tech = max(0.10, min(0.70, raw_tech / total))
        t2 = w_cl + w_prof + w_tech
        w_cl   = round(w_cl   / t2, 3)
        w_prof = round(w_prof / t2, 3)
        w_tech = round(1.0 - w_cl - w_prof, 3)
        weights[subj] = {'classroom': w_cl, 'professional': w_prof, 'tech': w_tech}
    return weights


def _builtin_schools():
    """مدارس افتراضية لو مفيش داتا"""
    return {
        "SCH_SAMPLE_1": {
            "name":"Sample International School","type":"International","city":"Cairo",
            "subjects_needed":["Math","Science","English"],
            "subject_weights":{
                "Math":{"classroom":0.20,"professional":0.35,"tech":0.45},
                "Science":{"classroom":0.15,"professional":0.30,"tech":0.55},
                "English":{"classroom":0.30,"professional":0.35,"tech":0.35},
            },
            "min_scores":{"classroom":55,"professional":60,"tech":65},
            "preferred_personalities":["digital_innovator","visionary_catalyst"],
            "school_threshold":65,
            "notes":"Sample school — please add schools data file.",
        },
    }

# ═══════════════════════════════════════════════════════════════════════
# 4️⃣  QUESTIONS
# ═══════════════════════════════════════════════════════════════════════
QUESTIONS = [
    {"id":1,"step":1,"title":"Classroom Management",
     "text":"How do you handle a disruptive student?",
     "options":["Calm them down and explain classroom rules","Ignore the situation",
                "Talk to them individually and understand them","Punish them immediately"],
     "col":C_DISRUPT,"map":{0:"Calm then explain",1:"Ignore",2:"Talk individually",3:"Punish"}},
    {"id":2,"step":1,"title":"Classroom Management",
     "text":"How do you help a slow learner understand the required topic?",
     "options":["Adjust my teaching method to suit the student's level",
                "Use simplified examples sometimes","Explain in the same way"],
     "col":C_WEAK,"map":{0:"Adjust by level",1:"Use simple examples. Sometimes",2:"Explain same"}},
    {"id":3,"step":1,"title":"Classroom Management",
     "text":"How do you get uninterested students to participate actively?",
     "options":["Use encouragement methods and incentives",
                "Design engaging activities to motivate everyone",
                "Forcefully ask them to participate"],
     "col":C_UNMOTIV,"map":{0:"Encouragement",1:"Engaging activities",2:"Participate"}},
    {"id":4,"step":1,"title":"Classroom Management",
     "text":"How do you deal with a parent who objects to their child's grades?",
     "options":["Calmly explain the grading system",
                "Ask to speak later outside the classroom","Apply the policy directly"],
     "col":C_PARENT,"map":{0:"Explain calmly",1:"I'm asking to speak. No, really, outside of class.",2:"Apply policy"}},
    {"id":5,"step":1,"title":"Classroom Management",
     "text":"You noticed a student whose level is declining and has become withdrawn — what do you do?",
     "options":["Talk to them to understand the reason and support them",
                "Contact parents directly","Adjust my approach to meet their needs"],
     "col":C_WITHDRAWN,"map":{0:"Talk support",1:"I contact the parents directly",2:"Adjust approach"}},
    {"id":6,"step":2,"title":"Professional Skills",
     "text":"You disagreed with a colleague or administration about a teaching method — what do you do?",
     "options":["Present my point of view calmly","Look for a middle ground",
                "Comply with the policy to avoid conflict"],
     "col":C_CONFLICT,"map":{0:"Present calmly",1:"Compromise",2:"Adhere policy"}},
    {"id":7,"step":2,"title":"Professional Skills",
     "text":"How do you evaluate student interaction in class? Does class size affect your teaching quality?",
     "options":["Interaction is weak and density strongly affects it",
                "Interaction is average and density sometimes affects it",
                "Interaction is good and density somewhat affects it",
                "Interaction is very good and density doesn't affect it",
                "Interaction is excellent and density doesn't affect my teaching quality"],
     "col":C_ENGAGESIZE,"map":{0:"Weak interaction, strong effect",1:"Average interaction, some effect",
                               2:"Good interaction, slight effect",3:"Very good interaction, no effect",
                               4:"Excellent interaction, no effect on quality"}},
    {"id":8,"step":2,"title":"Professional Skills",
     "text":"A new skill you recently learned and how you applied it?",
     "options":["I haven't learned a new skill recently",
                "I learned a simple skill but haven't applied it yet",
                "I learned a skill and started applying it occasionally",
                "I learned a skill and apply it consistently in class"],
     "col":C_NEWSKILL,"map":{0:"None",1:"Learned, not applied",
                             2:"Applying occasionally",3:"Applying consistently in class every day"}},
    {"id":9,"step":2,"title":"Professional Skills",
     "text":"How do you handle a top student who finishes assignments faster than classmates?",
     "options":["Ask them to stay quiet until classmates finish",
                "Have them help weaker classmates",
                "Give them additional questions and challenges","Nothing specific"],
     "col":C_GIFTED,"map":{0:"I asked him to be quiet until his colleague finished.",
                           1:"Make him help his weaker colleagues.",2:"Challenges",3:"Nothing specific"}},
    {"id":10,"step":2,"title":"Professional Skills",
     "text":"Does the financial compensation match the effort required of you?",
     "options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"],
     "col":C_SALARY,"map":{0:"I strongly agree",1:"Agree",2:"Neutral",3:"No Agree",4:"Strongly No Agree"}},
    {"id":11,"step":3,"title":"AI & Technology",
     "text":"Do you use technology in your teaching?",
     "options":["I don't use it","I use it a little","Sometimes","Effectively","Always and skillfully"],
     "col":C_TECH,"map":{0:"No, use it",1:"Use it a little.",2:"Sometimes",3:"Effectively",4:"Always"}},
    {"id":12,"step":3,"title":"AI & Technology",
     "text":"If a student used AI to complete an entire assignment, what do you do?",
     "options":["Reject the assignment immediately and give a zero",
                "Ask them to redo it under my supervision in class",
                "Discuss the written content with them to verify understanding",
                "Encourage them to use it as a support tool while clarifying sources"],
     "col":C_AICHEAT,"map":{0:"Reject homework",
                            1:"I ask him to return it under my supervision inside the classroom.",
                            2:"Discuss content",3:"Use as aid"}},
    {"id":13,"step":3,"title":"AI & Technology",
     "text":"How do you integrate AI tools (like Gemini or ChatGPT) into your work?",
     "options":["I don't use them and prefer traditional methods entirely",
                "I use them only to save time in preparation and writing tests",
                "I use them in class to create interactive activities with students",
                "I train students on how to correctly write prompts for research"],
     "col":C_AI,"map":{0:"No, I don't use it and I prefer the traditional methods completely.",
                       1:"I only use it to save time in preparing and writing No tests",
                       2:"I use it in the classroom to create interactive activities with the students.",
                       3:"I train Nob on how to correctly formulate commands (prompts) for searching."}},
    {"id":14,"step":3,"title":"AI & Technology",
     "text":"When using a new AI-based educational app, what is your first concern?",
     "options":["Ease of use and the app's interface","Whether the app is free or paid",
                "Student data safety and privacy on the app",
                "Whether it will save me effort in grading or not"],
     "col":C_AIAPP,"map":{0:"The ease of use and design of the application.",1:"Free or paid",
                          2:"How secure and private is Noob's data on this application?",
                          3:"Will it save me the effort of correcting, or no?"}},
    {"id":15,"step":4,"title":"School Preferences",
     "text":"What teaching style do you prefer in your classroom management?",
     "options":["Strict — Firm rules and high expectations",
                "Flexible — Adaptable and open to change",
                "Structured — Organized with clear routines",
                "Free-flowing — Spontaneous and creative approach"],
     "col":None,"map":{0:"Strict",1:"Flexible",2:"Structured",3:"Free-flowing"}},
    {"id":16,"step":4,"title":"School Preferences",
     "text":"What classroom energy level works best for your students?",
     "options":["Calm — Peaceful and composed atmosphere",
                "Energetic — High-energy and dynamic",
                "Balanced — Mix of calm and energetic",
                "Playful — Fun and engaging environment"],
     "col":None,"map":{0:"Calm",1:"Energetic",2:"Balanced",3:"Playful"}},
    {"id":17,"step":4,"title":"School Preferences","multi":True,
     "text":"What is your leadership style when interacting with students? (select all that apply)",
     "options":["Leader — Takes charge and guides decisively",
                "Supporter — Nurtures and encourages growth",
                "Collaborator — Works together as a team",
                "Mentor — Guides through experience"],
     "col":None,"map":{0:"Leader",1:"Supporter",2:"Collaborator",3:"Mentor"}},
    {"id":18,"step":4,"title":"School Preferences",
     "text":"How do you prefer to communicate with your students?",
     "options":["Direct — Clear and straightforward",
                "Empathetic — Understanding and compassionate",
                "Formal — Professional and respectful",
                "Casual — Friendly and approachable"],
     "col":None,"map":{0:"Direct",1:"Empathetic",2:"Formal",3:"Casual"}},
    {"id":19,"step":4,"title":"School Preferences","multi":True,
     "text":"What is your problem-solving approach when tackling classroom challenges? (select all that apply)",
     "options":["Analytical — Data-driven and logical",
                "Creative — Innovative and imaginative",
                "Practical — Hands-on and realistic",
                "Innovative — Forward-thinking and bold"],
     "col":None,"map":{0:"Analytical",1:"Creative",2:"Practical",3:"Innovative"}},
]

STEP_LABELS={1:"CLASSROOM MANAGEMENT",2:"PROFESSIONAL SKILLS",
             3:"AI & TECHNOLOGY",4:"SCHOOL PREFERENCES"}

# ═══════════════════════════════════════════════════════════════════════
# 5️⃣  SCORE MAPS & SUBJECT CRITERIA
# ═══════════════════════════════════════════════════════════════════════
SCORE_MAP_RAW = {
    C_DISRUPT:   {"Talk individually":1.0,"Calm then explain":0.67,"Punish":0.2,"Ignore":0.0},
    C_WEAK:      {"Adjust by level":1.0,"Use simple examples. Sometimes":0.7,"Explain same":0.0},
    C_UNMOTIV:   {"Engaging activities":1.0,"Encouragement":0.7,"Participate":0.2},
    C_PARENT:    {"Explain calmly":1.0,"I'm asking to speak. No, really, outside of class.":0.7,"Apply policy":0.3},
    C_WITHDRAWN: {"Talk support":1.0,"Adjust approach":0.67,"I contact the parents directly":0.67},
    C_CONFLICT:  {"Present calmly":1.0,"Compromise":1.0,"Adhere policy":0.5},
    C_ENGAGESIZE:{"Excellent interaction, no effect on quality":1.0,"Very good interaction, no effect":0.8,
                  "Good interaction, slight effect":0.6,"Average interaction, some effect":0.4,
                  "Weak interaction, strong effect":0.0},
    C_NEWSKILL:  {"Applying consistently in class every day":1.0,"Applying occasionally":0.67,
                  "Learned, not applied":0.33,"None":0.0},
    C_GIFTED:    {"Challenges":1.0,"Make him help his weaker colleagues.":0.8,
                  "I asked him to be quiet until his colleague finished.":0.2,"Nothing specific":0.0},
    C_SALARY:    {"I strongly agree":1.0,"Agree":0.75,"Neutral":0.5,"No Agree":0.25,"Strongly No Agree":0.0},
    C_TECH:      {"Always":1.0,"Effectively":0.75,"Sometimes":0.5,"Use it a little.":0.25,"No, use it":0.0},
    C_AICHEAT:   {"Use as aid":1.0,"Discuss content":0.8,
                  "I ask him to return it under my supervision inside the classroom.":0.4,"Reject homework":0.0},
    C_AI:        {"I train Nob on how to correctly formulate commands (prompts) for searching.":1.0,
                  "I use it in the classroom to create interactive activities with the students.":0.9,
                  "I only use it to save time in preparing and writing No tests":0.5,
                  "No, I don't use it and I prefer the traditional methods completely.":0.0},
    C_AIAPP:     {"How secure and private is Noob's data on this application?":1.0,
                  "The ease of use and design of the application.":0.67,
                  "Will it save me the effort of correcting, or no?":0.33,"Free or paid":0.33},
}

SUBJECT_CRITERIA = {
    "KG":     {"desc":"Kindergarten/Art/Music","weights":{"classroom":0.55,"professional":0.25,"tech":0.20},
               "min_classroom":60,"threshold":65,"notes":"Warmth and creativity are top priority."},
    "Arabic": {"desc":"Arabic/Islamic Studies","weights":{"classroom":0.35,"professional":0.45,"tech":0.20},
               "min_classroom":50,"threshold":60,"notes":"Professional depth is key."},
    "Math":   {"desc":"Mathematics","weights":{"classroom":0.25,"professional":0.45,"tech":0.30},
               "min_classroom":45,"threshold":62,"notes":"Strong methodology required."},
    "Science":{"desc":"Science/Physics/Chemistry/CS","weights":{"classroom":0.20,"professional":0.35,"tech":0.45},
               "min_classroom":40,"threshold":63,"notes":"Tech integration is critical."},
    "English":{"desc":"English/French Language","weights":{"classroom":0.35,"professional":0.35,"tech":0.30},
               "min_classroom":50,"threshold":60,"notes":"Communication skills are essential."},
    "Social": {"desc":"Social Studies/History/Geography","weights":{"classroom":0.40,"professional":0.40,"tech":0.20},
               "min_classroom":50,"threshold":60,"notes":"Strong professional and classroom skills needed."},
}

PERSONALITY_TYPES = {
    "emotional_leader":{"label":"Emotional Leader","arabic":"القائد العاطفي","icon":"❤️ ",
        "desc":"You lead with empathy. Students trust you deeply.",
        "collab":"Works best with a structured methodical colleague.",
        "growth":"Channel empathy into routines for student independence.",
        "watch":"Set personal boundaries to avoid over-investing emotionally."},
    "digital_innovator":{"label":"Digital Innovator","arabic":"المبتكر الرقمي","icon":"🚀",
        "desc":"AI tools are your natural language in education.",
        "collab":"Pair with a mentor-type colleague for student wellbeing balance.",
        "growth":"Build analog fallback lessons for tech-struggling students.",
        "watch":"Anchor innovation to clear learning outcomes."},
    "methodical_professional":{"label":"Methodical Professional","arabic":"المحترف المنهجي","icon":"📋",
        "desc":"Consistent, policy-aware, and deeply reliable.",
        "collab":"Thrives alongside creative colleagues.",
        "growth":"Introduce one spontaneous student-led activity per week.",
        "watch":"Add deliberate moments of student choice to avoid appearing rigid."},
    "adaptive_coach":{"label":"Adaptive Coach","arabic":"المدرب المرن","icon":"⚡",
        "desc":"You read the room in real time.",
        "collab":"Works well with almost any colleague.",
        "growth":"Document adaptive strategies so they become replicable.",
        "watch":"Anchor with a visible weekly structure."},
    "visionary_catalyst":{"label":"Visionary Catalyst","arabic":"المحفّز الاستراتيجي","icon":"🏆",
        "desc":"You don't just teach — you transform.",
        "collab":"A natural mentor for any department.",
        "growth":"Begin formal mentoring or curriculum leadership.",
        "watch":"High standards can intimidate newer colleagues."},
    "developing_educator":{"label":"Developing Educator","arabic":"المعلم النامي","icon":"🌱",
        "desc":"Building your foundation with real potential.",
        "collab":"Seek mentorship with a methodical or visionary colleague.",
        "growth":"Focus on your single lowest dimension for 30 days.",
        "watch":"Depth in one area first builds confidence faster."},
}

# ═══════════════════════════════════════════════════════════════════════
# 6️⃣  HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════
def _bar(v): return "█"*(v//5)+"░"*(20-v//5)

def _convert_age(x):
    if isinstance(x,str) and "-" in x:
        a,b=x.split("-"); return (int(a.strip())+int(b.strip()))/2
    try: return float(x)
    except: return np.nan

def _convert_exp(x):
    if isinstance(x,str):
        x=x.strip()
        if "10+" in x or "more" in x.lower(): return 12
        if x in ("1yr","1 yr","1 year"): return 1
        if x in ("2yrs","2 yrs","2 years"): return 2
        if "3-5" in x: return 4
        if "5-10" in x: return 7
        nums=''.join([c for c in x if c.isdigit()])
        return int(nums) if nums and len(nums)<=2 else 7
    return np.nan

def compute_dimension_scores(ua):
    cl_sc,pr_sc,tc_sc=[],[],[]
    for q in QUESTIONS:
        if q.get("step") not in (1,2,3): continue
        idx=ua.get(q["id"])
        if idx is None: continue
        mapped=q["map"][idx]
        sc=SCORE_MAP_RAW.get(q["col"],{}).get(mapped,0.5)
        if q["step"]==1: cl_sc.append(sc)
        elif q["step"]==2: pr_sc.append(sc)
        else: tc_sc.append(sc)
    cl=round(np.mean(cl_sc)*100) if cl_sc else 50
    pr=round(np.mean(pr_sc)*100) if pr_sc else 50
    tc=round(np.mean(tc_sc)*100) if tc_sc else 50
    return cl,pr,tc,round((cl+pr+tc)/3)

def get_personality(cl,pr,tc):
    if cl>=75 and pr>=75 and tc>=75: return "🏆 Visionary Educator","You excel across all dimensions."
    elif cl>=70 and tc>=65: return "⚡ Dynamic Facilitator","Strong classroom control + modern digital tools."
    elif pr>=70 and tc>=65: return "💻 Tech-Savvy Professional","Professional mastery + digital fluency."
    elif cl>=70: return "👥 Master of the Classroom","Your classroom presence is your superpower."
    elif tc>=70: return "🚀 Digital Pioneer","You lead with AI and technology."
    elif pr>=70: return "📋 Dedicated Practitioner","Your professional commitment is your strength."
    else: return "🌱 Developing Educator","Focused development will unlock your potential."

def get_teacher_personality_type(cl,pr,tc,ua):
    emp=inn=stc=fle=0
    if ua.get(1)==2:  emp+=2
    if ua.get(5)==0:  emp+=2
    if ua.get(4)==0:  emp+=1
    if ua.get(6)==0:  emp+=1
    if ua.get(13) in (2,3): inn+=2
    if ua.get(11) in (3,4): inn+=2
    if ua.get(12) in (2,3): inn+=1
    if ua.get(14)==2:       inn+=1
    if ua.get(6)==2:  stc+=2
    if ua.get(4)==2:  stc+=2
    if ua.get(8)==3:  stc+=1
    if ua.get(1)==0:  stc+=1
    if ua.get(2)==0:  fle+=2
    if ua.get(7) in (3,4): fle+=2
    if ua.get(5)==2:  fle+=1
    if ua.get(9)==2:  fle+=1
    if cl>=75 and pr>=75 and tc>=75: return "visionary_catalyst"
    if cl>=65 and emp>=4 and inn<3:  return "emotional_leader"
    if tc>=65 and inn>=4:            return "digital_innovator"
    if fle>=4 and cl>=60:            return "adaptive_coach"
    if pr>=68 and stc>=3:            return "methodical_professional"
    if cl>=65 and emp>=3:            return "emotional_leader"
    if tc>=60 and inn>=3:            return "digital_innovator"
    return "developing_educator"

def get_subject_result(cl,pr,tc,subject,csv_stats=None):
    crit=SUBJECT_CRITERIA.get(subject,SUBJECT_CRITERIA["Math"])
    w=crit["weights"]
    score=round(min(99,max(10,cl*w["classroom"]+pr*w["professional"]+tc*w["tech"])))
    eff_thr=crit["threshold"]
    if csv_stats:
        st=csv_stats.get(subject,{})
        if st: eff_thr=crit["threshold"]+round((st.get("avg_eval",70)*10-70)*0.15)
    accepted=score>=eff_thr and cl>=crit["min_classroom"]
    strengths,weaknesses=[],[]
    if cl>=70: strengths.append(f"Strong classroom management ({cl}%)")
    elif cl<55: weaknesses.append(f"Classroom management needs work ({cl}%)")
    if pr>=70: strengths.append(f"Solid professional skills ({pr}%)")
    elif pr<55: weaknesses.append(f"Professional skills need development ({pr}%)")
    if tc>=70: strengths.append(f"Excellent tech/AI integration ({tc}%)")
    elif tc<55: weaknesses.append(f"Tech integration needs improvement ({tc}%)")
    return score,accepted,strengths,weaknesses,crit

# ═══════════════════════════════════════════════════════════════════════
# 7️⃣  SCHOOL RECOMMENDATION ENGINE
# ═══════════════════════════════════════════════════════════════════════
def recommend_schools_for_teacher(cl, pr, tc, personality_type, top_n=10):
    """يرجع أفضل top_n مدارس للمعلم"""
    results = []
    for school_id, school in SCHOOLS.items():
        mins = school["min_scores"]
        below_min = (cl<mins["classroom"] or pr<mins["professional"] or tc<mins["tech"])
        matched, scores = [], []
        for subj in school["subjects_needed"]:
            w = school["subject_weights"].get(subj,{"classroom":0.33,"professional":0.33,"tech":0.34})
            sc = round(min(99,max(10,cl*w["classroom"]+pr*w["professional"]+tc*w["tech"])))
            if sc >= school["school_threshold"] and not below_min:
                matched.append((subj,sc)); scores.append(sc)
        if below_min:
            status="❌ Below minimum"; match_score=0
        elif not matched:
            status="⚠️  Score too low"; match_score=0
        else:
            status="✅ Qualified"; match_score=round(np.mean(scores))
        pm = personality_type in school["preferred_personalities"]
        results.append({
            "school_id":school_id, "school_name":school["name"],
            "school_type":school["type"], "city":school["city"],
            "match_score":match_score, "status":status,
            "matched_subjects":matched, "personality_match":pm,
            "effective_score":min(99,match_score+(5 if pm else 0)),
            "notes":school["notes"],
        })
    results.sort(key=lambda x:(x["status"]!="✅ Qualified",-x["effective_score"]))
    return results[:top_n]


def rank_teachers_for_school(school_id, teachers_db=None):
    """
    ✅ FIX 2: كل مدرسة بتحسب score المعلم بناءً على weights بتاعتها
    - مدرسة دولية: Tech=45% → معلم tech قوي يجي أول
    - مدرسة حكومية: Classroom=40% → معلم classroom قوي يجي أول
    - نفس المعلم = rank مختلف في كل مدرسة
    """
    if teachers_db is None: teachers_db = REAL_TEACHERS_DB
    school = SCHOOLS.get(school_id)
    if not school: return {}

    mins = school["min_scores"]
    thr  = school["school_threshold"]
    ranked = {}

    for subj in school["subjects_needed"]:
        w = school["subject_weights"].get(subj, {
            "classroom": 0.33, "professional": 0.33, "tech": 0.34
        })
        candidates = []
        for t in teachers_db:
            cl2 = int(t["classroom"]); pr2 = int(t["professional"]); tc2 = int(t["tech"])
            if cl2 < mins["classroom"] or pr2 < mins["professional"] or tc2 < mins["tech"]: continue
            if subj not in t.get("accepted_subjects", []): continue
            sc = round(min(99, max(10,
                cl2*w["classroom"] + pr2*w["professional"] + tc2*w["tech"])))
            if sc < thr: continue
            pm = t.get("personality_type") in school["preferred_personalities"]
            effective = min(99, sc + (5 if pm else 0))
            candidates.append({
                "teacher_id":      t["teacher_id"],
                "name":            t["name"],
                "score":           sc,
                "effective_score": effective,
                "personality_type":t.get("personality_type", "—"),
                "personality_match": pm,
                "classroom":       cl2,
                "professional":    pr2,
                "tech":            tc2,
                "cl_contribution": round(cl2 * w["classroom"]),
                "pr_contribution": round(pr2 * w["professional"]),
                "tc_contribution": round(tc2 * w["tech"]),
                "weights_used":    f"CL:{int(w['classroom']*100)}% PR:{int(w['professional']*100)}% TC:{int(w['tech']*100)}%",
                "stage":           t.get("stage", "—"),
                "gender":          t.get("gender", "—"),
                "gov":             t.get("gov", "—"),
            })
        candidates.sort(key=lambda x: -x["effective_score"])
        ranked[subj] = candidates
    return ranked
def print_school_recommendations(results):
    print("\n"+"="*65)
    print("  🏫  RECOMMENDED SCHOOLS FOR YOU  (Top matches)")
    print("="*65)
    qualified=[r for r in results if r["status"]=="✅ Qualified"]
    others   =[r for r in results if r["status"]!="✅ Qualified"]
    if qualified:
        print(f"\n  ✅ Schools where you qualify ({len(qualified)} shown):\n")
        for i,r in enumerate(qualified,1):
            pm="⭐ Personality match!" if r["personality_match"] else ""
            subs=", ".join([f"{s}({sc}%)" for s,sc in r["matched_subjects"]])
            print(f"  {i}. {r['school_name']}")
            print(f"     📍 {r['city']}  |  {r['school_type']}")
            print(f"     Score : {r['effective_score']}%  {pm}")
            print(f"     Subjects: {subs}")
            if r['notes']: print(f"     📝 {r['notes'][:80]}")
            print()
    else:
        print("\n  ❌ No schools matched your current profile.")
        print("     Improve your weakest dimension to unlock matches.\n")
    if others:
        print(f"  ⚠️  Other schools (not qualified):")
        for r in others[:3]:
            mins=SCHOOLS[r["school_id"]]["min_scores"]
            print(f"     • {r['school_name'][:40]:<40} — {r['status']}")
            print(f"       Needs: CL≥{mins['classroom']}% | PR≥{mins['professional']}% | TC≥{mins['tech']}%")
    print("="*65)


def print_teachers_for_school(school_id, ranked):
    school=SCHOOLS[school_id]
    print("\n"+"="*65)
    print(f"  🏫  {school['name'][:50]}")
    print(f"      {school['type']}  |  {school['city']}")
    print("="*65)
    for subj,teachers in ranked.items():
        print(f"\n  📚 {subj}  ({len(teachers)} qualified)")
        print(f"  {'─'*60}")
        if not teachers:
            print("     No qualified teachers."); continue
        for rank,t in enumerate(teachers[:10],1):
            pm=" ⭐" if t["personality_match"] else ""
            print(f"  #{rank:<3} {t['name']:<20} Score:{t['effective_score']}%{pm}")
            print(f"       CL:{t['classroom']}% | PR:{t['professional']}% | TC:{t['tech']}% | {t['stage']}")
    print()
    print("="*65)

# ═══════════════════════════════════════════════════════════════════════
# 9️⃣  BUILD TEACHERS DB FROM XLSX
# ═══════════════════════════════════════════════════════════════════════
REAL_TEACHERS_DB = []

def build_teachers_db(xlsx_path="teachers_english (2).xlsx"):
    if not os.path.exists(xlsx_path):
        print("⚠️  Teachers XLSX not found"); return []
    df=pd.read_excel(xlsx_path)
    df.columns=[c.replace('\xa0',' ').strip() for c in df.columns]

    C_T='Tech use'; C_A='Integrate AI'; C_D='Disruptive'; C_W='slow learners'
    C_U='Disinterested'; C_P='Parent objections'; C_G='High performers'
    C_AC='AI homework'; C_AP='AI app concerns'
    C_CO='I disagreed with a fellow teacher or administrator (regarding teaching methods).'
    C_WD="I noticed that one of the students' performance levels started to decline and he became withdrawn."
    C_EN='Engagement'; C_NS='New skill'; C_SA='Compensation'

    cl_r=pd.Series(0.0,index=df.index)
    cl_r+=df[C_D].astype(str).str.strip().map({'Talk individually':1.0,'Calm then explain':0.67,'Punish':0.2,'Ignore':0.0}).fillna(0.5)
    cl_r+=df[C_W].astype(str).str.strip().map({'Adjust by level':1.0,'Use simple examples. Sometimes':0.7,'Explain same':0.0}).fillna(0.5)
    cl_r+=df[C_U].astype(str).str.strip().map({'Engaging activities':1.0,'Encouragement':0.7,'Participate':0.2}).fillna(0.5)
    cl_r+=df[C_P].astype(str).str.strip().map({'Explain calmly':1.0,"I'm asking to speak. No, really, outside of class.":0.7,'Apply policy':0.3}).fillna(0.5)
    cl_r+=df[C_WD].astype(str).str.strip().map({'Talk support':1.0,'Adjust approach':0.67,'I contact the parents directly':0.67,'contact the parents directly':0.67}).fillna(0.5)
    cl_s=(cl_r/5*100).round().astype(int)

    pr_r=pd.Series(0.0,index=df.index)
    pr_r+=df[C_CO].astype(str).str.strip().map({'Present calmly':1.0,'Compromise':1.0,'Adhere policy':0.5}).fillna(0.5)
    pr_r+=df[C_G].astype(str).str.strip().map({'Challenges':1.0,'Make him help his weaker colleagues.':0.8,'I asked him to be quiet until his colleague finished.':0.2,'asked him to be quiet until his colleague finished.':0.2,'Nothing specific':0.0}).fillna(0.5)
    pr_r+=df[C_EN].apply(lambda x:1.0 if isinstance(x,str) and len(str(x).strip())>20 else(0.4 if isinstance(x,str) and len(str(x).strip())>3 else 0.0))
    pr_r+=df[C_NS].apply(lambda x:1.0 if isinstance(x,str) and len(str(x).strip())>20 else(0.3 if isinstance(x,str) and len(str(x).strip())>3 else 0.0))
    pr_r+=df[C_SA].astype(str).str.strip().map({'I strongly agree':1.0,'Agree':0.75,'Neutral':0.5,'No Agree':0.25,'Strongly No Agree':0.0}).fillna(0.5)
    pr_s=(pr_r/5*100).round().astype(int)

    tc_r=pd.Series(0.0,index=df.index)
    tc_r+=df[C_T].astype(str).str.strip().map({'Always':1.0,'Effectively':0.75,'Sometimes':0.5,'Use it a little.':0.25,'Use it sparingly.':0.25,'No, use it':0.0}).fillna(0.5)
    tc_r+=df[C_A].astype(str).str.strip().map({'I train Nob on how to correctly formulate commands (prompts) for searching.':1.0,'train Nob on how to correctly formulate commands (prompts) for searching.':1.0,'I use it in the classroom to create interactive activities with the students.':0.9,'use it in the classroom to create interactive activities with the students.':0.9,'I only use it to save time in preparing and writing No tests':0.5,'only use it to save time in preparing and writing No tests':0.5,"No, I don't use it and I prefer the traditional methods completely.":0.0}).fillna(0.5)
    tc_r+=df[C_AC].astype(str).str.strip().map({'Use as aid':1.0,'Discuss content':0.8,'I ask him to return it under my supervision inside the classroom.':0.4,'ask him to return it under my supervision inside the classroom.':0.4,'I ask him to bring it back under my supervision inside the classroom.':0.4,'Reject homework':0.0}).fillna(0.5)
    tc_r+=df[C_AP].astype(str).str.strip().map({"How secure and private is Noob's data on this application?":1.0,'The ease of use and design of the application.':0.67,'Will it save me the effort of correcting, or no?':0.33,'Free or paid':0.33}).fillna(0.5)
    tc_s=(tc_r/4*100).round().astype(int)

    def _ptype(cl,pr,tc,row):
        emp=inn=stc=fle=0
        dis=str(row[C_D]).strip()
        if dis=='Talk individually': emp+=2
        if dis=='Calm then explain': stc+=1
        ai=str(row[C_A]).strip()
        if 'train' in ai.lower() or 'interactive' in ai.lower(): inn+=2
        if str(row[C_T]).strip() in ('Always','Effectively'): inn+=2
        if str(row[C_SA]).strip() in ('I strongly agree','Agree'): stc+=1
        if str(row[C_W]).strip()=='Adjust by level': fle+=2
        if cl>=75 and pr>=75 and tc>=75: return 'visionary_catalyst'
        if cl>=65 and emp>=2 and inn<2: return 'emotional_leader'
        if tc>=65 and inn>=3: return 'digital_innovator'
        if fle>=2 and cl>=60: return 'adaptive_coach'
        if pr>=65 and stc>=2: return 'methodical_professional'
        if cl>=60 and emp>=1: return 'emotional_leader'
        if tc>=55 and inn>=2: return 'digital_innovator'
        return 'developing_educator'

    def _accepted(cl,pr,tc):
        criteria={
            'KG':    {'w':{'classroom':0.55,'professional':0.25,'tech':0.20},'mc':60,'t':65},
            'Arabic':{'w':{'classroom':0.35,'professional':0.45,'tech':0.20},'mc':50,'t':60},
            'Math':  {'w':{'classroom':0.25,'professional':0.45,'tech':0.30},'mc':45,'t':62},
            'Science':{'w':{'classroom':0.20,'professional':0.35,'tech':0.45},'mc':40,'t':63},
            'English':{'w':{'classroom':0.35,'professional':0.35,'tech':0.30},'mc':50,'t':60},
            'Social': {'w':{'classroom':0.40,'professional':0.40,'tech':0.20},'mc':50,'t':60},
        }
        return [s for s,c in criteria.items()
                if cl*c['w']['classroom']+pr*c['w']['professional']+tc*c['w']['tech']>=c['t']
                and cl>=c['mc']]

    db=[]
    for i,row in df.iterrows():
        cl=int(cl_s.iloc[i]); pr=int(pr_s.iloc[i]); tc=int(tc_s.iloc[i])
        db.append({
            'teacher_id':f'T{int(row["ID"]):03d}',
            'name':f'Teacher {int(row["ID"])}',
            'classroom':cl,'professional':pr,'tech':tc,
            'accepted_subjects':_accepted(cl,pr,tc),
            'personality_type':_ptype(cl,pr,tc,row),
            'stage':str(row['Teacher for the stage']).strip(),
            'gender':str(row['Gender']).strip(),
        })
    global REAL_TEACHERS_DB
    REAL_TEACHERS_DB = db
    print(f"   ✅ {len(db)} teachers loaded from XLSX")
    return db

# ═══════════════════════════════════════════════════════════════════════
# 🔟  DATA LOADING & MODEL TRAINING
# ═══════════════════════════════════════════════════════════════════════
def load_and_train():
    XLSX_PATH="teachers_english (2).xlsx"
    CSV_PATH ="Teaching_Quality_Clean_1500.csv"
    SCH_PATH1="schools_500_final.xlsx"
    SCH_PATH2="schools_500_dataset.csv"

    # ── load schools ──────────────────────────────────────────────────
    sch_found=next((p for p in [SCH_PATH1,SCH_PATH2] if os.path.exists(p)),None)
    load_schools(sch_found)

    # ── check teacher data ────────────────────────────────────────────
    missing=[f for f in [XLSX_PATH,CSV_PATH] if not os.path.exists(f)]
    if missing:
        print(f"\n⚠️  Missing: {missing} — running DEMO mode\n")
        return _demo_model()

    print("\n⏳ Loading data and training model...")
    df=pd.read_excel(XLSX_PATH)
    df.columns=[c.replace('\xa0',' ').strip() for c in df.columns]
    df_csv=pd.read_csv(CSV_PATH)
    print(f"   ✅ Teachers XLSX → {df.shape[0]:,} rows | Quality CSV → {df_csv.shape[0]:,} rows")

    csv_stats=(df_csv.groupby("Subject").agg(
        avg_eval=("Teacher_Evaluation_Score","mean"),
        avg_tech=("Tech_Integration_Score","mean"),
        avg_student=("Student_Avg_Score","mean"),
        avg_attend=("Attendance_Rate","mean"),
        avg_inter=("Interactive_Sessions_Percent","mean"),
        count=("Teaching_Quality","count"),
        pct_excel=("Teaching_Quality",lambda x:(x=="Excellent").mean()*100),
        pct_good=("Teaching_Quality",lambda x:(x=="Good").mean()*100),
    ).round(2).to_dict(orient="index"))

    print("\n   📊 CSV Subject Averages:")
    for subj,st in csv_stats.items():
        print(f"      {subj:<8} | eval={st['avg_eval']:.1f} | tech={st['avg_tech']:.1f} | Excellent={st['pct_excel']:.1f}%")

    score=_raw_score(df)
    df['RAW_SCORE']=score; df['TARGET']=(score>=65).astype(int)
    df2=_engineer(df); df3,le_dict=_prepare(df2)
    ens,shap_exp,acc,auc=_train(df3,le_dict)
    print(f"✅ Model ready — Accuracy: {acc*100:.1f}% | AUC: {auc:.3f}\n")

    global REAL_TEACHERS_DB
    REAL_TEACHERS_DB=build_teachers_db(XLSX_PATH)
    return ens,shap_exp,le_dict,csv_stats

def _raw_score(df):
    s=pd.Series(0.0,index=df.index)
    s+=df[C_TECH].astype(str).str.strip().map({'Always':20,'Effectively':15,'Sometimes':10,'Use it a little.':5,'Use it sparingly.':5,'No, use it':0}).fillna(0)
    s+=df[C_AI].astype(str).str.strip().map({'I train Nob on how to correctly formulate commands (prompts) for searching.':20,'train Nob on how to correctly formulate commands (prompts) for searching.':20,'I use it in the classroom to create interactive activities with the students.':18,'use it in the classroom to create interactive activities with the students.':18,'I only use it to save time in preparing and writing No tests':10,'only use it to save time in preparing and writing No tests':10,"No, I don't use it and I prefer the traditional methods completely.":0}).fillna(0)
    s+=df[C_DISRUPT].astype(str).str.strip().map({'Talk individually':15,'Calm then explain':10,'Punish':3,'Ignore':0}).fillna(0)
    s+=df[C_WEAK].astype(str).str.strip().map({'Adjust by level':10,'Use simple examples. Sometimes':7,'Explain same':0}).fillna(0)
    s+=df[C_UNMOTIV].astype(str).str.strip().map({'Engaging activities':10,'Encouragement':7,'Participate':2}).fillna(0)
    s+=df[C_PARENT].astype(str).str.strip().map({'Explain calmly':10,"I'm asking to speak. No, really, outside of class.":7,'Apply policy':3}).fillna(0)
    s+=df[C_GIFTED].astype(str).str.strip().map({'Challenges':5,'Make him help his weaker colleagues.':4,'asked him to be quiet until his colleague finished.':1,'I asked him to be quiet until his colleague finished.':1,'Nothing specific':0}).fillna(0)
    s+=df[C_AICHEAT].astype(str).str.strip().map({'Use as aid':5,'Discuss content':4,'I ask him to return it under my supervision inside the classroom.':2,'ask him to return it under my supervision inside the classroom.':2,'I ask him to bring it back under my supervision inside the classroom.':2,'Reject homework':0}).fillna(0)
    s+=df[C_AIAPP].astype(str).str.strip().map({"How secure and private is Noob's data on this application?":3,'The ease of use and design of the application.':2,'Free or paid':1,'Will it save me the effort of correcting, or no?':1}).fillna(0)
    s+=df[C_CONFLICT].astype(str).str.strip().map({'Present calmly':2,'Compromise':2,'Adhere policy':1}).fillna(0)
    s+=df[C_ENGAGESIZE].apply(lambda x:5 if isinstance(x,str) and len(str(x).strip())>20 else(2 if isinstance(x,str) and len(str(x).strip())>3 else 0))
    s+=df[C_NEWSKILL].apply(lambda x:3 if isinstance(x,str) and len(str(x).strip())>20 else(1 if isinstance(x,str) and len(str(x).strip())>3 else 0))
    return s

def _engineer(df):
    d=df.copy()
    d[C_AGE]=d[C_AGE].apply(_convert_age); d[C_EXP]=d[C_EXP].apply(_convert_exp)
    d['SALARY_SCORE']=d[C_SALARY].astype(str).str.strip().map({'I strongly agree':5,'Agree':4,'Neutral':3,'No Agree':2,'Strongly No Agree':1}).fillna(3)
    d['CHRONIC_INT']=(d[C_CHRONIC].astype(str).str.strip().str.lower()=='yes').astype(int)
    d['NUM_LANGS']=d[C_LANGS].astype(str).str.count(';')
    d['WITHDRAWN_SC']=d[C_WITHDRAWN].astype(str).str.strip().map({'Talk support':3,'Adjust approach':2,'I contact the parents directly':2,'contact the parents directly':2}).fillna(1)
    return d

def _prepare(df2):
    df3=df2[feature_cols+['TARGET','RAW_SCORE']].dropna().copy()
    le_dict={}
    for col in feature_cols:
        if df3[col].dtype=='object' or df3[col].apply(lambda x:isinstance(x,str)).any():
            le=LabelEncoder(); df3[col]=le.fit_transform(df3[col].astype(str)); le_dict[col]=le
        else: df3[col]=pd.to_numeric(df3[col],errors='coerce')
    return df3.dropna(subset=feature_cols),le_dict

def _train(df3, le_dict):
    """
    ✅ No SMOTE — بيستخدم الداتا الحقيقية بس
    ✅ Calibration — probabilities دقيقة
    ✅ 10-fold CV — تقييم حقيقي
    ✅ class_weight balanced — يتعامل مع الـ imbalance
    """
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.model_selection import StratifiedKFold, cross_validate

    X = df3[feature_cols]
    y = df3['TARGET']

    # ── Base models ───────────────────────────────────────────────────
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=8, min_samples_leaf=3,
        class_weight='balanced', random_state=42, n_jobs=-1)
    gb = GradientBoostingClassifier(
        n_estimators=200, max_depth=4, learning_rate=0.05,
        subsample=0.7, random_state=42)

    # ── Ensemble ─────────────────────────────────────────────────────
    base_ens = VotingClassifier(estimators=[('rf', rf), ('gb', gb)], voting='soft')

    # ── Calibration ──────────────────────────────────────────────────
    ens = CalibratedClassifierCV(base_ens, cv=5, method='isotonic')

    # ── 10-fold Cross-Validation (للتقييم الحقيقي) ───────────────────
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    cv_res = cross_validate(ens, X, y, cv=cv,
                             scoring=['accuracy','roc_auc','f1'],
                             return_train_score=True)

    real_acc = cv_res['test_accuracy'].mean()
    real_auc = cv_res['test_roc_auc'].mean()
    real_f1  = cv_res['test_f1'].mean()
    gap      = cv_res['train_accuracy'].mean() - real_acc

    print(f"   📊 10-Fold CV Results (real data, no SMOTE):")
    print(f"      Accuracy : {real_acc*100:.1f}% ± {cv_res['test_accuracy'].std()*100:.1f}%")
    print(f"      AUC      : {real_auc:.3f} ± {cv_res['test_roc_auc'].std():.3f}")
    print(f"      F1       : {real_f1:.3f} ± {cv_res['test_f1'].std():.3f}")
    print(f"      Overfit? : {'⚠️  Yes' if gap>0.1 else '✅ No'} (gap={gap:.3f})")

    # ── الـ fit النهائي على كل الداتا ─────────────────────────────────
    ens.fit(X, y)

    # ── SHAP من الـ RF الداخلي ────────────────────────────────────────
    # CalibratedClassifierCV مش بيعطي direct access للـ estimators
    # فبنفت الـ RF لوحده للـ SHAP
    rf_for_shap = RandomForestClassifier(
        n_estimators=300, max_depth=8, min_samples_leaf=3,
        class_weight='balanced', random_state=42, n_jobs=-1)
    rf_for_shap.fit(X, y)
    shap_exp = shap.TreeExplainer(rf_for_shap)

    return ens, shap_exp, real_acc, real_auc

def _demo_model():
    np.random.seed(42)
    n=300; X=pd.DataFrame(np.random.randint(0,5,(n,len(feature_cols))),columns=feature_cols)
    y=(X.mean(axis=1)>2).astype(int)
    rf=RandomForestClassifier(n_estimators=50,random_state=42); rf.fit(X,y)
    gb=GradientBoostingClassifier(n_estimators=50,random_state=42); gb.fit(X,y)
    ens=VotingClassifier(estimators=[('rf',rf),('gb',gb)],voting='soft'); ens.fit(X,y)
    csv_stats={"Math":{"avg_eval":7.2,"avg_tech":6.8,"avg_student":72,"avg_attend":88,"avg_inter":60,"count":200,"pct_excel":18,"pct_good":45},"Science":{"avg_eval":7.0,"avg_tech":7.1,"avg_student":70,"avg_attend":87,"avg_inter":62,"count":180,"pct_excel":15,"pct_good":47},"English":{"avg_eval":7.4,"avg_tech":6.5,"avg_student":74,"avg_attend":90,"avg_inter":58,"count":220,"pct_excel":20,"pct_good":43},"Arabic":{"avg_eval":6.9,"avg_tech":5.8,"avg_student":68,"avg_attend":85,"avg_inter":50,"count":160,"pct_excel":12,"pct_good":44},"KG":{"avg_eval":7.8,"avg_tech":5.5,"avg_student":80,"avg_attend":92,"avg_inter":70,"count":120,"pct_excel":25,"pct_good":50}}
    global REAL_TEACHERS_DB; REAL_TEACHERS_DB=[]
    print("✅ Demo model ready\n")
    return ens,shap.TreeExplainer(rf),{},csv_stats

# ═══════════════════════════════════════════════════════════════════════
# 1️⃣1️⃣  BUILD FEATURE ROW
# ═══════════════════════════════════════════════════════════════════════
DEFAULT_PROFILE={C_AGE:"26-30",C_EXP:"3-5 years",C_GENDER:"Female",
                 C_STAGE:"Primary",C_LANGS:"Arabic;English",C_CHRONIC:"No"}

def build_feature_row(ua,le_dict):
    row={C_AGE:_convert_age(DEFAULT_PROFILE[C_AGE]),C_EXP:_convert_exp(DEFAULT_PROFILE[C_EXP]),'NUM_LANGS':1,'CHRONIC_INT':0}
    for q in QUESTIONS:
        if q.get("step") not in (1,2,3): continue
        idx=ua.get(q["id"])
        if idx is None: continue
        mapped=q["map"][idx]; col=q["col"]
        if col==C_SALARY: row['SALARY_SCORE']={"I strongly agree":5,"Agree":4,"Neutral":3,"No Agree":2,"Strongly No Agree":1}.get(mapped,3)
        elif col==C_WITHDRAWN: row['WITHDRAWN_SC']={"Talk support":3,"Adjust approach":2,"I contact the parents directly":2}.get(mapped,1)
        elif col in (C_ENGAGESIZE,C_NEWSKILL): row[col]=mapped
        else: row[col]=mapped
    for k,d in [('SALARY_SCORE',3),('WITHDRAWN_SC',2)]:
        if k not in row: row[k]=d
    if C_ENGAGESIZE not in row: row[C_ENGAGESIZE]="Average interaction, some effect"
    if C_NEWSKILL not in row: row[C_NEWSKILL]="Applying occasionally"
    row[C_GENDER]=DEFAULT_PROFILE[C_GENDER]; row[C_STAGE]=DEFAULT_PROFILE[C_STAGE]
    for col in [C_GENDER,C_STAGE,C_TECH,C_DISRUPT,C_WEAK,C_UNMOTIV,C_PARENT,C_GIFTED,C_AICHEAT,C_AI,C_AIAPP,C_CONFLICT,C_ENGAGESIZE,C_NEWSKILL]:
        if col in row and col in le_dict:
            le=le_dict[col]; val=str(row[col])
            row[col]=int(le.transform([val])[0]) if val in le.classes_ else 0
    X_in=pd.DataFrame([row],columns=feature_cols)
    for col in feature_cols:
        if col not in le_dict: X_in[col]=pd.to_numeric(X_in[col],errors='coerce').fillna(0)
    return X_in

# ═══════════════════════════════════════════════════════════════════════
# 1️⃣2️⃣  ASK QUESTIONS
# ═══════════════════════════════════════════════════════════════════════
def ask_questions():
    print("\n"+"="*65)
    print("🎓  TEACHER PERSONALITY & SUBJECT EVALUATION")
    print("    (19 Questions across 4 Sections)")
    print("="*65)
    ua={}; cur=0
    for q in QUESTIONS:
        if q["step"]!=cur:
            cur=q["step"]
            print(f"\n{'─'*65}\n  📌 STEP {cur}: {STEP_LABELS[cur]}\n{'─'*65}")
        multi=q.get("multi",False)
        print(f"\nQ{q['id']}. {q['text']}")
        if multi: print("   ✦ Select multiple options (e.g. 1,3 or 2)")
        for i,opt in enumerate(q["options"]): print(f"   {i+1}. {opt}")
        if multi:
            while True:
                try:
                    raw=input(f"\n   Your answer(s): ").strip()
                    choices=[int(x.strip())-1 for x in raw.split(",")]
                    if all(0<=c<len(q["options"]) for c in choices) and choices:
                        ua[q["id"]]=choices; break
                    else: print(f"   ❌ Enter numbers 1-{len(q['options'])}")
                except(ValueError,KeyboardInterrupt): print("   ❌ Invalid input")
        else:
            while True:
                try:
                    ch=int(input(f"\n   Your answer (1-{len(q['options'])}): ").strip())
                    if 1<=ch<=len(q["options"]): ua[q["id"]]=ch-1; break
                    else: print(f"   ❌ Enter 1-{len(q['options'])}")
                except(ValueError,KeyboardInterrupt): print("   ❌ Invalid input")
    return ua


# ═══════════════════════════════════════════════════════════════════════
# 🔎  TEACHER SCHOOL FILTER  (خطوة 5 — بعد النتائج)
# ═══════════════════════════════════════════════════════════════════════

def teacher_school_filter(cl, pr, tc, pkey, accepted_subjects):
    """
    المعلم يفلتر المدارس المقترحة ليه
    حسب: المدينة + نوع المدرسة + المادة + عدد النتائج
    """
    print("\n"+"="*65)
    print("  🔍  FIND YOUR IDEAL SCHOOL")
    print("  Filter the 500 schools based on your preferences")
    print("="*65)

    # ── 1. المدينة ────────────────────────────────────────────────────
    all_cities = sorted(set(s["city"] for s in SCHOOLS.values()))
    print("\n  📍 Step 1: City preference")
    print("   Available cities:")
    # عرض المدن في صفوف
    for i in range(0, len(all_cities), 4):
        row = all_cities[i:i+4]
        print("   " + "  |  ".join(f"{c:<22}" for c in row))
    print("\n   Type city name or press ENTER to skip (any city)")
    chosen_city = None
    while True:
        try:
            raw = input("   City: ").strip()
            if raw == "":
                chosen_city = None; break
            # partial match
            matches = [c for c in all_cities if raw.lower() in c.lower()]
            if len(matches) == 1:
                chosen_city = matches[0]
                print(f"   ✅ Selected: {chosen_city}"); break
            elif len(matches) > 1:
                print(f"   Multiple matches: {', '.join(matches)}")
                print("   Please be more specific")
            else:
                print(f"   ❌ '{raw}' not found. Try again or press ENTER to skip")
        except (ValueError, KeyboardInterrupt): print("   ❌ Invalid")

    # ── 2. نوع المدرسة ────────────────────────────────────────────────
    all_types = sorted(set(s["type"] for s in SCHOOLS.values()))
    print("\n  🏫 Step 2: School type preference")
    print("   0. Any type (no filter)")
    for i, t in enumerate(all_types, 1):
        print(f"   {i}. {t}")
    chosen_type = None
    while True:
        try:
            ch = int(input(f"\n   Your choice (0-{len(all_types)}): ").strip())
            if ch == 0:
                chosen_type = None; break
            elif 1 <= ch <= len(all_types):
                chosen_type = all_types[ch-1]; break
            else: print(f"   ❌ Enter 0-{len(all_types)}")
        except (ValueError, KeyboardInterrupt): print("   ❌ Invalid")

    # ── 3. المادة ─────────────────────────────────────────────────────
    subj_list = ["KG","Arabic","Math","Science","English","Social"]
    if accepted_subjects:
        avail = [s for s in subj_list if s in accepted_subjects]
    else:
        avail = subj_list
    print("\n  📚 Step 3: Subject preference")
    print("   0. All my accepted subjects (no filter)")
    for i, s in enumerate(avail, 1):
        acc = "✅" if s in accepted_subjects else "⚠️"
        print(f"   {i}. {acc} {s}")
    chosen_subj = None
    while True:
        try:
            ch = int(input(f"\n   Your choice (0-{len(avail)}): ").strip())
            if ch == 0:
                chosen_subj = None; break
            elif 1 <= ch <= len(avail):
                chosen_subj = avail[ch-1]; break
            else: print(f"   ❌ Enter 0-{len(avail)}")
        except (ValueError, KeyboardInterrupt): print("   ❌ Invalid")

    # ── 4. عدد النتائج ─────────────────────────────────────────────────
    print("\n  🔢 Step 4: How many schools to show?")
    print("   1. Top 5    2. Top 10    3. Top 20    4. All matches")
    top_n_map = {1:5, 2:10, 3:20, 4:999}
    top_n = 10
    while True:
        try:
            ch = int(input("\n   Your choice (1-4): ").strip())
            if 1 <= ch <= 4:
                top_n = top_n_map[ch]; break
            else: print("   ❌ Enter 1-4")
        except (ValueError, KeyboardInterrupt): print("   ❌ Invalid")

    # ── Apply filters & rank ───────────────────────────────────────────
    print("\n  ⏳ Searching schools...")

    filter_subjs = [chosen_subj] if chosen_subj else (accepted_subjects if accepted_subjects else None)

    results = []
    for school_id, school in SCHOOLS.items():
        # city filter
        if chosen_city and school["city"] != chosen_city:
            continue
        # type filter
        if chosen_type and school["type"] != chosen_type:
            continue

        mins = school["min_scores"]
        below_min = (cl<mins["classroom"] or pr<mins["professional"] or tc<mins["tech"])

        # subject filter + score
        check_subjs = filter_subjs if filter_subjs else school["subjects_needed"]
        matched, scores = [], []
        for subj in school["subjects_needed"]:
            if check_subjs and subj not in check_subjs:
                continue
            w = school["subject_weights"].get(subj, {"classroom":0.33,"professional":0.33,"tech":0.34})
            sc = round(min(99, max(10, cl*w["classroom"] + pr*w["professional"] + tc*w["tech"])))
            if sc >= school["school_threshold"] and not below_min:
                matched.append((subj, sc))
                scores.append(sc)

        if below_min:
            status = "❌ Below minimum"; match_score = 0
        elif not matched:
            status = "⚠️  Score too low"; match_score = 0
        else:
            status = "✅ Qualified"; match_score = round(np.mean(scores))

        pm = pkey in school["preferred_personalities"]
        results.append({
            "school_id":      school_id,
            "school_name":    school["name"],
            "school_type":    school["type"],
            "city":           school["city"],
            "match_score":    match_score,
            "status":         status,
            "matched_subjects": matched,
            "personality_match": pm,
            "effective_score": min(99, match_score + (5 if pm else 0)),
            "notes":          school["notes"],
        })

    results.sort(key=lambda x: (x["status"] != "✅ Qualified", -x["effective_score"]))
    qualified = [r for r in results if r["status"] == "✅ Qualified"]
    others    = [r for r in results if r["status"] != "✅ Qualified"]

    # ── Print results ──────────────────────────────────────────────────
    print("\n"+"="*65)
    f_city  = f"City: {chosen_city}"    if chosen_city  else "City: Any"
    f_type  = f"Type: {chosen_type}"    if chosen_type  else "Type: Any"
    f_subj  = f"Subject: {chosen_subj}" if chosen_subj  else "Subject: All accepted"
    print(f"  🏫  FILTERED SCHOOL RESULTS")
    print(f"  Filters → {f_city} | {f_type} | {f_subj}")
    print("="*65)

    show_q = qualified[:top_n]
    if show_q:
        print(f"\n  ✅ Qualified schools ({len(qualified)} found, showing {len(show_q)}):\n")
        for i, r in enumerate(show_q, 1):
            pm = "⭐" if r["personality_match"] else ""
            subs = ", ".join([f"{s}({sc}%)" for s,sc in r["matched_subjects"]])
            print(f"  {i}. {r['school_name']}")
            print(f"     📍 {r['city']}  |  {r['school_type']}  {pm}")
            print(f"     Score   : {r['effective_score']}%")
            print(f"     Subjects: {subs}")
            if r["notes"]: print(f"     📝 {r['notes'][:75]}")
            print()
    else:
        print("\n  ❌ No qualified schools found with these filters.")
        print("     Try broadening your search (remove city/type filter).\n")

    if others and len(show_q) == 0:
        print(f"  ⚠️  Closest schools (not yet qualified):")
        for r in others[:5]:
            mins = SCHOOLS[r["school_id"]]["min_scores"]
            print(f"     • {r['school_name'][:45]}")
            print(f"       📍 {r['city']} | Needs: CL≥{mins['classroom']}% PR≥{mins['professional']}% TC≥{mins['tech']}%")

    print("="*65)

    # ── Search again? ──────────────────────────────────────────────────
    again = input("\n  🔄 Search again with different filters? (y/n): ").strip().lower()
    if again == 'y':
        teacher_school_filter(cl, pr, tc, pkey, accepted_subjects)


# ═══════════════════════════════════════════════════════════════════════
# 1️⃣3️⃣  SHOW RESULTS
# ═══════════════════════════════════════════════════════════════════════
def show_results(ua,ens,shap_exp,le_dict,csv_stats):
    cl,pr,tc,ov=compute_dimension_scores(ua)
    p_label,p_desc=get_personality(cl,pr,tc)
    pkey=get_teacher_personality_type(cl,pr,tc,ua)
    ptype=PERSONALITY_TYPES[pkey]

    X_in=build_feature_row(ua,le_dict)
    pred=ens.predict(X_in)[0]; proba=ens.predict_proba(X_in)[0]; conf=round(max(proba)*100,1)
    shap_vals=shap_exp.shap_values(X_in)
    if isinstance(shap_vals,list): sv=shap_vals[1][0]
    elif hasattr(shap_vals,'ndim') and shap_vals.ndim==3: sv=shap_vals[0,:,1]
    else: sv=shap_vals[0]
    shap_s=pd.Series(sv,index=feature_cols)
    top_pos=shap_s.sort_values(ascending=False).head(3)
    top_neg=shap_s[shap_s<0].sort_values().head(3)

    print("\n\n"+"="*65); print("  🧠 YOUR TEACHING PERSONALITY"); print("="*65)
    print(f"\n  {p_label}\n  {p_desc}")
    print(f"\n  📊 SCORE BREAKDOWN:")
    print(f"  Classroom Management  │ {_bar(cl)} {cl}%")
    print(f"  Professional Skills   │ {_bar(pr)} {pr}%")
    print(f"  AI & Technology       │ {_bar(tc)} {tc}%")
    print(f"  ─────────────────────────────────────────────")
    print(f"  Overall Score         │ {_bar(ov)} {ov}%")
    print(f"\n  🤖 MODEL: {'✅ ACCEPTED' if pred==1 else '❌ REJECTED'}  (confidence: {conf}%)")
    print(f"\n  🔍 KEY FACTORS:  ✅ Positive:")
    for f,v in top_pos.items(): print(f"     • {EN_NAMES.get(f,f):<35} +{v:.3f}")
    if len(top_neg)>0:
        print(f"  ⚠️  Needs improvement:")
        for f,v in top_neg.items(): print(f"     • {EN_NAMES.get(f,f):<35}  {v:.3f}")

    print("\n"+"="*65); print("  🎭 YOUR TEACHER PERSONALITY TYPE"); print("="*65)
    print(f"\n  {ptype['icon']}  {ptype['label']}  |  {ptype['arabic']}")
    print(f"\n  {ptype['desc']}")
    print(f"\n  Team style : {ptype['collab']}")
    print(f"  Growth tip : {ptype['growth']}")
    print(f"  Watch out  : {ptype['watch']}")

    print("\n"+"="*65); print("  📚 SUBJECT COMPATIBILITY"); print("="*65)
    ALL_S=["KG","Arabic","Math","Science","English","Social"]
    subject_scores={}
    for subj in ALL_S:
        sc,acc,_,_,_=get_subject_result(cl,pr,tc,subj,csv_stats)
        subject_scores[subj]=(sc,acc)
    rec=[s for s,(sc,ac) in subject_scores.items() if ac]
    nrec=[s for s,(sc,ac) in subject_scores.items() if not ac]
    if rec:
        print(f"\n  ✅ Accepted:")
        for s in rec: print(f"     • {s:<10} ({subject_scores[s][0]}%)")
    else: print(f"\n  ❌ No subjects accepted yet — keep developing!")
    if nrec:
        print(f"\n  ❌ Rejected:")
        for s in nrec: print(f"     • {s:<10} ({subject_scores[s][0]}%)")

    print("\n"+"="*65); print("  🏫 SCHOOL PREFERENCES  (Q15–19)"); print("="*65)
    _show_preferences(ua,cl,pr,tc)

    # ── SCHOOL RECOMMENDATIONS ────────────────────────────────────────
    results=recommend_schools_for_teacher(cl,pr,tc,pkey,top_n=10)
    print_school_recommendations(results)

    # ── 🔍 STEP 5: Teacher School Filter ─────────────────────────────
    print("\n"+"="*65)
    print("  🔍  STEP 5: FIND YOUR IDEAL SCHOOL")
    print("="*65)
    print("  Want to filter schools by city, type, or subject?")
    do_filter = input("  Search for schools? (y/n): ").strip().lower()
    if do_filter == 'y':
        teacher_school_filter(cl, pr, tc, pkey, rec)

    # ── Subject deep-dive ─────────────────────────────────────────────
    print("\n"+"="*65); print("  🔎 SUBJECT DEEP-DIVE"); print("="*65)
    print("\n  Which subject would you like detailed feedback for?")
    for i,s in enumerate(ALL_S,1):
        sc,ac=subject_scores[s]; print(f"   {i}. {'✅' if ac else '❌'} {s} ({sc}%)")
    print(f"   {len(ALL_S)+1}. Exit")
    while True:
        try:
            ch=int(input(f"\n   Your choice (1-{len(ALL_S)+1}): ").strip())
            if ch==len(ALL_S)+1: print("\n👋 Thank you! Good luck.\n"); break
            elif 1<=ch<=len(ALL_S):
                subj=ALL_S[ch-1]
                sc,ac,strengths,weaknesses,crit=get_subject_result(cl,pr,tc,subj,csv_stats)
                print(f"\n{'─'*65}\n  📘 {subj} — {crit['desc']}\n{'─'*65}")
                print(f"  Result : {'✅ ACCEPTED' if ac else '❌ REJECTED'} | Score: {sc}% (threshold: {crit['threshold']}%)")
                print(f"  Note   : {crit['notes']}")
                st=csv_stats.get(subj,{})
                if st:
                    print(f"\n  📈 BENCHMARK ({st['count']} teachers):")
                    for lbl,val,scale in [("Teacher Eval",st["avg_eval"],10),("Tech",st["avg_tech"],10)]:
                        b=int((val/scale)*20); print(f"     {lbl:<14} │ {'█'*b+'░'*(20-b)} {val:.1f}/{scale}")
                    print(f"     Excellent:{st['pct_excel']:.1f}% | Good:{st['pct_good']:.1f}%")
                w=crit["weights"]
                print(f"\n  Weights: CL:{int(w['classroom']*100)}% | PR:{int(w['professional']*100)}% | TC:{int(w['tech']*100)}%")
                if strengths: [print(f"  ✅ {s}") for s in strengths]
                if weaknesses: [print(f"  ⚠️  {ww}") for ww in weaknesses]
                print(f"{'─'*65}")
                if input("\n  Check another subject? (y/n): ").strip().lower()!='y':
                    print("\n👋 Thank you! Good luck.\n"); break
                else:
                    for i,s in enumerate(ALL_S,1):
                        sc2,ac2=subject_scores[s]; print(f"   {i}. {'✅' if ac2 else '❌'} {s} ({sc2}%)")
                    print(f"   {len(ALL_S)+1}. Exit")
            else: print(f"   ❌ Enter 1–{len(ALL_S)+1}")
        except(ValueError,KeyboardInterrupt): print("   ❌ Invalid input")


def _show_preferences(ua,cl,pr,tc):
    maps={
        15:{0:"Strict",1:"Flexible",2:"Structured",3:"Free-flowing"},
        16:{0:"Calm",1:"Energetic",2:"Balanced",3:"Playful"},
        18:{0:"Direct",1:"Empathetic",2:"Formal",3:"Casual"},
    }
    descs={
        "Strict":"Firm rules and high expectations.",
        "Flexible":"Adaptable based on situation.",
        "Structured":"Clear routines and organised flow.",
        "Free-flowing":"Spontaneous and creative.",
        "Calm":"Peaceful — ideal for focused work.",
        "Energetic":"High-energy — great for active learners.",
        "Balanced":"Versatile and adaptive.",
        "Playful":"Highly motivating for younger students.",
        "Direct":"Clear and straightforward.",
        "Empathetic":"Understanding and compassionate.",
        "Formal":"Professional and respectful.",
        "Casual":"Friendly and approachable.",
    }
    labels={15:"📐 Teaching Style",16:"⚡ Classroom Energy",18:"💬 Communication"}
    for qid,m in maps.items():
        a=ua.get(qid)
        if a is not None:
            v=m[a]; print(f"\n  {labels[qid]} : {v}\n     → {descs[v]}")
    for qid,icon,m in [(17,"👑",{0:"Leader",1:"Supporter",2:"Collaborator",3:"Mentor"}),
                       (19,"🔧",{0:"Analytical",1:"Creative",2:"Practical",3:"Innovative"})]:
        a=ua.get(qid,[])
        if a:
            chosen=[m[i] for i in a]
            print(f"\n  {icon} {['Leadership','Problem-Solving'][qid==19]} : {', '.join(chosen)}")
    print(f"\n  {'─'*60}\n  💡 SCHOOL FIT INSIGHT\n  {'─'*60}")
    tips=[]
    a15=ua.get(15); a16=ua.get(16); a17=ua.get(17,[])
    if a15 is not None and {0:"Strict",1:"Flexible",2:"Structured",3:"Free-flowing"}[a15] in ("Flexible","Free-flowing") and tc>=65:
        tips.append("Flexible style + strong tech = great fit for STEM or international schools.")
    if a15 is not None and {0:"Strict",1:"Flexible",2:"Structured",3:"Free-flowing"}[a15]=="Strict" and pr>=65:
        tips.append("Structured + professional strength = ideal for public or traditional schools.")
    if a16 is not None and {0:"Calm",1:"Energetic",2:"Balanced",3:"Playful"}[a16]=="Energetic" and cl>=65:
        tips.append("High energy + strong classroom = excellent active-learning fit.")
    if a17 and 3 in a17: tips.append("Mentor leadership = valuable for schools focused on student development.")
    if not tips: tips.append("Balanced and versatile profile — suitable for most school types.")
    for t in tips: print(f"     👉 {t}")

# ═══════════════════════════════════════════════════════════════════════
# 1️⃣4️⃣  SCHOOL VIEW MENU
# ═══════════════════════════════════════════════════════════════════════
def school_view_menu():
    # ── أول حاجة: المدرسة تدخل اسمها أو الـ ID بتاعها ──────────────
    print("\n"+"="*65)
    print("  🏫  SCHOOL PORTAL")
    print(f"      {len(SCHOOLS)} schools | {len(REAL_TEACHERS_DB)} teachers")
    print("="*65)
    print("\n  Are you a school looking for teachers?")
    print("  1. 🏫  I am a specific school — find teachers for me")
    print("  2. 🔍  Browse / search all schools")
    print("  3. 🔙  Back to main menu")

    try:
        ch = int(input("\n   Choice (1-3): ").strip())
        if ch == 3: return
        elif ch == 1: _school_self_portal()
        elif ch == 2: _school_browse_portal()
        else: print("   ❌ Enter 1-3")
    except (ValueError, KeyboardInterrupt): print("   ❌ Invalid input")


def _school_self_portal():
    """المدرسة تدخل اسمها وتشوف المعلمين المؤهلين ليها مرتبين"""
    print("\n  Enter your school name or ID (partial name is fine):")
    raw = input("   Search: ").strip().lower()
    if not raw: return

    matches = [(sid,s) for sid,s in SCHOOLS.items()
               if raw in s['name'].lower() or raw in sid.lower()]

    if not matches:
        print(f"   ❌ No school found matching '{raw}'")
        return
    elif len(matches) == 1:
        sid, school = matches[0]
    else:
        print(f"\n   Found {len(matches)} matches:")
        for i,(sid,s) in enumerate(matches[:10],1):
            print(f"   {i}. [{sid}] {s['name']} — {s['city']}")
        try:
            sel = int(input(f"\n   Select (1-{min(len(matches),10)}): ").strip())
            if 1 <= sel <= min(len(matches),10):
                sid, school = matches[sel-1]
            else: return
        except (ValueError, KeyboardInterrupt): return

    # ── عرض المدرسة ──────────────────────────────────────────────────
    print("\n"+"="*65)
    print(f"  🏫  {school['name']}")
    print(f"      {school['type']} | {school['city']}")
    print(f"      Threshold: {school['school_threshold']}% | ")
    mins = school['min_scores']
    print(f"      Min required: CL≥{mins['classroom']}% | PR≥{mins['professional']}% | TC≥{mins['tech']}%")
    print("="*65)

    # ── فلتر اختياري قبل العرض ───────────────────────────────────────
    print("\n  Filter teachers before viewing? (recommended for large lists)")
    print("  1. Show all qualified teachers")
    print("  2. Filter by subject, stage, or gender")
    try:
        fch = int(input("\n   Choice (1-2): ").strip())
    except (ValueError, KeyboardInterrupt): fch = 1

    if fch == 2:
        _school_filtered_view(sid, school)
    else:
        ranked = rank_teachers_for_school(sid, REAL_TEACHERS_DB)
        _display_school_ranked(sid, school, ranked)


def _school_filtered_view(school_id, school):
    """فلتر متقدم للمدرسة"""
    ranked_all = rank_teachers_for_school(school_id, REAL_TEACHERS_DB)
    subj_list  = list(ranked_all.keys())

    # ── اختار المادة ─────────────────────────────────────────────────
    print("\n  📚 Filter by subject:")
    print("   0. All subjects")
    for i,s in enumerate(subj_list,1):
        n = len(ranked_all[s])
        print(f"   {i}. {s:<12} ({n} qualified teachers)")
    chosen_subj = None
    try:
        ch = int(input(f"\n   Choice (0-{len(subj_list)}): ").strip())
        if 1 <= ch <= len(subj_list):
            chosen_subj = subj_list[ch-1]
    except (ValueError, KeyboardInterrupt): pass

    # ── اختار المرحلة ────────────────────────────────────────────────
    all_stages = sorted(set(
        t['stage'].strip() for teachers in ranked_all.values()
        for t in teachers if t['stage'].strip() not in ('nan','')
    ))
    print("\n  🎓 Filter by teaching stage:")
    print("   0. All stages")
    for i,s in enumerate(all_stages,1): print(f"   {i}. {s}")
    chosen_stage = None
    try:
        ch = int(input(f"\n   Choice (0-{len(all_stages)}): ").strip())
        if 1 <= ch <= len(all_stages):
            chosen_stage = all_stages[ch-1]
    except (ValueError, KeyboardInterrupt): pass

    # ── اختار الجنس ──────────────────────────────────────────────────
    print("\n  👤 Filter by gender:")
    print("   0. All   1. Female   2. Male")
    chosen_gender = None
    try:
        ch = int(input("\n   Choice (0-2): ").strip())
        if ch == 1: chosen_gender = "Female"
        elif ch == 2: chosen_gender = "Male"
    except (ValueError, KeyboardInterrupt): pass

    # ── Apply filters ─────────────────────────────────────────────────
    filtered = {}
    check_subjs = [chosen_subj] if chosen_subj else subj_list
    for subj in check_subjs:
        teachers = ranked_all.get(subj, [])
        if chosen_stage:
            teachers = [t for t in teachers if t.get('stage','').strip() == chosen_stage.strip()]
        if chosen_gender:
            teachers = [t for t in teachers if t.get('gender','').strip() == chosen_gender.strip()]
        filtered[subj] = teachers

    f_labels = []
    if chosen_subj:  f_labels.append(f"Subject: {chosen_subj}")
    if chosen_stage: f_labels.append(f"Stage: {chosen_stage}")
    if chosen_gender:f_labels.append(f"Gender: {chosen_gender}")
    print(f"\n  🔍 Filters: {' | '.join(f_labels) if f_labels else 'None'}")

    _display_school_ranked(school_id, school, filtered)


def _display_school_ranked(school_id, school, ranked):
    """عرض المعلمين مرتبين — مع row range selection"""
    print("\n"+"="*65)
    print(f"  👨‍🏫  QUALIFIED TEACHERS — {school['name'][:45]}")
    print("="*65)

    for subj, teachers in ranked.items():
        if not teachers: continue
        total_subj = len(teachers)
        print(f"\n  📚 {subj}  ({total_subj} qualified — best → worst)")
        print(f"  {'─'*60}")

        # ── Row range selection ───────────────────────────────────────
        if total_subj > 10:
            print(f"  Rows available: 1 – {total_subj}")
            print(f"  Enter range to view (e.g. 1-20 or 1-{total_subj} for all)")
            print(f"  Press ENTER to show first 10")
            raw = input("  Range: ").strip()
            if raw == "":
                start, end = 1, min(10, total_subj)
            elif "-" in raw:
                try:
                    parts = raw.split("-")
                    start = max(1, int(parts[0].strip()))
                    end   = min(total_subj, int(parts[1].strip()))
                    if start > end: start, end = 1, min(10, total_subj)
                except:
                    start, end = 1, min(10, total_subj)
            else:
                try:
                    n = int(raw.strip())
                    start, end = 1, min(n, total_subj)
                except:
                    start, end = 1, min(10, total_subj)
            slice_teachers = teachers[start-1:end]
            print(f"  Showing rows {start}–{end} of {total_subj}")
        else:
            slice_teachers = teachers
            start = 1

        # اعرض الـ weights اللي المدرسة دي بتستخدمها
        if slice_teachers:
            w_info = slice_teachers[0].get("weights_used", "")
            if w_info: print(f"  ⚖️  School weights: {w_info}")
        print(f"  {'─'*60}")
        print(f"  {'#':<4} {'Name':<20} {'Score':>6}  {'CL→':>5} {'PR→':>5} {'TC→':>5}  ⭐  Stage")
        print(f"  {'─'*60}")
        for i, t in enumerate(slice_teachers, start):
            pm = "⭐" if t["personality_match"] else "  "
            cl_c = t.get("cl_contribution", t["classroom"])
            pr_c = t.get("pr_contribution", t["professional"])
            tc_c = t.get("tc_contribution", t["tech"])
            print(f"  #{i:<3} {t['name']:<20} {t['effective_score']:>5}%  "
                  f"{cl_c:>4}  {pr_c:>4}  {tc_c:>4}  "
                  f"{pm} {t['stage']}")
        print()

    total = sum(len(v) for v in ranked.values())
    print(f"  Total qualified: {total} teachers")
    print("="*65)

    again = input("\n  Apply different filters? (y/n): ").strip().lower()
    if again == 'y':
        _school_filtered_view(school_id, school)


def _school_browse_portal():
    """Browse/search للمدارس"""
    while True:
        print("\n"+"="*65)
        print("  🔍  BROWSE SCHOOLS")
        print("="*65)
        print("   1. Search by name or city")
        print("   2. Browse by type")
        print("   3. Top schools per subject (by teacher count)")
        print("   4. Back")
        try:
            ch = int(input("\n   Choice (1-4): ").strip())
            if ch == 4: return
            elif ch == 1: _search_schools()
            elif ch == 2: _browse_by_type()
            elif ch == 3: _top_schools_for_subject()
            else: print("   ❌ Enter 1-4")
        except (ValueError, KeyboardInterrupt): print("   ❌ Invalid")



def _pick_range(items, label="items", default_n=10):
    """
    يسأل المستخدم يختار range من قائمة
    يرجع (slice, start_idx)
    """
    total = len(items)
    if total == 0: return [], 0
    if total <= default_n: return items, 0

    print(f"  📋 {total} {label} available  (rows 1–{total})")
    print(f"  Enter range (e.g. 1-20) or ENTER for first {default_n}:")
    raw = input("  Range: ").strip()

    if raw == "":
        return items[:default_n], 0
    elif "-" in raw:
        try:
            a, b = raw.split("-")
            start = max(1, int(a.strip()))
            end   = min(total, int(b.strip()))
            if start > end: start, end = 1, default_n
            return items[start-1:end], start-1
        except:
            return items[:default_n], 0
    else:
        try:
            n = int(raw.strip())
            return items[:min(n, total)], 0
        except:
            return items[:default_n], 0

def _smart_score(query, sid, school):
    """
    Smart search scoring:
    - ID exact match → 100
    - اسم يبدأ بالـ query → 80
    - كلمة كاملة في الاسم → 60
    - مدينة exact → 70
    - نوع المدرسة → 50
    - partial في الاسم (لو query >= 3 حروف) → 30
    """
    q = query.lower().strip()
    name = school['name'].lower()
    city = school['city'].lower()
    stype = school['type'].lower()

    if not q or len(q) < 2: return 0  # تجاهل البحث بحرف واحد

    score = 0
    # ID match
    if q == sid.lower(): return 100
    # ID prefix: لازم يكون SCH + رقم (مش SCH لوحده)
    if (len(q) >= 5 and q[3:].isdigit() and
            sid.lower().startswith(q)):
        score = max(score, 85)

    # اسم يبدأ بالـ query
    if name.startswith(q): score = max(score, 80)

    # كلمة كاملة في الاسم
    name_words = name.split()
    if any(w == q for w in name_words): score = max(score, 65)
    if any(w.startswith(q) for w in name_words) and len(q) >= 3:
        score = max(score, 55)

    # مدينة
    if city == q: score = max(score, 75)
    if city.startswith(q) and len(q) >= 3: score = max(score, 60)
    if q in city and len(q) >= 3: score = max(score, 40)

    # نوع
    if stype == q or stype.startswith(q): score = max(score, 50)

    # partial في الاسم (بس لو query >= 4 حروف)
    if len(q) >= 4 and q in name: score = max(score, 30)

    return score


def _search_schools():
    print("\n  🔍 Search tips:")
    print("     • School ID  : SCH0050")
    print("     • City name  : Cairo / Alexandria")
    print("     • School type: Public / Private / Language / International")
    print("     • Part of name (min 4 chars): language / primary")
    q = input("\n   Search: ").strip()

    if len(q) < 2:
        print("   ❌ Please enter at least 2 characters"); return

    # منع البحث بـ SCH لوحده بدون رقم
    if q.lower() in ('sch', 'school', 'schl'):
        print("   ❌ Too generic — add more letters or a school number (e.g. SCH0050)")
        return

    # Score كل مدرسة
    scored = []
    for sid, s in SCHOOLS.items():
        sc = _smart_score(q, sid, s)
        if sc > 0:
            scored.append((sc, sid, s))

    scored.sort(key=lambda x: -x[0])
    matches = [(sid, s) for _, sid, s in scored]

    if not matches:
        print(f"   ❌ No schools found for '{q}'")
        print("   Try: city name, school type, or at least 4 chars of school name")
        return

    print(f"\n   Found {len(matches)} school(s) matching '{q}':")
    shown, offset = _pick_range(matches, label="schools", default_n=15)
    print()
    for i, (sid, s) in enumerate(shown, offset+1):
        relevance = next(sc for sc,_sid,_ in scored if _sid==sid)
        bar = "█" * (relevance // 10) + "░" * (10 - relevance // 10)
        print(f"   {i}. [{sid}] {s['name']}")
        print(f"      📍 {s['city']} | {s['type']} | Relevance: {bar} {relevance}%")
        print(f"      Subjects: {', '.join(s['subjects_needed'])} | Threshold: {s['school_threshold']}%")
        print()

    if matches:
        try:
            sel = int(input(f"   Select row number (or 0 to skip): ").strip())
            if 1 <= sel <= len(matches):
                sid, school = matches[sel-1]
                _show_school_teachers(sid, school)
        except (ValueError, KeyboardInterrupt): pass

def _browse_by_type():
    types={}
    for sid,s in SCHOOLS.items():
        t=s['type']
        if t not in types: types[t]=[]
        types[t].append((sid,s))
    print("\n   School types available:")
    type_list=list(types.items())
    for i,(t,schools) in enumerate(type_list,1):
        print(f"   {i}. {t:<20} ({len(schools)} schools)")
    try:
        ch=int(input(f"\n   Select type (1-{len(type_list)}): ").strip())
        if 1<=ch<=len(type_list):
            t,schools=type_list[ch-1]
            print(f"\n   {t} Schools ({len(schools)} total):\n")
            shown, offset = _pick_range(schools, label="schools", default_n=15)
            print()
            for i,(sid,s) in enumerate(shown, offset+1):
                print(f"   {i}. {s['name'][:45]:<45} | {s['city']}")
            if len(schools)>1:
                try:
                    sel=int(input(f"\n   Select row number (or 0 to skip): ").strip())
                    if 1<=sel<=len(schools):
                        sid,school=schools[sel-1]
                        _show_school_teachers(sid,school)
                except(ValueError,KeyboardInterrupt): pass
    except(ValueError,KeyboardInterrupt): pass


def _top_schools_for_subject():
    subj_list=["Math","Arabic","English","Science","KG","Social"]
    print("\n   Select subject:")
    for i,s in enumerate(subj_list,1): print(f"   {i}. {s}")
    try:
        ch=int(input(f"\n   Choice (1-{len(subj_list)}): ").strip())
        if 1<=ch<=len(subj_list):
            subj=subj_list[ch-1]
            # ابحث عن المدارس اللي عندها المادة دي
            relevant=[(sid,s) for sid,s in SCHOOLS.items() if subj in s['subjects_needed']]
            # رتبهم حسب عدد المعلمين المؤهلين
            ranked_schools=[]
            for sid,s in relevant:
                ranked=rank_teachers_for_school(sid,REAL_TEACHERS_DB)
                n=len(ranked.get(subj,[]))
                ranked_schools.append((sid,s,n))
            ranked_schools.sort(key=lambda x:-x[2])
            print(f"\n   Top schools for {subj} ({len(ranked_schools)} total):")
            shown, offset = _pick_range(ranked_schools, label="schools", default_n=10)
            print()
            for i,(sid,s,n) in enumerate(shown, offset+1):
                print(f"   {i}. [{sid}] {s['name'][:45]:<45}")
                print(f"      📍 {s['city']} | {s['type']} | {n} qualified teachers")
            if ranked_schools:
                try:
                    sel=int(input(f"\n   Select row number (or 0 to skip): ").strip())
                    if 1<=sel<=len(ranked_schools):
                        sid,school,_=ranked_schools[sel-1]
                        _show_school_teachers(sid,school)
                except(ValueError,KeyboardInterrupt): pass
    except(ValueError,KeyboardInterrupt): pass


def _show_school_teachers(school_id, school):
    ranked=rank_teachers_for_school(school_id,REAL_TEACHERS_DB)
    print_teachers_for_school(school_id,ranked)
    subj_list=list(ranked.keys())
    if not subj_list: return
    while True:
        print("\n  View detailed ranking for which subject?")
        for i,subj in enumerate(subj_list,1):
            n=len(ranked[subj]); print(f"   {i}. {subj}  ({n} qualified teachers)")
        print(f"   {len(subj_list)+1}. Back")
        try:
            sc2=int(input("   Choice: ").strip())
            if sc2==len(subj_list)+1: break
            elif 1<=sc2<=len(subj_list):
                subj=subj_list[sc2-1]; teachers=ranked[subj]
                print(f"\n{'─'*65}")
                print(f"  📊 {school['name'][:45]} — {subj}")
                print(f"  Ranked best → worst  ({len(teachers)} qualified)\n{'─'*65}")
                if not teachers: print("  No qualified teachers.")
                for rank,t in enumerate(teachers,1):
                    print(f"\n  #{rank} {t['name']:<20} {'⭐ personality match' if t['personality_match'] else ''}")
                    print(f"     Score:{t['effective_score']}% | CL:{t['classroom']}% | PR:{t['professional']}% | TC:{t['tech']}%")
                    print(f"     Stage: {t['stage']} | Gender: {t['gender']} | Type: {t['personality_type']}")
                print(f"{'─'*65}")
            else: print("   ❌ Invalid")
        except(ValueError,KeyboardInterrupt): print("   ❌ Invalid input")

# ═══════════════════════════════════════════════════════════════════════
# 🚀  MAIN
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    ens,shap_exp,le_dict,csv_stats=load_and_train()
    while True:
        print("\n"+"="*65)
        print("  🎓  TEACHER EVALUATION SYSTEM  v4.0")
        print(f"      {len(SCHOOLS)} schools | {len(REAL_TEACHERS_DB)} teachers")
        print("="*65)
        print("   1. 👨‍🏫  I am a TEACHER  — Take the assessment")
        print("   2. 🏫   I am a SCHOOL   — View & filter teachers")
        print("   3. 🚪   Exit")
        try:
            mode=int(input("\n   Choose mode (1-3): ").strip())
            if mode==1:
                answers=ask_questions()
                show_results(answers,ens,shap_exp,le_dict,csv_stats)
            elif mode==2:
                school_view_menu()
            elif mode==3:
                print("\n👋 Goodbye!\n"); break
            else: print("   ❌ Enter 1, 2, or 3")
        except(ValueError,KeyboardInterrupt): print("   ❌ Invalid input")
