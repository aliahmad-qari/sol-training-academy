/**
 * ai.prompts.js — server-side prompt & schema registry for every AI tool.
 *
 * WHY server-side: the frontend now sends only *structured inputs* (topic,
 * level, ticket text, precomputed stats). The prompt engineering and the
 * enforced JSON schemas live here, so they can't be tampered with from the
 * browser and can be tuned without shipping a new SPA build.
 *
 * Shape of each entry:
 *   {
 *     mode: 'text' | 'json',
 *     systemInstruction?: string,   // optional persona / global guardrail
 *     buildPrompt(input): string,   // turns req.body into the final prompt
 *     schema?: object,              // required when mode === 'json'
 *   }
 *
 * Keys MUST match the `toolId` the dashboards already use (AIToolsStudent.jsx /
 * AIToolsAdmin.jsx), so routing is a direct lookup.
 *
 * All prompt bodies and schemas below are migrated verbatim from the original
 * base44 `InvokeLLM` calls in the JSX to preserve identical behavior.
 */

/* ─────────────────────────── shared helpers ─────────────────────────── */

const str = (v) => (v == null ? '' : String(v));

const LEVEL_LABEL = {
  level1: 'Level 1 — Foundation',
  level2: 'Level 2 — Professional',
  level3: 'Level 3 — Advanced',
};
const levelLabel = (l) => LEVEL_LABEL[l] || LEVEL_LABEL.level1;

const WRITER_TYPE_PROMPTS = {
  brainstorm: `Generate a rich brainstorm with 8-10 ideas, angles, arguments and supporting points for this assignment topic. Include relevant NDIS/support coordination context where applicable.`,
  outline: `Create a detailed assignment outline with introduction, 3-5 body sections (each with sub-points), and a conclusion. Include suggested word counts per section.`,
  draft: `Write a solid first draft of an assignment on this topic. Structure it with an introduction, well-developed body paragraphs, and a conclusion. Use clear professional Australian English.`,
};

const EXPLAINER_STYLES = {
  simple: "Explain like I'm completely new to this topic. Use simple words, everyday analogies, and short sentences.",
  story: 'Explain through a short story or real-life scenario that makes the concept easy to understand.',
  detailed: 'Give a thorough, detailed explanation with definitions, context, examples, and nuances.',
};

/* ─────────────────────────── STUDENT TOOLS ─────────────────────────── */

export const STUDENT_TOOLS = {
  studybuddy: {
    mode: 'text',
    buildPrompt: ({ topic, level = 'simple' }) =>
      `You are a friendly tutor for a support coordination training student. Explain the following topic in ${str(level)} terms with practical tips.\n\nTOPIC: ${str(topic)}\n\nStructure your response as:\n1. Simple Explanation (2-3 paragraphs)\n2. Key Points (bullet list)\n3. Practical Tips (3-5 actionable tips)\n4. Remember This (one memorable takeaway)`,
  },

  feedback: {
    mode: 'text',
    buildPrompt: ({ instructions, draft }) =>
      `You are an expert academic assessor for a support coordination training course. Review this student's assignment draft and provide constructive feedback.\n\nASSIGNMENT INSTRUCTIONS (if provided): ${str(instructions) || 'General assignment'}\n\nSTUDENT DRAFT:\n${str(draft)}\n\nProvide structured feedback:\n1. Overall Impression (1-2 sentences)\n2. Strengths (what they did well, bullet list)\n3. Areas to Improve (specific, actionable suggestions, bullet list)\n4. Structure & Clarity (brief comment)\n5. Recommended Next Steps (2-3 clear actions before submitting)`,
  },

  writer: {
    mode: 'text',
    buildPrompt: ({ topic, type = 'brainstorm', level = 'level1' }) =>
      `You are an expert academic writing assistant for a ${
        level === 'level1' ? 'Level 1 Foundation' : level === 'level2' ? 'Level 2 Professional' : 'Level 3 Advanced'
      } support coordination training course in Australia.\n\nASSIGNMENT TOPIC: ${str(topic)}\n\nTASK: ${
        WRITER_TYPE_PROMPTS[type] || WRITER_TYPE_PROMPTS.brainstorm
      }\n\nEnsure content is relevant to NDIS, disability support, and support coordination where appropriate.`,
  },

  explainer: {
    mode: 'text',
    buildPrompt: ({ concept, style = 'simple' }) =>
      `You are a patient, expert tutor for NDIS and support coordination students in Australia.\n\nCONCEPT TO EXPLAIN: ${str(concept)}\n\nSTYLE: ${
        EXPLAINER_STYLES[style] || EXPLAINER_STYLES.simple
      }\n\nStructure your response as:\n1. What It Is (clear, plain-language definition)\n2. Why It Matters (why students need to understand this)\n3. Real Example (a concrete scenario from NDIS/support coordination practice)\n4. Common Misconceptions (1-2 things people often get wrong)\n5. Remember This (one simple sentence summary)`,
  },

  recommender: {
    mode: 'text',
    // Client sends precomputed, non-sensitive aggregates.
    buildPrompt: ({ summary = [], avgScore = null, passRate = 0 }) =>
      `You are a learning advisor for SOL Training Academy (support coordination & NDIS training). Based on this student's data, recommend what they should study next.\n\nCURRENT ENROLLMENTS: ${JSON.stringify(
        summary
      )}\nQUIZ AVERAGE SCORE: ${avgScore ?? 'no attempts yet'}%\nPASS RATE: ${passRate}%\n\nRespond with:\n1. Current Learning Summary (what stage they are at)\n2. Immediate Next Steps (what to focus on this week)\n3. Recommended Study Areas (topics they should deepen)\n4. If they are struggling (based on quiz scores) — specific remediation advice\n5. Long-term Pathway Recommendation`,
  },

  flashcards: {
    mode: 'json',
    buildPrompt: ({ content, count = 10 }) =>
      `Create exactly ${str(count)} flashcards from this content. Each card should test a key concept.\n\nCONTENT:\n${str(content)}`,
    schema: {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              front: { type: 'string' },
              back: { type: 'string' },
            },
          },
        },
      },
    },
  },

  // Personalised student progress report (migrated from the old base44
  // InvokeLLM call in AIProgressReport.jsx). The frontend sends precomputed,
  // non-sensitive aggregates; the shape below MUST match the keys the component
  // renders: greeting / summary / strengths / improvements / next_step / encouragement.
  progress_report: {
    mode: 'json',
    buildPrompt: ({
      studentName = 'Student',
      enrolledCount = 0,
      completedCount = 0,
      avgProgress = 0,
      quizAttempts = 0,
      passRate = null,
      avgScore = null,
      recentAttempts = [],
      courseBreakdown = [],
    }) =>
      `You are a supportive, encouraging learning coach at SOL Training Academy. Write a warm, personalised progress report for this student.\n\nSTUDENT NAME: ${str(
        studentName
      )}\n\nLEARNING DATA:\n- Enrolled courses: ${enrolledCount}\n- Completed courses: ${completedCount}\n- Average progress: ${avgProgress}%\n- Quiz attempts: ${quizAttempts}\n- Quiz pass rate: ${
        passRate !== null ? passRate + '%' : 'No attempts yet'
      }\n- Average quiz score: ${
        avgScore !== null ? avgScore + '%' : 'No attempts yet'
      }\n- Recent quiz results: ${JSON.stringify(recentAttempts)}\n- Course breakdown: ${JSON.stringify(
        courseBreakdown
      )}\n\nWrite the report using the student's first name, in plain, motivating English.`,
    schema: {
      type: 'object',
      properties: {
        greeting: { type: 'string' },
        summary: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } },
        next_step: { type: 'string' },
        encouragement: { type: 'string' },
      },
    },
  },
};

/* ─────────────────────────── CHAT ASSISTANT ─────────────────────────── */

/**
 * System persona for the public "SOL Assistant" chat (FloatingChatWidget +
 * AIAssistant page). Stateless: the frontend sends the recent message history
 * on every turn and we forward it to Groq. Keyed as `chat_assistant` so the
 * route and the frontend helper share one identifier.
 */
export const CHAT_ASSISTANT = {
  id: 'chat_assistant',
  systemInstruction: `You are "SOL Assistant", the friendly AI helper for SOL Business Consultant Pty Ltd (an Australian firm offering NDIS provider registration, support coordination training, website development, software automation, accountancy, and marketing services).

Guidelines:
- Be warm, concise, and professional. Use plain Australian English.
- Answer questions about SOL's services, NDIS registration, training courses, and general enquiries.
- If asked something outside SOL's scope or that needs a human (pricing quotes, account-specific issues, legal/medical advice), politely say so and point them to call +61 460 003 494 or use the contact form.
- Never invent specific prices, dates, or guarantees. If unsure, say you're not certain and suggest contacting the team.
- Keep replies short (2-4 sentences) unless the user asks for detail. You may use light Markdown (bold, bullet lists).`,
};

/* ──────────────────────────── ADMIN TOOLS ──────────────────────────── */

export const ADMIN_TOOLS = {
  contentwriter: {
    mode: 'text',
    buildPrompt: ({ topicTitle, level = 'level1', duration = '30' }) =>
      `You are an expert curriculum writer for SOL Training Academy, which provides NDIS and support coordination training in Australia.\n\nWrite a complete, detailed reading module for the following topic:\n\nTOPIC: ${str(
        topicTitle
      )}\nCOURSE LEVEL: ${levelLabel(level)}\nESTIMATED READING TIME: ${str(
        duration
      )} minutes\n\nStructure the content as:\n1. Introduction (What this topic is about and why it matters)\n2. Key Concepts (detailed explanation with subheadings)\n3. Practical Application (real-world examples in NDIS/support coordination context)\n4. Case Study or Scenario (a brief relevant example)\n5. Summary & Key Takeaways (bullet points)\n6. Further Reflection Questions (2-3 thought-provoking questions)\n\nWrite in clear, professional Australian English. The content should be comprehensive enough for a ${str(
        duration
      )}-minute read.`,
  },

  outlinegenerator: {
    mode: 'json',
    buildPrompt: ({ topic, level = 'level1', numLessons = '5' }) =>
      `You are an expert curriculum designer for SOL Training Academy (NDIS & support coordination training, Australia).\n\nGenerate a comprehensive, production-ready module outline for the following:\n\nTOPIC: ${str(
        topic
      )}\nCOURSE LEVEL: ${levelLabel(level)}\nNUMBER OF LESSONS: ${str(
        numLessons
      )}\n\nFor each lesson provide:\n- A clear, engaging lesson title\n- Type (video / reading / quiz / assessment)\n- Estimated duration\n- 3–5 specific key points that students will learn (these are the core takeaways, not vague objectives)\n- A brief content description (what the lesson covers)\n- 2–3 suggested reading/resource links: real Australian NDIS-related resources, NDIS website pages, NDIS Quality and Safeguards Commission resources, or reputable academic/professional references. Include the resource title, author/source, and URL.\n\nAlso include module-level:\n- A compelling module title\n- A clear module overview description (2-3 sentences)\n- Total estimated duration\n- 3–5 overall module learning outcomes`,
    schema: {
      type: 'object',
      properties: {
        module_title: { type: 'string' },
        module_description: { type: 'string' },
        estimated_total_duration: { type: 'string' },
        learning_outcomes: { type: 'array', items: { type: 'string' } },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lesson_number: { type: 'number' },
              title: { type: 'string' },
              type: { type: 'string' },
              duration: { type: 'string' },
              description: { type: 'string' },
              key_points: { type: 'array', items: { type: 'string' } },
              reading_resources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    source: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  progressreport: {
    mode: 'text',
    // Client sends precomputed `overall` stats + `courseBreakdown`.
    buildPrompt: ({ overall = {}, courseBreakdown = [] }) =>
      `You are an educational analytics expert. Write a clear, plain-English performance report for an LMS admin based on this data.\n\nOVERALL STATS:\n- Total students: ${
        overall.uniqueStudents ?? 0
      }\n- Total enrollments: ${overall.enrollments ?? 0}\n- Completed: ${
        overall.completed ?? 0
      }\n- Average progress: ${overall.avgProgress ?? 0}%\n- Quiz attempts: ${
        overall.quizAttempts ?? 0
      }\n- Overall pass rate: ${overall.passRate ?? 0}%\n- Average quiz score: ${
        overall.avgQuizScore ?? 0
      }%\n\nPER COURSE DATA:\n${JSON.stringify(
        courseBreakdown,
        null,
        2
      )}\n\nWrite the report in sections:\n1. Executive Summary (2-3 sentences)\n2. Strengths (what's going well)\n3. Areas of Concern (what needs attention)\n4. Course-by-Course Insights\n5. Recommended Actions (3-5 concrete steps admin should take)\n\nUse plain English. Be specific about numbers. Avoid jargon.`,
  },

  performanceanalysis: {
    mode: 'text',
    buildPrompt: ({ overall = {}, atRisk = [] }) =>
      `You are a student success analyst. Based on the LMS data below, write a clear report flagging at-risk students and providing actionable recommendations.\n\nOVERALL:\n- Students: ${
        overall.uniqueStudents ?? 0
      }, Enrollments: ${overall.enrollments ?? 0}, Avg Progress: ${
        overall.avgProgress ?? 0
      }%, Quiz Pass Rate: ${overall.passRate ?? 0}%\n\nAT-RISK FLAGGED: ${
        atRisk.length
      } students\nTOP AT-RISK:\n${JSON.stringify(
        atRisk.slice(0, 8),
        null,
        2
      )}\n\nProvide:\n1. Summary of findings\n2. Key risk patterns observed\n3. Top 3 students who need immediate outreach (and why)\n4. Re-engagement email template\n5. Structural recommendations to reduce at-risk rates`,
  },

  autograder: {
    mode: 'json',
    buildPrompt: ({ submission, instructions, maxMarks = '100' }) =>
      `You are an expert assessor for a support coordination training course. Grade this student submission fairly and provide detailed feedback.\n\nASSIGNMENT INSTRUCTIONS: ${
        str(instructions) || 'General assignment — assess content quality, structure, and understanding.'
      }\nMAXIMUM MARKS: ${str(maxMarks)}\n\nSTUDENT SUBMISSION:\n${str(submission)}`,
    schema: {
      type: 'object',
      properties: {
        suggested_mark: { type: 'number' },
        percentage: { type: 'number' },
        grade: { type: 'string' },
        passed: { type: 'boolean' },
        overall_impression: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } },
        detailed_feedback: { type: 'string' },
        recommendation: { type: 'string' },
      },
    },
  },

  announcementwriter: {
    mode: 'text',
    buildPrompt: ({ brief, tone = 'friendly' }) =>
      `You are a professional communications writer for SOL Training Academy (NDIS & support coordination training, Australia). Write a polished announcement based on the brief below.\n\nBRIEF: ${str(
        brief
      )}\nTONE: ${str(
        tone
      )}\n\nWrite 3 versions:\n1. Short Version (2-3 sentences, for a banner or push notification)\n2. Standard Version (1 paragraph, for email or dashboard announcement)\n3. Detailed Version (2-3 paragraphs with context, actions required, and a friendly sign-off)\n\nMake each version feel professional, warm, and on-brand for an NDIS training academy.`,
  },

  certmessage: {
    mode: 'text',
    buildPrompt: ({ studentName, courseName, details }) =>
      `Write 3 different personalised certificate congratulations messages for a student who has completed a training course. Each message should be warm, professional, and inspiring.\n\nSTUDENT NAME: ${str(
        studentName
      )}\nCOURSE: ${str(courseName)}\nADDITIONAL DETAILS: ${
        str(details) || 'None'
      }\n\nFor each message provide:\n- Short version (1-2 sentences, for the certificate itself)\n- Medium version (3-4 sentences, for an email)\n- Formal version (1 paragraph, for official documentation)\n\nMake each feel personal and genuine, not generic.`,
  },

  ticketreply: {
    mode: 'text',
    buildPrompt: ({ ticket, category = 'general' }) =>
      `You are a helpful support team member at SOL Training Academy (NDIS & support coordination training, Australia). Draft a professional, empathetic reply to this student support ticket.\n\nTICKET CATEGORY: ${str(
        category
      )}\nSTUDENT MESSAGE:\n${str(
        ticket
      )}\n\nWrite:\n1. Draft Reply — a complete, ready-to-send email reply (warm, professional, helpful)\n2. Key Points Addressed — bullet list of issues you responded to\n3. Any Follow-up Actions Suggested — if admin needs to do anything further\n\nTone: friendly, professional, helpful. Sign off as "SOL Training Academy Support Team".`,
  },

  quizanalyser: {
    mode: 'text',
    buildPrompt: ({ stats = {} }) =>
      `You are an educational data analyst. Analyse these quiz attempt patterns and identify which areas students are struggling with.\n\nDATA:\n- Total attempts: ${
        stats.total ?? 0
      }\n- Pass rate: ${stats.passRate ?? 0}%\n- Average score: ${
        stats.avgScore ?? 0
      }%\n- Failed attempts: ${stats.failedAttempts ?? 0}\n- Average score of failed attempts: ${
        stats.failedAvg ?? 0
      }%\n- Course filter: ${
        str(stats.courseLabel) || 'All courses'
      }\n\nProvide:\n1. Overall Performance Analysis\n2. Key Problem Areas (based on pass rates and score distributions)\n3. Student Struggles — what types of students are failing (high scorers who barely pass, consistently low scorers, etc.)\n4. Recommendations for Instructors (how to improve quiz results)\n5. Content Improvement Suggestions (what course content may need clarification)\n6. Action Plan (3 concrete steps to improve pass rates)`,
  },

  quizgenerator: {
    mode: 'json',
    buildPrompt: ({ content, numQuestions = 5, difficulty = 'medium', questionType = 'mcq' }) => {
      const typeLabel = {
        mcq: 'multiple choice (4 options, 1 correct)',
        true_false: 'True/False',
        mixed: 'a mix of multiple choice and True/False',
      }[questionType] || 'multiple choice';
      return `You are an expert quiz creator for a training academy. Generate exactly ${str(numQuestions)} ${typeLabel} quiz questions at ${str(difficulty)} difficulty level based on the following content.\n\nCONTENT:\n${str(content)}\n\nRULES:\n- Each question must be clear, unambiguous, and directly based on the content\n- For MCQ: provide exactly 4 options — only one is correct\n- For True/False: correct_index must be 0 (True) or 1 (False)\n- Include a brief explanation for why the correct answer is right\n- Vary the questions across different parts of the content`;
    },
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              correct_index: { type: 'number' },
              explanation: { type: 'string' },
            },
          },
        },
      },
    },
  },

  // Draft a message to a student about a document verification decision
  // (migrated from the old base44 InvokeLLM call in AdminDocumentVerification.jsx).
  docmessage: {
    mode: 'text',
    buildPrompt: ({ studentName, docType, docTitle, fileName, notes, decision }) =>
      `You are an admin at SOL Training Academy (NDIS training provider in Australia).\nA student named "${str(
        studentName
      ) || 'the student'}" has uploaded a document:\n- Document Type: ${str(docType)}\n- Document Title: ${str(
        docTitle
      )}\n- File: ${str(fileName)}\n- Student Notes: ${str(notes) || 'None'}\n- Verification Decision: ${str(
        decision
      )}\n\nWrite a professional, warm, and clear message to send to the student about their document submission.\nThe message should:\n- Address the student by their first name\n- Clearly state the verification outcome (${str(
        decision
      )})\n- If verified: congratulate them and confirm it's on record\n- If rejected or resubmit_required: explain what's needed clearly and encourage resubmission\n- Be 3-5 sentences, professional but friendly\n- Mention next steps if applicable\n\nReturn only the message text, no subject line or greeting prefix.`,
  },

  dropout: {
    mode: 'text',
    buildPrompt: ({ riskList = [] }) =>
      `You are a student retention specialist for an online training academy. Based on this at-risk student data, provide retention recommendations.\n\nAT-RISK STUDENTS IDENTIFIED: ${
        riskList.length
      }\nCRITERIA USED: low progress, inactivity (days since last login), high quiz fail rate, expiry deadline approaching\n\nTOP AT-RISK CASES:\n${JSON.stringify(
        riskList.slice(0, 5),
        null,
        2
      )}\n\nProvide:\n1. Key Risk Patterns (what patterns do you see)\n2. Immediate Actions (what to do in next 24-48 hours)\n3. Outreach Message Template (a re-engagement email template)\n4. Structural Improvements (long-term changes to reduce dropout)\n5. Priority Order (who to contact first and why)`,
  },
};

export default { STUDENT_TOOLS, ADMIN_TOOLS, CHAT_ASSISTANT };
