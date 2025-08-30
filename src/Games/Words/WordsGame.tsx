import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { generateWordsData } from "./wordsData";
import { submitPracticeScore } from "../../lib/submitPracticeScore";
import type { DisciplineData } from "../../types/index";
import CountdownOverlay from "../../practiceTests/CountdownOverlay";

interface WordsGameProps {
  paused?: boolean;
  time: number;
  onRestart: () => void;
  highlightColor: string;
  highlightGroupSize: number;
  showGroupedWords: boolean;
  category: "easy" | "moderate" | "hard" | "master";
  disciplineName: string;
  allDisciplines: DisciplineData[];
  onGameComplete?: (score: number) => void;
  onRecallPhaseStart?: () => void;
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
  const wordsPerPage = 100; // Fixed 100 words per page
  const cols = 5;
  const rows = 20; // 20 rows x 5 cols = 100 words per page
  const totalPages = 2; // Fixed number of pages

  const [phase, setPhase] = useState<"memorize" | "recall">("memorize");
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [recallAnswers, setRecallAnswers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [_, setShowResultModal] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(time * 60);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([]);

  const [currentPos, setCurrentPos] = useState({ row: 0, col: 0, page: 1 });
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (category) {
      (async () => {
        const allWords = await generateWordsData(category);
        const maxWords = totalPages * cols * rows;
        const shuffled = allWords.slice().sort(() => Math.random() - 0.5);
        setWords(shuffled.slice(0, maxWords));
      })();
    }
  }, [category, totalPages, cols, rows]);

  // Handle recall start with countdown
  const handleRecallStart = () => {
    // Stop the memorization timer before starting the countdown
    timerWorkerRef.current?.postMessage({ command: "stop" });
    setCountdownStarted(true);

    // After 5 seconds, start the recall phase
    setTimeout(() => {
      setPage(1);
      setPhase("recall");
      setCountdownStarted(false);

      if (onRecallPhaseStart) {
        onRecallPhaseStart();
      }
    }, 5000);
  };

  // Setup the Web Worker for the timer
  useEffect(() => {
    // Note: Adjust the path to your worker file if you placed it in a different directory.
    timerWorkerRef.current = new Worker(new URL("./timer.worker.ts", import.meta.url), { type: "module" });

    timerWorkerRef.current.onmessage = (e) => {
      const { type, timeLeft: newTimeLeft } = e.data;
      if (type === "tick") {
        setTimeLeft(newTimeLeft);
      } else if (type === "done") {
        setTimeLeft(0);
        if (phase === "memorize") {
          handleRecallStart();
        } else {
          handleSubmit();
        }
      }
    };

    // Cleanup: Terminate the worker when the component unmounts
    return () => {
      timerWorkerRef.current?.postMessage({ command: "stop" });
      timerWorkerRef.current?.terminate();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This effect controls the worker based on the game state
  useEffect(() => {
    if (paused) {
      timerWorkerRef.current?.postMessage({ command: "stop" });
      return;
    }

    if (!countdownStarted && timerWorkerRef.current) {
      const duration = phase === "memorize" ? time * 60 : 15 * 60;
      setTimeLeft(duration); // Set initial time immediately
      timerWorkerRef.current.postMessage({ command: "start", time: duration });
    } else {
      timerWorkerRef.current?.postMessage({ command: "stop" });
    }
  }, [phase, countdownStarted, paused, time]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Highlight logic for column grouping (memorize phase only)
  const handleHighlightGroup = useCallback(
    (startRow: number, startCol: number, startPage: number) => {
      const newHighlights: number[] = [];
      let currentRow = startRow;
      let currentCol = startCol;
      let currentPage = startPage;

      for (let i = 0; i < highlightGroupSize; i++) {
        const idxInPage = currentCol * rows + currentRow;
        const globalIdx = (currentPage - 1) * wordsPerPage + idxInPage;
        if (globalIdx >= words.length) {
          break;
        }
        newHighlights.push(globalIdx);

        currentRow++;
        if (currentRow >= rows) {
          currentRow = 0;
          currentCol++;
          if (currentCol >= cols) {
            currentCol = 0;
            currentPage++;
          }
        }
      }
      setHighlightedIndexes(newHighlights);
    },
    [highlightGroupSize, rows, cols, wordsPerPage, words.length]
  );

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!showFinalResult && !countdownStarted) {
          if (phase === "memorize") {
            if (window.confirm("Are you sure you want to move to the Recall phase?")) {
              handleRecallStart();
            }
          }
          if (phase === "recall") {
            if (window.confirm("Are you sure you want to submit your answers?")) {
              handleSubmit();
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [phase, showFinalResult, countdownStarted]);

  const handleInputChange = (index: number, value: string) => {
    const updated = [...recallAnswers];
    updated[index] = value.toLowerCase();
    setRecallAnswers(updated);
  };

  const handleSubmit = async () => {
    // Stop the timer when submitting
    timerWorkerRef.current?.postMessage({ command: "stop" });
    let totalScore = 0;
    let totalCorrect = 0;

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      for (let col = 0; col < cols; col++) {
        let consecutiveCorrectOnPage = 0;
        let mistakeFoundInColumnOnPage = false;
        for (let row = 0; row < rows; row++) {
          const globalIdx = pageIdx * wordsPerPage + (col * rows + row);
          if (globalIdx >= words.length) break;

          const userAnswer = (recallAnswers[globalIdx] || "").trim().toLowerCase();
          const correctAnswer = words[globalIdx].toLowerCase();

          if (userAnswer === correctAnswer) {
            totalCorrect++;
          }

          if (!mistakeFoundInColumnOnPage) {
            if (userAnswer === correctAnswer) {
              consecutiveCorrectOnPage++;
            } else {
              mistakeFoundInColumnOnPage = true;
            }
          }
        }
        const bonus = Math.floor(consecutiveCorrectOnPage / 10);
        const columnOnPageScore = consecutiveCorrectOnPage + bonus;
        totalScore += columnOnPageScore;
      }
    }

    setScore(totalScore);
    setTotalCorrect(totalCorrect);
    setShowResultModal(true);
    setShowFinalResult(true);
    setPage(1); // MINOR UPDATE: Reset to page 1 on submit.

    if (onGameComplete) {
      onGameComplete(totalScore);
      return;
    }
    try {
      const userIdString = sessionStorage.getItem("userId");
      const user_id = userIdString ? Number.parseInt(userIdString, 10) : undefined;
      const matchedDiscipline = allDisciplines?.find((d) => d.discipline_name === disciplineName && typeof d.disc_id === "number");
      if (user_id && matchedDiscipline) {
        const postData = {
          user_id,
          disc_id: matchedDiscipline.disc_id!,
          score: totalScore,
        };
        await submitPracticeScore(postData);
      }
    } catch (err) {
      console.error("🚨 Error submitting WordsGame score:", err);
    }
  };

  useEffect(() => {
    if (phase === "memorize" && words.length > 0) {
      handleHighlightGroup(0, 0, page);
    }
  }, [words, page, phase, handleHighlightGroup]);

  // --- Keyboard navigation for memorize phase (CORRECTED) ---
  useEffect(() => {
    if (phase !== "memorize") return;

    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Tab"].includes(e.key)) {
        e.preventDefault();

        // The starting global index of the current highlighted group is the source of truth.
        const currentGroupStartIdx = highlightedIndexes[0] || 0;
        let nextGroupStartIdx: number | null = null;

        // Determine the starting index of the next or previous group
        if (["ArrowDown", "ArrowRight", "Tab"].includes(e.key)) {
          const nextIdx = currentGroupStartIdx + highlightGroupSize;
          if (nextIdx < words.length) {
            nextGroupStartIdx = nextIdx;
          }
        } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
          const prevIdx = currentGroupStartIdx - highlightGroupSize;
          if (prevIdx >= 0) {
            nextGroupStartIdx = prevIdx;
          }
        }
        
        // If a valid next/previous group exists, update the position
        if (nextGroupStartIdx !== null) {
          // Convert the new global index back to (row, col, page) coordinates
          const newPage = Math.floor(nextGroupStartIdx / wordsPerPage) + 1;
          const idxInPage = nextGroupStartIdx % wordsPerPage;
          const newCol = Math.floor(idxInPage / rows);
          const newRow = idxInPage % rows;

          // Update state and UI
          const newPos = { row: newRow, col: newCol, page: newPage };
          setCurrentPos(newPos);
          handleHighlightGroup(newPos.row, newPos.col, newPos.page);
          setPage(newPos.page);

          // Scroll the new group into view
          setTimeout(() => {
            const target = wordRefs.current[nextGroupStartIdx];
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 50); // A small delay ensures the state has updated
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, words.length, highlightGroupSize, highlightedIndexes, handleHighlightGroup, rows, wordsPerPage]);

  // --- Recall phase: initial setup ---
  useEffect(() => {
    if (phase !== "recall" || showFinalResult) return;

    setCurrentPos({ row: 0, col: 0, page: 1 });
    setHighlightedIndexes(Array.from({ length: highlightGroupSize }, (_, i) => i));

    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 100);
  }, [phase, showFinalResult, highlightGroupSize]);

  // --- Recall phase: highlight group navigation and input focus (MODIFIED) ---
  useEffect(() => {
    if (phase !== "recall" || showFinalResult) return;

    const handleRecallKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();

        const activeElement = document.activeElement as HTMLInputElement;
        const activeId = activeElement?.id;
        if (!activeId || !activeId.startsWith("input-")) return;

        const currentGlobalIdx = parseInt(activeId.split("-")[1], 10);
        let nextGlobalIdx = currentGlobalIdx;

        if (["ArrowDown", "Tab", "ArrowRight"].includes(e.key)) {
          nextGlobalIdx++;
        } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
          nextGlobalIdx--;
        }

        if (nextGlobalIdx !== currentGlobalIdx && nextGlobalIdx >= 0 && nextGlobalIdx < words.length) {
          // Calculate new position from the global index
          const newPage = Math.floor(nextGlobalIdx / wordsPerPage) + 1;
          const idxInPage = nextGlobalIdx % wordsPerPage;
          const newCol = Math.floor(idxInPage / rows);
          const newRow = idxInPage % rows;

          // Update state
          setCurrentPos({ row: newRow, col: newCol, page: newPage });
          if (page !== newPage) setPage(newPage);

          // Update highlights based on group, allowing it to cross column/page boundaries
          const groupStartIndex = Math.floor(nextGlobalIdx / highlightGroupSize) * highlightGroupSize;
          const newHighlights = Array.from({ length: highlightGroupSize }, (_, i) => {
            const idx = groupStartIndex + i;
            return idx < words.length ? idx : null;
          }).filter((x): x is number => x !== null);
          setHighlightedIndexes(newHighlights);

          // Focus and scroll to the next input
          setTimeout(() => {
            const targetInput = inputRefs.current[nextGlobalIdx];
            targetInput?.focus();
            targetInput?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 50);
        }
      }
    };

    window.addEventListener("keydown", handleRecallKey);
    return () => window.removeEventListener("keydown", handleRecallKey);
  }, [phase, showFinalResult, words.length, highlightGroupSize, wordsPerPage, rows, page]);

  const getDarkerShade = (color: string): string => {
    const rgb = color.match(/\w\w/g)?.map((x) => parseInt(x, 16));
    if (!rgb) return color;
    const darker = rgb.map((c) => Math.max(0, c - 40)).map((c) => c.toString(16).padStart(2, "0"));
    return `#${darker.join("")}`;
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center space-x-4 mt-6 mb-6">
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-500 text-white">
          Prev
        </Button>
        <span className="pt-2 px-4 font-medium text-gray-400">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-600 text-white"
        >
          Next
        </Button>
      </div>
    );
  };

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
          {(!showFinalResult || phase !== "recall") && !countdownStarted && (
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${timeLeft < 30 ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-800"}`}>
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

      {phase === "memorize" && showGroupedWords && highlightedIndexes.length > 0 && (
        <div className="mb-6 border border-gray-300 rounded-lg p-6 text-center bg-white shadow-inner">
          <div className="grid grid-cols-1 gap-2 text-2xl font-bold text-gray-800">
            {highlightedIndexes.map((globalIdx) => {
              if (globalIdx < words.length) {
                return (
                  <div key={globalIdx} className="tracking-wide">
                    {words[globalIdx]}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      <div
        className={`grid ${showFinalResult ? "gap-0.5" : "gap-2"} text-gray-900 text-xs`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {[...Array(rows)].map((_, r) =>
          [...Array(cols)].map((_, c) => {
            const idxInPage = c * rows + r;
            const globalIdx = (page - 1) * wordsPerPage + idxInPage;

            if (globalIdx >= words.length) return null;

            const word = words[globalIdx];
            const answer = recallAnswers[globalIdx] || "";
            const showFeedback = showFinalResult && phase === "recall";
            const highlighted = highlightedIndexes.includes(globalIdx);

            return (
              <div key={c + "-" + r} style={{ display: "flex", alignItems: "center" }}>
                <span className="font-bold mr-1 text-gray-400 select-none" style={{ minWidth: 30, textAlign: "right" }}>
                  {(page - 1) * wordsPerPage + idxInPage + 1}.
                </span>

                {phase === "memorize" ? (
                  <div
                    ref={(el) => {
                      wordRefs.current[globalIdx] = el;
                    }}
                    className={`text-center font-medium select-none cursor-pointer`}
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
                      outline: highlighted && currentPos.row === r && currentPos.col === c && page === currentPos.page ? `2px solid ${highlightColor}` : undefined,
                    }}
                    onClick={() => {
                      if (!highlightedIndexes.includes(globalIdx)) {
                        handleHighlightGroup(r, c, page);
                        setCurrentPos({ row: r, col: c, page });
                      }
                    }}
                  >
                    {word}
                  </div>
                ) : showFeedback ? (
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
                      inputRefs.current[globalIdx] = el;
                    }}
                    className={`w-full h-6 p-2 border border-gray-300 rounded text-center text-sm outline-none`}
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
                        e.preventDefault();
                      }
                    }}
                    onFocus={() => {
                      // MODIFIED: Update position and highlights based on global index, independent of columns.
                      setCurrentPos({ row: r, col: c, page });
                      const groupStartIndex = Math.floor(globalIdx / highlightGroupSize) * highlightGroupSize;
                      const newHighlights = Array.from({ length: highlightGroupSize }, (_, i) => {
                        const idx = groupStartIndex + i;
                        return idx < words.length ? idx : null;
                      }).filter((x): x is number => x !== null);
                      setHighlightedIndexes(newHighlights);
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {renderPagination()}

      <div className="flex justify-center items-center mt-6">
        {!showFinalResult && phase === "memorize" && !countdownStarted && (
          <Button className="mt-4 w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={timeLeft > 50000} onClick={handleRecallStart}>
            Recall
          </Button>
        )}

        {!showFinalResult && phase === "recall" && (
          <Button
            className="mt-4 w-[100px] bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit?")) {
                handleSubmit();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Submit
          </Button>
        )}
      </div>

      {showFinalResult && (
        <div className="-mt-4 text-center">
          <Button className="w-[100px] mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700" onClick={onRestart}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}