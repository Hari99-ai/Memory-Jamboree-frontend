import React, { useEffect, useState, useRef, useCallback } from "react"
import { submitPracticeScore } from "../../lib/submitPracticeScore"
import type { DisciplineData } from "../../types/index"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

type Props = {
  paused?: boolean
  time: number
  onRestart: () => void
  config: {
    grouping: number
    drawEvery: number
    highlightColor: string
  }
  disciplineName: string
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
  onRecallPhaseStart?: () => void
}

const generateRandomBinaryDigits = (length: number): number[] =>
  Array.from({ length }, () => Math.floor(Math.random() * 2))

export default function BinaryGame({
  onRestart,
  config,
  disciplineName,
  allDisciplines,
  onGameComplete,
  onRecallPhaseStart,
  paused,
}: Props) {
  const totalRows = 30
  const digitsPerRow = 30
  const totalDigits = totalRows * digitsPerRow
  const rowsPerPage = 10
  const totalPages = Math.ceil(totalRows / rowsPerPage)

  const [phase, setPhase] = useState<"memorize" | "recall" | "done">("memorize")
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [timer, setTimer] = useState(5 * 60) // 5 minutes memorization
  const [digits, setDigits] = useState<number[]>([])
  const [inputs, setInputs] = useState<string[][]>([])
  const [results, setResults] = useState<string[][]>([])
  const [score, setScore] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [activeGroupIndex, setActiveGroupIndex] = useState(0) // New: Global group index
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)

  // Refs for robust timer
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const timeRemainingRef = useRef<number>(5 * 60 * 1000) // 5 minutes in ms

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])

  // Initialize digits and inputs
  useEffect(() => {
    const randoms = generateRandomBinaryDigits(totalDigits)
    setDigits(randoms)
    setActiveCell({ row: 0, col: 0 })
    setActiveGroupIndex(0)
    setInputs(Array.from({ length: totalRows }, () => Array(digitsPerRow).fill("")))
    inputRefs.current = Array.from({ length: totalRows }, () => Array(digitsPerRow).fill(null))
  }, [])

  // Focus first input on recall phase
  useEffect(() => {
    if (phase === "recall") {
      setCurrentPage(0)
      setActiveCell({ row: 0, col: 0 })
      setActiveGroupIndex(0)
      setTimeout(() => {
        inputRefs.current[0]?.[0]?.focus()
      }, 100)
    }
  }, [phase])

  const startTimer = useCallback(
    (durationInSeconds: number) => {
      timeRemainingRef.current = durationInSeconds * 1000
      startTimeRef.current = Date.now()

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        if (paused) {
          startTimeRef.current = Date.now() - (durationInSeconds * 1000 - timeRemainingRef.current)
          return
        }

        const elapsed = Date.now() - startTimeRef.current
        const remaining = timeRemainingRef.current - elapsed

        if (remaining <= 0) {
          setTimer(0)
          if (timerRef.current) clearInterval(timerRef.current)
        } else {
          setTimer(Math.ceil(remaining / 1000))
        }
      }, 100)
    },
    [paused],
  )

  const handleRecallStart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdownStarted(true)

    setTimeout(() => {
      setPhase("recall")
      setCountdownStarted(false)
      startTimer(15 * 60) // 15 minutes for recall

      if (onRecallPhaseStart) {
        onRecallPhaseStart()
      }
    }, 5000)
  }, [onRecallPhaseStart, startTimer])

  // Timer expiration logic
  useEffect(() => {
    if (timer <= 0 && !countdownStarted) {
      if (phase === "memorize") {
        handleRecallStart()
      } else if (phase === "recall") {
        handleSubmit()
      }
    }
  }, [timer, phase, countdownStarted, handleRecallStart])

  // Start initial timer
  useEffect(() => {
    startTimer(5 * 60)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  // Keep activeCell in view when page changes
  useEffect(() => {
    if (activeCell && config) {
      const start = currentPage * rowsPerPage
      const end = start + rowsPerPage
      if (activeCell.row < start || activeCell.row >= end) {
        const newRow = start
        const newCol = 0
        setActiveCell({ row: newRow, col: newCol })
        const globalIndex = newRow * digitsPerRow + newCol
        setActiveGroupIndex(Math.floor(globalIndex / config.grouping))
      }
    }
  }, [currentPage, activeCell, rowsPerPage, config, digitsPerRow])

  // Input change handler with navigation
  const handleInputChange = (r: number, c: number, val: string) => {
    if (!/^[01]?$/.test(val) || !config) return
    const copy = [...inputs]
    copy[r][c] = val
    setInputs(copy)

    const isLastCol = c === digitsPerRow - 1
    const isLastRow = r === totalRows - 1

    if (val) {
      if (!isLastCol) {
        inputRefs.current[r][c + 1]?.focus()
        inputRefs.current[r][c + 1]?.select()
      } else if (!isLastRow) {
        const newRow = r + 1
        const newCol = 0
        inputRefs.current[newRow][newCol]?.focus()
        inputRefs.current[newRow][newCol]?.select()
        setActiveCell({ row: newRow, col: newCol })

        const globalIndex = newRow * digitsPerRow + newCol
        setActiveGroupIndex(Math.floor(globalIndex / config.grouping))

        const nextRowPage = Math.floor(newRow / rowsPerPage)
        if (nextRowPage !== currentPage) {
          setCurrentPage(nextRowPage)
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    const maxCol = digitsPerRow - 1

    const moveFocus = (newRow: number, newCol: number) => {
      setActiveCell({ row: newRow, col: newCol })
      const globalIndex = newRow * digitsPerRow + newCol
      setActiveGroupIndex(Math.floor(globalIndex / (config?.grouping || 1)))
      setTimeout(() => {
        inputRefs.current[newRow]?.[newCol]?.focus()
      }, 50)
    }

    const pageStartRow = currentPage * rowsPerPage
    const pageEndRow = Math.min(totalRows, pageStartRow + rowsPerPage)

    switch (e.key) {
      case "ArrowLeft":
        if (col > 0) {
          moveFocus(row, col - 1)
          setTimeout(() => inputRefs.current[row]?.[col - 1]?.select(), 10)
        } else if (col === 0 && row > pageStartRow) {
          moveFocus(row - 1, digitsPerRow - 1)
          setTimeout(() => inputRefs.current[row - 1]?.[digitsPerRow - 1]?.select(), 10)
        }
        break
      case "ArrowRight":
        if (col < maxCol) moveFocus(row, col + 1)
        else if (col === maxCol && row < pageEndRow - 1) moveFocus(row + 1, 0)
        break
      case "ArrowUp":
        if (row > pageStartRow) moveFocus(row - 1, col)
        break
      case "ArrowDown":
        if (row < pageEndRow - 1) moveFocus(row + 1, col)
        break
      case "Backspace":
        e.preventDefault()
        const copy = [...inputs]
        copy[row][col] = ""
        setInputs(copy)

        if (col > 0) {
          moveFocus(row, col - 1)
        } else if (row > pageStartRow) {
          moveFocus(row - 1, digitsPerRow - 1)
        }
        break
      case "Enter":
        if (row === pageEndRow - 1 && col === maxCol) {
          if (currentPage < totalPages - 1) {
            setCurrentPage((p) => p + 1)
            setTimeout(() => moveFocus((currentPage + 1) * rowsPerPage, 0), 100)
          }
        } else if (col < maxCol) {
          moveFocus(row, col + 1)
        } else if (col === maxCol && row < pageEndRow - 1) {
          moveFocus(row + 1, 0)
        }
        break
    }
  }

  // New: Keyboard navigation for memorize phase with cross-row grouping
  useEffect(() => {
    if (phase !== "memorize" || !config) return

    const totalGroups = Math.ceil(totalDigits / config.grouping)

    const move = (newGroupIndex: number) => {
      if (newGroupIndex < 0 || newGroupIndex >= totalGroups) {
        return // Out of bounds
      }

      setActiveGroupIndex(newGroupIndex)

      const groupStartGlobalIndex = newGroupIndex * config.grouping
      const newRow = Math.floor(groupStartGlobalIndex / digitsPerRow)
      const newCol = groupStartGlobalIndex % digitsPerRow

      setActiveCell({ row: newRow, col: newCol })

      const newPage = Math.floor(newRow / rowsPerPage)
      if (newPage !== currentPage) {
        setCurrentPage(newPage)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          move(activeGroupIndex - 1)
          break
        case "ArrowRight":
          e.preventDefault()
          move(activeGroupIndex + 1)
          break
        case "ArrowUp": {
          e.preventDefault()
          const { row, col } = activeCell
          if (row > 0) {
            const targetGlobalIndex = (row - 1) * digitsPerRow + col
            const newGroupIndex = Math.floor(targetGlobalIndex / config.grouping)
            move(newGroupIndex)
          }
          break
        }
        case "ArrowDown": {
          e.preventDefault()
          const { row, col } = activeCell
          if (row < totalRows - 1) {
            const targetGlobalIndex = (row + 1) * digitsPerRow + col
            const newGroupIndex = Math.floor(targetGlobalIndex / config.grouping)
            move(newGroupIndex)
          }
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    phase,
    activeGroupIndex,
    activeCell,
    config,
    currentPage,
    totalDigits,
    digitsPerRow,
    rowsPerPage,
    totalRows,
  ])

  const handleSubmit = async () => {
    if (phase === "done") return
    if (timerRef.current) clearInterval(timerRef.current)

    const output: string[][] = []
    let finalScore = 0
    let totalCorrect = 0

    for (let r = 0; r < totalRows; r++) {
      const rowResult: string[] = []
      let consecutiveCorrect = 0
      let rowScore = 0

      const firstInput = inputs[r][0]
      const firstActual = digits[r * digitsPerRow].toString()

      if (firstInput === "" || firstInput !== firstActual) {
        for (let c = 0; c < digitsPerRow; c++) {
          const actual = digits[r * digitsPerRow + c].toString()
          const input = inputs[r][c]
          if (input === actual) {
            rowResult.push("correct")
            totalCorrect++
          } else {
            rowResult.push("incorrect")
          }
        }
      } else {
        for (let c = 0; c < digitsPerRow; c++) {
          const actual = digits[r * digitsPerRow + c].toString()
          const input = inputs[r][c]

          if (input === actual) {
            consecutiveCorrect++
            rowResult.push("correct")
            totalCorrect++
            rowScore++

            if (consecutiveCorrect > 0 && consecutiveCorrect % 10 === 0) {
              rowScore++
            }
          } else {
            rowResult.push("incorrect")
            for (let i = c + 1; i < digitsPerRow; i++) {
              const remaining = digits[r * digitsPerRow + i].toString()
              const remainingInput = inputs[r][i]
              if (remainingInput === remaining) {
                totalCorrect++
                rowResult.push("correct")
              } else {
                rowResult.push("incorrect")
              }
            }
            break
          }
        }
      }

      finalScore += rowScore
      output.push(rowResult)
    }

    setResults(output)
    setScore(finalScore)
    setPhase("done")
    setTimer(0)
    setCurrentPage(0)
    setTotalCorrect(totalCorrect)

    if (onGameComplete) {
      onGameComplete(finalScore)
      return
    }

    if (!scoreSubmitted) {
      setScoreSubmitted(true)
      try {
        const userIdString = sessionStorage.getItem("userId")
        const userId = userIdString ? Number.parseInt(userIdString, 10) : undefined

        if (!userId) throw new Error("User ID not found in localStorage")
        if (!allDisciplines || !disciplineName) throw new Error("Discipline data is missing")

        const matchedDiscipline = allDisciplines.find(
          (d) => d.discipline_name === disciplineName && typeof d.disc_id === "number",
        )

        if (!matchedDiscipline) throw new Error(`Discipline not matched: "${disciplineName}"`)

        const postData = {
          user_id: userId,
          disc_id: matchedDiscipline.disc_id!,
          score: finalScore,
        }

        await submitPracticeScore(postData)
      } catch (err) {
        console.error("🚨 Failed to submit score:", err)
        setScoreSubmitted(false)
        alert(`Failed to submit score: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }
  }

  // New: Click handler for global grouping
  const handleBoxClick = (r: number, c: number) => {
    if (!config) return
    const globalIndex = r * digitsPerRow + c
    const groupIndex = Math.floor(globalIndex / config.grouping)
    setActiveGroupIndex(groupIndex)

    const groupStartGlobalIndex = groupIndex * config.grouping
    setActiveCell({
      row: Math.floor(groupStartGlobalIndex / digitsPerRow),
      col: groupStartGlobalIndex % digitsPerRow,
    })

    if (phase === "recall") {
      inputRefs.current[r][c]?.focus()
    }
  }

  const renderGrid = () => {
    if (!config) return null

    const { grouping, drawEvery, highlightColor } = config
    const startRow = currentPage * rowsPerPage
    const endRow = Math.min(startRow + rowsPerPage, totalRows)

    return (
      <div className="space-y-4 w-full max-w-[1600px] mx-auto">
        {Array.from({ length: endRow - startRow }).map((_, rowOffset) => {
          const rowIndex = startRow + rowOffset
          return (
            <div key={rowIndex} className="relative flex items-center">
              <div
                className="w-8 font-semibold text-gray-500 mr-4 -ml-3 text-right select-none flex"
                style={{ minWidth: "1.5rem" }}
              >
                {rowIndex + 1}
              </div>
              <div className="relative w-full">
                {drawEvery > 0 &&
                  phase !== "done" &&
                  Array.from({ length: Math.floor(digitsPerRow / drawEvery) - 1 }).map((_, i) => (
                    <div
                      key={`vline-${i}`}
                      className="absolute top-0 bottom-0 w-[2px] bg-black"
                      style={{
                        left: `${((i + 1) * drawEvery * 100) / digitsPerRow}%`,
                        transform: "translateX(-0.5px)",
                        height: "100%",
                        zIndex: 1,
                      }}
                    />
                  ))}
                <div className="flex space-x-1 relative z-10">
                  {Array.from({ length: digitsPerRow + (phase === "done" ? 1 : 0) }).map((_, colIndex) => {
                    const globalIndex = rowIndex * digitsPerRow + colIndex

                    if (phase === "done" && colIndex === digitsPerRow) {
                      return <div key={`score-${colIndex}`}></div>
                    }

                    const value = phase === "memorize" ? digits[globalIndex] : inputs[rowIndex][colIndex]
                    const globalGroupIndex = Math.floor(globalIndex / grouping)
                    const isGroupHighlighted =
                      (phase === "memorize" || phase === "recall") && globalGroupIndex === activeGroupIndex

                    const result = results?.[rowIndex]?.[colIndex]
                    let background = isGroupHighlighted ? highlightColor : "transparent"
                    let textColor = "black"
                    let border = "1.5px solid #d1d5db"

                    if (phase === "done") {
                      if (inputs[rowIndex][colIndex] === "") {
                        background = "transparent"
                      } else if (result === "correct") {
                        background = "green"
                        textColor = "white"
                        border = "2px solid green"
                      } else {
                        background = "red"
                        textColor = "white"
                        border = "2px solid red"
                      }
                    }

                    return (
                      <React.Fragment key={colIndex}>
                        <div
                          onClick={() => handleBoxClick(rowIndex, colIndex)}
                          className="aspect-square w-[3.5rem] text-center text-lg flex items-center justify-center rounded relative cursor-pointer"
                          style={{ backgroundColor: background, color: textColor, border: border }}
                        >
                          {phase === "memorize" && <span className="font-bold">{value}</span>}
                          {phase === "recall" && (
                            <input
                              ref={(el) => {
                                if (inputRefs.current[rowIndex]) {
                                  inputRefs.current[rowIndex][colIndex] = el
                                }
                              }}
                              value={value}
                              maxLength={1}
                              onClick={() => handleBoxClick(rowIndex, colIndex)}
                              onFocus={() => handleBoxClick(rowIndex, colIndex)}
                              onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                              className="w-full h-full text-center bg-transparent outline-none font-bold"
                              style={{ color: isGroupHighlighted ? "black" : textColor }}
                            />
                          )}
                          {phase === "done" && (
                            <div className="relative w-full h-full flex items-center justify-center">
                              {inputs[rowIndex][colIndex] === "" ? (
                                <div className="absolute inset-0 bg-yellow-200 flex items-center justify-center rounded">
                                  <span className="text-lg font-bold text-black">{digits[globalIndex]}</span>
                                </div>
                              ) : (
                                <>
                                  {inputs[rowIndex][colIndex] !== digits[globalIndex].toString() && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-black font-bold bg-white px-1 rounded-sm shadow-sm">
                                      {digits[globalIndex]}
                                    </div>
                                  )}
                                  <span className="text-lg font-bold">{inputs[rowIndex][colIndex]}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {(colIndex + 1) % 10 === 0 && colIndex !== digitsPerRow - 1 && (
                          <div style={{ width: "0.8rem" }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:opacity-50"
          >
            Prev
          </button>
          <span className="pt-2 px-4 font-medium text-gray-400">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  // Global Enter key handling
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (phase === "memorize" && !countdownStarted) {
          e.preventDefault()
          if (window.confirm("Are you sure you want to move to the Recall phase?")) {
            handleRecallStart()
          }
        } else if (phase === "recall") {
          e.preventDefault()
          if (window.confirm("Are you sure you want to submit your answers?")) {
            handleSubmit()
          }
        }
      }
    }
    window.addEventListener("keydown", handleGlobalEnter)
    return () => window.removeEventListener("keydown", handleGlobalEnter)
  }, [phase, countdownStarted, handleRecallStart, handleSubmit])

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <div className="pr-12 pl-10 pt-16 pb-6 max-w-6xl mx-auto bg-gray-50 rounded-xl space-y-6 relative">
      {countdownStarted && <CountdownOverlay message="Recall starts in..." />}

      <h1 className="text-3xl font-bold text-center text-indigo-700">
        {phase === "memorize" ? "🧠 Memorization Phase" : phase === "recall" ? "📝 Recall Phase" : "✅ Results"}
      </h1>

      {phase !== "done" && !countdownStarted && (
        <div className="text-center text-lg font-semibold text-blue-600">
          Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </div>
      )}

      {renderGrid()}

      {phase === "done" && (
        <div className="absolute top-4 right-6 bg-white border-2 border-green-600 text-green-700 px-6 py-2 rounded-lg shadow-lg flex items-center align-middle gap-2">
          <span className="text-2xl font-bold flex items-center align-middle">
            🏆 Score: <span className="text-4xl">{score}</span>
          </span>
          <span className="text-xl flex items-center align-middle">
            ( <span className="text-2xl font-bold"> {totalCorrect} </span> correct)
          </span>
        </div>
      )}

      {phase === "memorize" && !countdownStarted && (
        <div className="flex justify-center">
          <button
            disabled={timer <= 0}
            onClick={handleRecallStart}
            className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Recall
          </button>
        </div>
      )}

      {phase === "recall" && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to submit?")) {
                handleSubmit()
              }
            }}
            className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="text-center mt-6">
          <button
            onClick={onRestart}
            className="w-[100px] mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}