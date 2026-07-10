/**
 * End-to-end smoke test against an in-memory MongoDB.
 * Exercises the real Express app + models + services (no mocks) for the
 * core LMS flow: register → create course/module/topic → enroll → complete
 * → auto-certificate → student overview.
 *
 * Run: node scripts/e2e.test.mjs
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.NODE_ENV = 'test';

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri('sol_test');

const { connectDB, disconnectDB } = await import('../src/config/db.js');
await connectDB();

const app = (await import('../src/app.js')).default;

let passed = 0;
let failed = 0;
const assert = (cond, msg) => {
  if (cond) { passed += 1; console.log('  ✓', msg); }
  else { failed += 1; console.log('  ✗', msg); }
};

const server = app.listen(5090);
const base = 'http://127.0.0.1:5090';

const api = async (method, path, { body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

try {
  console.log('\n[1] Auth');
  const { User } = await import('../src/models/index.js');

  // Registration now returns a pending-verification state (OTP emailed), not a
  // token — new accounts must verify their email before logging in.
  const reg = await api('POST', '/api/v1/auth/register', {
    body: { full_name: 'Jane Student', email: 'jane@test.com', password: 'password123' },
  });
  assert(
    reg.status === 201 && reg.json.data.pending_verification === true && !reg.json.data.accessToken,
    'register student → 201 + pending_verification (no token)'
  );

  const dup = await api('POST', '/api/v1/auth/register', {
    body: { full_name: 'Jane', email: 'jane@test.com', password: 'password123' },
  });
  assert(dup.status === 409, 'duplicate email → 409');

  // Unverified login is gated (403 + pending_verification) and re-sends a code.
  const gated = await api('POST', '/api/v1/auth/login', {
    body: { email: 'jane@test.com', password: 'password123' },
  });
  assert(
    gated.status === 403 && gated.json.details?.pending_verification === true,
    'login while unverified → 403 + pending_verification'
  );

  // Verify the OTP end-to-end. The code is hashed in the DB, so drive the model
  // helper to mint a known code, persist it, then hit the real endpoint.
  const janeDoc = await User.findOne({ email: 'jane@test.com' }).select('+otp_code +otp_expires');
  const janeCode = janeDoc.generateOtp();
  await janeDoc.save({ validateBeforeSave: false });
  const verify = await api('POST', '/api/v1/auth/verify-otp', {
    body: { email: 'jane@test.com', otp: janeCode },
  });
  assert(verify.status === 200 && verify.json.data.accessToken, 'verify-otp → 200 + token');
  const studentToken = verify.json.data.accessToken;
  const studentId = verify.json.data.user.id || verify.json.data.user._id;

  const badOtp = await api('POST', '/api/v1/auth/verify-otp', {
    body: { email: 'jane@test.com', otp: '000000' },
  });
  assert(badOtp.status === 400, 'verify-otp with wrong/used code → 400');

  const login = await api('POST', '/api/v1/auth/login', {
    body: { email: 'jane@test.com', password: 'password123' },
  });
  assert(login.status === 200 && login.json.data.accessToken, 'verified login → 200 + token');

  // Register a SEPARATE admin account (keep Jane as a genuine student).
  const adminReg = await api('POST', '/api/v1/auth/register', {
    body: { full_name: 'Owner Admin', email: 'admin@test.com', password: 'password123' },
  });
  assert(adminReg.status === 201, 'register admin → 201');
  // Promote + verify directly (simulates the migrate:verified / admin path).
  const adminDoc = await User.findOne({ email: 'admin@test.com' });
  adminDoc.role = 'admin';
  adminDoc.is_verified = true;
  await adminDoc.save({ validateBeforeSave: false });
  const adminLogin = await api('POST', '/api/v1/auth/login', {
    body: { email: 'admin@test.com', password: 'password123' },
  });
  assert(adminLogin.status === 200 && adminLogin.json.data.accessToken, 'admin login → 200 + token');
  const adminToken = adminLogin.json.data.accessToken;

  console.log('\n[2] Course + curriculum (admin)');
  const course = await api('POST', '/api/v1/courses', {
    token: adminToken,
    body: { title: 'NDIS Foundation', level: 'level1', price: 199, is_published: true },
  });
  assert(course.status === 201, 'create course → 201');
  const courseId = course.json.data.id || course.json.data._id;

  const mod = await api('POST', '/api/v1/modules', {
    token: adminToken,
    body: { course_id: courseId, title: 'Module 1' },
  });
  assert(mod.status === 201, 'create module → 201');
  const moduleId = mod.json.data.id || mod.json.data._id;

  const topic1 = await api('POST', '/api/v1/topics', {
    token: adminToken,
    body: { module_id: moduleId, title: 'Intro Video', type: 'video' },
  });
  const topic2 = await api('POST', '/api/v1/topics', {
    token: adminToken,
    body: { module_id: moduleId, title: 'Reading', type: 'reading' },
  });
  assert(topic1.status === 201 && topic2.status === 201, 'create 2 topics → 201');
  const t1 = topic1.json.data.id || topic1.json.data._id;
  const t2 = topic2.json.data.id || topic2.json.data._id;

  // total_topics should have synced to 2
  const courseAfter = await api('GET', `/api/v1/courses/${courseId}`, { token: adminToken });
  assert(courseAfter.json.data.total_topics === 2, `course.total_topics synced to 2 (got ${courseAfter.json.data.total_topics})`);

  console.log('\n[3] Public catalogue');
  const publicList = await api('GET', '/api/v1/courses');
  assert(publicList.status === 200 && publicList.json.data.length === 1, 'public course list → 200 with 1 course');
  assert(publicList.json.meta && publicList.json.meta.total === 1, 'pagination meta present');

  console.log('\n[4] Enrollment + progress + auto-certificate');
  const enroll = await api('POST', '/api/v1/enrollments', {
    token: adminToken,
    body: { user_id: studentId, course_id: courseId },
  });
  assert(enroll.status === 201, 'manual enroll → 201');
  const enrollmentId = enroll.json.data.id || enroll.json.data._id;

  const p1 = await api('PATCH', `/api/v1/enrollments/${enrollmentId}/progress`, {
    token: adminToken, body: { topic_id: t1, completed: true },
  });
  assert(p1.json.data.enrollment.progress_percent === 50, `progress 50% after 1/2 (got ${p1.json.data.enrollment.progress_percent})`);

  const p2 = await api('PATCH', `/api/v1/enrollments/${enrollmentId}/progress`, {
    token: adminToken, body: { topic_id: t2, completed: true },
  });
  assert(p2.json.data.enrollment.progress_percent === 100, 'progress 100% after 2/2');
  assert(p2.json.data.enrollment.status === 'completed', 'enrollment auto-completed');
  // Certificate issuance depends on Cloudinary; without creds it will throw,
  // but completion + status must still hold. Accept either issued cert or null.
  assert(p2.json.data.certificate === null || p2.json.data.certificate?.certificate_number, 'certificate attempt handled');

  console.log('\n[5] Quiz grading (server-side)');
  const quizTopic = await api('POST', '/api/v1/topics', {
    token: adminToken,
    body: {
      module_id: moduleId, title: 'Quiz', type: 'quiz', passing_marks: 1,
      quiz_questions: [
        { question: '2+2?', options: ['3', '4'], correct_index: 1, marks: 1 },
        { question: 'Sky color?', options: ['Blue', 'Green'], correct_index: 0, marks: 1 },
      ],
    },
  });
  const qtId = quizTopic.json.data.id || quizTopic.json.data._id;
  // Student fetches topic → answers must be stripped
  const studentTopicView = await api('GET', `/api/v1/topics/${qtId}`, { token: studentToken });
  const q0 = studentTopicView.json.data.quiz_questions[0];
  assert(q0.correct_index === undefined, 'quiz answer key hidden from student');

  const attempt = await api('POST', '/api/v1/quizzes/attempts', {
    token: studentToken,
    body: { topic_id: qtId, course_id: courseId, answers: { 0: 1, 1: 0 } },
  });
  assert(attempt.status === 201 && attempt.json.data.score === 2, `quiz graded 2/2 (got ${attempt.json.data.score})`);
  assert(attempt.json.data.passed === true, 'quiz passed');

  console.log('\n[6] Coupons');
  await api('POST', '/api/v1/coupons', {
    token: adminToken, body: { code: 'save50', discount_type: 'percent', discount_value: 50 },
  });
  const val = await api('POST', '/api/v1/coupons/validate', {
    token: studentToken, body: { code: 'SAVE50', course_id: courseId },
  });
  assert(val.status === 200 && val.json.data.valid, 'coupon validate → 200 valid');

  console.log('\n[7] Support tickets');
  const ticket = await api('POST', '/api/v1/support-tickets', {
    token: studentToken, body: { category: 'course', subject: 'Help', message: 'Stuck on module 1' },
  });
  assert(ticket.status === 201 && ticket.json.data.messages.length === 1, 'ticket created with initial message');

  console.log('\n[8] Dashboards');
  const adminOv = await api('GET', '/api/v1/admin/overview', { token: adminToken });
  assert(adminOv.status === 200 && adminOv.json.data.courses.total === 1, 'admin overview → 200');
  const studentOv = await api('GET', '/api/v1/student/overview', { token: studentToken });
  assert(studentOv.status === 200 && studentOv.json.data.enrollments.completed === 1, 'student overview shows 1 completed');

  console.log('\n[9] RBAC enforcement');
  const forbidden = await api('POST', '/api/v1/courses', {
    token: studentToken, body: { title: 'Hack', level: 'level1' },
  });
  assert(forbidden.status === 403, 'student cannot create course → 403');
} catch (err) {
  console.error('\nTEST CRASHED:', err.message);
  console.error(err.stack);
  failed += 1;
} finally {
  console.log(`\n${'='.repeat(40)}\nRESULT: ${passed} passed, ${failed} failed\n${'='.repeat(40)}`);
  server.close();
  await disconnectDB();
  await mongod.stop();
  process.exit(failed > 0 ? 1 : 0);
}
