# 🥷 Ninja Teacher — التشغيل الكامل من الصفر (النسخة النهائية)

منصة توظيف ذكية: **Frontend (React) + Backend (Node/Express + MySQL) + AI Service (Python/FastAPI)** — كلهم مربوطين وشغالين، واتختبروا End-to-End فعليًا.

---

## ✅ كل اللي بيشتغل (اتختبر لايف)

- تسجيل/دخول معلم ومدرسة (JWT) ✅
- **تقييم المعلم بالـ AI**: قرار + أبعاد (إدارة فصل/مهني/تكنولوجيا) + شخصية + SHAP + توصية مدارس — في ~250ms ✅
- **🆕 أسئلة المدرسة الـ5 مربوطة بالـ AI**: المدرسة تجاوب 5 أسئلة عن الصفات → الموديل يحوّلها لشخصيات مفضّلة ويطلّع **المعلمين المقبولين بالسكور والبيانات** ✅
- نشر وظائف + تقديم عليها + قبول/رفض ✅
- إشعارات أوتوماتيك لحظية (Socket.io) ✅
- لوحة Analytics من بيانات حقيقية (500 مدرسة + 1500 سجل) ✅
- اشتراكات + مدفوعات (instapay/vodafone/orange) ✅

---

## 📦 الأرشيفات

| الملف | المحتوى |
|---|---|
| `ninja-teacher-backend-ai.zip` | الـ Backend + **خدمة الـ AI كاملة في `ai_model/`** + كل بيانات الـ AI + الـ SQL + صفحة الاختبار |
| `ninja-teacher-frontend.zip` | الـ Frontend (React/Vite) كامل |

---

# 🚀 خطوات التشغيل (4 خطوات)

## المتطلبات
Node.js 18+ · Python 3.10+ · MySQL/XAMPP (اختياري — يشتغل SQLite بدونه)

## الترتيب مهم: DB → AI → Backend → Frontend

### 0) فك الضغط
```
مجلدك/
├── ninja-teacher/      (من backend-ai.zip)
└── graduation code/    (من frontend.zip)
```

### 1) قاعدة البيانات (مرة واحدة)
شغّل MySQL (XAMPP)، وبعدين **اختار طريقة واحدة**:

**الطريقة أ (الأسهل):** مش محتاج تستورد أي ملف — الـ Backend بينشئ كل الجداول لوحده عند الإقلاع. بس تأكد إن في database فاضية:
```sql
CREATE DATABASE school_jobs;
```

**الطريقة ب:** استورد الـ schema الجاهز:
```bash
mysql -u root < ninja-teacher/database_schema_clean.sql
```

ثم ظبط بيانات الدخول في **`ninja-teacher/.env`**:
```
DB_NAME=school_jobs
DB_USER=root          ← يوزرك
DB_PASSWORD=          ← باسوردك
```
> **مفيش MySQL؟** علّق سطر `DB_HOST` في `.env` → هيشتغل SQLite تلقائي (`npm i sqlite3`).

### 2) خدمة الـ AI (تيرمنال 1)
```bash
cd ninja-teacher/ai_model
pip install -r requirements.txt
python -m uvicorn ai_service:app --host 0.0.0.0 --port 8000
```
- أول تشغيل: تدريب (~30-60 ثانية) → بيحفظ `model_cache.joblib`
- بعدها: أقل من ثانية (من الكاش)
- تأكد: `http://localhost:8000/health` → `{"status":"ok","schools":500,...}`

### 3) الـ Backend (تيرمنال 2)
```bash
cd ninja-teacher
npm install
npm start
```
المفروض تشوف: `✅ Database connected → Models synced → 🚀 http://localhost:3000`

### 4) الـ Frontend (تيرمنال 3)
```bash
cd "graduation code"
npm install
npm run dev          → http://localhost:5173
```

---

# 🧪 صفحة الاختبار الجاهزة

من غير ما تشغّل الفرونت، تقدر تجرّب كل الـ AI من صفحة واحدة:

افتح **`ninja-teacher/ai_model/ai_test_console.html`** في المتصفح. فيها 4 تبويبات:
1. **تقييم معلم + توصية** — جاوب الاستبيان → قرار + أبعاد + شخصية + مدارس
2. **الإحصائيات** — كروت ورسوم بيانية
3. **مدرسة ← أفضل المعلمين** — اكتب School ID من الداتاسيت
4. **🆕 أسئلة المدرسة ← مطابقة AI** — جاوب الـ5 أسئلة → معلمين مقبولين بالسكور

---

# 🔌 الـ Endpoints الجديدة (للـ Postman)

| Method | URL | الوصف |
|---|---|---|
| POST | `/assessment` 🔒 | تقييم معلم بالـ AI |
| GET | `/recommend/schools?city=Cairo` 🔒 | توصية مدارس للمعلم |
| GET | `/recommend/teachers/SCH0001` 🔒 | ترتيب معلمين لمدرسة (من الداتاسيت) |
| **POST** | **`/ai/match-teachers`** 🔒 | **🆕 مطابقة معلمين بأسئلة المدرسة الـ5** |
| GET | `/ai/school-questions` | الأسئلة الـ5 وخياراتها |
| GET | `/analytics/overview` | إحصائيات |
| GET | `/analytics/predictions` | توقعات |
| POST | `/ai/analyze` 🔒 | تحليل إجابات مباشر |

🔒 = محتاج `Authorization: Bearer <token>`

### مثال POST /ai/match-teachers
```json
{
  "school_name": "Al-Nour", "city": "Cairo", "type": "Private",
  "subjects_needed": ["Math", "Science"],
  "answers": {
    "discipline": "Strict / Structured",
    "energy": "Calm / Patient",
    "leadership": "Leader / Initiator",
    "communication": "Direct / Results-focused",
    "approach": "Analytical / Methodical"
  },
  "limit": 10
}
```
يرجّع: الشخصيات المطابقة + المعلمين المقبولين لكل مادة (سكور + CL/PR/TC + الشخصية + هل في تطابق شخصية).

---

# 🆕 إزاي اشتغل ربط أسئلة المدرسة بالـ AI

1. الموديل عنده 6 أنواع شخصيات. ملف جديد `ai_model/school_matcher.py` بيحوّل إجابات المدرسة الـ5 → أكتر شخصيتين مناسبتين (بنظام تصويت).
2. بيبني "مدرسة حيّة" بنفس شكل مدرسة الموديل، **وبيستخدم نفس منطق الترتيب والـ weights والـ thresholds بتاعة الموديل بالظبط** (مش منطق جديد).
3. بيطلّع المعلمين اللي بيعدّوا معايير القبول، مرتبين بالسكور، مع +5 نقاط للي شخصيته تطابق المدرسة.

> الموديل نفسه (`full_system_v4.py`) **ما اتغيّرش** — الربط كله في ملف منفصل + endpoint جديد.

---

# 🔧 حل المشاكل

| المشكلة | الحل |
|---|---|
| `AI service unreachable` | شغّل خدمة الـ AI الأول (خطوة 2) |
| `Access denied for user` | ظبط `DB_USER`/`DB_PASSWORD` في `.env` |
| نشر الوظيفة بيفشل بـ FK | الـ schema الجديد متظبط — لو استوردت القديم، الـ Backend بيعمل sync تلقائي يصلّحه |
| الفرونت مش بيكلم الباك | الباك لازم على بورت 3000 |

---

# 🏗️ المعمارية

```
React :5173 ─axios+JWT→ Node :3000 ─HTTP→ FastAPI AI :8000
                          │                    │
                    MySQL school_jobs    full_system_v4.py (موديل 92.5%)
                    (19 جدول)            + school_matcher.py (ربط أسئلة المدرسة)
```

- الموديل يتدرّب مرة واحدة ويتكاش
- الفرونت مايكلمش Python مباشرة (أمان + JWT في الباك)
- خدمة الـ AI منفصلة وstateless (سهل scaling)
- non-breaking: ولا صفحة/route/UI اتغير — بس ملفات متضررة اتكتبت + ربط اتضاف
