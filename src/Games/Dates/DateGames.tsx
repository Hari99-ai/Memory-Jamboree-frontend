import type React from "react"
import { useState, useEffect, useRef } from "react"
import { EVENTS } from "./eventsData"
import { submitPracticeScore } from "../../lib/submitPracticeScore"
import type { DisciplineData } from "../../types/index"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

const COLORS = {
  correct: "#b6fcb6", // green
  incorrect: "#fcb6b6", // red
  empty: "#fffab6", // yellow
}

const itemsPerPage = 20

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface DateGameProps {
  paused?: boolean
  onRestart: () => void
  hoverColor: string
  disciplineName: string
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
  onRecallPhaseStart?: () => void
}

const DateGame: React.FC<DateGameProps> = ({
  paused,
  onRestart,
  hoverColor,
  disciplineName,
  allDisciplines,
  onGameComplete,
  onRecallPhaseStart,
}) => {
  const [phase, setPhase] = useState<"memorize" | "recall" | "done">("memorize")
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [page, setPage] = useState<number>(0)
  const [userInput, setUserInput] = useState<string[]>(Array(EVENTS.length).fill(""))
  const [inputColors, setInputColors] = useState<string[]>(Array(EVENTS.length).fill(""))
  const [score, setScore] = useState<number>(0)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [memorizeIndices, setMemorizeIndices] = useState<number[]>([])
  const [focusedRow, setFocusedRow] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(300) // Default to 5 minutes
  const timerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const indices = Array.from({ length: EVENTS.length }, (_, i) => i)
    setMemorizeIndices(shuffleArray(indices))
  }, [])

  const totalPages = Math.ceil(EVENTS.length / itemsPerPage)
  const recallInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const paginatedEvents = memorizeIndices
    .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
    .map((i) => EVENTS[i])

  const getRecallIndices = () => {
    const start = page * itemsPerPage
    const end = (page + 1) * itemsPerPage
    return shuffledIndices.slice(start, end)
  }

  // Function to start timer
  const startTimer = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(duration)
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setTimeout(() => {
            setPhase((currentPhase) => {
              if (currentPhase === "memorize") {
                handleRecallStart()
              } else if (currentPhase === "recall") {
                handleSubmit()
              }
              return currentPhase
            })
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Clear timer function
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Add useEffect for initial render and phase changes
  useEffect(() => {
    setPage(0)
    window.scrollTo({ top: 0, behavior: "smooth" })
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [phase])

  // Add useEffect for page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [page])

  const handleRecallStart = () => {
    stopTimer();
    setCountdownStarted(true)

    // After 5 seconds, start the recall phase
    setTimeout(() => {
      const indices = Array.from({ length: EVENTS.length }, (_, i) => i)
      setShuffledIndices(shuffleArray(indices))
      setPhase("recall")
      setPage(0) // Reset to first page
      setFocusedRow(0)
      setCountdownStarted(false)

      // Notify parent that recall phase has started
      if (onRecallPhaseStart) {
        onRecallPhaseStart()
      }

      startTimer(900) // Start 15-minute timer for recall
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 5000)
  }

  const handleChange = (idx: number, value: string) => {
    if (!/^\d{0,4}$/.test(value)) return
    if (value.length > 0 && !/^[1-9]/.test(value)) return

    if (value.length === 4) {
      const currentInputIndex = recallInputRefs.current.findIndex((input) => input && input === document.activeElement)
      if (currentInputIndex !== -1 && currentInputIndex < recallInputRefs.current.length - 1) {
        recallInputRefs.current[currentInputIndex + 1]?.focus()
        setFocusedRow(currentInputIndex + 1)
      }
    }

    const updated = [...userInput]
    updated[idx] = value
    setUserInput(updated)
  }
  const handleSubmit = async () => {
    stopTimer()

    let correctCount = 0
    const newColors = Array(EVENTS.length).fill(COLORS.empty)

    shuffledIndices.forEach((eventIndex) => {
      const val = userInput[eventIndex]
      if (!val) {
        newColors[eventIndex] = COLORS.empty
      } else if (val === EVENTS[eventIndex].year) {
        correctCount += 1
        newColors[eventIndex] = COLORS.correct
      } else {
        newColors[eventIndex] = COLORS.incorrect
      }
    })

    const finalScore = correctCount;

    setInputColors(newColors)
    setScore(finalScore)
    setPage(0)
    setPhase("done")

    // Call onGameComplete if provided (for event games)
    if (onGameComplete) {
      // Changed this line to submit the raw correct count
      onGameComplete(finalScore) 
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 0)
      return // Don't submit practice score for event games
    }

    try {
      const userIdString = sessionStorage.getItem("userId")
      const userId = userIdString ? Number.parseInt(userIdString, 10) : undefined

      const matchedDiscipline = allDisciplines.find(
        (d) => d.discipline_name === disciplineName && typeof d.disc_id === "number",
      )

      if (userId && matchedDiscipline) {
        const postData = {
          user_id: userId,
          disc_id: matchedDiscipline.disc_id!,
          score: finalScore, 
        }

        console.log("📤 Sending score to API:", postData)
        await submitPracticeScore(postData)
        console.log("✅ Score submitted successfully!")
      } else {
        console.warn("❌ Missing userId or discipline match:", {
          userId,
          disciplineName,
          allDisciplines,
        })
      }
    } catch (err) {
      console.error("🚨 Failed to submit score:", err)
    }

    // Ensure scroll to top after state updates
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((phase === "recall" || phase === "memorize") && e.key === "Enter") {
        e.preventDefault()
        if (phase === "memorize" && !countdownStarted) {
          if (window.confirm("Move to recall phase?")) {
            handleRecallStart()
          }
        } else if (phase === "recall") {
          if (window.confirm("Submit the game?")) {
            handleSubmit()
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, countdownStarted])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // On phase change to memorize or recall, start/reset timer
  useEffect(() => {
    if (paused) return
    if (phase === "memorize" && !countdownStarted) {
      startTimer(300); // 5 minutes for memorization
    } else if (phase === "recall" && !countdownStarted) {
        startTimer(900); // 15 minutes for recall
    } else if (phase === "done") {
      stopTimer()
    }
  }, [phase, countdownStarted, paused])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const maxRows = phase === "recall" ? getRecallIndices().length : paginatedEvents.length
      if (e.key === "ArrowDown") {
        setFocusedRow((prev) => {
          if (prev === maxRows - 1) {
            if (page < totalPages - 1) {
              setPage(page + 1)
              return 0
            }
            return prev
          }
          return Math.min(prev + 1, maxRows - 1)
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedRow((prev) => {
          if (prev === 0) {
            if (page > 0) {
              const prevPageStart = (page - 1) * itemsPerPage
              const prevPageLength = Math.min(itemsPerPage, EVENTS.length - prevPageStart)
              setPage(page - 1)
              return prevPageLength - 1
            }
            return 0
          }
          return prev - 1
        })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, page, focusedRow, paginatedEvents.length, shuffledIndices, totalPages])

  useEffect(() => {
    if (phase === "recall") {
      recallInputRefs.current[focusedRow]?.focus()
    }
  }, [focusedRow, phase, page])

  useEffect(() => {
    setFocusedRow(0)
  }, [page, phase])

  const renderMemorizeTable = () => (
    <table className="w-full text-left border-separate border-spacing-y-1 text-black">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="px-2 py-1">#</th>
          <th className="px-3 py-1 rounded-tl-lg">Year</th>
          <th className="px-3 py-1 rounded-tr-lg">Event</th>
        </tr>
      </thead>
      <tbody>
        {paginatedEvents.map((item, idx) => (
          <tr
            key={idx}
            className="rounded shadow-sm"
            onClick={() => setFocusedRow(idx)}
            style={{
              background: focusedRow === idx ? hoverColor : "#ffffff",
              transition: "background 0.2s",
              borderRadius: "0.25rem",
            }}
          >
            <td className="px-2 py-1 font-mono">{page * itemsPerPage + idx + 1}</td>
            <td className="px-3 py-1 font-mono">{item.year}</td>
            <td className="px-3 py-1">{item.event}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderRecallTable = () => {
    const currentIndices = getRecallIndices()
    return (
      <table className="w-full text-left border-separate border-spacing-y-1 text-black">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-2 py-1">#</th>
            <th className="px-3 py-1 rounded-tl-lg">Year</th>
            <th className="px-3 py-1 rounded-tr-lg">Event</th>
          </tr>
        </thead>
        <tbody>
          {currentIndices.map((eventIdx, idx) => (
            <tr
              key={idx}
              className="rounded shadow-sm"
              style={{
                background: focusedRow === idx ? hoverColor : "#ffffff",
                transition: "background 0.2s",
              }}
            >
              <td className="px-2 py-1 font-mono">{page * itemsPerPage + idx + 1}</td>
              <td className="px-3 py-1">
                <input
                  ref={(el) => {
                    recallInputRefs.current[idx] = el
                  }}
                  type="text"
                  maxLength={4}
                  value={userInput[eventIdx]}
                  onChange={(e) => handleChange(eventIdx, e.target.value)}
                  onClick={() => setFocusedRow(idx)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-black focus:outline-none"
                  disabled={phase === "done"}
                  style={{
                    background: inputColors[eventIdx] || (focusedRow === idx ? hoverColor : "white"),
                    color: "black",
                  }}
                  tabIndex={focusedRow === idx ? 0 : -1}
                />
              </td>
              <td className="px-3 py-1">{EVENTS[eventIdx].event}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderResultTable = () => {
    const start = page * itemsPerPage
    const end = (page + 1) * itemsPerPage
    const paginatedResults = shuffledIndices.slice(start, end)

    return (
        <table className="w-full text-left border-separate border-spacing-y-1 text-black">
            <thead>
                <tr className="bg-gray-100 text-gray-700">
                    <th className="px-2 py-1">#</th>
                    <th className="px-3 py-1">Answer</th>
                    <th className="px-3 py-1">Event</th>
                </tr>
            </thead>
            <tbody>
                {paginatedResults.map((eventIdx, idx) => {
                    const item = EVENTS[eventIdx];
                    const userAns = userInput[eventIdx];
                    const color = inputColors[eventIdx];
                    const isCorrect = color === COLORS.correct;
                    const isEmpty = color === COLORS.empty;
                    const isWrong = color === COLORS.incorrect;

                    return (
                        <tr key={eventIdx}>
                            <td className="px-2 py-1 font-mono">{page * itemsPerPage + idx + 1}</td>
                            <td className="px-3 py-1 font-mono">
                                {isCorrect && (
                                    <span style={{ background: COLORS.correct, color: "green", fontWeight: "bold", borderRadius: "0.25rem", padding: "1px 6px" }}>
                                        {item.year}
                                    </span>
                                )}
                                {isWrong && (
                                    <>
                                        <span style={{ textDecoration: "line-through", color: "red", marginRight: 6 }}>
                                            {userAns}
                                        </span>
                                        <span style={{ color: "red", fontWeight: "bold", marginLeft: 3 }}>
                                            ({item.year})
                                        </span>
                                    </>
                                )}
                                {isEmpty && (
                                    <span style={{ background: COLORS.empty, color: "#a68a00", fontWeight: "bold", borderRadius: "0.25rem", padding: "1px 6px" }}>
                                        {item.year}
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-1">{item.event}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}


  // const renderLegend = () => (
  //   <div className="flex gap-6 mt-6 mb-2 text-black">
  //     <div className="flex items-center gap-2">
  //       <span className="w-4 h-4 rounded" style={{ background: COLORS.correct }}></span>
  //       <span className="text-sm">Correct</span>
  //     </div>
  //     <div className="flex items-center gap-2">
  //       <span className="w-4 h-4 rounded" style={{ background: COLORS.incorrect }}></span>
  //       <span className="text-sm">Wrong</span>
  //     </div>
  //     <div className="flex items-center gap-2">
  //       <span className="w-4 h-4 rounded" style={{ background: COLORS.empty }}></span>
  //       <span className="text-sm">Not attempted</span>
  //     </div>
  //   </div>
  // )

   const renderPagination = () => (
    <div className="flex justify-center space-x-2 mt-4">
        <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:opacity-50"
        >
            Prev
        </button>
        <span className="pt-2 px-4 font-medium text-gray-400">
            Page {page + 1} / {totalPages}
        </span>
        <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:opacity-50"
        >
            Next
        </button>
    </div>
)


  return (
    <div
      ref={containerRef}
      className="p-6 max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-lg text-black relative"
      id="date-game-container"
    >
      {countdownStarted && <CountdownOverlay message="Recall Phase starts in..." />}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Date Game</h1>
        {(phase === "memorize" || phase === "recall") && !countdownStarted && (
          <div className="text-lg font-semibold text-red-600 select-none">Time : {formatTime(timeLeft)}</div>
        )}
        {phase === "done" && (
          <div className="absolute mb-8 top-4 right-6 bg-white border-2 border-green-600 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center align-middle gap-2">
            <span className="text-xl font-bold flex items-center align-middle">
              🏆 Score: <span className="text-3xl ml-2">{score}</span>
            </span>
          </div>
        )}
      </div>

      {phase === "memorize" && (
        <>
          <div className="mb-4">{renderMemorizeTable()}</div>
          {renderPagination()}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleRecallStart}
              className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Recall
            </button>
          </div>
        </>
      )}

      {phase === "recall" && (
        <>
          <div className="mb-4">{renderRecallTable()}</div>
          {renderPagination()}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to submit?")) {
                  handleSubmit()
                }
              }}
              className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 "
            >
              Submit
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <>
         
          <div className="mb-4">{renderResultTable()}</div>
          {renderPagination()}
          <div className="flex justify-center mt-6">
            <button
              onClick={onRestart}
              className="w-[100px] mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default DateGame