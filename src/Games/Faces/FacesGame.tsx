import { useState, useEffect, useRef, useCallback } from "react"
import clsx from "clsx"
import generateFacesData from "./facesData"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

import { submitPracticeScore } from "../../lib/submitPracticeScore"
import { DisciplineData } from "../../types/index"

interface Face {
  firstName: string
  lastName: string
  name: string
  image: string
}

interface Props {
  time: number
  onRestart: () => void
  highlightColor: string
  onRecallPhaseStart?: () => void
  disciplineName: string
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
}

interface ScoreResult {
  total: number
  details: Array<{
    userAnswer: string
    correctAnswer: string
    points: number
    isCorrect: boolean
    isPartiallyCorrect: boolean
    isEmpty: boolean
  }>
}

export default function FacesGame({
  onRestart,
  highlightColor,
  onRecallPhaseStart,
  disciplineName,
  allDisciplines,
  onGameComplete,
}: Props) {
  const ROWS = 3
  const COLS = 5 // Changed from 4 to 5
  const TOTAL_FACES = 60 // Now 4 pages × 15 faces per page

  const [faces, setFaces] = useState<Face[]>([])
  const [recallFaces, setRecallFaces] = useState<Face[]>([])
  const [phase, setPhase] = useState<"memorize" | "countdown" | "recall" | "results">("memorize")
  const [page, setPage] = useState(1)
  const [activeImage, setActiveImage] = useState<[number, number]>([0, 0])
  const [activeInput, setActiveInput] = useState<[number, number]>([0, 0])
  const [recallAnswers, setRecallAnswers] = useState<string[]>([])
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes in seconds
  const [endTime, setEndTime] = useState<number | null>(null) // State to store the target end time

  const inputRefs = useRef<HTMLInputElement[][]>([])
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize 60 faces on mount
  useEffect(() => {
    const facesData = generateFacesData(TOTAL_FACES)
    setFaces(facesData)
    setRecallAnswers(Array(TOTAL_FACES).fill(""))
  }, [])

  // Calculate score based on requirements
  const calculateScore = (faces: Face[], answers: string[]): ScoreResult => {
    let totalScore = 0
    const details = faces.map((face, idx) => {
      const userAnswer = (answers[idx] || "").trim()
      const correctAnswer = face.name
      const isEmpty = userAnswer === ""

      if (isEmpty) {
        return {
          userAnswer,
          correctAnswer,
          points: 0,
          isCorrect: false,
          isPartiallyCorrect: false,
          isEmpty: true,
        }
      }

      const userParts = userAnswer.toLowerCase().split(" ").filter(Boolean)
      const correctFirstName = face.firstName.toLowerCase()
      const correctLastName = face.lastName.toLowerCase()

      const userFirstName = userParts[0] || ""
      const userLastName = userParts[1] || ""

      const isFirstNameMatch = userFirstName === correctFirstName
      const isLastNameMatch = userLastName === correctLastName
      
      const hasFullName = userParts.length >= 2

      let points = 0
      let isCorrect = false
      let isPartiallyCorrect = false

      // Award 1 point if the first name matches.
      if (isFirstNameMatch) {
        points = 1
        // Distinguish between a full match and a partial match for the results display.
        if (hasFullName && isLastNameMatch) {
            isCorrect = true
        } else {
            isPartiallyCorrect = true
        }
      }

      totalScore += points

      return {
        userAnswer,
        correctAnswer,
        points,
        isCorrect,
        isPartiallyCorrect,
        isEmpty: false,
      }
    })

    return { total: totalScore, details }
  }
  
  // Submit recall answers
  const handleSubmit = useCallback(async () => {
    if (phase === "recall" && !confirm("Are you sure you want to submit your answers?")) {
      return
    }
    const result = calculateScore(recallFaces, recallAnswers)
    setScoreResult(result)
    setPhase("results")

    // Call onGameComplete if provided (for event games)
    if (onGameComplete) {
      onGameComplete(result.total)
      return // Don't submit practice score for event games
    }

    // Submit practice score only if not an event game
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
          score: result.total,
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
  }, [phase, recallFaces, recallAnswers, onGameComplete, allDisciplines, disciplineName, calculateScore])

  // Handle clicking "Recall Now"
  const handleRecall = useCallback(() => {
    setPhase("countdown")

    const shuffled = [...faces]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRecallFaces(shuffled)

    setTimeout(() => {
      setPhase("recall")
      if (onRecallPhaseStart) {
        onRecallPhaseStart()
      }
    }, 5000)
  }, [faces, onRecallPhaseStart])

  //  TIMER LOGIC: Set duration and end time when a phase begins
  useEffect(() => {
    if (phase === "memorize") {
        const duration = 5 * 60; // 5 minutes
        setTimeLeft(duration);
        setEndTime(Date.now() + duration * 1000);
    } else if (phase === "recall") {
        const duration = 15 * 60; // 15 minutes
        setTimeLeft(duration);
        setEndTime(Date.now() + duration * 1000);
    } else {
        setEndTime(null); // Clear end time for other phases
    }
  }, [phase]);

  // TIMER LOGIC: Effect that runs the countdown tick
 // TIMER LOGIC: Effect that runs the countdown tick
useEffect(() => {
  // If there's no end time set, or we're not in a phase with a timer, do nothing.
  if (!endTime || (phase !== "memorize" && phase !== "recall")) {
    return;
  }

  // This function runs every second to update the timer.
  const timerTick = () => {
    const remaining = Math.max(0, endTime - Date.now());
    const remainingSeconds = Math.round(remaining / 1000);
    setTimeLeft(remainingSeconds);

    // ✅ This is the key part: check if time has run out.
    if (remaining <= 0) {

      // If the memorization timer ends, start the recall process.
      if (phase === "memorize") {
        handleRecall();

      // If the recall timer ends, trigger the submit process.
      } else if (phase === "recall") {
        handleSubmit();
      }
    }
  };

  // Start the timer interval.
  countdownRef.current = setInterval(timerTick, 1000);

  // Clean up the interval when the component updates or unmounts.
  return () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };
}, [phase, endTime, handleRecall, handleSubmit]);
  // Focus the first input when recall phase starts
  useEffect(() => {
    if (phase === "recall") {
      setPage(1)
      setActiveInput([0, 0])
      setTimeout(() => {
        inputRefs.current[0]?.[0]?.focus()
      }, 100)
    }
  }, [phase])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "results") return

      const totalPages = Math.ceil(TOTAL_FACES / (ROWS * COLS))

      // Memorize phase navigation
      if (phase === "memorize") {
        const [row, col] = activeImage
        const isLastPage = page === totalPages
        const isLastRow = row === ROWS - 1
        const isLastCol = col === COLS - 1
        const isFirstPage = page === 1
        const isFirstRow = row === 0
        const isFirstCol = col === 0

        switch (e.key) {
          case "ArrowRight":
            if (!isLastPage || !(isLastRow && isLastCol)) {
              if (col < COLS - 1) {
                setActiveImage([row, col + 1])
              } else if (row < ROWS - 1) {
                setActiveImage([row + 1, 0])
              } else if (!isLastPage) {
                setPage(page + 1)
                setTimeout(() => setActiveImage([0, 0]), 0)
              }
            }
            e.preventDefault()
            return
          case "ArrowLeft":
            if (!(isFirstPage && isFirstRow && isFirstCol)) {
              if (col > 0) {
                setActiveImage([row, col - 1])
              } else if (row > 0) {
                setActiveImage([row - 1, COLS - 1])
              } else if (page > 1) {
                setPage(page - 1)
                setTimeout(() => setActiveImage([ROWS - 1, COLS - 1]), 0)
              }
            }
            e.preventDefault()
            return
          case "ArrowDown":
            if (row < ROWS - 1) {
              setActiveImage([row + 1, col])
            } else if (page < totalPages) {
              setPage(page + 1)
              setTimeout(() => setActiveImage([0, col]), 0)
            }
            e.preventDefault()
            return
          case "ArrowUp":
            if (row > 0) {
              setActiveImage([row - 1, col])
            } else if (page > 1) {
              setPage(page - 1)
              setTimeout(() => setActiveImage([ROWS - 1, col]), 0)
            }
            e.preventDefault()
            return
        }
      }

      // Recall phase navigation
      if (phase === "recall") {
        const [row, col] = activeInput
        let nextRow = row
        let nextCol = col

        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault()
          switch (e.key) {
            case "ArrowRight":
              if (col < COLS - 1) {
                nextCol++
              } else if (row < ROWS - 1) {
                nextRow++
                nextCol = 0
              } else if (page < totalPages) {
                setPage(page + 1)
                setTimeout(() => {
                  setActiveInput([0, 0])
                  inputRefs.current[0]?.[0]?.focus()
                }, 0)
                return
              }
              break
            case "ArrowLeft":
              if (col > 0) {
                nextCol--
              } else if (row > 0) {
                nextRow--
                nextCol = COLS - 1
              } else if (page > 1) {
                setPage(page - 1)
                setTimeout(() => {
                  const lastRow = ROWS - 1
                  const lastCol = COLS - 1
                  setActiveInput([lastRow, lastCol])
                  inputRefs.current[lastRow]?.[lastCol]?.focus()
                }, 0)
                return
              }
              break
            case "ArrowDown":
              if (row < ROWS - 1) {
                nextRow++
              } else if (page < totalPages) {
                setPage(page + 1)
                setTimeout(() => {
                  setActiveInput([0, col])
                  inputRefs.current[0]?.[col]?.focus()
                }, 0)
                return
              }
              break
            case "ArrowUp":
              if (row > 0) {
                nextRow--
              } else if (page > 1) {
                setPage(page - 1)
                setTimeout(() => {
                  const lastRow = ROWS - 1
                  setActiveInput([lastRow, col])
                  inputRefs.current[lastRow]?.[col]?.focus()
                }, 0)
                return
              }
              break
          }
          setActiveInput([nextRow, nextCol])
          inputRefs.current[nextRow]?.[nextCol]?.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, activeImage, activeInput, page])

  // Handle changing an answer in recall
  const handleInputChange = (globalIdx: number, value: string) => {
    setRecallAnswers((prev) => {
      const newAnswers = [...prev]
      newAnswers[globalIdx] = value
      return newAnswers
    })
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get total correct count for score display
  const getTotalCorrect = () => {
    if (!scoreResult) return 0
    return scoreResult.details.filter((d) => d.isCorrect || d.isPartiallyCorrect).length
  }

  // Determine faces to display on current page
  const totalPages = Math.ceil(TOTAL_FACES / (ROWS * COLS))
  const startIdx = (page - 1) * ROWS * COLS
  const endIdx = startIdx + ROWS * COLS
  const currentFaces = phase === "memorize" ? faces : recallFaces
  const displayFaces = currentFaces.slice(startIdx, endIdx)

  return (
    <div className="p-6 max-w-5xl mx-auto relative"> {/* Adjusted max-w for 5 columns */}
      {/* Countdown Overlay */}
      {phase === "countdown" && (
        <CountdownOverlay message="Get Ready to Recall!" />
      )}
      
      {/* Score Display (Results Phase) */}
      {phase === "results" && scoreResult && (
        <div className="absolute top-0 right-6 bg-white border-2 border-green-600 text-green-700 px-6 py-2 rounded-lg shadow-lg flex items-center align-middle gap-2">
          <span className="text-2xl font-bold flex items-center align-middle">
            🏆 Score: <span className="text-3xl">{Math.max(0, scoreResult.total || 0)}</span>
          </span>
          <span className="text-xl flex items-center align-middle">
            ( <span className="text-xl font-bold">{getTotalCorrect()} </span> correct)
          </span>
        </div>
      )}

      {/* Timer - Positioned absolute top right */}
      {(phase === "memorize" || phase === "recall") && (
        <div className="absolute top-4 right-4">
          <div className="text-md  text-black bg-gray-100 px-3 py-1 rounded-full shadow-sm">
            Time left : {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold ">
          {phase === "memorize" && "Memorize Names and Faces"}
          {phase === "recall" && "Recall Names and Faces"}
          {phase === "results" && "Results"}
        </h2>
      </div>

      {/* 3×5 grid of faces */}
      <div className="grid grid-cols-5 gap-4 mb-6"> {/* Changed from grid-cols-4 */}
        {displayFaces.map((face, i) => {
          const globalIndex = startIdx + i
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const isActive =
            phase === "memorize"
              ? row === activeImage[0] && col === activeImage[1]
              : row === activeInput[0] && col === activeInput[1]

          const userAnswer = recallAnswers[globalIndex] || ""
          const result = phase === "results" && scoreResult ? scoreResult.details[globalIndex] : null

          // Determine styling for results phase
          let containerClass = "bg-white text-black p-2 rounded-xl shadow transition border-2"
          let borderStyle = {}

          if (phase === "results" && result) {
            if (result.isCorrect) {
              containerClass += " border-green-500 bg-green-50"
            } else if (result.isEmpty) {
              containerClass += " border-yellow-500 bg-yellow-50"
            } else {
              containerClass += " border-red-500 bg-red-50"
            }
          } else if (isActive) {
            borderStyle = {
              borderColor: highlightColor,
              boxShadow: `0 0 10px ${highlightColor}`,
            }
          } else {
            containerClass += " border-gray-200"
          }

          return (
            <div key={i} className={containerClass} style={isActive ? borderStyle : {}}>
              <img
                src={face.image || "/placeholder.svg?height=96&width=96&query=person face"}
                alt="face"
                className="w-[130px] h-[115px] object-cover rounded-md mb-2 mx-auto" // Centered the image
              />

              {phase === "memorize" ? (
                <p className="text-center font-medium text-sm">{face.name}</p>
              ) : phase === "recall" ? (
                <input
                  ref={(el) => {
                    const r = Math.floor(i / COLS)
                    const c = i % COLS
                    if (!inputRefs.current[r]) inputRefs.current[r] = []
                    if (el) {
                      inputRefs.current[r][c] = el
                    }
                  }}
                  type="text"
                  placeholder="Enter name"
                  className={clsx("w-full p-2 border rounded-md text-sm", isActive ? "border-2" : "border")}
                  style={isActive ? { borderColor: highlightColor } : {}}
                  value={userAnswer}
                  onChange={(e) => handleInputChange(globalIndex, e.target.value)}
                  onFocus={() => setActiveInput([row, col])}
                  autoComplete="off"
                  spellCheck={false}
                />
              ) : (
                // Results phase
                <div className="text-sm">
                  {result && (
                    <div>
                      {result.isEmpty ? (
                        <div className="bg-yellow-50 p-2 rounded-md border border-yellow-200">
                          <input 
                            type="text" 
                            className="w-full py-1 text-sm bg-yellow-50 border-0 text-yellow-800" 
                            value={result.correctAnswer} 
                            disabled 
                          />
                        </div>
                      ) : result.isCorrect ? (
                        <div className="bg-green-50 p-2 rounded-md border border-green-200">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-1">✓</span>
                            <input 
                              type="text" 
                              className="w-full py-1 text-sm bg-green-50 border-0 text-green-800" 
                              value={result.userAnswer} 
                              disabled 
                            />
                          </div>
                        </div>
                      ) : result.isPartiallyCorrect ? (
                        <div className="bg-white p-2 rounded-md border border-gray-200">
                          <div className="flex items-center space-x-1">
                            <span className="text-green-600">{result.userAnswer}</span>
                            <span className="text-red-600">{result.correctAnswer.split(' ')[1]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-2 rounded-md border border-red-200">
                          <input 
                            type="text" 
                            className="w-full py-1 text-sm bg-red-50 border-0 text-red-800 line-through" 
                            value={result.userAnswer} 
                            disabled 
                          />
                          <div className="text-sm text-red-800 mt-1">
                            {result.correctAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination and controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Page buttons */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="pt-2 px-4 font-medium text-gray-400">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center">
          {phase === "memorize" && (
            <button className="w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleRecall}>
              Recall
            </button>
          )}
          {phase === "recall" && (
            <button className="w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleSubmit}>
              Submit
            </button>
          )}
          {phase === "results" && (
            <button
              onClick={onRestart}
              className="w-[100px] bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}