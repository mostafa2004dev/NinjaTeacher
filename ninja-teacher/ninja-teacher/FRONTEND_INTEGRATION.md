# Ninja Teacher — Frontend Integration Guide
## Complete API Reference (UI-Aligned)

**Base URL:** `http://localhost:3000`  
**Auth header:** `Authorization: Bearer <token>`

---

## 1. Authentication — `/auth`

### POST `/auth/register`
**Used on:** Role-selection → Teacher/School registration screens

```json
// Teacher Request
{
  "name": "Ahmed Ali",
  "email": "ahmed@teacher.com",
  "password": "123456",
  "confirm_password": "123456",
  "role": "teacher"
}

// School Request
{
  "name": "Cairo Academy",
  "email": "info@cairo.com",
  "password": "123456",
  "confirm_password": "123456",
  "role": "school"
}

// Success 201
{
  "status": "success",
  "message": "Account created successfully.",
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "name": "Ahmed Ali", "email": "...", "role": "teacher" }
  }
}

// Validation Error 400
{
  "status": "fail",
  "message": "Passwords do not match.",
  "errors": { "confirm_password": "Passwords do not match." }
}
```

### POST `/auth/login`
```json
// Request
{ "email": "ahmed@teacher.com", "password": "123456" }

// Success 200
{
  "status": "success",
  "data": { "token": "eyJ...", "user": { "id": 1, "role": "teacher" } }
}

// Error 401
{
  "status": "fail",
  "message": "Invalid email or password.",
  "errors": { "general": "The email or password you entered is incorrect." }
}
```

### POST `/auth/logout` 🔒
```json
// Response 200
{ "status": "success", "message": "Logged out successfully." }
```

### POST `/auth/forgot-password`
```json
// Request
{ "email": "ahmed@teacher.com" }
// Response 200 — always same message (security)
{ "status": "success", "message": "If this email exists, a reset link has been sent." }
```

---

## 2. Home Page (Public) — `/home`

| Endpoint | Used for |
|---|---|
| `GET /home/stats` | "500+ Schools, 1200+ Teachers, 95%" banner |
| `GET /home/featured-jobs` | "Teaching Jobs" section (latest 6 active) |
| `GET /home/top-teachers` | "Highest Rated Teachers" section |
| `GET /home/testimonials` | "What Schools Say About Us" section |

```json
// GET /home/stats
{
  "data": { "total_teachers": 1234, "total_schools": 567, "total_jobs": 234, "active_jobs": 189, "match_rate": 95 }
}

// GET /home/top-teachers?limit=6
{
  "data": [
    { "Teacher_ID": 1, "Name": "Dr. Sarah Ahmed", "Specialization": "Mathematics",
      "Average_Rating": 4.9, "Total_Reviews": 23, "Image": "/uploads/profiles/..." }
  ]
}

// GET /home/testimonials?limit=4
{
  "data": [
    { "reviewer_name": "Al Noor International School", "rating": 5,
      "comment": "Excellent teacher...", "job_title": "Math Teacher" }
  ]
}
```

---

## 3. Teacher Profile — `/profile`

### GET `/profile/me` 🔒
Returns full profile with experience, education, certifications.

```json
{
  "data": {
    "Teacher_ID": 1,
    "Name": "Ahmed Ali",
    "Email": "ahmed@teacher.com",
    "Specialization": "Mathematics",
    "Years_of_Experience": 5,
    "Bio": "Experienced math teacher...",
    "Location": "Cairo, Egypt",
    "Profile_Completion": 80,
    "Average_Rating": 4.7,
    "Image": "/uploads/profiles/...",
    "experience": [ { "job_title": "Math Teacher", "school_name": "Cairo School", ... } ],
    "education":  [ { "degree": "B.Sc Mathematics", "institution": "Cairo Uni", ... } ],
    "certifications": [ { "title": "TESOL Certificate", "issuing_org": "Cambridge", ... } ]
  }
}
```

### GET `/profile/:teacherId` — Public
Same structure — used by school to view teacher profile.

### PUT `/profile/basic` 🔒
```json
// Request — Basic Info screen
{
  "Name": "Ahmed Ali",
  "Phone": "01012345678",
  "Bio": "Passionate math teacher with 5 years experience",
  "Location": "Cairo, Egypt",
  "Nationality": "Egyptian",
  "Specialization": "Mathematics",
  "Years_of_Experience": 5,
  "Job_Type_Preference": "full-time",
  "Expected_Salary": "8,000 - 12,000 EGP",
  "Is_Available": true
}
// Response includes updated profile_completion percentage
```

### Work Experience CRUD 🔒
```
POST   /profile/experience          — Add entry
PUT    /profile/experience/:id      — Edit entry
DELETE /profile/experience/:id      — Remove entry
GET    /profile/experience          — List all

// POST Body:
{
  "job_title": "Mathematics Teacher",
  "school_name": "Al Noor International School",
  "location": "Riyadh, Saudi Arabia",
  "subject": "Mathematics",
  "start_date": "2020-09-01",
  "end_date": null,
  "is_current": true,
  "description": "Teaching grades 9-12 math curriculum"
}
```

### Education CRUD 🔒
```
POST   /profile/education          — Add
PUT    /profile/education/:id      — Edit
DELETE /profile/education/:id      — Remove

// POST Body:
{ "degree": "B.Sc Mathematics", "institution": "Cairo University",
  "field": "Mathematics", "start_year": 2014, "end_year": 2018, "grade": "Excellent" }
```

### Certifications CRUD 🔒
```
POST   /profile/certifications     — Add
PUT    /profile/certifications/:id — Edit
DELETE /profile/certifications/:id — Remove

// POST Body:
{ "title": "TESOL Certificate", "issuing_org": "Cambridge",
  "issue_date": "2022-03-01", "credential_url": "https://..." }
```

---

## 4. Job Posts — `/job-posts`

### GET `/job-posts`
Browse all jobs (public, with filters).
```
?search=math&specialization=Mathematics&job_type=full-time&page=1&limit=10
```

### GET `/job-posts/:schoolId/:jobId`
Single job detail with all wizard fields.
```json
{
  "data": {
    "Job_ID": 1, "School_ID": 1,
    "Title": "Senior Mathematics Teacher",
    "Location": "Riyadh", "Specialization": "Mathematics",
    "Job_Type": "full-time", "Required_Experience": 3,
    "Salary_Range": "12,000 - 15,000 SAR",
    "Start_Date": "2024-09-01", "Deadline": "2024-06-12",
    "Description": "...", "Content": "...",
    "Responsibilities": ["Teach grades 9-12", "Prepare lesson plans"],
    "Requirements": ["Bachelor degree", "3+ years experience"],
    "Benefits": ["Housing allowance", "Health insurance"],
    "Teaching_Style": "structured",
    "Classroom_Energy": "collaborative",
    "Leadership_Style": "mentor",
    "Communication_Style": "empathetic",
    "Problem_Solving": "practical",
    "Applicants_Count": 24,
    "Status": "active"
  }
}
```

---

## 5. School — `/school`

### GET `/school/dashboard` 🔒 (school role)
```json
{
  "data": { "active_jobs": 5, "total_applicants": 89, "pending_review": 44, "hired": 12 }
}
```

### POST `/school/jobs` 🔒 — Full wizard submission
```json
{
  "Title": "Mathematics Teacher",
  "Location": "Riyadh, Saudi Arabia",
  "Specialization": "Mathematics",
  "Subjects": ["Mathematics", "Statistics"],
  "Job_Type": "full-time",
  "Required_Experience": 3,
  "Required_Qualifications": "Bachelor degree in Mathematics or Education",
  "Start_Date": "2024-09-01",
  "Deadline": "2024-06-12",
  "Salary_Range": "12,000 - 15,000 SAR",
  "Description": "We are looking for an experienced math teacher...",
  "Responsibilities": ["Teach grades 9-12", "Prepare lesson plans", "Assess students"],
  "Requirements": ["Bachelor in Mathematics", "3+ years experience", "Strong communication"],
  "Benefits": ["Housing allowance", "Health insurance", "Annual flights"],
  "Teaching_Style": "structured",
  "Classroom_Energy": "collaborative",
  "Leadership_Style": "mentor",
  "Communication_Style": "empathetic",
  "Problem_Solving": "practical"
}
```

### GET `/school/jobs/:jobId/applicants` 🔒
Returns applicants with teacher details + match score.
```json
{
  "data": {
    "applicants": [
      {
        "Teacher_ID": 1, "Job_ID": 1, "Apply_Date": "2024-05-14",
        "Status": "pending",
        "match_score": 94,
        "teacher": {
          "Name": "Sarah Ahmed", "Specialization": "Mathematics",
          "Years_of_Experience": 5, "Qualifications": "Masters in Mathematics",
          "Average_Rating": 4.8, "Image": "/uploads/..."
        }
      }
    ]
  }
}
```

### PATCH `/school/jobs/:jobId/applicants/:teacherId/status` 🔒
```json
// Request
{ "status": "interview", "message": "Congratulations! Please join us for an interview on..." }
// status options: "pending" | "interview" | "accepted" | "rejected"
// Automatically sends notification + message to teacher
```

---

## 6. Teacher Dashboard — `/dashboard`

### GET `/dashboard/stats` 🔒
```json
{
  "data": { "profileViews": 12, "applications": 5, "interviews": 2, "offers": 1 }
}
```

---

## 7. Applied Jobs — `/applied-jobs`

### GET `/applied-jobs` 🔒
Returns applications with job details.
```json
{
  "data": [
    {
      "Teacher_ID": 1, "Job_ID": 5, "Status": "pending",
      "Apply_Date": "2024-05-14",
      "Post": { "Title": "Math Teacher", "Description": "...", "Date": "2024-05-10" }
    }
  ]
}
```

### POST `/applied-jobs` 🔒
```json
{ "Job_ID": 5 }
// Response 201: application created + notification sent
```

---

## 8. AI Matching — `/ai-matching`

### GET `/ai-matching/recommended` 🔒 (teacher)
Returns jobs ranked by match score for the logged-in teacher.
```json
{
  "data": [
    { "Job_ID": 1, "Title": "Math Teacher", "match_score": 94, "Location": "Riyadh", ... }
  ]
}
```

### GET `/ai-matching/score?teacherId=1&schoolId=1&jobId=5` 🔒
```json
{ "data": { "match_score": 88, "teacher_id": 1, "job_id": 5 } }
```

### GET `/ai-matching/jobs/:schoolId/:jobId/matches` 👑 (admin)
AI Matching Monitor — ranked teacher list for a job.
```json
{
  "data": {
    "job": { "Title": "Math Teacher", ... },
    "matches": [
      { "match_score": 94, "teacher": { "Name": "Sarah Ahmed", "Specialization": "Mathematics", ... } }
    ]
  }
}
```

---

## 9. Reviews — `/reviews`

### POST `/reviews` 🔒 (school adds review for teacher)
```json
{
  "teacher_id": 1,
  "rating": 4.5,
  "comment": "Excellent teacher, very professional",
  "job_title": "Mathematics Teacher",
  "job_id": 5
}
```

### GET `/reviews/teachers/:teacherId` — Public
```json
{ "data": [ { "reviewer_name": "Cairo Academy", "rating": 4.5, "comment": "...", "createdAt": "..." } ] }
```

---

## 10. Messages — `/messages`

### GET `/messages` 🔒 — Inbox
```json
{
  "data": [
    {
      "id": 1, "sender_name": "Cairo Academy",
      "subject": "Interview Scheduled",
      "body": "We would like to invite you for an interview...",
      "type": "interview_invite",
      "job_title": "Math Teacher",
      "is_read": false,
      "createdAt": "2024-05-14T10:00:00Z"
    }
  ]
}
```

### GET `/messages/unread-count` 🔒
```json
{ "data": { "unread_count": 3 } }
```

### POST `/messages` 🔒
```json
{
  "receiver_id": 1,
  "subject": "Interview Scheduled",
  "body": "We would like to invite you...",
  "type": "interview_invite",
  "job_title": "Math Teacher",
  "job_id": 5
}
```

### PATCH `/messages/:id/read` 🔒
Marks message as read.

---

## 11. Notifications — `/notifications`

### GET `/notifications` 🔒
```json
{
  "notifications": [
    {
      "Notification_ID": 1,
      "Type": "job_match",
      "Title": "New Job Match",
      "Message": "A new job matches your profile with 94% compatibility.",
      "IsRead": false,
      "createdAt": "..."
    }
  ]
}
```

### Notification Types
| Type | When |
|---|---|
| `job_match` | New job matches teacher's specialization |
| `application_received` | Teacher applied to a job |
| `status_update` | Application status changed |
| `profile_view` | Someone viewed teacher's profile |
| `subscription_activated` | Subscription activated |
| `subscription_cancelled` | Subscription cancelled |

---

## 12. Contact Us — `/contact`

### POST `/contact`
```json
// Request
{ "name": "Ahmed", "email": "ahmed@test.com", "subject": "General Inquiry", "message": "Hello..." }

// Success 201
{ "status": "success", "message": "Your message has been sent. We'll get back to you soon!" }

// Validation Error 400
{
  "status": "fail",
  "errors": { "name": "Name is required.", "subject": "Subject is required." }
}
```

---

## 13. Admin — `/admin`

### POST `/admin/auth/login`
```json
{ "email": "admin@ninjateacher.com", "password": "Admin@1234" }
```

### GET `/admin/dashboard`
```json
{
  "data": {
    "users":         { "total_teachers": 1234, "total_schools": 567 },
    "jobs":          { "total_jobs": 234, "total_applications": 1456 },
    "subscriptions": { "active": 189, "pending_payments": 12 },
    "revenue":       { "total_egp": 45000 }
  }
}
```

### Users
```
GET    /admin/users?role=teacher&search=ahmed&page=1&limit=20
GET    /admin/users/stats
GET    /admin/users/:userId
POST   /admin/users          — Create teacher or school
PUT    /admin/users/:userId  — Edit any field
PATCH  /admin/users/:userId/reset-password
DELETE /admin/users/:userId  — super_admin only
```

### Jobs & Applications
```
GET    /admin/jobs?search=math&page=1
PUT    /admin/jobs/:schoolId/:jobId
DELETE /admin/jobs/:schoolId/:jobId        — super_admin only
GET    /admin/applications?status=pending
PATCH  /admin/applications/:teacherId/:jobId/status
```

### Subscriptions
```
GET   /admin/subscriptions?status=active
GET   /admin/subscriptions/stats
PATCH /admin/subscriptions/:subId/activate
PATCH /admin/subscriptions/:subId/extend    body: { extra_days: 7 }
PATCH /admin/subscriptions/:subId/cancel    body: { reason: "..." }
```

### Payments
```
GET   /admin/payments?status=pending
PATCH /payments/admin/:paymentId/verify     body: { approve: true }
```

---

## 14. Socket.io Events

### Connect
```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:3000", {
  auth: { token: `Bearer ${localStorage.getItem("authToken")}` }
});
```

### Events the server sends to client
```javascript
// New notification (all types)
socket.on("notification", (data) => {
  // { id, type, title, message, isRead, relatedId, createdAt }
  showToast(data.title);
  updateNotificationBell();
});

// New message from school
socket.on("new_message", (data) => {
  // { id, sender_name, subject, body, type, job_title, createdAt }
  showMessageAlert(data);
});
```

---

## 15. Complete Route Table

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register (teacher or school) |
| POST | `/auth/login` | — | Login |
| POST | `/auth/logout` | 🔒 | Logout |
| POST | `/auth/forgot-password` | — | Forgot password |
| GET | `/home/stats` | — | Platform statistics |
| GET | `/home/featured-jobs` | — | Latest active jobs |
| GET | `/home/top-teachers` | — | Highest rated teachers |
| GET | `/home/testimonials` | — | School testimonials |
| GET | `/profile/me` | 🔒 | My full profile |
| GET | `/profile/:teacherId` | — | Public profile |
| PUT | `/profile/basic` | 🔒 | Update basic info |
| POST | `/profile/experience` | 🔒 | Add work experience |
| PUT | `/profile/experience/:id` | 🔒 | Edit experience |
| DELETE | `/profile/experience/:id` | 🔒 | Delete experience |
| POST | `/profile/education` | 🔒 | Add education |
| PUT | `/profile/education/:id` | 🔒 | Edit education |
| DELETE | `/profile/education/:id` | 🔒 | Delete education |
| POST | `/profile/certifications` | 🔒 | Add certification |
| PUT | `/profile/certifications/:id` | 🔒 | Edit certification |
| DELETE | `/profile/certifications/:id` | 🔒 | Delete certification |
| GET | `/job-posts` | — | Browse all jobs |
| GET | `/job-posts/:schoolId/:jobId` | — | Job detail |
| POST | `/job-posts` | 🔒 | Create job (simple) |
| GET | `/school/dashboard` | 🔒 | School dashboard |
| GET | `/school/jobs` | 🔒 | School's job posts |
| POST | `/school/jobs` | 🔒 | Create job (full wizard) |
| GET | `/school/jobs/:jobId/applicants` | 🔒 | Job applicants + match % |
| PATCH | `/school/jobs/:jobId/applicants/:teacherId/status` | 🔒 | Update status |
| GET | `/applied-jobs` | 🔒 | My applications |
| POST | `/applied-jobs` | 🔒 | Apply to job |
| DELETE | `/applied-jobs/:jobId` | 🔒 | Cancel application |
| GET | `/ai-matching/recommended` | 🔒 | Recommended jobs |
| GET | `/ai-matching/score` | 🔒 | Match score for a job |
| GET | `/ai-matching/jobs/:sId/:jId/matches` | 👑 | Admin: matches for job |
| GET | `/reviews/teachers/:teacherId` | — | Teacher reviews |
| GET | `/reviews/top-teachers` | — | Top rated teachers |
| GET | `/reviews/testimonials` | — | Testimonials |
| POST | `/reviews` | 🔒 | Add review |
| GET | `/messages` | 🔒 | Inbox |
| GET | `/messages/sent` | 🔒 | Sent messages |
| GET | `/messages/unread-count` | 🔒 | Unread count |
| POST | `/messages` | 🔒 | Send message |
| PATCH | `/messages/:id/read` | 🔒 | Mark read |
| GET | `/notifications` | 🔒 | All notifications |
| PATCH | `/notifications/:id/read` | 🔒 | Mark read |
| DELETE | `/notifications/:id` | 🔒 | Delete |
| GET | `/dashboard/stats` | 🔒 | Teacher stats |
| POST | `/contact` | — | Contact form |
| GET | `/subscriptions/plans/all` | — | All plans (pricing page) |
| GET | `/subscriptions/my` | 🔒 | My subscription |
| POST | `/subscriptions` | 🔒 | Subscribe |
| POST | `/subscriptions/upgrade` | 🔒 | Upgrade plan |
| DELETE | `/subscriptions/cancel` | 🔒 | Cancel |
| POST | `/admin/auth/login` | — | Admin login |
| GET | `/admin/dashboard` | 👑 | Admin overview |
| GET | `/admin/users` | 👑 | All users |
| POST | `/admin/users` | 👑 | Create user |
| PUT | `/admin/users/:id` | 👑 | Edit user |
| DELETE | `/admin/users/:id` | 👑 | Delete user |
| GET | `/admin/jobs` | 👑 | All jobs |
| GET | `/admin/applications` | 👑 | All applications |
| GET | `/admin/subscriptions` | 👑 | All subscriptions |
| GET | `/admin/payments` | 👑 | All payments |

---

## 16. Frontend Notes

**Token Storage:**
```javascript
// After login/register
localStorage.setItem("authToken", data.token);
localStorage.setItem("userRole", data.user.role); // "teacher" | "school"

// Route guard
const role = localStorage.getItem("userRole");
if (role === "school") navigate("/school/dashboard");
else navigate("/teacher/dashboard");
```

**Axios Setup:**
```javascript
const api = axios.create({ baseURL: "http://localhost:3000" });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
  return Promise.reject(err);
});
```

**Profile Photo Upload:**
```javascript
const formData = new FormData();
formData.append("profileImage", file); // field name must be "profileImage"
await api.put("/users/profile-photo", formData);
// Image available at: http://localhost:3000/uploads/profiles/filename.jpg
```

**Error Handling Pattern:**
```javascript
// All error responses follow this format:
{
  "status": "fail",
  "message": "Human readable message",
  "errors": {           // field-level errors (only on validation failures)
    "email": "...",
    "password": "...",
    "general": "..."    // non-field-specific errors
  }
}
```
