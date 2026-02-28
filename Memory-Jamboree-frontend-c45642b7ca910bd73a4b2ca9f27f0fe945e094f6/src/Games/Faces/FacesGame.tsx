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

// Updated recall answer structure
interface RecallAnswer {
  firstName: string
  lastName: string
}

interface ScoreDetail {
  userAnswer: RecallAnswer
  correctAnswer: { firstName: string; lastName: string }
  points: number
  isCorrect: boolean // Both names are correct
  isFirstNameCorrect: boolean
  isLastNameCorrect: boolean
  isEmpty: boolean
}

interface ScoreResult {
  total: number
  details: ScoreDetail[]
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
  const COLS = 5
  const TOTAL_FACES = 60

  const [faces, setFaces] = useState<Face[]>([])
  const [recallFaces, setRecallFaces] = useState<Face[]>([])
  const [phase, setPhase] = useState<"memorize" | "countdown" | "recall" | "results">("memorize")
  const [page, setPage] = useState(1)
  const [activeImage, setActiveImage] = useState<[number, number]>([0, 0])
  const [activeInput, setActiveInput] = useState<[number, number]>([0, 0])
  const [recallAnswers, setRecallAnswers] = useState<RecallAnswer[]>([])
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});


  // Refs for first name inputs to manage focus
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const facesData = generateFacesData(TOTAL_FACES)
    setFaces(facesData)
    setRecallAnswers(Array(TOTAL_FACES).fill({ firstName: "", lastName: "" }))

    // Preload and cache images to local storage
    const preloadAndCacheImages = async (facesToCache: Face[]) => {
      const cache: Record<string, string> = {};
      const promises = facesToCache.map(async (face) => {
        const storageKey = `face-image-${face.image}`;
        try {
          const cachedImage = localStorage.getItem(storageKey);
          if (cachedImage) {
            cache[face.image] = cachedImage;
          } else {
            const response = await fetch(face.image);
            const blob = await response.blob();
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            localStorage.setItem(storageKey, dataUrl);
            cache[face.image] = dataUrl;
          }
        } catch (error) {
          console.error(`Failed to cache image: ${face.image}`, error);
        }
      });
      await Promise.all(promises);
      setCachedImages(cache);
    };

    preloadAndCacheImages(facesData);
  }, [])

  // Scoring Logic
  const calculateScore = (faces: Face[], answers: RecallAnswer[]): ScoreResult => {
    let totalScore = 0
    const details = faces.map((face, idx) => {
      const userAnswer = answers[idx] || { firstName: "", lastName: "" }
      const userFirstName = userAnswer.firstName.trim().toLowerCase()
      const userLastName = userAnswer.lastName.trim().toLowerCase()

      const correctFirstName = face.firstName.toLowerCase()
      const correctLastName = face.lastName.toLowerCase()

      const isEmpty = userFirstName === "" && userLastName === ""
      if (isEmpty) {
        return {
          userAnswer,
          correctAnswer: { firstName: face.firstName, lastName: face.lastName },
          points: 0,
          isCorrect: false,
          isFirstNameCorrect: false,
          isLastNameCorrect: false,
          isEmpty: true,
        }
      }

      const isFirstNameCorrect = userFirstName === correctFirstName
      const isLastNameCorrect = userLastName === correctLastName

      let points = 0
      if (isFirstNameCorrect) points++
      if (isLastNameCorrect) points++

      totalScore += points

      return {
        userAnswer,
        correctAnswer: { firstName: face.firstName, lastName: face.lastName },
        points,
        isCorrect: isFirstNameCorrect && isLastNameCorrect,
        isFirstNameCorrect,
        isLastNameCorrect,
        isEmpty: false,
      }
    })

    return { total: totalScore, details }
  }

  const handleSubmit = useCallback(async () => {
    if (phase === "recall" && !confirm("Are you sure you want to submit your answers?")) {
      return
    }
    const result = calculateScore(recallFaces, recallAnswers)
    setScoreResult(result)
    setPhase("results")
    setPage(1) // Reset to page 1
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top

    if (onGameComplete) {
      onGameComplete(result.total)
      return
    }

    try {
      const userIdString = sessionStorage.getItem("userId")
      const userId = userIdString ? Number.parseInt(userIdString, 10) : undefined

      const matchedDiscipline = allDisciplines.find((d) => d.discipline_name === disciplineName)

      if (userId && matchedDiscipline?.disc_id) {
        const postData = {
          user_id: userId,
          disc_id: matchedDiscipline.disc_id,
          score: result.total,
        }
        await submitPracticeScore(postData)
      }
    } catch (err) {
      console.error("🚨 Failed to submit score:", err)
    }
  }, [phase, recallFaces, recallAnswers, onGameComplete, allDisciplines, disciplineName, calculateScore])

  const handleRecall = useCallback(() => {
    setPhase("countdown")
    const shuffled = [...faces].sort(() => Math.random() - 0.5)
    setRecallFaces(shuffled)

    setTimeout(() => {
      setPhase("recall")
      onRecallPhaseStart?.()
    }, 5000)
  }, [faces, onRecallPhaseStart])
  
  // Timer Logic
  useEffect(() => {
      if (phase === "memorize") {
          const duration = 5 * 60;
          setTimeLeft(duration);
          setEndTime(Date.now() + duration * 1000);
      } else if (phase === "recall") {
          const duration = 15 * 60;
          setTimeLeft(duration);
          setEndTime(Date.now() + duration * 1000);
      } else {
          setEndTime(null);
      }
    }, [phase]);
  
    useEffect(() => {
    if (!endTime || (phase !== "memorize" && phase !== "recall")) {
      return;
    }
  
    const timerTick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const remainingSeconds = Math.round(remaining / 1000);
      setTimeLeft(remainingSeconds);
  
      if (remaining <= 0) {
        if (phase === "memorize") handleRecall();
        else if (phase === "recall") handleSubmit();
      }
    };
  
    countdownRef.current = setInterval(timerTick, 1000);
  
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [phase, endTime, handleRecall, handleSubmit]);

  useEffect(() => {
    if (phase === "recall") {
      setPage(1)
      setActiveInput([0, 0])
      setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 100)
    }
  }, [phase])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (phase === "results") return;

        const totalPages = Math.ceil(TOTAL_FACES / (ROWS * COLS));
  
        const navigate = (updateFunc: (prevPage: number) => number, newActive: [number, number]) => {
          setPage(updateFunc);
          setTimeout(() => {
            if (phase === "memorize") setActiveImage(newActive);
            if (phase === "recall") {
              setActiveInput(newActive);
              inputRefs.current[newActive[0]]?.[newActive[1]]?.focus();
            }
          }, 0);
        };
  
        let [row, col] = phase === "memorize" ? activeImage : activeInput;
  
        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            if (col < COLS - 1) {
              col++;
            } else if (row < ROWS - 1) {
              row++;
              col = 0;
            } else if (page < totalPages) {
              navigate(p => p + 1, [0, 0]);
              return;
            }
            break;
          case "ArrowLeft":
            e.preventDefault();
            if (col > 0) {
              col--;
            } else if (row > 0) {
              row--;
              col = COLS - 1;
            } else if (page > 1) {
              navigate(p => p - 1, [ROWS - 1, COLS - 1]);
              return;
            }
            break;
          case "ArrowDown":
            e.preventDefault();
            if (row < ROWS - 1) {
              row++;
            } else if (page < totalPages) {
              navigate(p => p + 1, [0, col]);
              return;
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (row > 0) {
              row--;
            } else if (page > 1) {
              navigate(p => p - 1, [ROWS - 1, col]);
              return;
            }
            break;
          default:
            return;
        }
  
        if (phase === "memorize") setActiveImage([row, col]);
        if (phase === "recall") {
          setActiveInput([row, col]);
          inputRefs.current[row]?.[col]?.focus();
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, activeImage, activeInput, page]);


  const handleInputChange = (globalIdx: number, field: "firstName" | "lastName", value: string) => {
    setRecallAnswers((prev) => {
      const newAnswers = [...prev]
      newAnswers[globalIdx] = { ...newAnswers[globalIdx], [field]: value }
      return newAnswers
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    // Clear image cache from local storage
    faces.forEach(face => {
      const storageKey = `face-image-${face.image}`;
      localStorage.removeItem(storageKey);
    });
    onRestart(); // Call the original handler
  };

  const totalPages = Math.ceil(TOTAL_FACES / (ROWS * COLS))
  const startIdx = (page - 1) * ROWS * COLS
  const endIdx = startIdx + ROWS * COLS
  const currentFaces = phase === "memorize" ? faces : recallFaces
  const displayFaces = currentFaces.slice(startIdx, endIdx)

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      {phase === "countdown" && <CountdownOverlay message="Get Ready to Recall!" />}
      
      {phase === "results" && scoreResult && (
        <div className="absolute top-0 right-6 bg-white border-2 border-green-600 text-green-700 px-6 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-2xl font-bold">
            🏆 Score: <span className="text-3xl">{Math.max(0, scoreResult.total || 0)}</span>
          </span>
        </div>
      )}

      {(phase === "memorize" || phase === "recall") && (
        <div className="absolute top-4 right-4 text-md text-black bg-gray-100 px-3 py-1 rounded-full shadow-sm">
          Time left : {formatTime(timeLeft)}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold">
          {phase === "memorize" && "Memorize Names and Faces"}
          {phase === "recall" && "Recall Names and Faces"}
          {phase === "results" && "Results"}
        </h2>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {displayFaces.map((face, i) => {
          const globalIndex = startIdx + i
          const row = Math.floor(i / COLS)
          const col = i % COLS
          const isActive = phase === "memorize" ? row === activeImage[0] && col === activeImage[1] : row === activeInput[0] && col === activeInput[1]
          const result = phase === "results" && scoreResult ? scoreResult.details[globalIndex] : null

          let containerClass = "bg-white text-black p-2 rounded-xl shadow transition border-2"
          if (phase === "results" && result) {
            if (result.isCorrect) containerClass += " border-green-500 bg-green-50"
            else if (result.isEmpty) containerClass += " border-yellow-500 bg-yellow-50"
            else containerClass += " border-red-500 bg-red-50"
          } else {
            containerClass += isActive ? "" : " border-gray-200"
          }

          return (
            <div key={i} className={containerClass} style={isActive && phase !== 'results' ? { borderColor: highlightColor, boxShadow: `0 0 10px ${highlightColor}` } : {}}>
              <img src={cachedImages[face.image] || face.image} alt="face" className="w-[130px] h-[115px] object-cover rounded-md mb-2 mx-auto" />

              {phase === "memorize" && <p className="text-center font-medium text-sm">{face.name}</p>}
              
              {phase === "recall" && (
                <div className="flex flex-col gap-1">
                  <input
                    ref={(el) => {
                      if (!inputRefs.current[row]) inputRefs.current[row] = [];
                      if (el) inputRefs.current[row][col] = el;
                    }}
                    type="text"
                    placeholder="First name"
                    className={clsx("w-full p-1.5 border rounded-md text-sm", isActive ? "border-2" : "border")}
                    style={isActive ? { borderColor: highlightColor } : {}}
                    value={recallAnswers[globalIndex]?.firstName || ""}
                    onChange={(e) => handleInputChange(globalIndex, "firstName", e.target.value)}
                    onFocus={() => setActiveInput([row, col])}
                    autoComplete="off" spellCheck={false}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className={clsx("w-full p-1.5 border rounded-md text-sm", isActive ? "border-2" : "border")}
                    style={isActive ? { borderColor: highlightColor } : {}}
                    value={recallAnswers[globalIndex]?.lastName || ""}
                    onChange={(e) => handleInputChange(globalIndex, "lastName", e.target.value)}
                    onFocus={() => setActiveInput([row, col])}
                    autoComplete="off" spellCheck={false}
                  />
                </div>
              )}

              {phase === "results" && result && (
                <div className="text-sm space-y-1">
                  {/* First Name Display */}
                  <div className={clsx(
                      "p-1.5 rounded-md flex items-center text-left",
                      result.isFirstNameCorrect
                        ? "bg-green-100 text-green-800"
                        : result.userAnswer.firstName === ""
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  )}>
                    <span className="font-bold mr-2 w-4 text-center">{!result.isFirstNameCorrect && "✗"}</span>
                    <span>
                      {result.userAnswer.firstName || <span className="italic opacity-70">{result.correctAnswer.firstName}</span>}
                    </span>
                  </div>
                  {/* Last Name Display */}
                   <div className={clsx(
                      "p-1.5 rounded-md flex items-center text-left",
                      result.isLastNameCorrect
                        ? "bg-green-100 text-green-800"
                        : result.userAnswer.lastName === ""
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  )}>
                    <span className="font-bold mr-2 w-4 text-center">{!result.isLastNameCorrect && "✗"}</span>
                     <span>
                      {result.userAnswer.lastName || <span className="italic opacity-70">{result.correctAnswer.lastName}</span>}
                    </span>
                  </div>
                   {/* Correct Answer if wrong */}
                   {!result.isCorrect && !result.isEmpty && (
                     <div className="text-center pt-1 text-xs text-blue-700 font-semibold">
                       Correct: {result.correctAnswer.firstName} {result.correctAnswer.lastName}
                     </div>
                   )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center space-x-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white disabled:bg-gray-700 disabled:cursor-not-allowed">Prev</button>
          <span className="pt-2 px-4 font-medium text-gray-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed">Next</button>
        </div>

        <div className="flex justify-center">
          {phase === "memorize" && <button className="w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleRecall}>Recall</button>}
          {phase === "recall" && <button className="w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleSubmit}>Submit</button>}
          {phase === "results" && <button onClick={handleClose} className="w-[100px] bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Close</button>}
        </div>
      </div>
    </div>
  )
}