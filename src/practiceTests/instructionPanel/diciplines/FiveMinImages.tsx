"use client"

import { useState, useEffect } from "react"
import { imagesPool } from "../../../Games/Image/imagespool"

interface Props {
  onStart: (config: { highlightColor: string; images: string[] }) => void
}

const PREDEFINED_COLORS = [
  "#FF9999", // Darker Red
  "#FF99B3", // Darker Pink
  "#B3B3FF", // Darker Lavender
  "#E5B3FF", // Darker Purple
  "#99D6FF", // Darker Sky Blue
  "#9999FF", // Darker Blue
  "#99FF99", // Darker Green
  "#FFB380", // Darker Orange/Peach
]

export default function FiveMinImages({ onStart }: Props) {
  const [highlightColor, setHighlightColor] = useState(PREDEFINED_COLORS[0])
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [loadedCount, setLoadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    let loaded = 0
    const loadedImages: string[] = []

    imagesPool().then((urls) => {
      if (!isMounted) return

      // UPDATED: Limit to exactly 575 images for the game.
      const limitedUrls = urls.slice(0, 575)
      setTotalCount(limitedUrls.length)

      if (limitedUrls.length === 0) {
        setLoading(false)
        return
      }

      // Create and load all images in parallel
      const imagePromises = limitedUrls.map((url, idx) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            if (isMounted) {
              loaded++
              loadedImages[idx] = url
              setLoadedCount(loaded)

              if (loaded === limitedUrls.length) {
                setImages(loadedImages.filter(Boolean))
                setLoading(false)
              }
            }
            resolve()
          }
          img.onerror = () => {
            if (isMounted) {
              loaded++
              loadedImages[idx] = "" // Mark as failed
              setLoadedCount(loaded)

              if (loaded === limitedUrls.length) {
                setImages(loadedImages.filter(Boolean)) // Filter out failed images
                setLoading(false)
              }
            }
            resolve()
          }
          img.src = url
          // Force the browser to start loading immediately
          img.style.position = "absolute"
          img.style.opacity = "0"
          img.style.pointerEvents = "none"
          document.body.appendChild(img)
        })
      })

      // Wait for all images to load
      Promise.all(imagePromises).then(() => {
        if (isMounted) {
          // Clean up temporary image elements
          document.querySelectorAll('img[style*="position: absolute"]').forEach((img) => {
            img.parentNode?.removeChild(img)
          })
        }
      })
    })

    return () => {
      isMounted = false
      // Clean up any remaining temporary image elements
      document.querySelectorAll('img[style*="position: absolute"]').forEach((img) => {
        img.parentNode?.removeChild(img)
      })
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Game Objective</h3>
            <p className="text-gray-700">
              Memorize the positions of images in a 5 row x 5 column grid. Each row contains 5 unique images that you'll
              need to recall later.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Game Phases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Memorization (5 minutes):</span> Study the image positions in each row
              </li>
              <li>
                <span className="font-medium">Recall (10 minutes):</span> Enter positions (1-5) for shuffled images in
                each row
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⌨️ Navigation</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                Use <span className="font-medium">Arrow keys</span> to move between images
              </li>
              <li>
                Press <span className="font-medium">Enter</span> to start recall phase
              </li>
              <li>
                Type numbers <span className="font-medium">1-5</span> to input positions
              </li>
              <li>Navigate between pages using the page numbers below</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>+5 points: All positions correct in a row</li>
              <li>-1 point: Any wrong position in a row</li>
              <li>0 points: Empty row (no answers)</li>
              <li>Maximum score: 5 points × number of rows</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎨 Visual Feedback</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Green border: Correct position</li>
              <li>Red border: Wrong position</li>
              <li>Yellow border: Empty answer</li>
              <li>Custom highlight: Selected image focus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Selection Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Select Highlight Color</label>
        <div className="flex gap-3">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setHighlightColor(color)}
              style={{
                backgroundColor: color,
                border: highlightColor === color ? "2px solid black" : "2px solid white",
              }}
              className="w-10 h-10 rounded-full shadow-md hover:scale-110 transition-transform"
            />
          ))}
        </div>
      </div>

      {/* Loader & Start Button */}
      <div className="text-right mt-4 min-h-[48px] flex flex-col items-end">
        {loading ? (
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-6 py-2 rounded-xl shadow flex items-center gap-2 cursor-not-allowed"
          >
            <span className="loader border-4 border-blue-400 border-t-transparent rounded-full w-6 h-6 animate-spin"></span>
            Loading images... ({loadedCount}/{totalCount})
          </button>
        ) : (
          <button
            onClick={() => onStart({ highlightColor, images })}
            className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Start
          </button>
        )}
      </div>

      {/* Loader spinner style */}
      <style>{`
        .loader { border-top-color: transparent !important; }
      `}</style>
    </div>
  )
}