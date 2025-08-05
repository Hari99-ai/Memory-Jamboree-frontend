"use client"

import React, { useEffect, useState, useRef } from "react"
import { submitPracticeScore } from "../../lib/submitPracticeScore"
import type { DisciplineData } from "../../types/index"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

type Props = {
  paused?:boolean
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
}

const generateRandomBinaryDigits = (length: number): number[] =>
  Array.from({ length }, () => Math.floor(Math.random() * 2))

export default function BinaryGame({ onRestart, config, disciplineName, allDisciplines, onGameComplete , paused }: Props) {
  const totalRows = 30
  const digitsPerRow = 30
  const totalDigits = totalRows * digitsPerRow
  const rowsPerPage = 10
  const totalPages = Math.ceil(totalRows / rowsPerPage)

  const [phase, setPhase] = useState<"memorize" | "recall" | "done">("memorize")
  const [countdownStarted, setCountdownStarted] = useState(false)
  // Binary game: 5 min memorize, 10 min recall
  const [timer, setTimer] = useState(5 * 60) // 5 minutes memorization
  const [digits, setDigits] = useState<number[]>([])
  const [inputs, setInputs] = useState<string[][]>([])
  const [results, setResults] = useState<string[][]>([])
  const [score, setScore] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightGroup, setHighlightGroup] = useState<{ row: number; group: number }>({ row: 0, group: 0 })
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])

  // Initialize digits and inputs
  useEffect(() => {
    const randoms = generateRandomBinaryDigits(totalDigits)
    setDigits(randoms)
    setActiveCell({ row: 0, col: 0 })
    setHighlightGroup({ row: 0, group: 0 })
    setInputs(Array.from({ length: totalRows }, () => Array(digitsPerRow).fill("")))
    inputRefs.current = Array.from({ length: totalRows }, () => Array(digitsPerRow).fill(null))
  }, [])

  // Focus first input on recall phase
  useEffect(() => {
    if (phase === "recall") {
      setCurrentPage(0)
      setActiveCell({ row: 0, col: 0 })
      setHighlightGroup({ row: 0, group: 0 })
      setTimeout(() => {
        inputRefs.current[0]?.[0]?.focus()
      }, 100)
    }
  }, [phase])

  // Handle recall start with countdown
  const handleRecallStart = () => {
    setCountdownStarted(true)

    // After 5 seconds, start the recall phase
    setTimeout(() => {
      setPhase("recall")
      setTimer(10 * 60) // 10 minutes for recall
      setCountdownStarted(false)
    }, 5000)
  }

  // Timer logic
  useEffect(() => {
    if(paused) return
    if (timer > 0 && !countdownStarted) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    } else {
      if (phase === "memorize" && !countdownStarted) {
        handleRecallStart()
      } else if (phase === "recall") {
        handleSubmit()
      }
    }
  }, [timer, phase, countdownStarted , paused])

  // Keep activeCell in view when page changes
  useEffect(() => {
    if (activeCell) {
      const start = currentPage * rowsPerPage
      const end = start + rowsPerPage
      if (activeCell.row < start || activeCell.row >= end) {
        setActiveCell({ row: start, col: 0 })
        setHighlightGroup({ row: start, group: 0 })
      }
    }
  }, [currentPage])

  // Input change handler with navigation
  const handleInputChange = (r: number, c: number, val: string) => {
    if (!/^[01]?$/.test(val)) return
    const copy = [...inputs]
    copy[r][c] = val
    setInputs(copy)

    const isLastCol = c === digitsPerRow - 1
    const isLastRow = r === totalRows - 1

    if (val) {
      if (!isLastCol) {
        // Move to next column in same row
        inputRefs.current[r][c + 1]?.focus()
        inputRefs.current[r][c + 1]?.select()
      } else if (!isLastRow) {
        // Move to first column of next row
        inputRefs.current[r + 1][0]?.focus()
        inputRefs.current[r + 1][0]?.select()
        setActiveCell({ row: r + 1, col: 0 })
        setHighlightGroup({ row: r + 1, group: 0 })

        // Handle page switch if next row is on next page
        const nextRowPage = Math.floor((r + 1) / rowsPerPage)
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
      setHighlightGroup({ row: newRow, group: Math.floor(newCol / (config?.grouping || 1)) })
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
          setTimeout(() => {
            inputRefs.current[row]?.[col - 1]?.select()
          }, 10)
        } else if (col === 0 && row > pageStartRow) {
          moveFocus(row - 1, digitsPerRow - 1)
          setTimeout(() => {
            inputRefs.current[row - 1]?.[digitsPerRow - 1]?.select()
          }, 10)
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
        if (inputs[row][col] === "" && col > 0) {
          moveFocus(row, col - 1)
        }
        break
      case "Enter":
        if (row === pageEndRow - 1 && col === maxCol) {
          if (currentPage < totalPages - 1) {
            setCurrentPage((p) => p + 1)
            setTimeout(() => {
              moveFocus((currentPage + 1) * rowsPerPage, 0)
            }, 100)
          }
        } else if (col < maxCol) {
          moveFocus(row, col + 1)
        } else if (col === maxCol && row < pageEndRow - 1) {
          moveFocus(row + 1, 0)
        }
        break
    }
  }

  // Keyboard navigation for memorize phase
  useEffect(() => {
    if (phase !== "memorize" || !config) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return

      const { row, col } = activeCell
      const maxCol = digitsPerRow - 1
      const groupSize = config.grouping || 1
      const pageStartRow = currentPage * rowsPerPage
      const pageEndRow = Math.min(totalRows, pageStartRow + rowsPerPage)
      const lastGroupInRow = Math.floor((digitsPerRow - 1) / groupSize)
      const currentGroup = Math.floor(col / groupSize)

      const move = (r: number, c: number) => {
        setActiveCell({ row: r, col: c })
        setHighlightGroup({ row: r, group: Math.floor(c / groupSize) })
      }

      switch (e.key) {
        case "ArrowLeft": {
          if (currentGroup > 0) {
            move(row, (currentGroup - 1) * groupSize)
          } else if (row > pageStartRow) {
            move(row - 1, lastGroupInRow * groupSize)
          } else if (row === pageStartRow && currentPage > 0) {
            const newPage = currentPage - 1
            setCurrentPage(newPage)
            setTimeout(() => {
              const newRow = Math.min((newPage + 1) * rowsPerPage, totalRows) - 1
              setActiveCell({ row: newRow, col: lastGroupInRow * groupSize })
              setHighlightGroup({ row: newRow, group: lastGroupInRow })
            }, 50)
          }
          break
        }
        case "ArrowRight": {
          if (currentGroup < lastGroupInRow) {
            move(row, Math.min((currentGroup + 1) * groupSize, maxCol))
          } else if (row < pageEndRow - 1) {
            move(row + 1, 0)
          } else if (row === pageEndRow - 1 && currentGroup === lastGroupInRow) {
            if (currentPage < totalPages - 1) {
              const newPage = currentPage + 1
              setCurrentPage(newPage)
              setTimeout(() => {
                const newRow = newPage * rowsPerPage
                setActiveCell({ row: newRow, col: 0 })
                setHighlightGroup({ row: newRow, group: 0 })
              }, 50)
            }
          }
          break
        }
        case "ArrowUp": {
          if (row > pageStartRow) {
            move(row - 1, Math.min(currentGroup * groupSize, maxCol))
          }
          break
        }
        case "ArrowDown": {
          if (row < pageEndRow - 1) {
            move(row + 1, Math.min(currentGroup * groupSize, maxCol))
          }
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeCell, phase, config, currentPage, rowsPerPage, totalPages, totalRows, digitsPerRow])

  // Handle submit with same scoring logic as NumbersGame
  const handleSubmit = async () => {
    const output: string[][] = []
    let finalScore = 0
    let totalCorrect = 0

    for (let r = 0; r < totalRows; r++) {
      const rowResult: string[] = []
      let consecutiveCorrect = 0
      let rowScore = 0

      // Check if first box is empty or incorrect
      const firstInput = inputs[r][0]
      const firstActual = digits[r * digitsPerRow].toString()

      if (firstInput === "" || firstInput !== firstActual) {
        // Mark entire row as incorrect but still identify correct/incorrect answers
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
        // Row score remains 0
      } else {
        // First box is correct, count consecutive correct answers
        for (let c = 0; c < digitsPerRow; c++) {
          const actual = digits[r * digitsPerRow + c].toString()
          const input = inputs[r][c]

          if (input === actual) {
            consecutiveCorrect++
            rowResult.push("correct")
            totalCorrect++
            rowScore++

            // Add bonus point for every 10 consecutive correct answers
            if (consecutiveCorrect % 10 === 0) {
              rowScore++
            }
          } else {
            // Stop counting score at first incorrect answer
            rowResult.push("incorrect")
            // Fill remaining cells without adding to score
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

    // Call onGameComplete if provided (for event games)
    if (onGameComplete) {
      onGameComplete(finalScore)
      return // Don't submit practice score for event games
    }

    // Submit score to backend only for practice games
    if (!scoreSubmitted) {
      setScoreSubmitted(true)
      try {
        const userIdString = sessionStorage.getItem("userId")
        const userId = userIdString ? Number.parseInt(userIdString, 10) : undefined

        if (!userId) {
          console.error("❌ User ID not found in localStorage")
          throw new Error("User ID not found in localStorage")
        }

        if (!allDisciplines || !disciplineName) {
          console.error("❌ Discipline data is missing:", { allDisciplines, disciplineName })
          throw new Error("Discipline data is missing")
        }

        console.log("🔍 Looking for discipline:", disciplineName)
        console.log(
          "📋 Available disciplines:",
          allDisciplines.map((d) => ({ name: d.discipline_name, id: d.disc_id })),
        )

        const matchedDiscipline = allDisciplines.find(
          (d) => d.discipline_name === disciplineName && typeof d.disc_id === "number",
        )

        if (!matchedDiscipline) {
          console.error(`❌ Discipline not matched: "${disciplineName}"`)
          console.error(
            "Available disciplines:",
            allDisciplines.map((d) => d.discipline_name),
          )
          throw new Error(`Discipline not matched: "${disciplineName}"`)
        }

        const postData = {
          user_id: userId,
          disc_id: matchedDiscipline.disc_id!,
          score: finalScore,
        }

        console.log("📤 Sending score to API:", postData)
        await submitPracticeScore(postData)
        console.log("✅ Score submitted successfully!")
      } catch (err) {
        console.error("🚨 Failed to submit score:", err)
        setScoreSubmitted(false) // Allow retry
        // Show user-friendly error message
        alert(`Failed to submit score: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }
  }

  // Click to set group highlight and active cell
  const handleBoxClick = (r: number, c: number) => {
    setActiveCell({ row: r, col: c })
    setHighlightGroup({ row: r, group: Math.floor(c / (config?.grouping || 1)) })
    if (phase === "recall") {
      inputRefs.current[r][c]?.focus()
    }
  }

  // Render grid with exact same design as NumbersGame
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

                    // Score cell at end of row
                    if (phase === "done" && colIndex === digitsPerRow) {
                      return <div key={`score-${colIndex}`}></div>
                    }

                    const groupIndex = Math.floor(colIndex / grouping)
                    const value = phase === "memorize" ? digits[globalIndex] : inputs[rowIndex][colIndex]

                    // Group highlight logic
                    const isGroupHighlighted =
                      (phase === "memorize" || phase === "recall") &&
                      highlightGroup.row === rowIndex &&
                      highlightGroup.group === groupIndex

                    const result = results?.[rowIndex]?.[colIndex]
                    let background = "transparent"
                    let textColor = "black"
                    let border = "1.5px solid #d1d5db"

                    if (isGroupHighlighted) {
                      background = highlightColor
                      textColor = "black"
                    }

                    if (phase === "done") {
                      if (inputs[rowIndex][colIndex] === "") {
                        background = "transparent"
                        textColor = "black"
                        border = "1.5px solid #d1d5db"
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
                                inputRefs.current[rowIndex][colIndex] = el
                              }}
                              value={value}
                              maxLength={1}
                              onClick={() => handleBoxClick(rowIndex, colIndex)}
                              onFocus={() => handleBoxClick(rowIndex, colIndex)}
                              onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                              className="w-full h-full text-center bg-transparent outline-none font-bold"
                              style={{ color: textColor }}
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
                        {/* Double space after every 10th column */}
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
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white"
          >
            Prev
          </button>
          <span className="pt-2 px-4 font-medium text-gray-400">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white"
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
  }, [phase, countdownStarted])

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <div className="pr-12 pl-10 pt-16 pb-6 max-w-6xl mx-auto bg-gray-50 rounded-xl space-y-6 relative">
      {countdownStarted && <CountdownOverlay message="Memorization starts in .."/>}

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
            className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
