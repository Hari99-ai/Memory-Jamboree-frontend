import { useState } from "react"
import { X, Shield,  Camera, AlertTriangle, User,  Video } from "lucide-react"

interface ProctoringInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  eventName: string
}

export default function ProctoringInstructionsModal({
  isOpen,
  onClose,
  onAccept,
}: ProctoringInstructionsModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [hasAgreedToCheatingTerms, setHasAgreedToCheatingTerms] = useState(false)

  const totalPages = 4

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleAccept = () => {
    if (hasAgreedToCheatingTerms) {
      onAccept()
    }
  }

  const resetState = () => {
    setCurrentPage(1)
    setHasAgreedToCheatingTerms(false)
    onClose()
  }

  if (!isOpen) return null

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          // Page 1: General Instructions
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">General Instructions</h3>
            </div>
            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <p className="text-gray-700">• Take the test all by yourself in a quiet, bright room.</p>
              <p className="text-gray-700">• No one else can be in the room or help you.</p>
              <p className="text-gray-700">• Make sure your profile picture is clear.</p>
              <p className="text-gray-700">• The computer will check your face before the test begins.</p>
            </div>
          </section>
        )
      case 2:
        return (
          // Page 2: Room Environment and Device requirements
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Room Environment and Device requirements</h3>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 space-y-3">
              <p className="text-gray-700">• Your desk must be empty. No books, papers, or phones.</p>
              <p className="text-gray-700">• Make sure the walls behind you are clear.</p>
              <p className="text-gray-700">• Your room should be very bright so the camera can see you.</p>
              <p className="text-gray-700">• Your computer's camera and microphone must be on.</p>
              <p className="text-gray-700">• You need a good internet connection.</p>
              <p className="text-gray-700">• No screenshots or screen sharing.</p>
            </div>
          </section>
        )
      case 3:
        return (
          // Page 3: You'll be tracked during the event.
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Video className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">You'll be tracked during the event.</h3>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
              <p className="text-gray-700">• Always stay in front of the camera. Don't leave your seat.</p>
              <p className="text-gray-700">• No talking to anyone during the test.</p>
              <p className="text-gray-700">• You cannot wear headphones, earbuds, or smartwatches.</p>
              <p className="text-gray-700">
                • The computer will record your screen, video, and sound to make sure the test is fair.
              </p>
            </div>
          </section>
        )
      case 4:
        return (
          // Page 4: Cheating and Academic Integrity
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cheating and Academic integrity</h3>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 space-y-3">
                <p className="text-red-700 font-semibold">Don't cheat. If you do, the test will stop.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-bold text-red-600">No Phones:</span> Using a phone will end the test.</li>
                  <li><span className="font-bold text-red-600">Work Alone:</span> No other people are allowed near you.</li>
                  <li><span className="font-bold text-red-600">No Screenshots:</span> Taking pictures of the screen will end the test.</li>
                  <li><span className="font-bold text-red-600">Stay Focused:</span> Don't look away from the screen too much.</li>
                  <li><span className="font-bold text-red-600">Be Quiet:</span> Too much noise can end the test.</li>
                </ul>
              </div>
            </section>
            <div className="flex items-center gap-3 p-4 bg-red-100 rounded-lg">
              <p className="text-base text-red-600 font-semibold animate-pulse">
                You get 3 warnings. After the third warning, your test will automatically stop.
              </p>
            </div>
            <section className="space-y-4">
              <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Important Notes:</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>If something goes wrong:</strong> Tell your teacher right away.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Why we record:</strong> We record the test to make sure everyone follows the rules.
                  </p>
                </div>
              </div>
            </section>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg mt-4">
              <input
                type="checkbox"
                id="cheating-agreement"
                checked={hasAgreedToCheatingTerms}
                onChange={(e) => setHasAgreedToCheatingTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <label htmlFor="cheating-agreement" className="text-sm text-gray-900">
                I have read the rules and I promise to follow them.
              </label>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Proctoring Instructions</h2>
              <p className="text-gray-600">Please read carefully before starting the event discipline</p>
            </div>
          </div>
          <button onClick={resetState} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">{renderPageContent()}</div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            {/* Progress Indicator */}
            <div className="text-sm font-medium text-gray-500">
              Step {currentPage} of {totalPages}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentPage > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Previous
                </button>
              )}

              {currentPage < totalPages && (
                <button
                  onClick={handleNext}
                  className="px-8 py-2 rounded-lg font-semibold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}

              {currentPage === totalPages && (
                <button
                  onClick={handleAccept}
                  disabled={!hasAgreedToCheatingTerms}
                  className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 ${hasAgreedToCheatingTerms
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  I Understand & Agree
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}