import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, XCircle, RotateCcw, Trophy, Star, Clock, AlertTriangle, ChevronRight, Play, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/apiClient";

const STORAGE_KEY = (topicId, attempt) => `quiz_timer_${topicId}_${attempt}`;

export default function QuizComponent({ topic, userId, courseId, onPass, isCompleted, onNext }) {
  const questions = topic.quiz_questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedMarks, setEarnedMarks] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [timedOut, setTimedOut] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const timeLimitSecs = topic.time_limit_mins ? topic.time_limit_mins * 60 : null;
  const [secsLeft, setSecsLeft] = useState(null);
  const timerRef = useRef(null);

  const PASS_THRESHOLD = topic.passing_marks || 70;

  // ── Check quiz availability ────────────────────────────────────────────────
  const now = new Date();
  const availFrom = topic.available_from ? new Date(topic.available_from) : null;
  const availUntil = topic.available_until ? new Date(topic.available_until) : null;
  const notYetOpen = availFrom && now < availFrom;
  const expired = availUntil && now > availUntil;
  const isAvailable = !notYetOpen && !expired;

  // ── Submit logic ──────────────────────────────────────────────────────────
  const doSubmit = useCallback(async (currentAnswers, isAutoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(STORAGE_KEY(topic.id, attempt));
    let earned = 0;
    const total = questions.reduce((s, q) => s + (q.marks !== undefined ? Number(q.marks) : 1), 0);
    questions.forEach((q, i) => {
      const qMarks = q.marks !== undefined ? Number(q.marks) : 1;
      const userAns = currentAnswers[i];
      if (q.type === "multi_select") {
        const correct = new Set(q.correct_indices || []);
        const given = new Set(userAns || []);
        if (correct.size === given.size && [...correct].every(v => given.has(v))) earned += qMarks;
      } else if (q.type === "true_false") {
        if (userAns === q.correct_index) earned += qMarks;
      } else if (q.type !== "short_answer") {
        if (userAns === q.correct_index) earned += qMarks;
      }
    });
    const s = total > 0 ? Math.round((earned / total) * 100) : 0;
    setScore(s); setEarnedMarks(earned); setTotalMarks(total); setSubmitted(true);
    if (isAutoSubmit) setTimedOut(true);
    await apiClient.post('/quizzes/attempts', {
      user_id: userId, course_id: courseId, topic_id: topic._id || topic.id,
      answers: currentAnswers, score: s, total_questions: questions.length,
      passed: s >= PASS_THRESHOLD, attempt_number: attempt,
      timed_out: isAutoSubmit,
    });
    if (s >= PASS_THRESHOLD) onPass?.();
  }, [questions, userId, courseId, topic.id, attempt, PASS_THRESHOLD, onPass]);

  // ── Timer: start only after student clicks Start ──────────────────────────
  useEffect(() => {
    if (!quizStarted || !timeLimitSecs || submitted) return;

    // Restore remaining time from localStorage (survives refresh)
    const stored = localStorage.getItem(STORAGE_KEY(topic.id, attempt));
    const remaining = stored ? parseInt(stored, 10) : timeLimitSecs;
    setSecsLeft(remaining);

    timerRef.current = setInterval(() => {
      setSecsLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          localStorage.removeItem(STORAGE_KEY(topic.id, attempt));
          setAnswers(latestAnswers => {
            doSubmit(latestAnswers, true);
            return latestAnswers;
          });
          return 0;
        }
        localStorage.setItem(STORAGE_KEY(topic.id, attempt), String(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizStarted, attempt]);

  const calcTotalMarks = () => questions.reduce((s, q) => s + (q.marks !== undefined ? Number(q.marks) : 1), 0);

  const handleAnswer = (qIdx, value) => {
    if (!quizStarted || submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
  };

  const handleMultiToggle = (qIdx, optIdx) => {
    if (!quizStarted || submitted) return;
    setAnswers(prev => {
      const current = prev[qIdx] || [];
      const updated = current.includes(optIdx) ? current.filter(i => i !== optIdx) : [...current, optIdx];
      return { ...prev, [qIdx]: updated };
    });
  };

  const isAnswered = (qIdx) => {
    const q = questions[qIdx];
    const ans = answers[qIdx];
    if (q?.type === "multi_select") return Array.isArray(ans) && ans.length > 0;
    if (q?.type === "short_answer") return typeof ans === "string" && ans.trim().length > 0;
    return ans !== undefined;
  };

  const answeredCount = questions.filter((_, i) => isAnswered(i)).length;
  const handleSubmit = () => doSubmit(answers, false);

  const handleRetry = () => {
    localStorage.removeItem(STORAGE_KEY(topic.id, attempt));
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setEarnedMarks(0);
    setTotalMarks(0);
    setTimedOut(false);
    setSecsLeft(null);
    setQuizStarted(false);
    setAttempt(a => a + 1);
  };

  const passed = score >= PASS_THRESHOLD;

  const isQuestionCorrect = (q, i) => {
    const userAns = answers[i];
    if (q.type === "multi_select") {
      const correct = new Set(q.correct_indices || []);
      const given = new Set(userAns || []);
      return correct.size === given.size && [...correct].every(v => given.has(v));
    }
    if (q.type === "short_answer") return null;
    return userAns === q.correct_index;
  };

  const grandTotal = calcTotalMarks();

  // Timer display
  const timerMins = secsLeft !== null ? Math.floor(secsLeft / 60) : null;
  const timerSecs = secsLeft !== null ? secsLeft % 60 : null;
  const timerWarning = secsLeft !== null && secsLeft <= 60 && !submitted;
  const timerDanger = secsLeft !== null && secsLeft <= 30 && !submitted;
  const timerDisplay = secsLeft !== null
    ? `${String(timerMins).padStart(2, "0")}:${String(timerSecs).padStart(2, "0")}`
    : null;

  // ── Already completed ──────────────────────────────────────────────────────
  if (isCompleted && !submitted) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-16 h-16 text-harvest mx-auto mb-4" />
        <h3 className="text-white font-display font-bold text-2xl mb-2">Quiz Passed!</h3>
        <p className="text-white/60">You have already completed this quiz.</p>
        {onNext && (
          <Button onClick={onNext} className="mt-6 gap-2 bg-harvest hover:bg-harvest/90 text-white px-8">
            <ChevronRight className="w-4 h-4" /> Continue to Next Topic
          </Button>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl p-8 text-center text-white/40">
        <p>No quiz questions have been added yet.</p>
        {!isCompleted && (
          <Button onClick={onPass} className="mt-4 bg-harvest text-white">Mark Complete Anyway</Button>
        )}
      </div>
    );
  }

  // ── Availability gate ──────────────────────────────────────────────────────
  if (!isAvailable) {
    return (
      <div className="bg-white/5 rounded-2xl p-10 text-center">
        <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
        {notYetOpen && (
          <>
            <h3 className="text-white font-display font-bold text-xl mb-2">Quiz Not Yet Open</h3>
            <p className="text-white/50 text-sm">
              This quiz opens on {availFrom.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </>
        )}
        {expired && (
          <>
            <h3 className="text-white font-display font-bold text-xl mb-2">Quiz Closed</h3>
            <p className="text-white/50 text-sm">
              This quiz closed on {availUntil.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </>
        )}
      </div>
    );
  }

  // ── Start Quiz screen ──────────────────────────────────────────────────────
  if (!quizStarted && !submitted) {
    return (
      <div className="bg-white/5 rounded-2xl p-10 text-center space-y-6">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-harvest/20 flex items-center justify-center mx-auto mb-4">
            <HelpCircleIcon className="w-8 h-8 text-harvest" />
          </div>
          <h2 className="text-white font-display font-bold text-2xl mb-2">{topic.title}</h2>
          <p className="text-white/50 text-sm">Read the details carefully before starting.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {[
            { label: "Questions", value: questions.length },
            { label: "Total Marks", value: grandTotal },
            { label: "Pass Mark", value: `${PASS_THRESHOLD}%` },
            { label: "Time Limit", value: topic.time_limit_mins ? `${topic.time_limit_mins} min` : "No limit" },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white font-display font-bold text-lg leading-tight">{item.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {availUntil && (
          <div className="flex items-center justify-center gap-2 text-amber-300 text-sm">
            <Clock className="w-4 h-4" />
            Closes: {availUntil.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        {timeLimitSecs && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl px-5 py-3 max-w-sm mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm font-medium">
                Timer starts when you click "Start Quiz" and cannot be paused.
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={() => setQuizStarted(true)}
          className="gap-2 bg-harvest hover:bg-harvest/90 text-white px-10 py-6 text-base font-display font-semibold">
          <Play className="w-5 h-5" /> Start Quiz
        </Button>
      </div>
    );
  }

  // ── Active Quiz ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-white font-display font-bold text-xl">{topic.title}</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {questions.length} question{questions.length !== 1 ? "s" : ""} · {grandTotal} total marks · {PASS_THRESHOLD}% to pass
            {topic.time_limit_mins ? ` · ${topic.time_limit_mins} min limit` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Countdown Timer */}
          {timerDisplay && !submitted && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm border transition-all ${
              timerDanger
                ? "bg-red-600/30 border-red-400/60 text-red-300 animate-pulse"
                : timerWarning
                ? "bg-red-500/20 border-red-400/50 text-red-300"
                : "bg-white/10 border-white/20 text-white"
            }`}>
              <Clock className="w-4 h-4 flex-shrink-0" />
              {timerDisplay}
            </div>
          )}
          {submitted && (
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {earnedMarks}/{grandTotal} marks · {score}% — {passed ? "Passed ✓" : "Try Again"}
            </span>
          )}
        </div>
      </div>

      {/* Timed Out Banner */}
      {timedOut && (
        <div className="flex items-center gap-3 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 font-medium">Time's up! Your quiz was automatically submitted.</p>
        </div>
      )}

      {/* Progress bar (during quiz) */}
      {!submitted && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-1.5 bg-harvest rounded-full transition-all"
              style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }} />
          </div>
          <span className="text-white/40 text-xs flex-shrink-0">{answeredCount}/{questions.length} answered</span>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const userAns = answers[qIdx];
          const correctResult = submitted ? isQuestionCorrect(q, qIdx) : null;
          const qMarks = q.marks !== undefined ? Number(q.marks) : 1;

          return (
            <div key={qIdx} className="bg-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-white font-medium flex-1">
                  <span className="text-white/40 mr-2">{qIdx + 1}.</span>
                  {q.question}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-harvest" />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    submitted
                      ? correctResult === true ? "text-green-400 bg-green-400/20"
                        : correctResult === false ? "text-red-400 bg-red-400/20"
                        : "text-white/50 bg-white/10"
                      : "text-harvest bg-harvest/20"
                  }`}>
                    {submitted && correctResult === true ? `+${qMarks}` : submitted && correctResult === false ? "0" : `${qMarks}`} mark{qMarks !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* True/False */}
              {q.type === "true_false" && (
                <div className="flex gap-3">
                  {["True", "False"].map((opt, oIdx) => {
                    let cls = "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white cursor-pointer";
                    if (!submitted && userAns === oIdx) cls = "border border-harvest bg-harvest/20 text-white";
                    if (submitted) {
                      if (oIdx === q.correct_index) cls = "border border-green-400 bg-green-400/10 text-green-300";
                      else if (userAns === oIdx) cls = "border border-red-400 bg-red-400/10 text-red-300";
                      else cls = "border border-white/5 text-white/30";
                    }
                    return (
                      <div key={oIdx} onClick={() => handleAnswer(qIdx, oIdx)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm text-center font-medium transition-all ${cls}`}>
                        {opt}
                        {submitted && oIdx === q.correct_index && <CheckCircle className="w-4 h-4 text-green-400 inline ml-2" />}
                        {submitted && userAns === oIdx && oIdx !== q.correct_index && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MCQ */}
              {(!q.type || q.type === "mcq") && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oIdx) => {
                    let cls = "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white cursor-pointer";
                    if (!submitted && userAns === oIdx) cls = "border border-harvest bg-harvest/20 text-white";
                    if (submitted) {
                      if (oIdx === q.correct_index) cls = "border border-green-400 bg-green-400/10 text-green-300";
                      else if (userAns === oIdx) cls = "border border-red-400 bg-red-400/10 text-red-300";
                      else cls = "border border-white/5 text-white/30";
                    }
                    return (
                      <div key={oIdx} onClick={() => handleAnswer(qIdx, oIdx)}
                        className={`rounded-xl px-4 py-3 text-sm transition-all ${cls}`}>
                        <span className="text-white/30 mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                        {submitted && oIdx === q.correct_index && <CheckCircle className="w-4 h-4 text-green-400 inline ml-2" />}
                        {submitted && userAns === oIdx && oIdx !== q.correct_index && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Multi-select */}
              {q.type === "multi_select" && (
                <div className="space-y-2">
                  <p className="text-white/40 text-xs mb-2">Select all correct answers</p>
                  {(q.options || []).map((opt, oIdx) => {
                    const selected = (userAns || []).includes(oIdx);
                    const isCorrectOpt = (q.correct_indices || []).includes(oIdx);
                    let cls = "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white cursor-pointer";
                    if (!submitted && selected) cls = "border border-harvest bg-harvest/20 text-white";
                    if (submitted) {
                      if (isCorrectOpt) cls = "border border-green-400 bg-green-400/10 text-green-300";
                      else if (selected) cls = "border border-red-400 bg-red-400/10 text-red-300";
                      else cls = "border border-white/5 text-white/30";
                    }
                    return (
                      <div key={oIdx} onClick={() => handleMultiToggle(qIdx, oIdx)}
                        className={`rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2 ${cls}`}>
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selected && !submitted ? "border-harvest bg-harvest" : "border-current"
                        }`}>
                          {selected && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <span className="text-white/30 mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                        {submitted && isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                        {submitted && selected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {q.type === "short_answer" && (
                <div>
                  <textarea
                    disabled={submitted}
                    value={answers[qIdx] || ""}
                    onChange={e => handleAnswer(qIdx, e.target.value)}
                    placeholder="Type your answer here…"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-harvest/60 disabled:opacity-50"
                  />
                  {submitted && q.model_answer && (
                    <div className="mt-2 bg-blue-500/10 border border-blue-400/30 rounded-xl px-4 py-3">
                      <p className="text-xs text-blue-300 font-semibold mb-1">Model Answer:</p>
                      <p className="text-sm text-white/70">{q.model_answer}</p>
                      <p className="text-xs text-white/40 mt-2">Short answers are reviewed by your instructor.</p>
                    </div>
                  )}
                </div>
              )}

              {submitted && q.explanation && (
                <p className="text-xs text-white/40 mt-3 pl-1">💡 {q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Result */}
      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={answeredCount < questions.filter(q => q.type !== "short_answer").length}
          className="w-full bg-harvest hover:bg-harvest/90 text-white py-5 font-display">
          Submit Quiz ({answeredCount}/{questions.length} answered)
        </Button>
      ) : (
        <div className={`rounded-2xl p-6 ${passed ? "bg-green-500/10 border border-green-400/30" : "bg-red-500/10 border border-red-400/30"}`}>
          <div className="text-center mb-4">
            {passed ? (
              <Trophy className="w-10 h-10 text-green-400 mx-auto mb-2" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            )}
            <p className={`font-display font-bold text-2xl ${passed ? "text-green-400" : "text-red-400"}`}>
              {passed ? "Passed! 🎉" : `Not quite — ${score}%`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Your Score</p>
              <p className="text-white font-display font-bold text-xl">{earnedMarks}<span className="text-white/40 text-sm">/{grandTotal}</span></p>
              <p className="text-white/40 text-xs">marks</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Percentage</p>
              <p className={`font-display font-bold text-xl ${passed ? "text-green-400" : "text-red-400"}`}>{score}%</p>
              <p className="text-white/40 text-xs">achieved</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Required</p>
              <p className="text-white font-display font-bold text-xl">{PASS_THRESHOLD}%</p>
              <p className="text-white/40 text-xs">to pass</p>
            </div>
          </div>

          {passed ? (
            <div className="text-center mt-2">
              <Button onClick={onNext || onPass} className="gap-2 bg-harvest hover:bg-harvest/90 text-white px-8">
                <ChevronRight className="w-4 h-4" /> Continue to Next Topic
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white/60 text-sm mb-4">
                You need {PASS_THRESHOLD}% to pass. Review the answers above and try again.
              </p>
              <Button onClick={handleRetry} variant="outline" className="gap-2 text-white border-white/20 hover:bg-white/10">
                <RotateCcw className="w-4 h-4" /> Retry Quiz
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// local icon alias to avoid extra import issues
function HelpCircleIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}