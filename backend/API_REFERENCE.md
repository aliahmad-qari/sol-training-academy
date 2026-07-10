# SOL Training Academy — API Reference (v1)

Base URL: `/api/v1`
Auth: `Authorization: Bearer <accessToken>` (refresh token is an httpOnly cookie).
All responses: `{ success, message, data, meta? }`. Errors: `{ success:false, message, details? }`.

List endpoints support: `?page`, `?limit` (max 100), `?sort=-field,field2`, `?search=`, plus per-field filters and `_gte/_lte/_gt/_lt/_ne` operators.

---

## Auth  `/auth`
| Method | Path | Access | Body | Success |
|--------|------|--------|------|---------|
| POST | `/register` | public | `{full_name,email,password,phone?}` | 201 `{email,pending_verification:true}` — emails a 6-digit OTP, no token issued |
| POST | `/login` | public | `{email,password}` | 200 `{user,accessToken}`; 403 `{message,details:{pending_verification,email}}` if email unverified (re-sends OTP) |
| POST | `/verify-otp` | public | `{email,otp}` | 200 `{user,accessToken}` — flips `is_verified`, logs in |
| POST | `/resend-otp` | public | `{email}` | 200 (generic; re-sends OTP for unverified accounts) |
| POST | `/forgot-password` | public | `{email}` | 200 (generic; emails a reset link `${CLIENT_URL}/reset-password?token=…`) |
| POST | `/reset-password` | public | `{token,new_password}` | 200 — sets password, revokes all sessions |
| POST | `/refresh` | cookie | — | 200 `{accessToken}` |
| POST | `/logout` | any | — | 200 |
| GET | `/me` | auth | — | 200 `{user}` |
| PATCH | `/change-password` | auth | `{current_password,new_password}` | 200 |

**Email verification & reset** — transactional email is delivered via the Resend
HTTPS API (SMTP is blocked on Render). All the public auth endpoints above are
rate-limited by `authLimiter`. OTPs are 6 digits, expire in 10 min; reset tokens
expire in 30 min. Both are stored only as sha256 hashes. Accounts created before
email verification existed are grandfathered by `npm run migrate:verified`.

Required env vars (set on Render): `RESEND_API_KEY` (or `EMAIL_API_KEY`),
`EMAIL_FROM` (verified sender, e.g. `SOL Business Consultant <saf@solbusinessconsultant.com.au>`),
`CLIENT_URL` (frontend origin, used to build reset links + locate the email
logo). Optional: `EMAIL_PROVIDER` (default `resend`), `EMAIL_LOGO_URL`
(default `${CLIENT_URL}/sol-logo.jpg`).

## Users  `/users`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| PATCH | `/me` | auth | update own `full_name/phone/avatar_url` |
| GET | `/` | staff | list, filter `role,is_active` |
| POST | `/` | admin | create user (`role`, `page_permissions`) |
| GET | `/:id` | staff/self | |
| PATCH | `/:id` | admin | role/permissions/active |
| DELETE | `/:id` | admin | soft-delete (deactivate) |

## Courses  `/courses`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/` | public | published only; staff `?all=true` |
| GET | `/:id` | public | `?include=curriculum` embeds modules+topics |
| POST | `/` | staff | |
| PUT | `/:id` | staff | |
| PATCH | `/:id/publish` | staff | `{is_published}` |
| DELETE | `/:id` | admin | blocked if enrollments exist |

## Modules `/modules`  ·  Topics `/topics`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/modules?course_id=` | public | ordered |
| GET | `/topics?module_id=` \| `?course_id=` | public | quiz answer keys hidden from students |
| POST/PUT/DELETE | `/modules/:id`, `/topics/:id` | staff | cascade-safe; `total_topics` auto-synced |
| PATCH | `/modules/reorder`, `/topics/reorder` | staff | `{items:[{id,sort_order}]}` |

## Enrollments  `/enrollments`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/` | auth | students see own |
| POST | `/` | staff | `{user_id,course_id}` |
| POST | `/bulk` | staff | `{user_ids,course_id}` or `{course_ids,user_id}` |
| GET | `/:id` | owner/staff | |
| PATCH | `/:id/progress` | owner | `{topic_id,completed}` → auto-cert on 100% |
| PATCH | `/:id` | staff | status/expiry |
| DELETE | `/:id` | staff | |

## Quizzes  `/quizzes`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/attempts` | auth | `{topic_id\|quiz_id,course_id,answers}` — graded server-side |
| GET | `/attempts/mine` | auth | |
| GET | `/attempts` | staff | all attempts |
| GET/POST/GET/PUT/DELETE | `/`, `/:id` | list auth, writes staff | answers hidden from students |

## Assignments `/assignments`  ·  Submissions `/submissions`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET/POST/PUT/DELETE | `/assignments`… | list auth, writes staff | |
| POST | `/submissions` | auth | multipart `file` → Cloudinary |
| GET | `/submissions` | auth | students see own |
| PATCH | `/submissions/:id/grade` | staff | `{marks_awarded,feedback?,status?}` |
| DELETE | `/submissions/:id` | owner(pre-grade)/staff | removes Cloudinary asset |

## Certificates  `/certificates`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/verify/:code` | public | limited verification data |
| GET | `/` | auth | students see own |
| POST | `/issue` | auth | `{enrollment_id}` (student, if completed) |
| GET | `/:id` | owner/staff | |
| PATCH | `/:id/revoke` | admin | |

## Payments  `/payments`  (Stripe)
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/checkout` | auth | `{course_id,coupon_code?}` → `{url}` (or free enroll) |
| POST | `/verify` | auth | `{session_id}` — idempotent with webhook |
| POST | `/preview-coupon` | auth | `{course_id,coupon_code}` |
| GET | `/`, `/:id` | auth | students see own |
| POST | `/webhooks/stripe` | Stripe | raw-body signature verified (mounted at `/api/v1/webhooks/stripe`) |

## Coupons `/coupons`  ·  Support `/support-tickets`
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/coupons/validate` | auth | `{code,course_id?}` |
| GET/POST/PUT/DELETE | `/coupons`… | staff | |
| GET/POST | `/support-tickets`, `/:id` | auth | students see own |
| POST | `/support-tickets/:id/reply` | owner/staff | `{message}` |
| PATCH | `/support-tickets/:id` | staff | status/priority/assignment |

## Uploads `/uploads/:kind`  (staff)
`kind` ∈ `resource | assignment_brief | reading | avatar | thumbnail`. multipart `file` → Cloudinary.

## Dashboards & Analytics
| Method | Path | Access |
|--------|------|--------|
| GET | `/admin/overview`, `/admin/recent` | staff |
| GET | `/student/overview` | auth |
| GET | `/analytics/revenue?months=6` | staff |
| GET | `/analytics/enrollments` | staff |
| GET | `/analytics/top-courses?limit=5` | staff |
| GET | `/analytics/summary` | staff |

## Health
`GET /api/v1/health` → uptime + DB state (used by Render/Railway health checks).
