# ═══════════════════════════════════════════════════════════════════════
# 🎓 نظام تقييم المعلمين - النسخة الكاملة المدموجة
# Terminal mode  →  python predictor.py              (main_menu)
# API mode       →  python predictor.py '<json>'     (Express/React)
# ═══════════════════════════════════════════════════════════════════════

import sys
import json
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import shap

# ═══════════════════════════════════════════════════════════════════════
# 1️⃣ تعريف أسماء الأعمدة والقواميس
# ═══════════════════════════════════════════════════════════════════════

C_TECH      = 'Tech use'
C_AI        = 'Integrate AI'
C_DISRUPT   = 'Disruptive'
C_WEAK      = 'slow learners'
C_UNMOTIV   = 'Disinterested'
C_PARENT    = 'Parent objections'
C_GIFTED    = 'High performers'
C_AICHEAT   = 'AI homework'
C_AIAPP     = 'AI app concerns'
C_CONFLICT  = 'I disagreed with a fellow teacher or administrator (regarding teaching methods).'
C_AGE       = 'Age'
C_EXP       = 'Experience'
C_GENDER    = 'Gender'
C_STAGE     = 'Teacher for the stage'
C_LANGS     = 'Languages'
C_SALARY    = 'Compensation'
C_CHRONIC   = 'chronic disease'
C_WITHDRAWN = "I noticed that one of the students' performance levels started to decline and he became withdrawn."
C_ENGAGESIZE= 'Engagement'
C_NEWSKILL  = 'New skill'

EN_NAMES = {
    C_TECH:         'Technology usage',
    C_AI:           'AI tool integration in teaching',
    C_DISRUPT:      'Handling disruptive students',
    C_WEAK:         'Teaching weaker students',
    C_UNMOTIV:      'Engaging unmotivated students',
    C_PARENT:       'Handling parent objections',
    C_GIFTED:       'Handling gifted students',
    C_AICHEAT:      'Response to AI-assisted homework',
    C_AIAPP:        'Priority when using new AI app',
    C_CONFLICT:     'Handling conflict with colleagues/admin',
    C_AGE:          'Age',
    C_EXP:          'Years of experience',
    C_GENDER:       'Gender',
    C_STAGE:        'Teaching stage',
    'NUM_LANGS':    'Number of languages spoken',
    'SALARY_SCORE': 'Salary satisfaction',
    'CHRONIC_INT':  'Chronic illness',
    'WITHDRAWN_SC': 'Handling withdrawn students',
    C_ENGAGESIZE:   'Student engagement & class size impact',
    C_NEWSKILL:     'New skill learned recently',
}

advice_map = {
    C_TECH:         "Improve effective use of technology inside the classroom.",
    C_AI:           "Integrate AI tools into teaching, not just lesson preparation.",
    C_DISRUPT:      "Handle disruptive students individually, not publicly.",
    C_WEAK:         "Adapt teaching methods to suit different student levels.",
    C_UNMOTIV:      "Design interactive activities to boost student engagement.",
    C_PARENT:       "Communicate calmly with parents and explain grading criteria clearly.",
    C_GIFTED:       "Give gifted students extra challenges instead of asking them to wait.",
    C_AICHEAT:      "Adopt a balanced approach toward AI as a learning tool.",
    C_EXP:          "Gain more experience through training programs and mentoring.",
    'NUM_LANGS':    "Learn an additional language (especially English) to expand capabilities.",
    C_CONFLICT:     "Develop constructive conflict resolution skills with peers and admin.",
    C_ENGAGESIZE:   "Reflect on student engagement levels and find strategies to manage large class sizes.",
    C_NEWSKILL:     "Commit to regular professional learning — even one new skill per term makes a difference.",
}

label_map = {
    0: ("REJECTED ❌", "This teacher does not meet the acceptance criteria."),
    1: ("ACCEPTED ✅", "This teacher meets the acceptance criteria."),
}

feature_cols = [
    C_AGE, C_EXP, 'NUM_LANGS', 'SALARY_SCORE', 'CHRONIC_INT', 'WITHDRAWN_SC',
    C_GENDER, C_STAGE, C_TECH, C_DISRUPT, C_WEAK, C_UNMOTIV, C_PARENT,
    C_GIFTED, C_AICHEAT, C_AI, C_AIAPP, C_CONFLICT,
    C_ENGAGESIZE, C_NEWSKILL,
]

# ═══════════════════════════════════════════════════════════════════════
# 2️⃣ تحميل البيانات وحساب الدرجات
# ═══════════════════════════════════════════════════════════════════════

df = pd.read_excel("teachers_english (2).xlsx")
df.columns = [c.replace('\xa0', ' ').strip() for c in df.columns]

score = pd.Series(0.0, index=df.index)

score += df[C_TECH].astype(str).str.strip().map({
    'Always': 20, 'Effectively': 15, 'Sometimes': 10,
    'Use it a little.': 5, 'Use it sparingly.': 5, 'No, use it': 0,
}).fillna(0)

score += df[C_AI].astype(str).str.strip().map({
    'I train Nob on how to correctly formulate commands (prompts) for searching.': 20,
    'train Nob on how to correctly formulate commands (prompts) for searching.': 20,
    'I use it in the classroom to create interactive activities with the students.': 18,
    'use it in the classroom to create interactive activities with the students.': 18,
    'I only use it to save time in preparing and writing No tests': 10,
    'only use it to save time in preparing and writing No tests': 10,
    "No, I don't use it and I prefer the traditional methods completely.": 0,
}).fillna(0)

score += df[C_DISRUPT].astype(str).str.strip().map({
    'Talk individually': 15, 'Calm then explain': 10, 'Punish': 3, 'Ignore': 0,
}).fillna(0)

score += df[C_WEAK].astype(str).str.strip().map({
    'Adjust by level': 10, 'Use simple examples. Sometimes': 7, 'Explain same': 0,
}).fillna(0)

score += df[C_UNMOTIV].astype(str).str.strip().map({
    'Engaging activities': 10, 'Encouragement': 7, 'Participate': 2,
}).fillna(0)

score += df[C_PARENT].astype(str).str.strip().map({
    'Explain calmly': 10,
    "I'm asking to speak. No, really, outside of class.": 7,
    'Apply policy': 3,
}).fillna(0)

score += df[C_GIFTED].astype(str).str.strip().map({
    'Challenges': 5, 'Make him help his weaker colleagues.': 4,
    'asked him to be quiet until his colleague finished.': 1,
    'I asked him to be quiet until his colleague finished.': 1,
    'Nothing specific': 0,
}).fillna(0)

score += df[C_AICHEAT].astype(str).str.strip().map({
    'Use as aid': 5, 'Discuss content': 4,
    'I ask him to return it under my supervision inside the classroom.': 2,
    'ask him to return it under my supervision inside the classroom.': 2,
    'I ask him to bring it back under my supervision inside the classroom.': 2,
    'ask him to bring it back under my supervision inside the classroom.': 2,
    'Reject homework': 0,
}).fillna(0)

score += df[C_AIAPP].astype(str).str.strip().map({
    "How secure and private is Noob's data on this application?": 3,
    'The ease of use and design of the application.': 2,
    'Free or paid': 1, 'Will it save me the effort of correcting, or no?': 1,
}).fillna(0)

score += df[C_CONFLICT].astype(str).str.strip().map({
    'Present calmly': 2, 'Compromise': 2, 'Adhere policy': 1,
}).fillna(0)

score += df[C_ENGAGESIZE].apply(
    lambda x: 5 if isinstance(x, str) and len(str(x).strip()) > 20
    else (2 if isinstance(x, str) and len(str(x).strip()) > 3 else 0)
)

score += df[C_NEWSKILL].apply(
    lambda x: 3 if isinstance(x, str) and len(str(x).strip()) > 20
    else (1 if isinstance(x, str) and len(str(x).strip()) > 3 else 0)
)

df['RAW_SCORE'] = score
df['TARGET']    = (df['RAW_SCORE'] >= 65).astype(int)

print("📊 BINARY Label Distribution:")
print(df['TARGET'].value_counts().rename({1: '✅ ACCEPTED', 0: '❌ REJECTED'}))
print(f"\nAcceptance Rate: {df['TARGET'].mean()*100:.1f}%\n")

# ═══════════════════════════════════════════════════════════════════════
# 3️⃣ هندسة الميزات
# ═══════════════════════════════════════════════════════════════════════

def convert_age(x):
    if isinstance(x, str) and "-" in x:
        a, b = x.split("-"); return (int(a.strip()) + int(b.strip())) / 2
    try: return float(x)
    except: return np.nan

def convert_exp(x):
    if isinstance(x, str):
        x = x.strip()
        if "10+" in x or "more" in x.lower(): return 12
        if x in ("1yr", "1 yr", "1 year"): return 1
        if x in ("2yrs", "2 yrs", "2 years"): return 2
        if "3-5" in x: return 4
        if "5-10" in x: return 7
        nums = ''.join([c for c in x if c.isdigit()])
        return int(nums) if nums and len(nums) <= 2 else 7
    return np.nan

df2 = df.copy()
df2[C_AGE] = df2[C_AGE].apply(convert_age)
df2[C_EXP] = df2[C_EXP].apply(convert_exp)

df2['SALARY_SCORE'] = df2[C_SALARY].astype(str).str.strip().map({
    'I strongly agree': 5, 'Agree': 4, 'Neutral': 3,
    'No Agree': 2, 'Strongly No Agree': 1,
}).fillna(3)

df2['CHRONIC_INT'] = (df2[C_CHRONIC].astype(str).str.strip().str.lower() == 'yes').astype(int)
df2['NUM_LANGS']   = df2[C_LANGS].astype(str).str.count(';')

df2['WITHDRAWN_SC'] = df2[C_WITHDRAWN].astype(str).str.strip().map({
    'Talk support': 3, 'Adjust approach': 2,
    'I contact the parents directly': 2, 'contact the parents directly': 2,
}).fillna(1)

df3 = df2[feature_cols + ['TARGET', 'RAW_SCORE']].dropna().copy()

le_dict = {}
for col in feature_cols:
    if df3[col].dtype == 'object' or df3[col].apply(lambda x: isinstance(x, str)).any():
        le = LabelEncoder()
        df3[col] = le.fit_transform(df3[col].astype(str))
        le_dict[col] = le
    else:
        df3[col] = pd.to_numeric(df3[col], errors='coerce')

df3 = df3.dropna(subset=feature_cols)

X = df3[feature_cols]
y = df3['TARGET']

print(f"✅ Total samples after cleaning: {len(df3)}")
print(f"   ACCEPTED: {(y==1).sum()}")
print(f"   REJECTED: {(y==0).sum()}\n")

# ═══════════════════════════════════════════════════════════════════════
# 4️⃣ SMOTE
# ═══════════════════════════════════════════════════════════════════════

print("⚙️  Applying SMOTE...")
smote = SMOTE(random_state=42, k_neighbors=3)
X_balanced, y_balanced = smote.fit_resample(X, y)

print(f"✅ After SMOTE: ACCEPTED={( y_balanced==1).sum()} | REJECTED={(y_balanced==0).sum()}\n")

# ═══════════════════════════════════════════════════════════════════════
# 5️⃣ تدريب النموذج
# ═══════════════════════════════════════════════════════════════════════

X_train, X_test, y_train, y_test = train_test_split(
    X_balanced, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
)

print(f"📈 Training: {len(X_train)} | Test: {len(X_test)}\n")

rf = RandomForestClassifier(
    n_estimators=400, min_samples_leaf=2, max_depth=15,
    class_weight='balanced', random_state=42, n_jobs=-1
)
gb = GradientBoostingClassifier(
    n_estimators=250, max_depth=6, learning_rate=0.05,
    subsample=0.8, random_state=42
)
ensemble = VotingClassifier(estimators=[('rf', rf), ('gb', gb)], voting='soft')
ensemble.fit(X_train, y_train)

y_pred  = ensemble.predict(X_test)
y_proba = ensemble.predict_proba(X_test)[:, 1]
acc     = accuracy_score(y_test, y_pred)
auc     = roc_auc_score(y_test, y_proba)

print("="*62)
print(f"✅ Model Accuracy:  {acc*100:.2f}%")
print(f"🎯 ROC-AUC Score:   {auc:.4f}")
print("="*62)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['❌ REJECTED', '✅ ACCEPTED']))

print("\n📈 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"   TN={cm[0,0]} | FP={cm[0,1]}")
print(f"   FN={cm[1,0]} | TP={cm[1,1]}")

cv_scores = cross_val_score(
    ensemble, X, y,
    cv=StratifiedKFold(5, shuffle=True, random_state=42),
    scoring='accuracy'
)
print(f"\n📊 Cross-Val: {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")

feature_importance = pd.Series(
    ensemble.named_estimators_['rf'].feature_importances_,
    index=feature_cols
).sort_values(ascending=False)

print("\n🔝 Top 10 Features:")
for i, (feat, imp) in enumerate(feature_importance.head(10).items(), 1):
    print(f"   {i}. {EN_NAMES.get(feat, feat):<40} {imp:.4f}")

print("\n⚙️  Building SHAP explainer...")
rf_model       = ensemble.named_estimators_['rf']
shap_explainer = shap.TreeExplainer(rf_model)

# ═══════════════════════════════════════════════════════════════════════
# 6️⃣ دالة التنبؤ - Terminal (نفس الكود الأصلي)
# ═══════════════════════════════════════════════════════════════════════

def predict_teacher(X_df, idx):
    sample   = X_df.iloc[idx:idx+1]
    orig_idx = sample.index[0]
    pred     = ensemble.predict(sample)[0]
    proba    = ensemble.predict_proba(sample)[0]
    conf     = max(proba) * 100
    raw      = df3.loc[orig_idx, 'RAW_SCORE'] if orig_idx in df3.index else 0
    label, reason = label_map[pred]

    shap_vals = shap_explainer.shap_values(sample)
    if isinstance(shap_vals, list):              sv = shap_vals[1][0]
    elif hasattr(shap_vals,'ndim') and shap_vals.ndim == 3: sv = shap_vals[0, :, 1]
    else:                                         sv = shap_vals[0]

    shap_series = pd.Series(sv, index=feature_cols)
    top_pos = shap_series.sort_values(ascending=False).head(4)
    top_neg = shap_series[shap_series < 0].sort_values().head(3)

    print("\n" + "="*62)
    print(f"  🎯 Result           : {label}")
    print(f"  📊 Confidence       : {conf:.1f}%")
    print(f"  🔢 Raw Score        : {raw:.0f} / 100")
    print(f"  📝 Reason           : {reason}")

    print("\n  🔍 SHAP — Why this decision:")
    print("     ✅ Positive factors (boosted acceptance):")
    for f, v in top_pos.items():
        bar = "█" * min(int(abs(v)*300), 25)
        print(f"       {EN_NAMES.get(f,f):<40} +{v:.4f}  {bar}")

    if len(top_neg) > 0:
        print("     ⚠️  Negative factors (held score back):")
        for f, v in top_neg.items():
            bar = "░" * min(int(abs(v)*300), 25)
            print(f"       {EN_NAMES.get(f,f):<40}  {v:.4f}  {bar}")

    shown, tips = set(), []
    for f in top_neg.index:
        if f in advice_map and f not in shown:
            tips.append(advice_map[f]); shown.add(f)
    for f in top_pos.index:
        if f in advice_map and f not in shown and len(tips) < 3:
            tips.append(advice_map[f]); shown.add(f)

    if tips:
        print("\n  💡 Suggestions for Improvement:")
        for t in tips[:3]:
            print(f"     👉 {t}")
    print("="*62)

# ═══════════════════════════════════════════════════════════════════════
# 7️⃣ تقييم مجموعة الاختبار الكاملة
# ═══════════════════════════════════════════════════════════════════════

results = []
for i in range(len(X_test)):
    idx  = X_test.index[i]
    pred = ensemble.predict(X_test.iloc[i:i+1])[0]
    conf = max(ensemble.predict_proba(X_test.iloc[i:i+1])[0]) * 100
    raw  = df3.loc[idx, 'RAW_SCORE'] if idx in df3.index else 0
    results.append({'label': label_map[pred][0], 'confidence': conf, 'raw_score': raw})

results_df     = pd.DataFrame(results)
accepted_count = (results_df['label'] == 'ACCEPTED ✅').sum()
rejected_count = (results_df['label'] == 'REJECTED ❌').sum()

# ═══════════════════════════════════════════════════════════════════════
# 8️⃣ الاختبار التفاعلي - Terminal
# ═══════════════════════════════════════════════════════════════════════

def interactive_test():
    print("\n\n" + "="*70)
    print("🧪 INTERACTIVE MODEL TESTING")
    print("="*70)
    print("   1️⃣  Random teacher\n   2️⃣  Specific teacher (by index)")
    choice = input("\n👉 Choose (1 or 2): ").strip()

    if choice == '1':
        idx = np.random.randint(0, len(X_test))
        print(f"   Selected index: {idx}")
        predict_teacher(X_test, idx)
    elif choice == '2':
        try:
            idx = int(input(f"\n👉 Enter index (0 to {len(X_test)-1}): "))
            if 0 <= idx < len(X_test):
                predict_teacher(X_test, idx)
            else:
                print(f"❌ Index must be 0–{len(X_test)-1}")
        except ValueError:
            print("❌ Please enter a valid number")
    else:
        print("❌ Please choose 1 or 2")

def test_multiple_teachers(num_teachers=5):
    print("\n\n" + "="*70)
    print(f"📊 TESTING {num_teachers} RANDOM TEACHERS")
    print("="*70)
    indices = np.random.choice(len(X_test), min(num_teachers, len(X_test)), replace=False)
    for i, idx in enumerate(indices, 1):
        print(f"\n{'='*70}\n🎓 TEACHER #{i}/{num_teachers}\n{'='*70}")
        predict_teacher(X_test, idx)

# ═══════════════════════════════════════════════════════════════════════
# 9️⃣  القائمة الرئيسية - Terminal
# ═══════════════════════════════════════════════════════════════════════

def main_menu():
    while True:
        print("\n\n" + "="*70)
        print("🎯 TEACHER EVALUATION MODEL - MAIN MENU")
        print("="*70)
        print("   1️⃣  Test SINGLE teacher\n   2️⃣  Test MULTIPLE teachers")
        print("   3️⃣  Model performance summary\n   4️⃣  Top important features")
        print("   5️⃣  Exit")

        choice = input("\n👉 Choose (1-5): ").strip()

        if choice == '1':
            interactive_test()
        elif choice == '2':
            try:
                num = int(input("👉 How many? (1-10): "))
                if 1 <= num <= 10: test_multiple_teachers(num)
                else: print("❌ Enter 1–10")
            except ValueError:
                print("❌ Invalid number")
        elif choice == '3':
            print(f"\n{'='*62}\n📊 MODEL PERFORMANCE SUMMARY\n{'='*62}")
            print(f"\n✅ Accuracy:     {acc*100:.2f}%")
            print(f"🎯 ROC-AUC:     {auc:.4f}")
            print(f"📈 Cross-Val:   {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
            print(f"\n📌 Train: {len(X_train)} | Test: {len(X_test)} | Features: {len(feature_cols)}")
            print(f"\n✅ ACCEPTED: {accepted_count} ({accepted_count/(accepted_count+rejected_count)*100:.1f}%)")
            print(f"❌ REJECTED: {rejected_count} ({rejected_count/(accepted_count+rejected_count)*100:.1f}%)")
        elif choice == '4':
            print(f"\n{'='*62}\n🔝 TOP 15 FEATURES\n{'='*62}")
            for i, (feat, imp) in enumerate(feature_importance.head(15).items(), 1):
                bar = "█" * int(imp * 200)
                print(f"   {i:2d}. {EN_NAMES.get(feat,feat):<40} {imp:.4f} {bar}")
        elif choice == '5':
            print("\n👋 Goodbye!\n"); break
        else:
            print("❌ Choose 1–5")

# ═══════════════════════════════════════════════════════════════════════
# 🌐 دالة التنبؤ - API mode (Express/React)
# ═══════════════════════════════════════════════════════════════════════

def _compute_raw_score(inp: dict) -> float:
    """نفس منطق الـ scoring بالضبط لكن على dict واحد"""
    s = 0.0
    s += {'Always':20,'Effectively':15,'Sometimes':10,
          'Use it a little.':5,'Use it sparingly.':5,'No, use it':0
         }.get(str(inp.get(C_TECH,'')).strip(), 0)
    s += {'I train Nob on how to correctly formulate commands (prompts) for searching.':20,
          'train Nob on how to correctly formulate commands (prompts) for searching.':20,
          'I use it in the classroom to create interactive activities with the students.':18,
          'use it in the classroom to create interactive activities with the students.':18,
          'I only use it to save time in preparing and writing No tests':10,
          'only use it to save time in preparing and writing No tests':10,
          "No, I don't use it and I prefer the traditional methods completely.":0,
         }.get(str(inp.get(C_AI,'')).strip(), 0)
    s += {'Talk individually':15,'Calm then explain':10,'Punish':3,'Ignore':0
         }.get(str(inp.get(C_DISRUPT,'')).strip(), 0)
    s += {'Adjust by level':10,'Use simple examples. Sometimes':7,'Explain same':0
         }.get(str(inp.get(C_WEAK,'')).strip(), 0)
    s += {'Engaging activities':10,'Encouragement':7,'Participate':2
         }.get(str(inp.get(C_UNMOTIV,'')).strip(), 0)
    s += {'Explain calmly':10,"I'm asking to speak. No, really, outside of class.":7,'Apply policy':3
         }.get(str(inp.get(C_PARENT,'')).strip(), 0)
    s += {'Challenges':5,'Make him help his weaker colleagues.':4,
          'asked him to be quiet until his colleague finished.':1,
          'I asked him to be quiet until his colleague finished.':1,'Nothing specific':0
         }.get(str(inp.get(C_GIFTED,'')).strip(), 0)
    s += {'Use as aid':5,'Discuss content':4,
          'I ask him to return it under my supervision inside the classroom.':2,
          'ask him to return it under my supervision inside the classroom.':2,
          'I ask him to bring it back under my supervision inside the classroom.':2,
          'ask him to bring it back under my supervision inside the classroom.':2,
          'Reject homework':0
         }.get(str(inp.get(C_AICHEAT,'')).strip(), 0)
    s += {"How secure and private is Noob's data on this application?":3,
          'The ease of use and design of the application.':2,
          'Free or paid':1,'Will it save me the effort of correcting, or no?':1
         }.get(str(inp.get(C_AIAPP,'')).strip(), 0)
    s += {'Present calmly':2,'Compromise':2,'Adhere policy':1
         }.get(str(inp.get(C_CONFLICT,'')).strip(), 0)
    engage = str(inp.get(C_ENGAGESIZE, ''))
    s += 5 if len(engage.strip())>20 else (2 if len(engage.strip())>3 else 0)
    skill  = str(inp.get(C_NEWSKILL, ''))
    s += 3 if len(skill.strip())>20  else (1 if len(skill.strip())>3  else 0)
    return s


def predict_from_json(inp: dict) -> dict:
    """
    تاخد dict فيه بيانات المعلم من Express
    وترجع dict بالنتيجة لـ React
    """
    raw_score = _compute_raw_score(inp)

    # بناء الـ feature row بنفس طريقة df3
    row = {}
    row[C_AGE]          = convert_age(inp.get(C_AGE, '26-30'))
    row[C_EXP]          = convert_exp(inp.get(C_EXP, '3-5 years'))
    row['NUM_LANGS']    = str(inp.get(C_LANGS, '')).count(';')
    row['SALARY_SCORE'] = {'I strongly agree':5,'Agree':4,'Neutral':3,
                           'No Agree':2,'Strongly No Agree':1
                          }.get(str(inp.get(C_SALARY,'')).strip(), 3)
    row['CHRONIC_INT']  = 1 if str(inp.get(C_CHRONIC,'')).strip().lower()=='yes' else 0
    row['WITHDRAWN_SC'] = {'Talk support':3,'Adjust approach':2,
                           'I contact the parents directly':2,
                           'contact the parents directly':2
                          }.get(str(inp.get(C_WITHDRAWN,'')).strip(), 1)

    for col in [C_GENDER, C_STAGE, C_TECH, C_DISRUPT, C_WEAK, C_UNMOTIV,
                C_PARENT, C_GIFTED, C_AICHEAT, C_AI, C_AIAPP, C_CONFLICT,
                C_ENGAGESIZE, C_NEWSKILL]:
        val = str(inp.get(col, ''))
        if col in le_dict:
            le = le_dict[col]
            row[col] = int(le.transform([val])[0]) if val in le.classes_ else 0
        else:
            row[col] = val

    X_input = pd.DataFrame([row], columns=feature_cols)
    for col in feature_cols:
        if col not in le_dict:
            X_input[col] = pd.to_numeric(X_input[col], errors='coerce').fillna(0)

    pred  = ensemble.predict(X_input)[0]
    proba = ensemble.predict_proba(X_input)[0]
    conf  = float(max(proba)) * 100

    # SHAP
    shap_vals = shap_explainer.shap_values(X_input)
    if isinstance(shap_vals, list):                          sv = shap_vals[1][0]
    elif hasattr(shap_vals,'ndim') and shap_vals.ndim == 3: sv = shap_vals[0, :, 1]
    else:                                                    sv = shap_vals[0]

    shap_series = pd.Series(sv, index=feature_cols)
    top_pos = shap_series.sort_values(ascending=False).head(4)
    top_neg = shap_series[shap_series < 0].sort_values().head(3)

    shown, tips = set(), []
    for f in list(top_neg.index) + list(top_pos.index):
        if f in advice_map and f not in shown and len(tips) < 3:
            tips.append(advice_map[f]); shown.add(f)

    return {
        "decision":         "ACCEPTED" if pred == 1 else "REJECTED",
        "confidence":       round(conf, 1),
        "raw_score":        round(float(raw_score), 1),
        "reason":           "This teacher meets the acceptance criteria."
                            if pred == 1 else
                            "This teacher does not meet the acceptance criteria.",
        "positive_factors": [{"feature": EN_NAMES.get(f, f), "value": round(float(v), 4)}
                              for f, v in top_pos.items()],
        "negative_factors": [{"feature": EN_NAMES.get(f, f), "value": round(float(v), 4)}
                              for f, v in top_neg.items()],
        "suggestions":      tips,
    }

# ═══════════════════════════════════════════════════════════════════════
# 🔟 نقطة الدخول الرئيسية
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # ── 🌐 API mode: Express بيناديه بـ JSON ──
        try:
            data   = json.loads(sys.argv[1])
            result = predict_from_json(data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
    else:
        # ── 💻 Terminal mode: main_menu الأصلي ──
        print("\n\n" + "="*62)
        print("✅ INITIAL TEST SET EVALUATION")
        print("="*62)
        print(results_df['label'].value_counts().to_string())
        print(f"\nAverage Confidence : {results_df['confidence'].mean():.1f}%")
        print(f"Average Score      : {results_df['raw_score'].mean():.1f} / 100")
        print(f"\nAccepted: {accepted_count} ({accepted_count/(accepted_count+rejected_count)*100:.1f}%)")
        print(f"Rejected: {rejected_count} ({rejected_count/(accepted_count+rejected_count)*100:.1f}%)")
        print(f"\n✅ Pipeline done! Accuracy={acc*100:.2f}% | AUC={auc:.4f}")
        main_menu()