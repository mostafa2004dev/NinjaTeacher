# Ninja Teacher — Complete Backend Integration Guide
## Subscriptions, Payments, Socket.io & REST API

---

## 1. Project Structure (Final)

```
ninja-teacher/
├── .env
├── package.json
├── database_full.sql                        ← Run this first
├── INTEGRATION_GUIDE.md                     ← This file
├── uploads/profiles/                        ← Uploaded images
└── src/
    ├── app.js                               ← Entry point
    ├── config/
    │   ├── database.js                      ← Sequelize MySQL
    │   ├── socket.js                        ← Socket.io setup + JWT auth
    │   └── associations.js                  ← All model relationships
    ├── middlewares/
    │   ├── auth.middleware.js               ← protect(), adminOnly()
    │   └── upload.middleware.js             ← Multer (profile photos)
    ├── utils/
    │   └── jwt.util.js                      ← generateToken(userId, role)
    └── modules/
        ├── auth/                            ← Register, Login, Forgot-password
        ├── users/                           ← Profile, photo upload
        ├── jobPosts/                        ← Job listings CRUD
        ├── appliedJobs/                     ← Applications
        ├── notifications/                   ← In-app + real-time notifications
        ├── dashboard/                       ← Teacher stats
        ├── subscriptions/
        │   ├── subscriptionPlan.model.js
        │   ├── subscription.model.js
        │   ├── subscription.service.js      ← All subscription business logic
        │   ├── subscription.controller.js
        │   ├── subscription.routes.js
        │   └── plans.seeder.js              ← Auto-seeds plans at startup
        └── payments/
            ├── payment.model.js
            ├── invoice.model.js
            ├── payment.service.js
            ├── payment.controller.js
            ├── payment.routes.js
            └── providers/
                ├── gateway.factory.js       ← Central provider switch
                ├── instapay.provider.js     ← Stub (implement when ready)
                ├── vodafoneCash.provider.js ← Stub (manual verification)
                └── orangeCash.provider.js   ← Stub (manual verification)
```

---

## 2. All Fixes Applied to the Original Project

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | `.env` | `BCRYPT_SALT_ROUNDS=10-e ` (shell flag typo) | Fixed to `10` |
| 2 | `package.json` | Missing `cors`, `socket.io`, `uuid` | Added all three |
| 3 | `app.js` | No CORS — browser blocks all frontend requests | Added `cors` middleware |
| 4 | `app.js` | Used `app.listen()` — incompatible with Socket.io | Switched to `http.createServer()` |
| 5 | `app.js` | No global error handler — errors crash silently | Added `app.use((err,req,res,next)=>...)` |
| 6 | `app.js` | No 404 handler | Added catch-all route |
| 7 | `users.model.js` | Missing 6 real DB columns (Phone, DOB, Gender, etc.) | Added all missing columns |
| 8 | `users.model.js` | Missing `Role` field for plan access control | Added `Role` ENUM |
| 9 | `auth.service.js` | Token didn't include `role` — subscription guards couldn't work | Added `role` to `generateToken()` |
| 10 | `auth.service.js` | `mockResetToken` exposed in HTTP response | Removed — logs to console only |
| 11 | `jobPosts.routes.js` | `POST /` had **no auth** — anyone could create jobs | Added `protect` to POST route |
| 12 | `jobPosts.service.js` | Queried `Teacher.Experience` — column is `Years_of_Experience` | Fixed field name |
| 13 | `appliedJobs.service.js` | `include: [{ model: Post, as: "Post" }]` — association never defined → **runtime crash** | Replaced with manual enrichment query |
| 14 | `appliedJobs.service.js` | `updateApplicationStatus()` existed but had no route | Added admin route |
| 15 | `appliedJobs.model.js` | `Status` column missing from original DB schema | Added via `sync({ alter: true })` |
| 16 | `jwt.util.js` | `generateToken()` signed only `userId` | Added `role` to payload |
| 17 | — | No Socket.io at all | Fully implemented in `config/socket.js` |
| 18 | — | No CORS | Added `cors` package + configuration |
| 19 | — | No model associations file | Created `config/associations.js` |
| 20 | — | No subscription or payment system | Fully implemented (10 new files) |

---

## 3. Environment Variables

```env
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_jobs
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT — MUST change before deployment
JWT_SECRET=use_a_long_random_string_min_64_chars
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# CORS — your frontend URL
CLIENT_URL=http://localhost:5173

# Admin — secret header for admin routes
ADMIN_SECRET=change_this_admin_secret

# Payment providers (fill in when you get real credentials)
INSTAPAY_MERCHANT_ID=
INSTAPAY_API_KEY=
INSTAPAY_WEBHOOK_SECRET=
VODAFONE_CASH_MERCHANT_CODE=01XXXXXXXXX
VODAFONE_CASH_WEBHOOK_SECRET=
ORANGE_CASH_MERCHANT_ID=
ORANGE_CASH_WEBHOOK_SECRET=
```

---

## 4. How to Run the Project

```bash
# 1. Copy this project to your machine

# 2. Install dependencies
npm install

# 3. Create the database
mysql -u root -p < database_full.sql

# 4. Edit .env — set DB_PASSWORD, JWT_SECRET, ADMIN_SECRET, CLIENT_URL

# 5. Start dev server (auto-restarts on changes)
npm run dev

# 6. Verify it's running
curl http://localhost:3000/
# → { "message": "Teacher Evaluation API is running ✅" }
```

On first startup:
- Database tables are created/updated automatically (`sequelize.sync({ alter: true })`)
- 4 subscription plans are seeded automatically
- Stale subscriptions/payments are expired automatically

---

## 5. Complete API Reference

**Base URL:** `http://localhost:3000`  
**Auth header:** `Authorization: Bearer <token>`  
**Admin header:** `X-Admin-Secret: <ADMIN_SECRET from .env>`

---

### 5.1 Auth — `/auth`

#### `POST /auth/register`
```json
// Request
{ "name": "Ahmed Ali", "email": "ahmed@school.com", "password": "secret123", "role": "teacher" }
// role: "teacher" (default) or "school"

// Response 201
{
  "message": "User registered successfully.",
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "name": "Ahmed Ali", "email": "ahmed@school.com", "role": "teacher" }
  }
}
```

#### `POST /auth/login`
```json
// Request
{ "email": "ahmed@school.com", "password": "secret123" }

// Response 200
{
  "message": "Login successful.",
  "data": { "token": "eyJ...", "user": { "id": 1, "name": "Ahmed Ali", "role": "teacher" } }
}
```

---

### 5.2 Subscription Plans — `/subscriptions/plans`

#### `GET /subscriptions/plans/all` — Public, no auth
Returns all 4 plans for a pricing page.
```json
{
  "status": "success",
  "data": [
    {
      "id": 1, "plan_key": "teacher_free", "name": "Teacher Free",
      "target_role": "teacher", "price_egp": "0.00", "duration_days": 30,
      "billing_cycle": "monthly", "max_applications": 5,
      "features": ["Up to 5 applications/month", "Basic profile", ...]
    },
    { "plan_key": "teacher_pro", "price_egp": "149.00", ... },
    { "plan_key": "school_starter", "price_egp": "299.00", ... },
    { "plan_key": "school_pro", "price_egp": "599.00", ... }
  ]
}
```

#### `GET /subscriptions/plans` — Auth required
Returns plans matching the logged-in user's role (teachers see teacher plans, schools see school plans).

---

### 5.3 Subscription Management — `/subscriptions`

All routes require: `Authorization: Bearer <token>`

#### `GET /subscriptions/my`
Returns the user's active subscription or `null`.
```json
{
  "status": "success",
  "data": {
    "id": 1, "user_id": 1, "plan_id": 2, "status": "active",
    "started_at": "2026-05-19T10:00:00Z",
    "expires_at": "2026-06-18T10:00:00Z",
    "price_paid": "149.00",
    "Plan": { "plan_key": "teacher_pro", "name": "Teacher Pro", ... }
  }
}
```

#### `GET /subscriptions/history`
Returns all past and present subscriptions.

#### `POST /subscriptions` — Create / Subscribe
```json
// Request
{
  "plan_key": "teacher_pro",
  "payment_provider": "vodafone_cash"
}
// For free plan: omit payment_provider

// Response 201 — Free plan (activated immediately)
{
  "status": "success",
  "message": "Subscription activated immediately.",
  "data": { "activated": true, "subscription": { ... } }
}

// Response 201 — Paid plan (pending payment)
{
  "status": "success",
  "message": "Subscription created. Complete payment to activate.",
  "data": {
    "activated": false,
    "subscription": { "id": 2, "status": "pending_payment", ... },
    "payment": {
      "id": 3,
      "transaction_ref": "TXN-20260519-A1B2C3",
      "amount": "149.00",
      "provider": "vodafone_cash",
      "expires_at": "2026-05-20T10:00:00Z",
      "instructions": "Send EGP 149.00 to Vodafone Cash number: 01XXXXXXXXX. Then submit your transaction number via POST /payments/3/submit-proof"
    }
  }
}
```

#### `POST /subscriptions/upgrade`
```json
// Request
{ "plan_key": "teacher_pro", "payment_provider": "instapay" }
// Cancels current plan, starts new one
```

#### `POST /subscriptions/renew`
```json
// Request
{ "payment_provider": "vodafone_cash" }
// Re-subscribes to the same plan as last time
```

#### `DELETE /subscriptions/cancel`
```json
// Response 200
{
  "status": "success",
  "message": "Subscription cancelled. Remains active until Thu Jun 18 2026."
}
```

---

### 5.4 Payments — `/payments`

#### `GET /payments/my` — Auth required
Lists all payment attempts by the current user.

#### `GET /payments/invoices` — Auth required
Lists all generated invoices.

#### `POST /payments/:paymentId/submit-proof` — Auth required
After paying via Vodafone Cash / Orange Cash, user submits their receipt.
```json
// Request
{
  "provider_ref": "VFCASH-20260519-123456",
  "payment_proof": "Optional note or image path"
}

// Response 200
{
  "status": "success",
  "message": "Payment proof submitted. Awaiting admin verification."
}
```

#### `POST /payments/webhook/:provider` — No auth (called by payment gateway)
Called automatically by InstaPay, etc. when a payment is confirmed.
```json
// Example webhook body
{
  "transaction_ref": "TXN-20260519-A1B2C3",
  "provider_ref": "INSTAPAY-REF-XYZ",
  "status": "paid"
}
// Header: X-Webhook-Secret: <from .env>
```

#### `GET /payments/admin/pending` — Admin only
Lists all pending payments awaiting manual verification.
```
Header: X-Admin-Secret: <ADMIN_SECRET>
```

#### `PATCH /payments/admin/:paymentId/verify` — Admin only
Approve or reject a payment manually.
```json
// Request
{ "approve": true }

// Response 200
{
  "status": "success",
  "message": "Payment approved and subscription activated.",
  "data": { "subscription": { ... }, "payment": { ... }, "invoice": { ... } }
}
```

---

### 5.5 Applied Jobs — `/applied-jobs` (Fixed)

#### `PATCH /applied-jobs/:jobId/teachers/:teacherId/status` — Admin only
Was previously defined in the service but had no route. Now wired up.
```json
// Request
{ "status": "interview" }   // or "accepted" / "rejected" / "pending"

// Response 200
{ "status": "success", "data": { "Teacher_ID": 1, "Job_ID": 5, "Status": "interview" } }
```

---

### 5.6 All Other Existing Routes (Unchanged)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | ✅ | My profile |
| GET | `/users/:id` | ✅ | Teacher profile (creates profile_view notification) |
| PUT | `/users/profile-photo` | ✅ | Upload photo (multipart/form-data, field: `profileImage`) |
| GET | `/job-posts` | ❌ | All job posts |
| GET | `/job-posts/:schoolId/:jobId` | ❌ | Single post |
| POST | `/job-posts` | ✅ | Create post (was unprotected — now fixed) |
| GET | `/applied-jobs` | ✅ | My applications |
| POST | `/applied-jobs` | ✅ | Apply to job |
| DELETE | `/applied-jobs/:jobId` | ✅ | Cancel application |
| GET | `/notifications` | ✅ | My notifications |
| PATCH | `/notifications/:id/read` | ✅ | Mark read |
| DELETE | `/notifications/:id` | ✅ | Delete notification |
| GET | `/dashboard/stats` | ✅ | Teacher stats |

---

## 6. Socket.io Integration

### Connect from Frontend
```javascript
import { io } from "socket.io-client";

const token = localStorage.getItem("authToken");
const socket = io("http://localhost:3000", {
  auth: { token: `Bearer ${token}` },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection failed:", err.message);
  // "Invalid or expired token." → redirect to login
});

// Listen for real-time notifications
socket.on("notification", (data) => {
  console.log("New notification:", data);
  // data = { id, type, title, message, isRead, relatedId, createdAt }
  // Show a toast or update the notification bell
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
```

### Notification Types Emitted in Real-Time
| Type | When fired |
|------|-----------|
| `notification` → type: `profile_view` | Someone views your profile |
| `notification` → type: `job_match` | A new job matches your spec/experience |
| `notification` → type: `application_received` | You applied to a job |
| `notification` → type: `status_update` | Your application status changed |
| `notification` → type: `subscription_activated` | Subscription payment confirmed |
| `notification` → type: `subscription_cancelled` | You cancelled your subscription |

---

## 7. Payment Lifecycle (Paid Plan)

```
Frontend                    Backend                          DB
   │                           │                             │
   ├─ POST /subscriptions ────►│                             │
   │   { plan_key: "teacher_pro",                           │
   │     payment_provider:      │                             │
   │     "vodafone_cash" }      │                             │
   │                           ├── Create Subscription ─────►│ status=pending_payment
   │                           ├── Create Payment ──────────►│ status=pending
   │                           ├── Call VodafoneCash.        │
   │                           │   initiatePayment()         │
   │◄─ { payment.id, amount,  ─┤                             │
   │     instructions,         │                             │
   │     expires_at }          │                             │
   │                           │                             │
   │  [User pays on phone]     │                             │
   │                           │                             │
   ├─ POST /payments/3/        │                             │
   │   submit-proof ──────────►│                             │
   │   { provider_ref:         ├── Update Payment ──────────►│ provider_ref saved
   │     "VFCASH-123" }        │                             │
   │◄─ "Awaiting admin" ───────┤                             │
   │                           │                             │
   │  [Admin reviews]          │                             │
   │                           │                             │
   ├─ PATCH /payments/         │                             │
   │   admin/3/verify ────────►│                             │
   │   { approve: true }       ├── activateSubscription() ──►│ Payment: paid
   │                           │                             │ Subscription: active
   │                           ├── Create Invoice ──────────►│
   │                           ├── emitToUser(userId,        │
   │                           │   "notification",           │
   │◄─ 200 OK ─────────────────┤   { type: "subscription_   │
   │                           │     activated" })           │
   │◄──[Socket] notification ──┤                             │
```

---

## 8. Role-Based Plan Access

| User Role | Allowed Plans | Blocked Plans |
|-----------|--------------|---------------|
| `teacher` | `teacher_free`, `teacher_pro` | `school_starter`, `school_pro` |
| `school`  | `school_starter`, `school_pro` | `teacher_free`, `teacher_pro` |

The Role is stored in the JWT payload and checked in `createSubscription()` without an extra DB query.

---

## 9. Testing with Postman

### Step-by-step flow:

**1. Register a teacher**
```
POST http://localhost:3000/auth/register
Body: { "name": "Ahmed", "email": "ahmed@test.com", "password": "123456", "role": "teacher" }
→ Copy the token
```

**2. Set Authorization header in Postman**
```
Authorization: Bearer <token>
```

**3. View plans**
```
GET http://localhost:3000/subscriptions/plans/all
```

**4. Subscribe to free plan**
```
POST http://localhost:3000/subscriptions
Body: { "plan_key": "teacher_free" }
→ Activated immediately, no payment needed
```

**5. Upgrade to pro (with Vodafone Cash)**
```
POST http://localhost:3000/subscriptions/upgrade
Body: { "plan_key": "teacher_pro", "payment_provider": "vodafone_cash" }
→ Returns payment.id and instructions
```

**6. Submit payment proof**
```
POST http://localhost:3000/payments/1/submit-proof
Body: { "provider_ref": "VFCASH-TEST-001" }
```

**7. Admin approves (in a new Postman request)**
```
PATCH http://localhost:3000/payments/admin/1/verify
Header: X-Admin-Secret: <your ADMIN_SECRET>
Body: { "approve": true }
→ Subscription is now active, invoice generated
```

**8. Check my subscription**
```
GET http://localhost:3000/subscriptions/my
→ Should show status: "active"
```

**9. Check invoices**
```
GET http://localhost:3000/payments/invoices
```

**10. Cancel subscription**
```
DELETE http://localhost:3000/subscriptions/cancel
```

---

## 10. Adding a New Payment Provider

Only 3 steps — nothing else in the codebase changes:

1. Create `src/modules/payments/providers/myNewProvider.provider.js`
   ```javascript
   async function initiatePayment({ amount, transactionRef }) { ... }
   async function verifyPayment({ transactionRef, providerRef }) { ... }
   module.exports = { initiatePayment, verifyPayment };
   ```

2. Register it in `gateway.factory.js`:
   ```javascript
   const myNewProvider = require("./myNewProvider.provider");
   const providers = {
     instapay, vodafone_cash, orange_cash,
     my_new_provider: myNewProvider,  // ← add here
   };
   ```

3. Add it to the `Payment.provider` ENUM in the model and the SQL schema.

---

## 11. Remaining Manual Steps

1. **Set `DB_PASSWORD`** in `.env` — cannot be empty in most MySQL installs
2. **Change `JWT_SECRET`** — current placeholder is not safe
3. **Change `ADMIN_SECRET`** — required before exposing admin routes
4. **Set `CLIENT_URL`** — must match your actual frontend URL for CORS and Socket.io
5. **Fill payment provider credentials** — when you receive them from InstaPay, Vodafone, or Orange
6. **Implement real email** in `forgotPassword()` — currently logs to console only
7. **Production deployment**: replace `sequelize.sync({ alter: true })` with proper Sequelize migrations
8. **Add a real cron job** (e.g. `node-cron`) for subscription expiry checks — the current `setInterval` only runs while the Node process is alive
9. **Add HTTPS** — required for all payment providers in production
10. **Add rate limiting** — `express-rate-limit` on auth endpoints to prevent brute force

