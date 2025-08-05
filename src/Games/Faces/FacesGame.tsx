// FacesGame.tsx
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import generateFacesData from "./facesData";

interface Face {
  name: string;
  image: string;
}

export default function FacesGame({
  // time,
  onRestart,
  highlightColor
}: {
  time: number;
  onRestart: () => void;
  highlightColor: string;
}) {
  const ROWS = 5, COLS = 5;
  const [faces, setFaces] = useState<Face[]>([]);
  const [recallFaces, setRecallFaces] = useState<Face[]>([]);
  const [phase, setPhase] = useState<"memorize" | "recall">("memorize");
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState<[number, number]>([0, 0]);
  const [activeInput, setActiveInput] = useState<[number, number]>([0, 0]);
  const [recallAnswers, setRecallAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [_, setScore] = useState(0);
  const inputRefs = useRef<HTMLInputElement[][]>([]);
  const memorizationTimerRef = useRef<number|null>(null);
const recallTimerRef = useRef<number|null>(null);

  // Initialize 75 faces on mount
  useEffect(() => {
    setFaces(generateFacesData(75));
  }, []);
  // When memorization phase begins, start a 15-min timer to switch to recall
useEffect(() => {
  if (phase === 'memorize') {
    memorizationTimerRef.current = window.setTimeout(() => {
      setPhase('recall');
    }, 15 * 60 * 1000);
  }
  return () => {
    if (memorizationTimerRef.current) {
      clearTimeout(memorizationTimerRef.current);
    }
  };
}, [phase]);
// When recall phase begins, start a 15-min timer to auto-submit
useEffect(() => {
  if (phase === 'recall') {
    recallTimerRef.current = window.setTimeout(() => {
      handleSubmit(); // auto-submit handler
    }, 15 * 60 * 1000);
  }
  return () => {
    if (recallTimerRef.current) {
      clearTimeout(recallTimerRef.current);
    }
  };
}, [phase]);

  // Focus the first input when recall phase starts
  useEffect(() => {
    if (phase === "recall") {
      setPage(1);
      setActiveInput([0, 0]);
      setTimeout(() => {
        inputRefs.current[0]?.[0]?.focus();
      }, 0);
    }
  }, [phase]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted) return; // no nav after submission

      // Memorize phase navigation
      if (phase === "memorize") {
        let [row, col] = activeImage;
        const isLastPage = page === Math.ceil(faces.length / (ROWS * COLS));
        const isLastRow = row === ROWS - 1;
        const isLastCol = col === COLS - 1;
        const isFirstPage = page === 1;
        const isFirstRow = row === 0;
        const isFirstCol = col === 0;

        switch (e.key) {
          case "ArrowRight":
            if (!isLastPage || !(isLastRow && isLastCol)) {
              if (col < COLS - 1) {
                setActiveImage([row, col + 1]);
              } else if (row < ROWS - 1) {
                setActiveImage([row + 1, 0]);
              } else if (!isLastPage) {
                setPage(page + 1);
                setTimeout(() => setActiveImage([0, 0]), 0);
              }
            }
            e.preventDefault();
            return;
          case "ArrowLeft":
            if (!(isFirstPage && isFirstRow && isFirstCol)) {
              if (col > 0) {
                setActiveImage([row, col - 1]);
              } else if (row > 0) {
                setActiveImage([row - 1, COLS - 1]);
              } else if (page > 1) {
                setPage(page - 1);
                setTimeout(() => setActiveImage([ROWS - 1, COLS - 1]), 0);
              }
            }
            e.preventDefault();
            return;
          case "ArrowDown":
            if (row < ROWS - 1) {
              setActiveImage([row + 1, col]);
            } else if (page < Math.ceil(faces.length / (ROWS * COLS))) {
              setPage(page + 1);
              setTimeout(() => setActiveImage([0, col]), 0);
            }
            e.preventDefault();
            return;
          case "ArrowUp":
            if (row > 0) {
              setActiveImage([row - 1, col]);
            } else if (page > 1) {
              setPage(page - 1);
              setTimeout(() => setActiveImage([ROWS - 1, col]), 0);
            }
            e.preventDefault();
            return;
          default:
            break;
        }
      }

      // Recall phase navigation (between inputs)
      if (phase === "recall") {
        // Flatten refs to find current index
        const flat = inputRefs.current.flat();
        let idx = flat.findIndex(ref => ref === document.activeElement);
        if (idx === -1) idx = 0;
        let row = Math.floor(idx / COLS);
        let col = idx % COLS;

        switch (e.key) {
          case "ArrowRight":
            if (col < COLS - 1) {
              col++;
            } else if (row < ROWS - 1) {
              row++; col = 0;
            } else if (page < Math.ceil(recallFaces.length / (ROWS * COLS))) {
              setPage(page + 1);
              setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 0);
              e.preventDefault();
              return;
            }
            break;
          case "ArrowLeft":
            if (col > 0) {
              col--;
            } else if (row > 0) {
              row--; col = COLS - 1;
            } else if (page > 1) {
              setPage(page - 1);
              setTimeout(() => {
                const lastRow = ROWS - 1;
                inputRefs.current[lastRow]?.[COLS - 1]?.focus();
              }, 0);
              e.preventDefault();
              return;
            }
            break;
          case "ArrowDown":
            if (row < ROWS - 1) {
              row++;
            } else if (page < Math.ceil(recallFaces.length / (ROWS * COLS))) {
              setPage(page + 1);
              setTimeout(() => inputRefs.current[0]?.[0]?.focus(), 0);
              e.preventDefault();
              return;
            }
            break;
          case "ArrowUp":
            if (row > 0) {
              row--;
            } else if (page > 1) {
              setPage(page - 1);
              setTimeout(() => {
                const lastRow = ROWS - 1;
                inputRefs.current[lastRow]?.[col]?.focus();
              }, 0);
              e.preventDefault();
              return;
            }
            break;
          default:
            break;
        }
        // Focus the new input
        inputRefs.current[row]?.[col]?.focus();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, activeImage, activeInput, page, submitted, recallFaces.length]);

  // Handle clicking "Recall Now"
  const handleRecall = () => {
    // Shuffle faces for recall
    const shuffled = [...faces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRecallFaces(shuffled);
    setRecallAnswers(Array(faces.length).fill(""));
    setPhase("recall");
  };

  // Handle changing an answer in recall
  const handleChange = (globalIdx: number, value: string) => {
    const ans = [...recallAnswers];
    ans[globalIdx] = value;
    setRecallAnswers(ans);
  };

  // Submit recall answers
  const handleSubmit = () => {
    let correct = 0;
    recallFaces.forEach((face, idx) => {
      if (face.name.toLowerCase() === (recallAnswers[idx] || "").toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  // Determine faces to display on current page
  const totalPages = Math.ceil(faces.length / (ROWS * COLS));
  const startIdx = (page - 1) * ROWS * COLS;
  const endIdx = startIdx + ROWS * COLS;
  const displayFaces = (phase === "memorize" ? faces : recallFaces).slice(startIdx, endIdx);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {phase === "memorize" ? "Memorize" : "Recall"} Names and Faces
        </h2>
        {/* Row index label, e.g. "Rows 1–5" */}
        <span className="text-sm italic">
          Rows {(page - 1) * ROWS + 1}–{Math.min(page * ROWS, Math.ceil(faces.length / COLS))}
        </span>
      </div>

      {/* 5×5 grid of faces */}
      <div className="grid grid-cols-5 gap-4">
        {displayFaces.map((face, i) => {
          const globalIndex = startIdx + i;
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const isActive = phase === "memorize"
            ? (row === activeImage[0] && col === activeImage[1] && page === Math.ceil((row*COLS + col + 1) / (ROWS*COLS)))
            : (row === activeInput[0] && col === activeInput[1]);
          const userAnswer = recallAnswers[globalIndex] || "";
          const isCorrect = face.name.toLowerCase() === userAnswer.toLowerCase();
          const isEmpty = userAnswer.trim() === "";

          // Determine border color for result
          let borderClass = "border-transparent";
          if (submitted) {
            if (isCorrect) borderClass = "border-green-500";
            else if (isEmpty) borderClass = "border-yellow-500";
            else borderClass = "border-red-500";
          }

          return (
            <div
              key={i}
              className={clsx(
                "bg-white text-black p-2 rounded-xl shadow transition border-4",
                borderClass
              )}
              style={isActive ? {
  borderColor: highlightColor,
  boxShadow: `0 0 10px ${highlightColor}`,
  borderWidth: '4px'
} : {
  borderColor: 'transparent',
  boxShadow: 'none'
}}

            >
              <img
                src={face.image}
                alt="face"
                className="w-full h-24 object-cover rounded-md mb-1"
              />
              {phase === "memorize" ? (
                <p className="text-center font-medium">{face.name}</p>
              ) : (
                <div>
                  <input
                    ref={el => {
                      const r = Math.floor(i / COLS);
                      const c = i % COLS;
                      if (!inputRefs.current[r]) inputRefs.current[r] = [];
                      inputRefs.current[r][c] = el!;
                    }}
                    type="text"
                    placeholder="Enter name"
                    className={clsx("w-full p-1 border rounded-md",
                      !submitted && isActive ? `border-[${highlightColor}]` : ""
                    )}
                    value={userAnswer}
                    onChange={e => handleChange(globalIndex, e.target.value)}
                    disabled={submitted}
                  />
                  {submitted && (
                    <div className="mt-1 text-sm">
                      {isEmpty ? (
                        <p className="text-gray-700">
                          <span className="font-semibold text-yellow-700">Empty</span> – Correct: {face.name}
                        </p>
                      ) : isCorrect ? (
                        <p className="text-green-700">
                          Your answer: {userAnswer}
                        </p>
                      ) : (
                        <p className="text-red-700 line-through">
                          {userAnswer} (Wrong). <span className="text-gray-900">Correct: {face.name}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination and controls */}
      <div className="flex justify-between items-center mt-6">
        {/* Page buttons */}
        <div className="space-x-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={clsx(
                "px-3 py-1 border rounded",
                page === idx+1 ? "bg-blue-500 text-white" : "bg-white text-blue-500"
              )}
              onClick={() => setPage(idx+1)}
            >
              {idx+1}
            </button>
          ))}
        </div>
        {/* Recall/Submit/Restart buttons */}
        <div className="flex space-x-2">
          {phase === "memorize" && !submitted && (
            <button
              className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={handleRecall}
            >
              Recall
            </button>
          )}
          {phase === "recall" && !submitted && (
            <button
              className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
          {submitted && (
            <button
             className="w-[100px] mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={onRestart}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
