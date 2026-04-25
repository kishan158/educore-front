import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuiz, useStartAttempt, useSubmitAttempt, useMyAttempts } from '../../hooks/useQuiz'
import type { QuizAttempt, QuizQuestion } from '../../types/quiz.types'

// ─── Timer Component ──────────────────────────────────────────────
function QuizTimer({ timeLimit, onTimeUp }: { timeLimit: number; onTimeUp: () => void }) {
  const [seconds, setSeconds] = useState(timeLimit * 60)

  useEffect(() => {
    if (timeLimit === 0) return
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(t); onTimeUp(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [timeLimit, onTimeUp])

  if (timeLimit === 0) return null

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const pct = ((timeLimit * 60 - seconds) / (timeLimit * 60)) * 100

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${
      seconds < 60 ? 'bg-red-100 text-red-600' :
      seconds < 300 ? 'bg-amber-100 text-amber-700' :
      'bg-blue-50 text-blue-700'
    }`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {m}:{s.toString().padStart(2, '0')}
    </div>
  )
}

// ─── Question Card ────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  answer,
  onChange,
}: {
  question:  QuizQuestion
  index:     number
  total:     number
  answer:    string | string[] | undefined
  onChange:  (val: string | string[]) => void
}) {
  const selectedArr = Array.isArray(answer) ? answer : (answer ? [answer] : [])

  const toggleMcq = (opt: string) => {
    if (selectedArr.includes(opt)) {
      onChange(selectedArr.filter((o) => o !== opt))
    } else {
      onChange([...selectedArr, opt])
    }
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-gray-200 rounded-2xl p-6"
    >
      {/* Question header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Question {index + 1} of {total}
          </span>
          <p className="text-base font-semibold text-gray-900 mt-1 leading-relaxed">
            {question.question}
          </p>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </span>
      </div>

      {/* MCQ Options */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            const selected = selectedArr.includes(opt)
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMcq(opt)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-xl text-left text-sm transition-all ${
                  selected
                    ? 'border-accent bg-accent/5 text-accent font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? 'border-accent bg-accent' : 'border-gray-300'
                }`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {opt}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="grid grid-cols-2 gap-3">
          {['true', 'false'].map((val) => {
            const selected = selectedArr[0] === val
            return (
              <motion.button
                key={val}
                whileTap={{ scale: 0.96 }}
                onClick={() => onChange(val)}
                className={`py-4 border-2 rounded-xl font-semibold text-sm capitalize transition-all ${
                  selected
                    ? val === 'true'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {val === 'true' ? 'True' : 'False'}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Short Answer */}
      {question.type === 'short_answer' && (
        <textarea
          value={selectedArr[0] ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Type your answer here..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
        />
      )}
    </motion.div>
  )
}

// ─── Results Screen ───────────────────────────────────────────────
function QuizResults({ attempt, quiz, onRetake, onBack }: {
  attempt: QuizAttempt
  quiz:    any
  onRetake: () => void
  onBack:   () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto"
    >
      {/* Result card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${
            attempt.passed ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {attempt.passed ? (
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className={`text-2xl font-bold mb-1 ${attempt.passed ? 'text-green-700' : 'text-red-600'}`}>
            {attempt.passed ? 'Quiz Passed!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {attempt.passed
              ? 'Great job! You have successfully passed this quiz.'
              : `You need ${quiz?.pass_percentage ?? 70}% to pass. Give it another try!`}
          </p>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Score',      value: `${attempt.score}/${attempt.total_marks}` },
              { label: 'Percentage', value: `${Math.round(attempt.percentage)}%` },
              { label: 'Time',       value: `${Math.round(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s` },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-primary">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Pass mark indicator */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              className={`absolute top-0 left-0 h-full rounded-full ${
                attempt.passed ? 'bg-green-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(attempt.percentage, 100)}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
            {/* Pass line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
              style={{ left: `${quiz?.pass_percentage ?? 70}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">
            Pass mark: {quiz?.pass_percentage ?? 70}%
          </p>
        </motion.div>
      </div>

      {/* Answer review */}
      {attempt.answers && quiz?.show_answers_after && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-gray-700 px-1">Answer Review</h3>
          {attempt.answers.map((answer, i) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white border rounded-xl p-4 ${
                answer.is_correct === true  ? 'border-green-200 bg-green-50/30' :
                answer.is_correct === false ? 'border-red-200 bg-red-50/30' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  answer.is_correct === true  ? 'bg-green-500' :
                  answer.is_correct === false ? 'bg-red-500' :
                  'bg-gray-400'
                }`}>
                  {answer.is_correct === true ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : answer.is_correct === false ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <span className="text-white text-xs">?</span>
                  )}
                </span>
                <p className="text-sm text-gray-800 font-medium">{answer.question}</p>
              </div>

              <div className="ml-7 space-y-1 text-xs">
                <p className="text-gray-500">
                  Your answer: <span className="font-medium text-gray-700">
                    {answer.given_answer?.join(', ') || 'Not answered'}
                  </span>
                </p>
                {answer.correct_answer && answer.is_correct === false && (
                  <p className="text-green-700">
                    Correct: <span className="font-medium">
                      {answer.correct_answer.join(', ')}
                    </span>
                  </p>
                )}
                {answer.explanation && (
                  <p className="text-gray-400 italic mt-1">{answer.explanation}</p>
                )}
                {answer.teacher_feedback && (
                  <p className="text-blue-600 mt-1">
                    Teacher: {answer.teacher_feedback}
                  </p>
                )}
                <p className="font-semibold text-primary mt-1">
                  {answer.marks_awarded} mark(s) awarded
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Back to Course
        </button>
        {quiz?.max_attempts === 0 || true ? (
          <button
            onClick={onRetake}
            className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            Retake Quiz
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}

// ─── Main Quiz Player Page ────────────────────────────────────────
export default function QuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate   = useNavigate()

  const { data: quiz, isLoading } = useQuiz(Number(quizId))
  const startMutation             = useStartAttempt()
  const submitMutation            = useSubmitAttempt()

  const [phase, setPhase]         = useState<'intro' | 'playing' | 'results'>('intro')
  const [attempt, setAttempt]     = useState<QuizAttempt | null>(null)
  const [currentQ, setCurrentQ]   = useState(0)
  const [answers, setAnswers]     = useState<Record<number, string | string[]>>({})
  const startTimeRef              = useRef<number>(Date.now())

  const questions = quiz?.questions ?? []
  const question  = questions[currentQ]

  const handleStart = async () => {
    if (!quiz) return
    const res = await startMutation.mutateAsync(quiz.id)
    setAttempt(res.data.data)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  const handleSubmit = useCallback(async () => {
    if (!attempt) return
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    const res = await submitMutation.mutateAsync({
      attemptId: attempt.id,
      answers,
      timeTaken,
    })
    setAttempt(res.data.data)
    setPhase('results')
  }, [attempt, answers])

  const handleTimeUp = useCallback(() => handleSubmit(), [handleSubmit])

  const answeredCount = Object.keys(answers).length
  const progressPct   = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-3 border-gray-200 border-t-accent rounded-full"
        />
      </div>
    )
  }

  if (!quiz) return <div className="p-8 text-center text-gray-400">Quiz not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <AnimatePresence mode="wait">

          {/* ─── Intro ───────────────────────────────────────── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-primary">{quiz.title}</h1>
                    {quiz.description && (
                      <p className="text-gray-500 text-sm">{quiz.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: '📝', label: 'Questions', value: `${quiz.questions_count}` },
                    { icon: '⭐', label: 'Total Marks', value: `${quiz.total_marks}` },
                    { icon: '⏱',  label: 'Time Limit', value: quiz.time_limit > 0 ? `${quiz.time_limit} min` : 'No limit' },
                    { icon: '🎯', label: 'Pass Mark', value: `${quiz.pass_percentage}%` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg" style={{ fontSize: '18px' }}>{item.icon}</span>
                        <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                      </div>
                      <p className="text-base font-bold text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>

                {quiz.max_attempts > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
                    You have {quiz.max_attempts} attempt(s) for this quiz.
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {startMutation.isPending ? 'Starting...' : 'Start Quiz'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Playing ─────────────────────────────────────── */}
          {phase === 'playing' && question && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {answeredCount}/{questions.length} answered
                  </span>
                  <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      animate={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                {quiz.time_limit > 0 && (
                  <QuizTimer timeLimit={quiz.time_limit} onTimeUp={handleTimeUp} />
                )}
              </div>

              {/* Question dots */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      i === currentQ
                        ? 'bg-primary text-white'
                        : answers[q.id] !== undefined
                          ? 'bg-accent/20 text-accent'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={currentQ}
                  total={questions.length}
                  answer={answers[question.id]}
                  onChange={(val) => setAnswers((prev) => ({ ...prev, [question.id]: val }))}
                />
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((q) => q + 1)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quiz
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Results ─────────────────────────────────────── */}
          {phase === 'results' && attempt && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <QuizResults
                attempt={attempt}
                quiz={quiz}
                onRetake={() => {
                  setPhase('intro')
                  setAnswers({})
                  setCurrentQ(0)
                  setAttempt(null)
                }}
                onBack={() => navigate(-1)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}