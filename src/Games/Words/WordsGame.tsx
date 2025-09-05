import { useState, useEffect, useRef, useCallback } from "react"
import confetti from "canvas-confetti"
import { Button } from "../../components/ui/button"
import { generateWordsData } from "./wordsData"
import { submitPracticeScore } from "../../lib/submitPracticeScore"
import type { DisciplineData } from "../../types/index"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

interface WordsGameProps {
  paused?: boolean
  time: number
  onRestart: () => void
  highlightColor: string
  highlightGroupSize: number
  showGroupedWords: boolean
  category: "easy" | "moderate" | "hard" | "master"
  disciplineName: string
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
  onRecallPhaseStart?: () => void
}

export default function WordsGame({
  time,
  onRestart,
  highlightColor,
  highlightGroupSize,
  showGroupedWords,
  category,
  disciplineName,
  allDisciplines,
  onGameComplete,
  onRecallPhaseStart,
  paused,
}: WordsGameProps) {
  const wordsPerPage = 100 // Fixed 100 words per page
  const cols = 5
  const rows = 20 // 20 rows x 5 cols = 100 words per page

  const [phase, setPhase] = useState<"memorize" | "recall">("memorize")
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [words, setWords] = useState<string[]>([])
  const [recallAnswers, setRecallAnswers] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [_, setShowResultModal] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(time * 60)
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([])

  // Track current position for keyboard navigation
  const [currentPos, setCurrentPos] = useState({ row: 0, col: 0, page: 1 })
  const wordRefs = useRef<(HTMLDivElement | null)[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerEndTime = useRef<number | null>(null)

  useEffect(() => {
    if (category) {
      ;(async () => {
        const allWords = await generateWordsData(category)
        const maxWords = 2 * cols * rows

        const shuffled = allWords.slice().sort(() => Math.random() - 0.5)

        setWords(shuffled.slice(0, maxWords))
      })()
    }
  }, [category])

  const handleSubmit = useCallback(async () => {
    let totalScore = 0
    let totalCorrect = 0
    const columnScores: number[] = []

    for (let col = 0; col < cols; col++) {
      let columnConsecutiveCorrect = 0
      let foundWrong = false

      for (let pageIdx = 0; pageIdx < Math.ceil(words.length / wordsPerPage); pageIdx++) {
        for (let row = 0; row < rows; row++) {
          const idxInPage = col * rows + row
          const globalIdx = pageIdx * wordsPerPage + idxInPage
          if (globalIdx >= words.length) break

          const userAnswer = (recallAnswers[globalIdx] || "").trim().toLowerCase()
          const correctAnswer = words[globalIdx].toLowerCase()

          if (userAnswer === correctAnswer) {
            totalCorrect++
          }

          if (!foundWrong) {
            if (userAnswer === correctAnswer) {
              columnConsecutiveCorrect++
            } else {
              foundWrong = true
            }
          }
        }
      }

      let bonus = 0
      if (columnConsecutiveCorrect >= 20) bonus = 2
      else if (columnConsecutiveCorrect >= 10) bonus = 1

      const columnScore = columnConsecutiveCorrect + bonus
      columnScores.push(columnScore)
      totalScore += columnScore
    }

    setScore(totalScore)
    setTotalCorrect(totalCorrect)
    setShowResultModal(true)
    setShowFinalResult(true)

    // Call onGameComplete if provided (for event games)
    if (onGameComplete) {
      onGameComplete(totalScore)
      return // Don't submit practice score for event games
    }

    // ✅ Submit practice score only if not an event game
    try {
      const userIdString = sessionStorage.getItem("userId")
      const user_id = userIdString ? Number.parseInt(userIdString, 10) : undefined

      const matchedDiscipline = allDisciplines?.find(
        (d) => d.discipline_name === disciplineName && typeof d.disc_id === "number",
      )

      if (user_id && matchedDiscipline) {
        const postData = {
          user_id,
          disc_id: matchedDiscipline.disc_id!,
          score: totalScore,
        }

        console.log("📤 Submitting WordsGame score:", postData)
        await submitPracticeScore(postData)
        console.log("✅ WordsGame score submitted!")
      } else {
        console.warn("❌ Could not find user_id or matched discipline", {
          user_id,
          disciplineName,
          allDisciplines,
        })
      }
    } catch (err) {
      console.error("🚨 Error submitting WordsGame score:", err)
    }
  }, [
    allDisciplines,
    disciplineName,
    onGameComplete,
    recallAnswers,
    words,
  ])

  // Handle recall start with countdown
  const handleRecallStart = useCallback(() => {
    setCountdownStarted(true)

    // After 5 seconds, start the recall phase
    setTimeout(() => {
      setPage(1)
      setPhase("recall")
      setTimeLeft(15 * 60) // Set to 10 minutes for recall phase
      setCountdownStarted(false)

      // Call the recall phase start callback
      if (onRecallPhaseStart) {
        onRecallPhaseStart()
      }
    }, 5000)
  }, [onRecallPhaseStart])

  // New timestamp-based timer effect
  useEffect(() => {
    if (paused || countdownStarted) {
      return // Timer is stopped
    }

    // Set the target end time based on the current `timeLeft` state.
    // This runs when a phase starts or when the game is un-paused.
    timerEndTime.current = Date.now() + timeLeft * 1000

    const interval = setInterval(() => {
      if (!timerEndTime.current) return

      const remaining = timerEndTime.current - Date.now()

      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
        if (phase === "memorize") {
          handleRecallStart()
        } else if (phase === "recall") {
          handleSubmit()
        }
      } else {
        // Use Math.ceil to ensure the timer display updates correctly
        setTimeLeft(Math.ceil(remaining / 1000))
      }
    }, 500) // Check twice per second

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, countdownStarted])

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  // Highlight logic for column grouping (memorize phase only)
  const handleHighlightGroup = (row: number, col: number) => {
    const newHighlights: number[] = []
    for (let i = 0; i < highlightGroupSize; i++) {
      const targetRow = row + i
      if (targetRow < rows) {
        const idxInPage = col * rows + targetRow
        const globalIdx = (page - 1) * wordsPerPage + idxInPage
        if (globalIdx < words.length) {
          newHighlights.push(globalIdx)
        }
      }
    }
    setHighlightedIndexes(newHighlights)
  }

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (!showFinalResult && !countdownStarted) {
          if (phase === "memorize") {
            if (window.confirm("Are you sure you want to move to the Recall phase?")) {
              handleRecallStart()
            }
          }
          if (phase === "recall") {
            if (window.confirm("Are you sure you want to submit your answers?")) {
              handleSubmit()
              setPage(1)
            }
          }
        }
      }
    }
    window.addEventListener("keydown", handleGlobalEnter)
    return () => window.removeEventListener("keydown", handleGlobalEnter)
  }, [phase, showFinalResult, countdownStarted, handleRecallStart, handleSubmit])

  const handleInputChange = (index: number, value: string) => {
    const updated = [...recallAnswers]
    updated[index] = value.toLowerCase()
    setRecallAnswers(updated)
  }

  useEffect(() => {
    const defaultHighlights: number[] = []
    for (let i = 0; i < highlightGroupSize; i++) {
      const idxInPage = 0 * rows + i
      const globalIdx = (page - 1) * wordsPerPage + idxInPage

      if (globalIdx < words.length) {
        defaultHighlights.push(globalIdx)
      }
    }
    if (phase === "memorize") {
      setHighlightedIndexes(defaultHighlights)
    }
  }, [words, page, phase, highlightGroupSize, rows, wordsPerPage])

  // 🎉 Confetti
  useEffect(() => {
    if (showFinalResult) {
      const ratio = score / words.length
      const particleCount = ratio === 1 ? 300 : ratio >= 0.75 ? 200 : 100

      confetti({
        particleCount,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.1,
      })
    }
  }, [showFinalResult, score, words.length])

  // --- Keyboard navigation for memorize phase ---
  useEffect(() => {
    if (phase !== "memorize") return

    const handleKey = (e: KeyboardEvent) => {
      let { row, col, page } = currentPos
      let changed = false

      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Tab"].includes(e.key)) {
        e.preventDefault()
      }

      // Calculate group start/end for current column
      const groupStart = Math.floor(row / highlightGroupSize) * highlightGroupSize
      const groupEnd = Math.min(groupStart + highlightGroupSize - 1, rows - 1)

      // Helper to check if group exists (at least one word in group)
      const groupExists = (testRow: number, testCol: number, testPage: number) => {
        for (let i = 0; i < highlightGroupSize; i++) {
          const idxInPage = testCol * rows + (testRow + i)
          const globalIdx = (testPage - 1) * wordsPerPage + idxInPage
          if (testRow + i < rows && globalIdx < words.length) {
            return true
          }
        }
        return false
      }

      // Forward (Down, Right, Tab): next group in column, then next column, then next page
      if (["ArrowDown", "ArrowRight", "Tab"].includes(e.key)) {
        if (groupEnd + 1 < rows && groupExists(groupEnd + 1, col, page)) {
          row = groupEnd + 1
          changed = true
        } else if (col < cols - 1 && groupExists(0, col + 1, page)) {
          col++
          row = 0
          changed = true
        } else if (page < Math.ceil(words.length / wordsPerPage) && groupExists(0, 0, page + 1)) {
          page++
          col = 0
          row = 0
          changed = true
        } else if (col === cols - 1 && groupEnd === rows - 1) {
          // Last group of last column — scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        if (changed) {
          setCurrentPos({ row, col, page })
          handleHighlightGroup(row, col)
          setPage(page)

          const idxInPage = col * rows + row
          const globalIdx = (page - 1) * wordsPerPage + idxInPage

          // Scroll the focused word into center view
          setTimeout(() => {
            const target = wordRefs.current[globalIdx]
            target?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 30)
        }
      }
      // Backward (Up, Left): previous group in column, then previous column, then previous page
      else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        if (groupStart - highlightGroupSize >= 0 && groupExists(groupStart - highlightGroupSize, col, page)) {
          row = groupStart - highlightGroupSize
          changed = true
        } else if (col > 0) {
          // Find last valid group in previous column
          let lastGroupRow = Math.floor((rows - 1) / highlightGroupSize) * highlightGroupSize
          while (lastGroupRow >= 0 && !groupExists(lastGroupRow, col - 1, page)) {
            lastGroupRow -= highlightGroupSize
          }
          if (lastGroupRow >= 0) {
            col--
            row = lastGroupRow
            changed = true
          }
        } else if (page > 1) {
          // Find last valid group in last column of previous page
          let lastGroupRow = Math.floor((rows - 1) / highlightGroupSize) * highlightGroupSize
          while (lastGroupRow >= 0 && !groupExists(lastGroupRow, cols - 1, page - 1)) {
            lastGroupRow -= highlightGroupSize
          }
          if (lastGroupRow >= 0) {
            page--
            col = cols - 1
            row = lastGroupRow
            changed = true
          }
        }
      }

      if (changed) {
        setCurrentPos({ row, col, page })
        handleHighlightGroup(row, col)
        setPage(page)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line
  }, [phase, currentPos, page, words.length, highlightGroupSize, rows, cols, wordsPerPage])

  // --- Recall phase: highlight group navigation and input focus ---
  useEffect(() => {
    if (phase !== "recall" || showFinalResult) return

    // Default: highlight first group in first column, focus first input
    setCurrentPos({ row: 0, col: 0, page: 1 })
    setHighlightedIndexes(Array.from({ length: highlightGroupSize }, (_, i) => i))

    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus()
    }, 100)
    // eslint-disable-next-line
  }, [phase, showFinalResult])

  useEffect(() => {
    if (phase !== "recall" || showFinalResult) return

    const handleRecallKey = (e: KeyboardEvent) => {
      let { row, col, page } = currentPos
      let changed = false
      let idxInPage = col * rows + row
      let globalIdx = (page - 1) * wordsPerPage + idxInPage

      if (["ArrowUp", "ArrowDown", "Tab"].includes(e.key)) e.preventDefault()

      // Calculate group start/end for current column
      const groupStart = Math.floor(row / highlightGroupSize) * highlightGroupSize
      const groupEnd = Math.min(groupStart + highlightGroupSize - 1, rows - 1)

      if (e.key === "ArrowDown") {
        if (row < groupEnd) {
          row++
          changed = true
        } else if (groupEnd < rows - 1) {
          row = groupEnd + 1
          changed = true

          setHighlightedIndexes(
            Array.from({ length: highlightGroupSize }, (_, i) => {
              const r = groupEnd + 1 + i
              if (r < rows) return (page - 1) * wordsPerPage + col * rows + r
              return null
            }).filter((x) => x !== null) as number[],
          )
        } else if (col < cols - 1) {
          // 🔥 Custom behavior: move to first input of next column
          row = 0
          col++
          changed = true

          setHighlightedIndexes(
            Array.from({ length: highlightGroupSize }, (_, i) => {
              const r = i
              return (page - 1) * wordsPerPage + col * rows + r
            }),
          )
        }
      } else if (e.key === "ArrowUp") {
        if (row > groupStart) {
          row--
          changed = true
        } else if (groupStart > 0) {
          row = groupStart - 1
          setHighlightedIndexes(
            Array.from({ length: highlightGroupSize }, (_, i) => {
              const r = groupStart - highlightGroupSize + i
              if (r >= 0) return (page - 1) * wordsPerPage + col * rows + r
              return null
            }).filter((x) => x !== null) as number[],
          )
          changed = true
        }
      } else if (e.key === "Tab") {
        if (row < groupEnd) {
          row++
          changed = true
        } else if (groupEnd < rows - 1) {
          row = groupEnd + 1
          setHighlightedIndexes(
            Array.from({ length: highlightGroupSize }, (_, i) => {
              const r = groupEnd + 1 + i
              if (r < rows) return (page - 1) * wordsPerPage + col * rows + r
              return null
            }).filter((x) => x !== null) as number[],
          )
          changed = true
        }
      }

      if (changed) {
        setCurrentPos({ row, col, page })

        idxInPage = col * rows + row
        globalIdx = (page - 1) * wordsPerPage + idxInPage

        // Highlight group
        const groupStart = Math.floor(row / highlightGroupSize) * highlightGroupSize
        setHighlightedIndexes(
          Array.from({ length: highlightGroupSize }, (_, i) => {
            const rr = groupStart + i
            if (rr < rows) return (page - 1) * wordsPerPage + col * rows + rr
            return null
          }).filter((x) => x !== null) as number[],
        )

        setTimeout(() => {
          inputRefs.current[globalIdx]?.focus()

          const activeInput = document.getElementById(`input-${globalIdx}`)
          activeInput?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 50)
      }
    }

    window.addEventListener("keydown", handleRecallKey)
    return () => window.removeEventListener("keydown", handleRecallKey)
    // eslint-disable-next-line
  }, [phase, currentPos, showFinalResult, highlightedIndexes, page])

  // Add this helper function at the top of the component
  const getDarkerShade = (color: string): string => {
    // Convert hex to RGB, darken, then back to hex
    const rgb = color.match(/\w\w/g)?.map((x) => Number.parseInt(x, 16))
    if (!rgb) return color

    const darker = rgb.map((c) => Math.max(0, c - 40)).map((c) => c.toString(16).padStart(2, "0"))
    return `#${darker.join("")}`
  }

  // The existing renderPagination function can remain unchanged
const totalPages = 2 // Hardcoded to 2 pages

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center space-x-4 mt-4 mb-6">
        <Button
         
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
           className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:opacity-50"
        >
          Prev
        </Button>
        <span className="pt-2 px-4 font-medium text-gray-400">
          Page {page} / {totalPages}
        </span>
        <Button
          
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    )
  }
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      {countdownStarted && <CountdownOverlay message="Recall Phase starts in..." />}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {phase === "memorize" ? "Memorize" : phase === "recall" && !showFinalResult ? "Recall" : "Results"} Words
          </h2>
          {(phase === "memorize" || (phase === "recall" && !showFinalResult)) && (
            <span className="text-sm font-semibold text-gray-800 capitalize">(Category: {category})</span>
          )}
        </div>
        <div className="text-right space-y-1">
          <div className="text-right space-y-1">
            {(!showFinalResult || phase !== "recall") && !countdownStarted && (
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                  timeLeft < 30 ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-800"
                }`}
              >
                ⏱ Time Left: {formatTime(timeLeft)}
              </div>
            )}
            {showFinalResult && (
              <div className="relative right-6 bg-white border-2 border-green-600 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center align-middle gap-2">
                <span className="text-2xl font-bold flex items-center align-middle">
                  🏆 Score: <span className="text-4xl">{score}</span>
                </span>
                <span className="text-xl flex items-center align-middle">
                  ( <span className="text-2xl font-bold"> {totalCorrect} </span> correct)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display highlighted words at top */}
      {phase === "memorize" && showGroupedWords && highlightedIndexes.length > 0 && (
        <div className="mb-6 border border-gray-300 rounded-lg p-6 text-center bg-white shadow-inner">
          <div className="grid grid-cols-1 gap-2 text-2xl font-bold text-gray-800">
            {highlightedIndexes.map((globalIdx) => {
              if (globalIdx < words.length) {
                return (
                  <div key={globalIdx} className="tracking-wide">
                    {words[globalIdx]}
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}

      {/* Word grid with serial number column */}
      <div
        className={`grid ${showFinalResult ? "gap-0.5" : "gap-2"} text-gray-900 text-xs`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {[...Array(rows)].map((_, r) =>
          [...Array(cols)].map((_, c) => {
            const idxInPage = c * rows + r
            const globalIdx = (page - 1) * wordsPerPage + idxInPage

            // Check if we have a word for this position
            if (globalIdx >= words.length || page > 4) return null

            const word = words[globalIdx]
            const answer = recallAnswers[globalIdx] || ""
            const showFeedback = showFinalResult && phase === "recall"
            const highlighted = highlightedIndexes.includes(globalIdx)

            return (
              <div key={c + "-" + r} style={{ display: "flex", alignItems: "center" }}>
                <span className="font-bold mr-1 text-gray-400 select-none" style={{ minWidth: 30, textAlign: "right" }}>
                  {(page - 1) * wordsPerPage + idxInPage + 1}.
                </span>

                {phase === "memorize" ? (
                  <div
                    ref={(el) => {
                      wordRefs.current[globalIdx] = el
                    }}
                    className={`text-center font-medium select-none cursor-pointer ${highlighted ? "bg-yellow-200" : ""}`}
                    style={{
                      minWidth: "130px",
                      minHeight: "24px",
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      padding: "2px 5px",
                      margin: "-2px 2px",
                      backgroundColor: highlighted ? highlightColor : undefined,
                      outline:
                        highlighted && currentPos.row === r && currentPos.col === c && page === currentPos.page
                          ? `2px solid ${highlightColor}`
                          : undefined,
                    }}
                    onClick={() => {
                      // Check if the clicked word is already part of the highlighted group
                      const clickedGlobalIdx = (page - 1) * wordsPerPage + (c * rows + r)
                      const isAlreadyHighlighted = highlightedIndexes.includes(clickedGlobalIdx)

                      // Only update highlight if the word is not already highlighted
                      if (!isAlreadyHighlighted) {
                        handleHighlightGroup(r, c)
                        setCurrentPos({ row: r, col: c, page })
                      }
                    }}
                  >
                    {word}
                  </div>
                ) : showFeedback ? (
                  // Correct answer - green highlight
                  <div className={`${showFinalResult ? "px-1 py-0.5" : "px-2 py-1"}`}>
                    {answer ? (
                      answer.toLowerCase() === word.toLowerCase() ? (
                        <div className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-sm">{word}</div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="line-through text-gray-500 text-sm">{answer}</span>
                          <span className="text-red-600 text-sm">{word}</span>
                        </div>
                      )
                    ) : (
                      <div className="bg-yellow-100 px-1 py-0.5 rounded text-gray-800 text-sm">{word}</div>
                    )}
                  </div>
                ) : (
                  <input
                    id={`input-${globalIdx}`}
                    type="text"
                    value={answer}
                    ref={(el) => {
                      inputRefs.current[globalIdx] = el
                    }}
                    className={`w-full h-6 p-2 border border-gray-300 rounded text-center text-sm outline-none
    ${phase === "recall" && currentPos.row === r && currentPos.col === c && page === currentPos.page ? "bg-black text-white" : ""}
  `}
                    style={{
                      minHeight: "20px",
                      outlineColor: highlightColor,
                      fontSize: "0.9rem",
                      backgroundColor:
                        phase === "recall" && currentPos.row === r && currentPos.col === c && page === currentPos.page
                          ? getDarkerShade(highlightColor)
                          : highlighted
                            ? highlightColor
                            : "white",
                      color: "black",
                      textTransform: "lowercase",
                    }}
                    onChange={(e) => handleInputChange(globalIdx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault()
                      }
                    }}
                    onFocus={() => {
                      setCurrentPos({ row: r, col: c, page })
                      if (phase === "recall") {
                        const groupStart = Math.floor(r / highlightGroupSize) * highlightGroupSize
                        setHighlightedIndexes(
                          Array.from({ length: highlightGroupSize }, (_, i) => {
                            const rr = groupStart + i
                            if (rr < rows) return (page - 1) * wordsPerPage + c * rows + rr
                            return null
                          }).filter((x) => x !== null) as number[],
                        )
                      }
                    }}
                  />
                )}
              </div>
            )
          }),
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
      <div className="flex justify-center items-center mt-6">
        {!showFinalResult && phase === "memorize" && !countdownStarted && (
          <Button
            className="mt-4 w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={timeLeft > 50000}
            onClick={handleRecallStart}
          >
            Recall
          </Button>
        )}

        {!showFinalResult && phase === "recall" && (
          <Button
            className="mt-4 w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit?")) {
                handleSubmit()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
          >
            Submit
          </Button>
        )}
      </div>

      {showFinalResult && (
        <div className="-mt-8 text-center">
          <Button
            className="w-[100px] mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            onClick={onRestart}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
}