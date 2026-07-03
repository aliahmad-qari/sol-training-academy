# SOL Training Academy — Complete Project Flow Documentation

**Project:** SOL Training Academy — NDIS Training, LMS & Client Portal
**Domain:** solbusinessconsultant.com.au
**ABN:** 20 662 022 522
**Date:** July 2026

---

## TABLE OF CONTENTS
1. Project Overview
2. Technology Stack
3. The 4 Main Areas of the Website
4. User Roles
5. Complete User Flows (step-by-step)
6. Database (Entities) Overview
7. Backend Automation & Emails
8. Payment Flow
9. NDIS Client Onboarding Flow
10. Course / Learning Flow
11. Admin Management Flow
12. How Everything Connects

---

## 1. PROJECT OVERVIEW

SOL Training Academy is an all-in-one business platform with **three connected products** in one website:

1. **Public Marketing Website** — promotes NDIS registration services, training courses, marketing packages, and consulting. Drives enquiries and course sales.
2. **Client Portal** — a private dashboard for NDIS clients to track their registration, upload documents, view invoices, book consultations, and submit intake forms.
3. **LMS (Learning Management System)** — a full training platform where students enroll in courses, watch videos, take quizzes, submit assessments, and earn certificates. Plus an admin back-office to manage everything.

The business sells:
- NDIS registration services (done-for-you compliance & registration)
- Online training courses (3 levels: Foundation, Professional, Advanced)
- Marketing packages & consulting services
- Support coordination training
- Website development & software automation services

---

## 2. TECHNOLOGY STACK

| Layer | Technology |
|-------|-----------|
| Frontend (website UI) | React + Vite + Tailwind CSS + shadcn/ui components |
| Icons | lucide-react |
| Charts | Recharts |
| Animations | Framer Motion |
| Routing | React Router |
| Forms | react-hook-form |
| Rich text | react-quill |
| Backend / Database / Auth / Emails / AI / Files | **Base44 platform** (backend-as-a-service) |
| Backend functions | Deno serverless (on Base44) |
| Payment | Stripe / PayPal / eWay / Bank Transfer |
| AI Assistant | Base44 InvokeLLM |

---

## 3. THE 4 MAIN AREAS OF THE WEBSITE

### Area 1 — Public Marketing Site (`/`)
Visible to everyone, no login required.
- **Home** — hero, services, pricing, compliance, NDIS info, testimonials, FAQ, contact
- **Service Pages** — NDIS Registration, Website Development, Software Automation, Accountancy, Support Coordination Training, Marketing Services
- **Training Courses** — course catalog with 3 levels
- **Marketing Packages** — pricing tiers
- **Blog, Case Studies** — content marketing
- **Get Started** — interactive quiz that recommends a service plan
- **Readiness Quiz / NDIS Readiness Calculator** — lead capture tools
- **AI Assistant** — chatbot for visitor questions
- **Legal Pages** — Privacy, Refund, Terms, Complaints, Accessibility
- **Auth** — Login, Register, Forgot/Reset Password

### Area 2 — Client Portal (`/client-portal`)
Private area for NDIS clients (logged in).
- Overview dashboard
- NDIS progress tracker
- Enquiries
- Document upload & verification
- Subscriptions
- Invoices & billing
- NDIS template library
- Support tickets
- Onboarding (client intake vs staff intake)
- Consultation booking

### Area 3 — Student Dashboard (`/student-dashboard`)
Private area for students enrolled in courses (logged in).
- Course player (videos, quizzes, reading, assessments)
- Progress tracking
- Certificates
- Notes & bookmarks
- Quizzes & assessments
- Goals & learning streaks
- Payments history
- Referral hub
- Support centre

### Area 4 — LMS Admin & Admin Dashboard (`/lms-admin`, `/admin`)
Private area for staff/admins to manage the whole platform.
- Course & module management
- Student management
- Payments & revenue
- Quizzes & assessments
- Certificates
- Coupons
- Analytics & reports
- NDIS intake review
- Document verification
- Support tickets
- Team member management
- Announcements
- Settings

---

## 4. USER ROLES

| Role | Where they go | What they do |
|------|--------------|--------------|
| **Visitor** (not logged in) | Public site | Browse services, read blog, take readiness quiz, register an account, contact us |
| **Client** (NDIS participant) | Client Portal | Submit intake, track NDIS registration, upload docs, view invoices, book consultations |
| **Student** (course enrollee) | Student Dashboard | Take courses, do quizzes, submit assessments, earn certificates |
| **Staff / Worker applicant** | Client Portal (staff intake) | Submit job application & compliance docs |
| **Team Member** (employee) | LMS Admin | Manage courses, students, payments, content (permission-based) |
| **Admin / Owner** | LMS Admin + Admin Dashboard | Full access to everything, settings, team, revenue |

> A single person can be both a Client (getting NDIS help) and a Student (taking training) — the portal and dashboard are separate but linked by the same login.

---

## 5. COMPLETE USER FLOWS (STEP-BY-STEP)

### FLOW A — Visitor becomes a paying student
1. Visitor lands on **Home** page, browses services/courses
2. Visits **Training Courses**, picks a course level
3. Clicks **Enroll** → goes to **Checkout**
4. If not logged in → redirected to **Register** (email + password, or Google)
5. Receives **OTP email** → enters code → account verified
6. Returns to **Checkout**, selects payment method (Stripe card / PayPal / bank transfer)
7. **processPayment** function runs → creates a **CoursePayment** record → on success auto-creates a **CourseEnrollment**
8. **sendPaymentInvoiceEmail** function generates a PDF invoice and emails it
9. Student lands on **Payment Success** page → redirected to **Student Dashboard**
10. Student starts the course in the **Course Player**

### FLOW B — Visitor becomes an NDIS client
1. Visitor browses **NDIS Registration** service page
2. Fills the **NDIS Onboarding Form** (multi-step: contact → business → services → notes)
3. Submission creates an **Enquiry** record (status: new)
4. Admin sees it in **AdminNDISIntake** dashboard, reviews, updates status
5. Client receives a welcome email and is invited to the **Client Portal**
6. Client logs in → sees **PortalOverview**
7. Client completes **PortalOnboarding** → chooses **Client Intake** → fills **PortalClientIntake** form
8. Client can **upload compliance documents** (PortalDocuments) → admin verifies them
9. Client tracks NDIS progress in **PortalNDISProgress** (visual stepper)
10. Client can **book a consultation** (PortalBooking) → creates an Enquiry record
11. Admin reviews booking, schedules the consultation

### FLOW C — Staff/Worker applies to join the team
1. Applicant visits the portal → **PortalOnboarding** → chooses **Staff Intake**
2. Fills **PortalStaffIntake** form (personal details, role, qualifications, compliance checks)
3. Submission creates an **Enquiry** record
4. HR/Admin reviews in **AdminNDISIntake** / intake dashboard
5. If approved, applicant is invited and uploads compliance docs (police check, NDIS screening, WWC, etc.)
6. Admin verifies documents in **AdminDocumentVerification**
7. **TeamMember** record created → applicant becomes a team member

### FLOW D — Student takes and completes a course
1. Student logs in → **Student Dashboard** → **StudentOverview**
2. Opens a course → **Course Player** shows modules & topics (video / quiz / reading / assessment)
3. Watches videos → marks progress → **CourseEnrollment.progress_percent** updates
4. Takes a **Quiz** → **QuizAttempt** record created → if passed, topic marked complete
5. Submits an **Assessment** → **AssignmentSubmission** record created (status: submitted)
6. Admin reviews in **AdminAssessmentManager** → grades it → **sendGradeFeedbackEmail** sends feedback
7. When all topics complete → enrollment marked **completed**
8. **generateAndEmailCertificate** function creates a PDF certificate and emails it
9. Student can view/download certificate in **StudentCertificates**
10. **sendCompletionEmail** congratulates the student

### FLOW E — Admin manages the platform
1. Admin logs in → **LMS Admin** dashboard
2. **AdminOverview** shows stats (students, revenue, enrollments)
3. Admin can:
   - Create/edit courses & modules (**AdminCourseManager**, **AdminModuleManager**)
   - Manage students & enrollments (**AdminStudentManager**, **AdminBulkEnroll**)
   - Review NDIS intake applications (**AdminNDISIntake**, **NDISIntakeSummary**)
   - Verify compliance documents (**AdminDocumentVerification**)
   - Generate quizzes with AI (**AIQuizGenerator**)
   - Manage payments & invoices (**AdminPayments**, **AdminRevenueDashboard**)
   - Create coupons (**AdminCoupons**)
   - Issue certificates (**AdminCertificates**)
   - Handle support tickets (**AdminSupportManager**)
   - Review student requests (**AdminRequestsManager**)
   - Manage team members & permissions (**AdminTeamManager**)
   - View analytics (**AdminAnalytics**)
   - Export data to CSV (**AdminExportCSV**)
   - Send announcements (**AdminAnnouncements**)
   - Moderate discussions (**AdminDiscussionModeration**)
   - Configure settings (**AdminSettings**)

### FLOW F — Automated reminders (no human action needed)
1. **courseExpiryReminders** runs on a schedule → finds enrollments nearing expiry → emails students (30/15/7 day reminders)
2. **sendProgressReminders** runs on a schedule → nudges inactive students to continue learning
3. When a student request is updated → **notifyRequestUpdate** emails the student
4. When a quiz is graded → **sendQuizResultEmail** emails the result

---

## 6. DATABASE (ENTITIES) OVERVIEW

The database has ~30 entity types grouped by function:

### Course & Learning
- **Course** — course details (title, level, price, duration)
- **CourseModule** — modules within a course
- **CourseTopic** — topics within a module (video/quiz/reading/assessment)
- **CourseEnrollment** — links a student to a course, tracks progress
- **CoursePayment** — payment records for courses
- **CourseFeedback** — student reviews
- **CourseWaitlist** — students waiting for a full course
- **Assignment** — assignment definitions
- **AssignmentSubmission** — student assignment submissions
- **QuizAttempt** — quiz attempt records
- **DiscussionPost** — course discussion forum
- **StudentNote** — student notes & bookmarks

### Students & Users
- **User** (built-in) — all user accounts
- **StudentDocument** — compliance documents uploaded by students
- **StudentRequest** — requests from students (new course, resources, etc.)
- **StudentGoal** — student learning goals
- **AdminNote** — internal admin notes about students
- **Referral** — referral tracking

### Commerce & Billing
- **Coupon** — discount codes
- **Invoice** — invoices for services (NDIS, web, marketing, etc.)
- **Subscription** — subscription plans
- **Document** — compliance/registration documents linked to enquiries

### NDIS Client Portal
- **Enquiry** — all service enquiries & intake submissions
- **ReadinessQuizLead** — leads from the readiness quiz

### Team & Operations
- **TeamMember** — staff/employee records
- **TeamFile** — shared internal files
- **TeamActivityLog** — audit log of team actions
- **SupportTicket** — student/client support tickets
- **Complaint** — formal complaints

### Marketing & Automation
- **EmailSequence** — email marketing sequences
- **AutomationLog** — logs of automated actions

---

## 7. BACKEND AUTOMATION & EMAILS

The platform has **10 backend functions** that run automatically or on demand:

| Function | When it runs | What it does |
|----------|-------------|--------------|
| **processPayment** | Student pays for a course | Records payment, creates enrollment, sends invoice email |
| **verifyPayment** | Payment needs verification | Checks payment status with gateway, creates enrollment if confirmed |
| **sendPaymentInvoiceEmail** | After successful payment | Generates PDF invoice, uploads it, emails to student |
| **sendCompletionEmail** | Course completed | Congratulates student on finishing |
| **generateAndEmailCertificate** | Course completed | Generates PDF certificate, emails to student, marks enrollment |
| **sendGradeFeedbackEmail** | Assessment graded | Sends grade & feedback to student |
| **sendQuizResultEmail** | Quiz submitted | Emails quiz result to student |
| **sendProgressReminders** | Scheduled (e.g. weekly) | Reminds inactive students to keep learning |
| **courseExpiryReminders** | Scheduled | Warns students 30/15/7 days before course access expires |
| **notifyRequestUpdate** | Student request status changes | Notifies student of admin response |

---

## 8. PAYMENT FLOW (detailed)

```
Student clicks "Enroll & Pay"
        │
        ▼
Checkout page → selects payment method
        │
        ▼
processPayment function runs
  ├─ Creates CoursePayment record (status: processing)
  ├─ If Stripe → charges card via Stripe API
  ├─ If PayPal → processes via PayPal
  ├─ If eWay → processes via eWay
  ├─ If bank transfer → marks as pending (manual)
        │
        ▼
Payment successful?
  ├─ YES → Updates CoursePayment (completed)
  │        → Creates CourseEnrollment (active)
  │        → sendPaymentInvoiceEmail (PDF invoice emailed)
  │        → Redirects to Payment Success → Student Dashboard
  └─ NO  → Returns error, student retries
        │
        ▼
verifyPayment (for bank transfer / async methods)
  → Admin verifies manually → marks completed → enrollment created
```

---

## 9. NDIS CLIENT ONBOARDING FLOW (detailed)

```
Visitor → NDIS Registration service page
        │
        ▼
Fills NDIS Onboarding Form (4 steps)
  1. Contact details
  2. Business info
  3. NDIS services needed
  4. Additional notes
        │
        ▼
Creates Enquiry record → Admin sees in AdminNDISIntake
        │
        ▼
Admin reviews → updates status (new → reviewing → in progress → completed)
        │
        ▼
Client invited to Client Portal → logs in
        │
        ▼
Portal Onboarding → chooses "I'm an NDIS Participant"
        │
        ▼
Fills Client Intake Form (personal, disability, support needs, NDIS plan)
        │
        ▼
Client can:
  ├─ Upload compliance documents (PortalDocuments)
  │    → Admin verifies in AdminDocumentVerification
  │    → Status: pending → under_review → verified / rejected
  ├─ Track NDIS progress (PortalNDISProgress — visual stepper)
  ├─ Book consultations (PortalBooking)
  ├─ View invoices (PortalInvoices)
  └─ Get support (PortalSupport)
```

---

## 10. COURSE / LEARNING FLOW (detailed)

```
Student enrolled (via payment or admin bulk enroll)
        │
        ▼
Student Dashboard → opens course
        │
        ▼
Course Player shows modules → topics
  ├─ Video topic → watch → mark complete
  ├─ Reading topic → read PDF/content → mark complete
  ├─ Quiz topic → answer questions → QuizAttempt recorded
  │    → if score ≥ passing marks → topic complete
  │    → sendQuizResultEmail sends result
  └─ Assessment topic → submit file → AssignmentSubmission
       → Admin grades in AdminAssessmentManager
       → sendGradeFeedbackEmail sends grade + feedback
        │
        ▼
Progress % updates on CourseEnrollment
        │
        ▼
All topics complete?
  ├─ YES → enrollment status = completed
  │        → generateAndEmailCertificate (PDF + email)
  │        → sendCompletionEmail
  │        → Certificate visible in StudentCertificates
  └─ NO  → continue learning
        │
        ▼
Optional automated nudges:
  → sendProgressReminders (if inactive)
  → courseExpiryReminders (if access expiring)
```

---

## 11. ADMIN MANAGEMENT FLOW (detailed)

```
Admin logs in → LMS Admin dashboard
        │
        ▼
Role-based access (owner / admin / manager / team_member)
  → page_permissions control what each member sees
        │
        ▼
Admin manages:
  ┌─ COURSES
  │   → Create course → add modules → add topics (video/quiz/reading/assessment)
  │   → Set pricing, duration, access period
  │   → Publish/unpublish
  │
  ├─ STUDENTS
  │   → View all students, progress, enrollments
  │   → Bulk enroll students into courses
  │   → Add admin notes
  │   → Manage student requests
  │
  ├─ ASSESSMENTS & QUIZZES
  │   → AI Quiz Generator creates quiz questions from content
  │   → Grade assignment submissions
  │   → Send grade feedback
  │
  ├─ CERTIFICATES
  │   → Auto-generate on completion, or manually issue
  │
  ├─ PAYMENTS & REVENUE
  │   → View all payments, revenue dashboard
  │   → Generate invoices for services
  │   → Export to CSV
  │
  ├─ NDIS INTAKE
  │   → Review client intake applications
  │   → Verify compliance documents
  │   → Update application status
  │
  ├─ SUPPORT
  │   → Handle support tickets
  │   → Respond to student requests
  │   → Manage complaints
  │
  ├─ TEAM
  │   → Invite team members
  │   → Assign roles & page permissions
  │   → Share internal files
  │   → View activity logs
  │
  ├─ MARKETING
  │   → Manage coupons
  │   → Send announcements
  │   → Email sequences
  │
  └─ SETTINGS
      → Configure platform settings
```

---

## 12. HOW EVERYTHING CONNECTS

```
┌─────────────────────────────────────────────────────────┐
│                   PUBLIC WEBSITE                         │
│  (Home, Services, Courses, Blog, Get Started, Contact)   │
└──────────┬──────────────────┬───────────────────┬────────┘
           │                  │                   │
      Register           Enquiry              Enroll & Pay
           │                  │                   │
           ▼                  ▼                   ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   AUTH (Base44) │  │  Enquiry record │  │  CoursePayment    │
│ Login/Register  │  │  (in database)  │  │  (in database)    │
└────────┬───────┘  └────────┬────────┘  └────────┬───────────┘
         │                   │                    │
         ▼                   ▼                    ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  CLIENT PORTAL  │  │  Admin reviews  │  │  CourseEnrollment │
│  - Intake       │  │  in AdminNDIS   │  │  auto-created     │
│  - Documents    │  │  Intake         │  │  (in database)    │
│  - NDIS track   │  │                 │  └────────┬─────────┘
│  - Invoices      │  └─────────────────┘           │
│  - Booking       │                                ▼
│  - Support       │                     ┌──────────────────┐
└────────────────┘                      │  STUDENT DASHBOARD│
                                         │  - Course Player   │
                                         │  - Quizzes         │
                                         │  - Assessments     │
                                         │  - Certificates    │
                                         │  - Progress        │
                                         └────────┬──────────┘
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │   LMS ADMIN       │
                                         │  (manages all)    │
                                         │  - Courses        │
                                         │  - Students       │
                                         │  - Payments       │
                                         │  - NDIS Intake    │
                                         │  - Documents      │
                                         │  - Team           │
                                         │  - Reports        │
                                         └──────────────────┘
```

**The single source of truth is the Base44 database.** Every action — a registration, a payment, an enquiry, a quiz attempt, a document upload — writes to the database. The Client Portal, Student Dashboard, and LMS Admin all read from and write to the same database, so when a student pays, the admin sees it instantly; when a client uploads a document, the admin can verify it immediately.

---

## SUMMARY

SOL Training Academy is a **3-in-1 platform**:

1. **Marketing & Lead Generation** — public site attracts visitors, captures enquiries, sells courses and NDIS services.
2. **Client Portal** — NDIS clients onboard, track progress, upload documents, book consultations, pay invoices.
3. **LMS + Admin** — students learn and earn certificates; admins manage courses, students, payments, and the entire operation.

Everything runs on the **Base44 backend** (database, auth, emails, files, AI, serverless functions), with the **React frontend** hosted on Vercel, and **Stripe** for live payments. The whole system is connected through one shared database, so every role sees real-time, up-to-date information.

---

*This document describes the complete project flow as of July 2026.*