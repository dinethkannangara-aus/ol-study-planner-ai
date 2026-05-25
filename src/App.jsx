import { useMemo, useState } from 'react'

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'Sinhala',
  'History',
  'Buddhism',
  'ICT',
  'Commerce',
  'Geography',
]

const focusTemplates = [
  'Review core theory and write short notes',
  'Practice exam-style questions',
  'Correct mistakes from recent papers',
  'Revise formulas, definitions, and keywords',
  'Complete a timed question set',
  'Teach the lesson out loud from memory',
  'Make flashcards for weak points',
]

function parseWeakLessons(value) {
  return value
    .split(/\n|,/)
    .map((lesson) => lesson.trim())
    .filter(Boolean)
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function createStudyPlan({ examDate, dailyHours, targetMarks, subject, weakLessons }) {
  const lessons = parseWeakLessons(weakLessons)
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const exam = examDate ? new Date(`${examDate}T00:00:00`) : null
  const daysUntilExam = exam
    ? Math.max(1, Math.ceil((exam - startDate) / (1000 * 60 * 60 * 24)))
    : 14
  const availableDays = Math.min(14, daysUntilExam)
  const hours = Number(dailyHours) || 1
  const marks = Number(targetMarks) || 75
  const planLength = 14

  return Array.from({ length: planLength }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    const isPastExamWindow = index >= availableDays
    const lesson = lessons[index % Math.max(lessons.length, 1)]
    const focus = lesson || `${subject} revision area ${index + 1}`
    const intensity =
      marks >= 85 ? 'high accuracy' : marks >= 70 ? 'steady improvement' : 'foundation building'

    return {
      id: `${subject}-${index + 1}-${focus}`,
      day: index + 1,
      date: formatDate(date),
      title: isPastExamWindow ? 'Light review or rest' : focus,
      time: isPastExamWindow ? '30 min' : `${hours} hour${hours === 1 ? '' : 's'}`,
      tasks: isPastExamWindow
        ? [
            'Read your summary notes',
            'Review marked mistakes',
            'Sleep early and protect your routine',
          ]
        : [
            focusTemplates[index % focusTemplates.length],
            `Work on ${focus}`,
            `Finish with a ${Math.min(45, Math.max(20, hours * 15))}-minute ${intensity} quiz`,
          ],
    }
  })
}

export default function App() {
  const [form, setForm] = useState({
    examDate: '',
    dailyHours: 2,
    targetMarks: 75,
    subject: subjects[0],
    weakLessons: 'Algebra\nGeometry\nPast paper structured questions',
  })
  const [plan, setPlan] = useState([])
  const [completedTasks, setCompletedTasks] = useState({})

  const totalTasks = plan.reduce((sum, day) => sum + day.tasks.length, 0)
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progress = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0

  const summary = useMemo(() => {
    if (!plan.length) {
      return 'Set your goal, choose a subject, then generate a focused two-week plan.'
    }

    return `${completedCount} of ${totalTasks} tasks complete for ${form.subject}.`
  }, [completedCount, form.subject, plan.length, totalTasks])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function generatePlan(event) {
    event.preventDefault()
    setPlan(createStudyPlan(form))
    setCompletedTasks({})
  }

  function toggleTask(taskKey) {
    setCompletedTasks((current) => ({
      ...current,
      [taskKey]: !current[taskKey],
    }))
  }

  return (
    <main className="app-shell">
      <section className="planner-panel" aria-labelledby="planner-title">
        <div className="intro">
          <p className="eyebrow">O/L Study Planner AI</p>
          <h1 id="planner-title">Build a 14-day study plan around your next exam.</h1>
          <p>{summary}</p>
        </div>

        <form className="planner-form" onSubmit={generatePlan}>
          <label>
            Exam date
            <input
              type="date"
              name="examDate"
              value={form.examDate}
              onChange={updateField}
            />
          </label>

          <label>
            Daily study hours
            <input
              type="number"
              name="dailyHours"
              min="0.5"
              max="12"
              step="0.5"
              value={form.dailyHours}
              onChange={updateField}
            />
          </label>

          <label>
            Target marks
            <input
              type="number"
              name="targetMarks"
              min="1"
              max="100"
              value={form.targetMarks}
              onChange={updateField}
            />
          </label>

          <label>
            Subject
            <select name="subject" value={form.subject} onChange={updateField}>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="wide-field">
            Weak lessons
            <textarea
              name="weakLessons"
              rows="5"
              value={form.weakLessons}
              onChange={updateField}
              placeholder="Add one lesson per line or separate them with commas"
            />
          </label>

          <button className="primary-button" type="submit">
            Generate 14-day plan
          </button>
        </form>
      </section>

      <section className="progress-panel" aria-label="Study progress">
        <div>
          <p className="eyebrow">Progress</p>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="plan-grid" aria-label="Generated study plan">
        {plan.length === 0 ? (
          <div className="empty-state">
            <h2>Your plan will appear here</h2>
            <p>Use the form above to create daily tasks for the next 14 days.</p>
          </div>
        ) : (
          plan.map((day) => (
            <article className="day-card" key={day.id}>
              <div className="day-card-header">
                <span>Day {day.day}</span>
                <span>{day.date}</span>
              </div>
              <h2>{day.title}</h2>
              <p>{day.time}</p>
              <ul>
                {day.tasks.map((task, taskIndex) => {
                  const taskKey = `${day.id}-${taskIndex}`

                  return (
                    <li key={taskKey}>
                      <label className="task-check">
                        <input
                          type="checkbox"
                          checked={Boolean(completedTasks[taskKey])}
                          onChange={() => toggleTask(taskKey)}
                        />
                        <span>{task}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </article>
          ))
        )}
      </section>
    </main>
  )
}