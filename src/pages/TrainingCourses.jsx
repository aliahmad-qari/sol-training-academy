import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CourseHero from "@/components/training/CourseHero";
import CourseLevelTabs from "@/components/training/CourseLevelTabs";
import CourseLevelContent from "@/components/training/CourseLevelContent";
import LMSFeatures from "@/components/training/LMSFeatures";
import BundleCTA from "@/components/training/BundleCTA";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import EnrollButton from "@/components/lms/EnrollButton";

export const LEVELS = [
  {
    id: "level1",
    level: "Level 1",
    badge: "Foundation",
    color: "blue",
    price: 199,
    title: "NDIS Support Coordinator Training — Level 1",
    subtitle: "Foundation",
    duration: "4–6 hours",
    totalTopics: 45,
    description:
      "Learn the fundamentals of Support Coordination, NDIS principles, participant engagement, and understanding NDIS plans and supports.",
    outcomes: [
      "Understand the NDIS history, structure and governance",
      "Identify the role and responsibilities of a Support Coordinator",
      "Navigate and interpret NDIS plans and budget categories",
      "Apply person-centered practice principles in daily support",
      "Support participant choice, control and dignity of risk",
      "Uphold human rights and NDIS Code of Conduct",
      "Manage privacy, confidentiality and duty of care",
      "Use person-centered planning tools (PATH, MAPs, One-Page Profiles)",
    ],
    curriculum: [
      {
        title: "Module 1: Introduction to the NDIS",
        topics: [
          "History and Purpose of the NDIS",
          "Purpose and Aims of the NDIS",
          "Core Principles and Values of the NDIS",
          "NDIS Structure and Governance",
          "NDIS Participant Pathway",
          "NDIS Support Budget Categories",
          "Real-World Scenario — Sarah's NDIS Journey",
          "Real-World Scenario — Amir's Early Intervention",
          "Real-World Scenario — Robert's Plan Management",
          "Practical Exercise — NDIS Principles in Action",
          "Knowledge Assessment — Introduction to the NDIS",
          "Role-Play — Explaining the NDIS to a Participant",
          "Self-Reflection — Introduction to the NDIS",
          "Reference Materials — Introduction to the NDIS",
        ],
      },
      {
        title: "Module 2: Person-Centered Support Principles",
        topics: [
          "Understanding Person-Centered Practice",
          "Core Elements of Person-Centered Practice",
          "Supporting Choice and Control",
          "The Support Worker's Role in Choice and Control",
          "Dignity of Risk and Informed Decision-Making",
          "Principles of Dignity of Risk",
          "Informed Decision-Making Process",
          "Person-Centered Planning Tools",
          "Benefits of Person-Centered Practice",
          "Components of a Person-Centered Plan",
          "Positive Risk-Taking Framework",
          "Real-World Scenario — Michael's Morning Routine",
          "Real-World Scenario — Leila's Housing Decision",
          "Real-World Scenario — Sam's Communication Support",
          "Practical Exercise — Person-Centered Planning",
          "Knowledge Assessment — Person-Centered Practice",
          "Role-Play — Supporting Choice in Everyday Activities",
          "Role-Play — Navigating Dignity of Risk with Jamila",
          "Self-Reflection — Person-Centered Practice",
          "Reference Materials — Person-Centered Practice",
        ],
      },
      {
        title: "Module 3: Rights and Responsibilities",
        topics: [
          "Human Rights Framework — UNCRPD Foundation",
          "NDIS Code of Conduct and Application",
          "Individual Autonomy as a Human Right",
          "Privacy and Confidentiality Requirements",
          "Duty of Care Principles",
          "Balancing Rights and Duty of Care",
          "Practical Exercise — Rights and Responsibilities",
          "Knowledge Assessment — Rights and Responsibilities",
          "Role-Play — Rights-Based Decision Making",
          "Self-Reflection — Rights and Responsibilities",
          "Reference Materials — Rights and Responsibilities",
        ],
      },
    ],
    enrollUrl: "/services/support-coordination-training#training-pricing",
  },
  {
    id: "level2",
    level: "Level 2",
    badge: "Professional",
    color: "amber",
    price: 399,
    title: "NDIS Support Coordinator Training — Level 2",
    subtitle: "Professional",
    duration: "8–10 hours",
    totalTopics: 125,
    description:
      "Develop practical skills in service coordination, provider engagement, participant goal planning, documentation, and case management.",
    outcomes: [
      "Apply advanced person-centered practice frameworks",
      "Facilitate complex planning meetings with multiple stakeholders",
      "Coordinate services across multiple providers",
      "Develop and review participant goal plans",
      "Manage documentation and compliance requirements",
      "Support participants through plan reviews",
      "Apply risk management and safeguarding strategies",
      "Navigate complex funding and service arrangements",
    ],
    curriculum: [
      {
        title: "Module 1: Advanced Person-Centered Practice",
        topics: [
          "Theoretical Foundations of Advanced PCP",
          "From Service-Led to Person-Led Practice",
          "Best Practice Frameworks in PCP",
          "Facilitating Complex PCP Meetings",
          "Using AAC Systems and Visual Supports",
          "Documenting the Facilitation Process",
          "Knowledge Assessment — Advanced PCP",
        ],
      },
      {
        title: "Module 2: Provider Engagement & Management",
        topics: [
          "Sourcing and Vetting Service Providers",
          "Negotiating Service Agreements",
          "Managing Provider Relationships",
          "Addressing Service Quality Issues",
          "Knowledge Assessment — Provider Engagement",
        ],
      },
      {
        title: "Module 3: Goal Planning in Practice",
        topics: [
          "Identifying Participant Goals and Aspirations",
          "Translating Goals into Funded Supports",
          "Co-designing Action Plans",
          "Reviewing Progress Against Goals",
          "Knowledge Assessment — Goal Planning",
        ],
      },
      {
        title: "Module 4: Documentation & Reporting",
        topics: [
          "NDIS Documentation Requirements",
          "Writing Support Coordination Notes",
          "Incident Reporting Obligations",
          "Progress Reports for NDIA",
          "Knowledge Assessment — Documentation",
        ],
      },
      {
        title: "Module 5: Case Management Strategies",
        topics: [
          "Case Management Principles in NDIS",
          "Managing Complex Participant Situations",
          "Coordinating Crisis Responses",
          "Escalation Pathways and Referrals",
          "Knowledge Assessment — Case Management",
        ],
      },
      {
        title: "Module 6: Plan Review Preparation",
        topics: [
          "Understanding Plan Review Triggers",
          "Preparing Evidence for Plan Reviews",
          "Supporting Participants in Review Meetings",
          "Advocating for Adequate Funding",
          "Knowledge Assessment — Plan Review",
        ],
      },
      {
        title: "Module 7: Risk & Safeguarding",
        topics: [
          "Risk Assessment Frameworks",
          "Identifying and Responding to Abuse",
          "Restrictive Practices — Obligations and Reporting",
          "Knowledge Assessment — Risk & Safeguarding",
        ],
      },
      {
        title: "Module 8: Assessment & Certificate",
        topics: [
          "Level 2 Comprehensive Assessment",
          "Certificate of Completion",
        ],
      },
    ],
    enrollUrl: "/services/support-coordination-training#training-pricing",
    popular: true,
  },
  {
    id: "level3",
    level: "Level 3",
    badge: "Advanced",
    color: "purple",
    price: 699,
    title: "NDIS Support Coordinator Training — Level 3",
    subtitle: "Advanced",
    duration: "12–15 hours",
    totalTopics: 66,
    description:
      "Master complex support coordination, compliance requirements, crisis management, reporting, leadership skills, and advanced participant support strategies.",
    outcomes: [
      "Manage complex and high-risk participant situations",
      "Lead a support coordination team effectively",
      "Ensure full NDIS compliance and audit readiness",
      "Apply the Four Principles ethical framework",
      "Handle crisis interventions and escalations",
      "Produce high-quality reports for NDIA and providers",
      "Mentor junior Support Coordinators",
      "Navigate Specialist Support Coordination pathways",
    ],
    curriculum: [
      {
        title: "Module 1: Introduction to Level 3 NDIS Support",
        topics: [
          "Level 3 Role and Responsibilities",
          "Level Differentiation — Level 1, 2 and 3 Compared",
          "Advanced NDIS Practice Standards",
          "Ethical Frameworks — The Four Principles Approach",
          "Applying Autonomy, Beneficence, Non-Maleficence and Justice",
          "Complex Decision-Making at Level 3",
          "Knowledge Assessment — Level 3 Introduction",
        ],
      },
      {
        title: "Module 2: Complex Participant Situations",
        topics: [
          "Identifying and Managing Complex Needs",
          "Multiple Disability and Comorbidity",
          "Behavioural Support in Complex Cases",
          "Family Dynamics and Conflict Resolution",
          "Knowledge Assessment — Complex Situations",
        ],
      },
      {
        title: "Module 3: NDIS Compliance & Audit Readiness",
        topics: [
          "NDIS Quality and Safeguards Framework",
          "Preparing for NDIS Audits",
          "Continuous Improvement Systems",
          "Knowledge Assessment — Compliance",
        ],
      },
      {
        title: "Module 4: Crisis Management & Intervention",
        topics: [
          "Crisis Identification and Early Intervention",
          "De-escalation Strategies",
          "Post-Crisis Review and Reporting",
          "Knowledge Assessment — Crisis Management",
        ],
      },
      {
        title: "Module 5: Leadership in Support Coordination",
        topics: [
          "Leadership Styles in Support Teams",
          "Coaching and Mentoring Junior Staff",
          "Running Effective Team Meetings",
          "Knowledge Assessment — Leadership",
        ],
      },
      {
        title: "Module 6: Advanced Reporting & Documentation",
        topics: [
          "Complex Incident Investigation Reports",
          "Specialist Support Coordination Reports",
          "Quality Evidence for Plan Reviews",
          "Knowledge Assessment — Advanced Reporting",
        ],
      },
      {
        title: "Module 7: Specialist Support Coordination",
        topics: [
          "What is Specialist Support Coordination?",
          "Eligibility and Funding Criteria",
          "Transitioning to Specialist Roles",
          "Knowledge Assessment — Specialist SC",
        ],
      },
      {
        title: "Module 8: Capstone Assessment & Certificate",
        topics: [
          "Level 3 Comprehensive Capstone Assessment",
          "Certificate of Advanced Completion",
        ],
      },
    ],
    enrollUrl: "/services/support-coordination-training#training-pricing",
  },
];

export default function TrainingCourses() {
  const [activeLevel, setActiveLevel] = useState("level1");
  const activeData = LEVELS.find((l) => l.id === activeLevel);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CourseHero />
      <CourseLevelTabs activeLevel={activeLevel} setActiveLevel={setActiveLevel} levels={LEVELS} />
      <CourseLevelContent course={activeData} enrollButton={<EnrollButton level={activeData} />} />
      <LMSFeatures />
      <BundleCTA />
      <Footer />
      <FloatingChatWidget />
    </div>
  );
}