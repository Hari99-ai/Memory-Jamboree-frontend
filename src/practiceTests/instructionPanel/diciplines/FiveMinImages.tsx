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
    const savedColor = localStorage.getItem("fiveMinImagesHighlightColor")
    if (savedColor && PREDEFINED_COLORS.includes(savedColor)) {
      setHighlightColor(savedColor)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let loaded = 0
    const loadedImages: string[] = []

    imagesPool().then((urls) => {
      if (!isMounted) return

      const limitedUrls = urls.slice(0, 575)
      setTotalCount(limitedUrls.length)

      if (limitedUrls.length === 0) {
        setLoading(false)
        return
      }

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
              loadedImages[idx] = ""
              setLoadedCount(loaded)
              if (loaded === limitedUrls.length) {
                setImages(loadedImages.filter(Boolean))
                setLoading(false)
              }
            }
            resolve()
          }
          img.src = url
          img.style.position = "absolute"
          img.style.opacity = "0"
          img.style.pointerEvents = "none"
          document.body.appendChild(img)
        })
      })

      Promise.all(imagePromises).then(() => {
        if (isMounted) {
          document.querySelectorAll('img[style*="position: absolute"]').forEach((img) => {
            img.parentNode?.removeChild(img)
          })
        }
      })
    })

    return () => {
      isMounted = false
      document.querySelectorAll('img[style*="position: absolute"]').forEach((img) => {
        img.parentNode?.removeChild(img)
      })
    }
  }, [])

  const handleColorChange = (color: string) => {
    setHighlightColor(color)
    localStorage.setItem("fiveMinImagesHighlightColor", color)
  }

  return (
    <div className="space-y-6">
      {/* Instructions Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Layout</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Test consists of 23 pages.</li>
              <li>Each page contains 5 rows with 5 images in each row.</li>
              <li>
                You can shift between the pages using the &quot;Prev&quot; and &quot;Next&quot; buttons once the test starts.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Objective</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You need to memorise the order of images in each row.</li>
              <li>You can memorise as many rows as possible in the given time.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Test Phases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Memorization (5 minutes):</span>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>You will see a grid of images.</li>
                  <li>During this time, you will memorise the order of images in a row.</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Recall (15 minutes):</span>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Images in each row will be shuffled.</li>
                  <li>You will see empty text boxes near every image.</li>
                  <li>
                    During this time, you will recall the order of the image in that row and enter the sequence number of that image in the empty text box.
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Every row will be scored separately.</li>
              <li>+5 points for a full correct row.</li>
              <li>-1 if the row is attempted incorrectly.</li>
              <li>The final score will be the sum of all the scores in each row.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⚙️ Test Settings</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Highlight Colour:</span> Select your preferred colour for the active image during the memorisation and recall phase.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⌨️ Keyboard Controls</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Arrow Keys:</span> Navigate between images using all 4 arrow keys.
              </li>
              <li>
                <span className="font-medium">Enter:</span> Move to the next phase (memorization to recall / recall to submit).
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎨 Visual Feedback</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Green border:</span> Correct position of the image
              </li>
              <li>
                <span className="font-medium">Red border:</span> Wrong position
              </li>
              <li>
                <span className="font-medium" >Yellow border:</span> Not attempted
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Select Highlight Color</label>
          <div className="flex gap-3">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  backgroundColor: color,
                  border: highlightColor === color ? "2px solid black" : "2px solid white",
                }}
                className="w-10 h-10 rounded-full shadow-md hover:scale-110 transition-transform"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Start Button */}
      <div className="flex justify-end pr-4">
        {loading ? (
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-6 py-2 rounded-xl shadow flex items-center gap-2 cursor-not-allowed"
          >
            <span className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
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
    </div>
  )
}