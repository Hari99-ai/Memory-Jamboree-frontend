/* eslint-disable react-hooks/exhaustive-deps */


import { useEffect, useState, useRef } from "react"
import clsx from "clsx"
import { submitPracticeScore } from "../../lib/submitPracticeScore"
import type { DisciplineData } from "../../types/index"
import CountdownOverlay from "../../practiceTests/CountdownOverlay"

const ROWS = 5
const COLS = 5
const RECALL_DURATION_MINUTES = 15 // Defined recall duration as a constant

interface Props {
  time: number
  highlightColor?: string
  onRestart: () => void
  images: string[] // Make sure this prop is required
  disciplineName: string
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
  onRecallPhaseStart?: () => void
}

// Keep this existing utility function at the top of the file
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ImagesGame({
  onRestart,
  time,
  highlightColor = "#60a5fa",
  images,
  disciplineName,
  allDisciplines,
  onGameComplete,
  onRecallPhaseStart,
}: Props) {
  const [_, setTotalImages] = useState(0)
  const [pages, setPages] = useState(0)

  const [originalImagesByRow, setOriginalImagesByRow] = useState<string[][]>([])
  const [shuffledImagesByRow, setShuffledImagesByRow] = useState<string[][]>([])
  const [showOriginal, setShowOriginal] = useState(true)
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [positionInputs, setPositionInputs] = useState<{ [key: string]: string }>({})
  const [showPopup, setShowPopup] = useState(false)
  const [timeLeft, setTimeLeft] = useState(time * 60)
  const [recallTimeLeft, setRecallTimeLeft] = useState(RECALL_DURATION_MINUTES * 60)
  const recallIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [score, setScore] = useState<{ total: number; rows: number[] } | null>(null)
  const [activeImagePos, setActiveImagePos] = useState<[number, number]>([0, 0]) // [rowIdx, colIdx]
  const [activeRecallPos, setActiveRecallPos] = useState<[number, number]>([0, 0])
  const [resultPage, setResultPage] = useState(0)

  const inputRefs = useRef<HTMLInputElement[][]>([])

  const [, setLocalImages] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("imagesGameImages")
    return stored ? JSON.parse(stored) : images
  })

  // Cleanup effect to clear any running timers when the component unmounts
  useEffect(() => {
    return () => {
      if (recallIntervalRef.current) {
        clearInterval(recallIntervalRef.current)
      }
    }
  }, [])


  // Initial image fetch and game setup
  useEffect(() => {
    if (sessionStorage.getItem("imagesGameImages")) {
      // Already loaded, use stored images
      setLocalImages(JSON.parse(sessionStorage.getItem("imagesGameImages")!))
      ;(async () => {
        await restart()
      })()
      return
    }
    ;(async () => {
      await restart()
      sessionStorage.setItem("imagesGameImages", JSON.stringify(images))
      setLocalImages(images)
    })()
  }, [images])

  // Handle recall start with countdown
  const handleRecallStart = () => {
    setCountdownStarted(true)

    // The shuffledImagesByRow state is already prepared by the restart() function.
    // This function now just handles the UI transition.

    // After 5 seconds, start the recall phase
    setTimeout(() => {
      setShowOriginal(false)
      setCurrentPage(0)
      setRecallTimeLeft(RECALL_DURATION_MINUTES * 60) // Use constant for initial time
      setCountdownStarted(false)

      // Notify parent that recall phase has started
      if (onRecallPhaseStart) {
        onRecallPhaseStart()
      }

      // Set the absolute end time for the recall phase
      const endTime = Date.now() + RECALL_DURATION_MINUTES * 60 * 1000

      // Clear any existing interval before setting a new one
      if (recallIntervalRef.current) clearInterval(recallIntervalRef.current)

      // Recall timer
      recallIntervalRef.current = setInterval(() => {
        const remaining = endTime - Date.now()
        if (remaining <= 0) {
          setRecallTimeLeft(0)
          if (recallIntervalRef.current) {
            clearInterval(recallIntervalRef.current)
          }
        } else {
          setRecallTimeLeft(Math.ceil(remaining / 1000))
        }
      }, 1000)

      // Focus management
      setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 0)
    }, 5000)
  }

  // Original viewing phase timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (showOriginal && !countdownStarted) {
      // Set the target end time based on the current timeLeft state
      const endTime = Date.now() + timeLeft * 1000

      interval = setInterval(() => {
        const remainingMilliseconds = endTime - Date.now()

        if (remainingMilliseconds <= 0) {
          setTimeLeft(0)
          if (interval) clearInterval(interval)
          handleRecallStart() // Automatically transition to recall phase
        } else {
          // Update the UI with the remaining time
          setTimeLeft(Math.ceil(remainingMilliseconds / 1000))
        }
      }, 1000)
    }

    // Cleanup function to clear the interval
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [showOriginal, countdownStarted]) // Reruns only when the memorization phase starts or stops

  // Keyboard navigation between inputs and phase change on Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPopup) return

      if (e.key === "Enter") {
        e.preventDefault()
        // For memorization phase
        if (showOriginal && !countdownStarted) {
          if (window.confirm("Are you sure you want to move to the Recall phase?")) {
            handleRecallStart()
          }
        }
        // For recall phase
        else if (!showOriginal && score === null) {
          if (window.confirm("Are you sure you want to submit your answers?")) {
            if (recallIntervalRef.current) {
              clearInterval(recallIntervalRef.current)
            }
            ;(async () => {
              await handleSubmit()
            })()
          }
        }
        return
      }

      if (showOriginal) {
        const [row, col] = activeImagePos
        const isLastPage = currentPage === pages - 1
        const isLastRow = row === ROWS - 1
        const isLastCol = col === COLS - 1
        const isFirstPage = currentPage === 0
        const isFirstRow = row === 0
        const isFirstCol = col === 0

        switch (e.key) {
          case "ArrowRight":
            if (isLastPage && isLastRow && isLastCol) {
            } else if (col < COLS - 1) {
              setActiveImagePos([row, col + 1])
            } else if (row < ROWS - 1) {
              setActiveImagePos([row + 1, 0])
            } else if (currentPage < pages - 1) {
              setCurrentPage(currentPage + 1)
              setTimeout(() => setActiveImagePos([0, 0]), 0)
            }
            break
          case "ArrowLeft":
            if (isFirstPage && isFirstRow && isFirstCol) {
            } else if (col > 0) {
              setActiveImagePos([row, col - 1])
            } else if (row > 0) {
              setActiveImagePos([row - 1, COLS - 1])
            } else if (currentPage > 0) {
              setCurrentPage(currentPage - 1)
              setTimeout(() => setActiveImagePos([ROWS - 1, COLS - 1]), 0)
            }
            break
          case "ArrowDown":
            if (row < ROWS - 1) {
              setActiveImagePos([row + 1, col])
            }
            break
          case "ArrowUp":
            if (row > 0) {
              setActiveImagePos([row - 1, col])
            }
            break
          default:
            return
        }
        e.preventDefault()
        return
      }

      // Recall phase: input navigation
      const flatRefs = inputRefs.current.flat()
      let activeIndex = flatRefs.findIndex((ref) => ref === document.activeElement)
      if (activeIndex === -1) activeIndex = 0

      const rowCount = ROWS
      const colCount = COLS
      let row = Math.floor(activeIndex / colCount)
      let col = activeIndex % colCount

      switch (e.key) {
        case "ArrowRight":
          if (col + 1 < colCount) {
            col++
          } else if (row + 1 < rowCount) {
            row++
            col = 0
          } else if (currentPage + 1 < pages) {
            setCurrentPage(currentPage + 1)
            setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 0)
            return
          }
          break
        case "ArrowLeft":
          if (col - 1 >= 0) {
            col--
          } else if (row - 1 >= 0) {
            row--
            col = colCount - 1
          } else if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
            setTimeout(() => inputRefs.current[ROWS - 1]?.[COLS - 1]?.focus(), 0)
            return
          }
          break
        case "ArrowDown":
          if (row + 1 < rowCount) {
            row++
          }
          break
        case "ArrowUp":
          if (row - 1 >= 0) {
            row--
          }
          break
        default:
          if (
            e.key === "Backspace" &&
            flatRefs[activeIndex] &&
            flatRefs[activeIndex].value === "" // Only if current input is empty
          ) {
            if (activeIndex > 0) {
              const prevRef = flatRefs[activeIndex - 1]
              prevRef?.focus()
              e.preventDefault()
              return
            }
          }
          return
      }
      e.preventDefault()
      inputRefs.current[row]?.[col]?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    activeImagePos,
    inputRefs,
    showOriginal,
    showPopup,
    currentPage,
    pages,
    score,
    time,
    recallIntervalRef,
    countdownStarted,
  ])

  // Auto-submit when recall timer ends
  useEffect(() => {
    if (!showOriginal && score === null && recallTimeLeft === 0) {
      if (recallIntervalRef.current) {
        clearInterval(recallIntervalRef.current)
      }
      ;(async () => {
        console.log("Recall time finished. Submitting answers...")
        await handleSubmit()
      })()
    }
  }, [recallTimeLeft, showOriginal, score])

  // Restart the game (fetch images, reset state)
  const restart = async () => {
    try {
      // Use prefetched images and shuffle them
      let fetchedImages = shuffleArray(images)
      fetchedImages = shuffleArray(fetchedImages) // Shuffle again

      // Remove duplicates globally
      const uniqueImages = Array.from(new Set(fetchedImages))

      // Calculate how many pages are needed, rounding up
      const imagesPerPage = ROWS * COLS
      const pageCount = Math.ceil(uniqueImages.length / imagesPerPage)
      const selected = uniqueImages

      // Build the grid for all pages by creating a flat list of all rows
      const allRows: string[][] = []
      for (let i = 0; i < selected.length; i += COLS) {
        const row = selected.slice(i, i + COLS)
        // Ensure uniqueness in row (should always be true)
        if (new Set(row).size === row.length) {
          allRows.push(row)
        }
      }

      // Group the flat list of rows into pages
      const pagesArray: string[][][] = []
      for (let i = 0; i < allRows.length; i += ROWS) {
        pagesArray.push(allRows.slice(i, i + ROWS))
      }

      // Shuffle the array of pages to randomize page order for the memorization phase
      const shuffledPagesArray = shuffleArray(pagesArray)

      // Flatten the shuffled pages back into a single array of rows
      const byRows = shuffledPagesArray.flat()

      // Shuffle each individual row for the recall phase
      const shuffledRows = byRows.map((row) => {
        let shuffled: string[] = []
        do {
          shuffled = shuffleArray(row)
        } while (shuffled.join() === row.join()) // Retry if not changed
        return shuffled
      })

      setOriginalImagesByRow(byRows)
      setShuffledImagesByRow(shuffledRows)
      setTotalImages(selected.length)
      setPages(pageCount)
      setShowOriginal(true)
      setPositionInputs({})
      setScore(null)
      setShowPopup(false)
      setTimeLeft(time * 60)
      setRecallTimeLeft(RECALL_DURATION_MINUTES * 60) // Use constant
      setCurrentPage(0)
    } catch (error) {
      console.error("Error loading images:", error)
    }
  }

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  // Handle input of positions (1–5 only)
  const handleInput = (img: string, value: string) => {
    if (/^[1-5]?$/.test(value)) {
      setPositionInputs((prev) => ({ ...prev, [img]: value }))

      if (/^[1-5]$/.test(value)) {
        const flatRefs = inputRefs.current.flat()
        const currentIndex = flatRefs.findIndex((ref) => ref === document.activeElement)

        if (currentIndex === flatRefs.length - 1 && currentPage < pages - 1) {
          setCurrentPage((prev) => prev + 1)
          setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 0)
        } else if (currentIndex < flatRefs.length - 1) {
          flatRefs[currentIndex + 1]?.focus()
        }
      }
    }
  }

  // Submit answers and calculate score
  const handleSubmit = async () => {
    if (recallIntervalRef.current) clearInterval(recallIntervalRef.current)

    let totalScore = 0
    const rowScores: number[] = []

    for (let r = 0; r < originalImagesByRow.length; r++) {
      const originalRow = originalImagesByRow[r]
      const recallRow = shuffledImagesByRow[r]
      let rowCorrect = 0
      let rowFilled = 0

      for (let c = 0; c < recallRow.length; c++) {
        const img = recallRow[c]
        const userInput = Number.parseInt(positionInputs[img], 10)

        if (userInput && !isNaN(userInput)) {
          rowFilled++
          if (originalRow[userInput - 1] === img) {
            rowCorrect++
          }
        }
      }

      let rowScore = 0
      if (rowCorrect === originalRow.length) {
        rowScore = originalRow.length
      } else if (rowFilled === 0) {
        rowScore = 0
      } else {
        rowScore = -1
      }

      rowScores.push(rowScore)
      totalScore += rowScore
    }

    const finalScore = {
      total: Math.max(0, totalScore),
      rows: rowScores,
    }

    setScore(finalScore)
    setShowPopup(true)
    setCurrentPage(0) // Go to first page for results

    if (onGameComplete) {
      onGameComplete(finalScore.total)
      return
    }

    try {
      const userIdString = sessionStorage.getItem("userId")
      const userId = userIdString ? Number.parseInt(userIdString, 10) : undefined

      if (!userId) {
        console.warn("❌ Missing or invalid userId")
        return
      }

      if (!Array.isArray(allDisciplines)) {
        console.warn("❌ allDisciplines is not a valid array:", allDisciplines)
        return
      }

      const matchedDiscipline = allDisciplines.find(
        (d) =>
          d?.discipline_name?.trim().toLowerCase() === disciplineName.trim().toLowerCase() &&
          typeof d?.disc_id === "number",
      )

      if (!matchedDiscipline) {
        console.warn("❌ No matching discipline found:", {
          disciplineName,
          allDisciplines,
        })
        return
      }

      const postData = {
        user_id: userId,
        disc_id: matchedDiscipline.disc_id as number,
        score: finalScore.total,
      }

      console.log("📤 Submitting ImageGame score:", postData)
      await submitPracticeScore(postData)
      console.log("✅ ImageGame score submitted successfully!")
    } catch (err) {
      console.error("🚨 Failed to submit ImageGame score:", err)
    }
  }

  // Helper to count total correct answers
  const getTotalCorrect = () => {
    if (!score) return 0
    let correct = 0
    for (let r = 0; r < originalImagesByRow.length; r++) {
      const originalRow = originalImagesByRow[r]
      const recallRow = shuffledImagesByRow[r]
      for (let c = 0; c < recallRow.length; c++) {
        const img = recallRow[c]
        const userInput = Number.parseInt(positionInputs[img], 10)
        if (userInput && !isNaN(userInput) && originalRow[userInput - 1] === img) {
          correct++
        }
      }
    }
    return correct
  }

  // Reset resultPage when showing popup
  useEffect(() => {
    if (showPopup) setResultPage(0)
  }, [showPopup])

  // Pagination Logic
  const renderPagination = (isResult = false) => {
    const page = isResult ? resultPage : currentPage
    const setPage = isResult ? setResultPage : setCurrentPage
    const totalPages = pages

    if (totalPages <= 1) {
      return null
    }

    return (
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="pt-2 px-4 font-medium text-gray-900">
          Page {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center relative w-[900px] mx-auto">
      {countdownStarted && <CountdownOverlay message="Recall Phase starts in..." />}

      <h2 className="text-3xl font-bold mb-4 text-black">🧠 5-Minute Images</h2>

      <p className="text-lg text-gray-900 mb-4">
        {showOriginal && !countdownStarted
          ? `Memorize the following images (${formatTime(timeLeft)})`
          : !showOriginal && !showPopup
            ? `Enter the position (1–5) for each image as you remember (${formatTime(recallTimeLeft)})`
            : ""}
      </p>

      <div className="space-y-4">
        {(showOriginal ? originalImagesByRow : shuffledImagesByRow)
          .slice(currentPage * ROWS, currentPage * ROWS + ROWS)
          .map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-6">
              <div className="text-gray-900 w-6 mr-2 font-bold text-right">{rowIdx + 1 + currentPage * ROWS}</div>
              {row.map((img, colIdx) => {
                const inputVal = positionInputs[img]
                const correctRow = originalImagesByRow[currentPage * ROWS + rowIdx]
                const isCorrect =
                  score !== null &&
                  Number.parseInt(inputVal) - 1 >= 0 &&
                  correctRow[Number.parseInt(inputVal) - 1] === img
                const isWrong = score !== null && inputVal && !isCorrect

                return (
                  <div key={colIdx} className="relative flex flex-row items-center w-16 sm:w-24">
                    {!showOriginal && score === null && (
                      <input
                        ref={(el) => {
                          if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = []
                          inputRefs.current[rowIdx][colIdx] = el!
                        }}
                        value={inputVal || ""}
                        onChange={(e) => handleInput(img, e.target.value)}
                        onFocus={() => setActiveRecallPos([rowIdx, colIdx])}
                        maxLength={1}
                        className={clsx(
                          "mt-1 w-8 h-8 text-xs text-center font-semibold rounded-sm bg-white border-2  focus:outline-none",
                          isCorrect
                            ? "border-green-500 text-green-800"
                            : isWrong
                              ? "border-red-500 text-red-800"
                              : "border-gray-400 text-black focus:border-blue-500",
                        )}
                      />
                    )}
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`img-${rowIdx}-${colIdx}`}
                      onClick={() => {
                        if (showOriginal) {
                          setActiveImagePos([rowIdx, colIdx])
                        }
                      }}
                      className={clsx(
                        "w-20 h-20 object-cover rounded-xl shadow-md transition-transform duration-200 cursor-pointer",
                        positionInputs[img] ? "scale-105" : "hover:scale-105",
                      )}
                      style={{
                        border: `3px solid ${
                          showOriginal
                            ? activeImagePos[0] === rowIdx && activeImagePos[1] === colIdx
                              ? highlightColor
                              : "transparent"
                            : score === null
                              ? activeRecallPos[0] === rowIdx && activeRecallPos[1] === colIdx
                                ? highlightColor
                                : positionInputs[img]
                                  ? isCorrect
                                    ? "green"
                                    : isWrong
                                      ? "red"
                                      : highlightColor
                                  : "transparent"
                              : isCorrect
                                ? "green"
                                : isWrong
                                  ? "red"
                                  : "yellow"
                        }`,
                        boxShadow: (
                          showOriginal
                            ? activeImagePos[0] === rowIdx && activeImagePos[1] === colIdx
                            : score === null
                              ? activeRecallPos[0] === rowIdx && activeRecallPos[1] === colIdx
                              : false
                        )
                          ? `0 0 20px 0.5px ${highlightColor}`
                          : "none",
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
      </div>

      {renderPagination()}

      {!showOriginal && score === null && (
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to submit your answers?")) {
              handleSubmit()
            }
          }}
          className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      )}

      {showOriginal && !countdownStarted && (
        <button
          onClick={handleRecallStart}
          className={clsx(
            "w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700",
            timeLeft > 50000 && "cursor-not-allowed opacity-50",
          )}
          disabled={timeLeft > 50000}
        >
          Recall
        </button>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 z-50 flex flex-col items-center justify-start p-4 sm:p-8 overflow-auto">
          <div className="bg-white  border-2 border-green-600 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-4 mr-12 sm:absolute sm:top-4 sm:right-6">
            <span className="text-2xl font-bold flex items-center">
              🏆 Score: <span className="text-4xl">{Math.max(0, score?.total || 0)}</span>
            </span>
            <span className="text-xl flex items-center">
              ( <span className="text-2xl font-bold">{getTotalCorrect()}</span> correct)
            </span>
          </div>

          <div className="flex flex-col items-center justify-center mt-16 bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex flex-col items-center justify-center space-y-4 w-full">
              {shuffledImagesByRow.slice(resultPage * ROWS, resultPage * ROWS + ROWS).map((row, rowIdx) => {
                const globalRowIdx = resultPage * ROWS + rowIdx
                const originalRow = originalImagesByRow[globalRowIdx]

                return (
                  <div key={globalRowIdx} className="flex items-center gap-6">
                    <div className="text-black w-6 mr-2 font-bold text-right">{globalRowIdx + 1}</div>
                    {row.map((img, colIdx) => {
                      const userInput = positionInputs[img]
                      const userInputNum = Number.parseInt(userInput, 10)

                      const isCorrect =
                        !isNaN(userInputNum) &&
                        userInputNum >= 1 &&
                        userInputNum <= originalRow.length &&
                        originalRow[userInputNum - 1] === img

                      const isWrong = userInput && !isCorrect
                      const isEmpty = !userInput

                      return (
                        <div key={colIdx} className="flex flex-row items-center gap-2 w-28 sm:w-32">
                          <div className="-mr-2">
                            {isCorrect && (
                              <span className="inline-block w-8 h-8 rounded bg-green-500 text-white font-bold text-center leading-8 border-2 border-green-700 shadow text-base">
                                {userInput}
                              </span>
                            )}
                            {isWrong && (
                              <div className="flex flex-col items-center space-x-1 ">
                                <span className=" w-8 h-8 rounded bg-red-500 text-white font-bold text-center leading-8 border-2 border-red-700 shadow text-base relative ">
                                  <span
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                    style={{ textDecoration: "line-through" }}
                                  >
                                    {userInput}
                                  </span>
                                </span>
                                <span className="text-black font-sm">{originalRow.indexOf(img) + 1}</span>
                              </div>
                            )}
                            {isEmpty && (
                              <span className="inline-block w-8 h-8 rounded bg-yellow-400 text-black font-bold text-center leading-8 border-2 border-yellow-600 shadow text-base">
                                {originalRow.indexOf(img) + 1}
                              </span>
                            )}
                          </div>
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`result-img-${globalRowIdx}-${colIdx}`}
                            className="w-20 h-20 object-cover rounded-xl shadow-md"
                            style={{
                              border: `4px solid ${isCorrect ? "green" : isWrong ? "red" : "yellow"}`,
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="mt-8">{renderPagination(true)}</div>

            <div className="flex justify-center mt-4">
              <button
                onClick={onRestart}
                className="w-[100px] bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div style={{ display: "none" }}>
          {images.map((src, i) => (
            <img key={i} src={src || "/placeholder.svg"} alt="" />
          ))}
        </div>
      )}
    </div>
  )
}