import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, XCircle, RotateCcw, Trophy, Star, Clock, AlertTriangle, ChevronRight, Play, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/apiClient";

const STORAGE_KEY = (topicId, attempt) => `quiz_timer_${topicId}_${attempt}`;

const questionMarks = (question) => {
  const marks = Number(question?.marks ?? 1);
  return Number.isFinite(marks) ? marks : 1;
};

const normalizePassingMarks = (passingMarks, totalMarks) => {
  const n = Number(passingMarks);
  if (!Number.isFinite(n) || n <= 0) return Math.ceil(totalMarks * 0.7);
  if (totalMarks > 0 && n > totalMarks && n <= 100) return Math.ceil((n / 100) * totalMarks);
  return n;
};

const getTopicId = (topic) => topic?._id || topic?.id;

export default function QuizComponent({ topic, userId, courseId, onPass, isCompleted, onNext }) {
  const questions = topic.quiz_questions || [];
  const topicId = getTopicId(topic);
  const grandTotal = questions.reduce((sum, q) => sum + questionMarks(q), 0);
  const passingMarks = normalizePassingMarks(topic.passing_marks, grandTotal);
  const passingPercent = grandTotal > 0 ? Math.round((passingMarks / grandTotal) * 100) : 0;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedMarks, setEarnedMarks] = useState(0);
  const [totalMarks, setTotalMarks] = useState(grandTotal);
  const [serverPassed, setServerPassed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [attempt, setAttempt] = useState(1);
  const [timedOut, setTimedOut] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const timeLimitSecs = topic.time_limit_mins ? topic.time_limit_mins * 60 : null;
  const [secsLeft, setSecsLeft] = useState(null);
  const timerRef = useRef(null);

  const now = new Date();
  const availFrom = topic.available_from ? new Date(topic.available_from) : null;
  const availUntil = topic.available_until ? new Date(topic.available_until) : null;
  const notYetOpen = availFrom && now < availFrom;
  const expired = availUntil && now > availUntil;
  const isAvailable = !notYetOpen && !expired;

  const doSubmit = useCallback(async (currentAnswers, isAutoSubmit = false) => {
    if (submitting || submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(STORAGE_KEY(topicId, attempt));
    setSubmitting(true);
    setSubmitError("");
    if (isAutoSubmit) setTimedOut(true);

    try {
      const res = await apiClient.post('/quizzes/attempts', {
        course_id: courseId,
        topic_id: topicId,
        answers: currentAnswers,
        timed_out: isAutoSubmit,
      });

      const result = res.data?.data || {};
      const resultScore = Number(result.score || 0);
      const resultTotal = Number(result.total_marks || grandTotal || 0);
      const resultPercent = resultTotal > 0 ? Math.round((resultScore / resultTotal) * 100) : 0;

      setEarnedMarks(resultScore);
      setTotalMarks(resultTotal);
      setScore(resultPercent);
      setServerPassed(Boolean(result.passed));
      setSubmitted(true);

      if (result.passed) onPass?.(result);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Quiz submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitted, topicId, attempt, courseId, grandTotal, onPass]);

  useEffect(() => {
    if (!quizStarted || !timeLimitSecs || submitted) return undefined;

    const stored = localStorage.getItem(STORAGE_KEY(topicId, attempt));
    const remaining = stored ? parseInt(stored, 10) : timeLimitSecs;
    setSecsLeft(remaining);

    timerRef.current = setInterval(() => {
      setSecsLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          localStorage.removeItem(STORAGE_KEY(topicId, attempt));
          setAnswers(latestAnswers => {
            void doSubmit(latestAnswers, true);
            return latestAnswers;
          });
          return 0;
        }
        localStorage.setItem(STORAGE_KEY(topicId, attempt), String(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizStarted, timeLimitSecs, submitted, topicId, attempt, doSubmit]);

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
  const passed = submitted ? serverPassed : isCompleted;

  const handleRetry = () => {
    localStorage.removeItem(STORAGE_KEY(topicId, attempt));
    setAnswers({});
    setSubmitted(false);
    setSubmitting(false);
    setScore(0);
    setEarnedMarks(0);
    setTotalMarks(grandTotal);
    setServerPassed(false);
    setSubmitError("");
    setTimedOut(false);
    setSecsLeft(null);
    setQuizStarted(false);
    setAttempt(a => a + 1);
  };

  const timerMins = secsLeft !== null ? Math.floor(secsLeft / 60) : null;
  const timerSecs = secsLeft !== null ? secsLeft % 60 : null;
  const timerWarning = secsLeft !== null && secsLeft <= 60 && !submitted;
  const timerDanger = secsLeft !== null && secsLeft <= 30 && !submitted;
  const timerDisplay = secsLeft !== null
    ? `${String(timerMins).padStart(2, "0")}:${String(timerSecs).padStart(2, "0")}`
    : null;

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
            { label: "Pass Mark", value: `${passingMarks}/${grandTotal}` },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-white font-display font-bold text-xl">{topic.title}</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {questions.length} question{questions.length !== 1 ? "s" : ""} / {grandTotal} total marks / {passingMarks} marks to pass ({passingPercent}%)
            {topic.time_limit_mins ? ` / ${topic.time_limit_mins} min limit` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              {earnedMarks}/{totalMarks} marks / {score}% / {passed ? "Passed" : "Try Again"}
            </span>
          )}
        </div>
      </div>

      {timedOut && (
        <div className="flex items-center gap-3 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 font-medium">Time is up. Your quiz was automatically submitted.</p>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 font-medium">{submitError}</p>
        </div>
      )}

      {!submitted && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-1.5 bg-harvest rounded-full transition-all"
              style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }} />
          </div>
          <span className="text-white/40 text-xs flex-shrink-0">{answeredCount}/{questions.length} answered</span>
        </div>
      )}

      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const userAns = answers[qIdx];
          const qMarks = questionMarks(q);

          return (
            <div key={qIdx} className="bg-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-white font-medium flex-1">
                  <span className="text-white/40 mr-2">{qIdx + 1}.</span>
                  {q.question}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-harvest" />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-harvest bg-harvest/20">
                    {qMarks} mark{qMarks !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {q.type === "true_false" && (
                <div className="flex gap-3">
                  {["True", "False"].map((opt, oIdx) => {
                    const selected = userAns === oIdx;
                    const cls = selected ? "border border-harvest bg-harvest/20 text-white" : "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white";
                    return (
                      <div key={opt} onClick={() => handleAnswer(qIdx, oIdx)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm text-center font-medium transition-all ${submitted ? "cursor-default" : "cursor-pointer"} ${cls}`}>
                        {opt}
                        {submitted && selected && <CheckCircle className="w-4 h-4 text-harvest inline ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {(!q.type || q.type === "mcq") && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oIdx) => {
                    const selected = userAns === oIdx;
                    const cls = selected ? "border border-harvest bg-harvest/20 text-white" : "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white";
                    return (
                      <div key={oIdx} onClick={() => handleAnswer(qIdx, oIdx)}
                        className={`rounded-xl px-4 py-3 text-sm transition-all ${submitted ? "cursor-default" : "cursor-pointer"} ${cls}`}>
                        <span className="text-white/30 mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                        {submitted && selected && <CheckCircle className="w-4 h-4 text-harvest inline ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "multi_select" && (
                <div className="space-y-2">
                  <p className="text-white/40 text-xs mb-2">Select all correct answers</p>
                  {(q.options || []).map((opt, oIdx) => {
                    const selected = (userAns || []).includes(oIdx);
                    const cls = selected ? "border border-harvest bg-harvest/20 text-white" : "border border-white/10 text-white/70 hover:border-harvest/60 hover:text-white";
                    return (
                      <div key={oIdx} onClick={() => handleMultiToggle(qIdx, oIdx)}
                        className={`rounded-xl px-4 py-3 text-sm transition-all flex items-center gap-2 ${submitted ? "cursor-default" : "cursor-pointer"} ${cls}`}>
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selected ? "border-harvest bg-harvest" : "border-current"
                        }`}>
                          {selected && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <span className="text-white/30 mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "short_answer" && (
                <textarea
                  disabled={submitted}
                  value={answers[qIdx] || ""}
                  onChange={e => handleAnswer(qIdx, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-harvest/60 disabled:opacity-50"
                />
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <Button
          onClick={() => doSubmit(answers, false)}
          disabled={submitting || answeredCount < questions.length}
          className="w-full bg-harvest hover:bg-harvest/90 text-white py-5 font-display disabled:opacity-50">
          {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${questions.length} answered)`}
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
              {passed ? "Passed!" : `Not quite - ${score}%`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Your Score</p>
              <p className="text-white font-display font-bold text-xl">{earnedMarks}<span className="text-white/40 text-sm">/{totalMarks}</span></p>
              <p className="text-white/40 text-xs">marks</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Percentage</p>
              <p className={`font-display font-bold text-xl ${passed ? "text-green-400" : "text-red-400"}`}>{score}%</p>
              <p className="text-white/40 text-xs">achieved</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Required</p>
              <p className="text-white font-display font-bold text-xl">{passingMarks}<span className="text-white/40 text-sm">/{grandTotal}</span></p>
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
                You need {passingMarks}/{grandTotal} marks to pass. Review the material and try again.
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

function HelpCircleIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
