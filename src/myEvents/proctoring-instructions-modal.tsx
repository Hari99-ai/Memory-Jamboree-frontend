"use client"
 
import type React from "react"
 
import { useState } from "react"
import { X, Shield, Eye, Camera, Wifi, AlertTriangle, CheckCircle } from "lucide-react"
 
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
  eventName,
}: ProctoringInstructionsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showCheatingModal, setShowCheatingModal] = useState(false)
  const [hasAgreedToCheatingTerms, setHasAgreedToCheatingTerms] = useState(false)
 
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true)
    }
  }
 
  const handleAcceptFirstModal = () => {
    setShowCheatingModal(true)
  }
 
  const handleAcceptCheatingModal = () => {
    setShowCheatingModal(false)
    onAccept()
  }
 
  if (!isOpen) return null
 
  return (
    <>
      {/* Main Proctoring Instructions Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Proctoring Instructions</h2>
                <p className="text-gray-600">Please read carefully before starting: {eventName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
 
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8" onScroll={handleScroll}>
            {/* General Conduct */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">General Conduct</h3>
              </div>
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">
                  • You must complete the exam alone, without assistance from others, in a quiet, well-lit room free from
                  distractions and interruptions.
                </p>
                <p className="text-gray-700">• No other person is allowed to enter the room during the exam.</p>
              </div>
            </section>
 
            {/* Identity Verification */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Identity Verification</h3>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">• Upload your profile picture according to the guidelines.</p>
                <p className="text-gray-700">
                  • You must verify your identity using facial recognition or as directed by the proctoring system before
                  starting the exam.
                </p>
              </div>
            </section>
 
            {/* Environment and Equipment */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Environment and Equipment</h3>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">
                  • The desk or table must be clear of all unauthorized materials, including books, papers, notes,
                  calculators, phones, and electronic devices.
                </p>
                <p className="text-gray-700">
                  • The walls and desk must not have any writing or unauthorized information visible,only solid and light backgrounds.
                </p>
                <p className="text-gray-700">
                  • Lighting should be bright enough for clear video capture, with no strong light sources behind you.
                </p>
              </div>
            </section>
 
            {/* Before Event Requirements */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Before Event Requirements</h3>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">
                  • Use a computer with a functioning webcam and microphone. Both must remain on for the duration of the
                  exam.
                </p>
                <p className="text-gray-700">
                  • A stable, uninterrupted internet connection is required throughout the exam.
                </p>
                <p className="text-gray-700">• Screen sharing, screenshots, and virtual machines are not permitted.</p>
              </div>
            </section>
 
            {/* AI Tracking During Exam */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Eye className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI Tracking During the Exam</h3>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">
                  • Remain visible in the webcam frame at all times. Looking away from the screen, leaving the seat, or
                  covering the camera is not allowed and may be flagged as suspicious behavior.
                </p>
                <p className="text-gray-700">
                  • Do not communicate with anyone by any means (in person, phone, chat, etc.) during the exam.
                </p>
                <p className="text-gray-700">
                  • Do not use external devices, notes, or software. No headphones, earbuds, or smart devices (watches,
                  fitness bands, etc.) are allowed unless explicitly permitted.
                </p>
                <p className="text-gray-700">
                  • The exam session is monitored and recorded (video, audio, and screen activity) for review and
                  integrity checks.
                </p>
              </div>
            </section>
 
            {/* Cheating and Academic Integrity */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cheating and Academic Integrity</h3>
              </div>
              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-gray-700">
                  • Any attempt to cheat, including using unauthorized materials, seeking outside help, or attempting to
                  bypass proctoring controls, is strictly prohibited.
                </p>
              </div>
            </section>
 
            {/* Important Notes */}
            <section className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h4 className="font-semibold text-gray-900">Important Notes:</h4>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Technical Difficulties:</span> If you experience technical difficulties,
                    notify your instructor or the designated support team immediately. Do not attempt to restart the exam
                    or change devices without permission.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Privacy and Data Use:</span> Your video, audio, and screen activity will
                    be recorded and analyzed by AI for the purpose of exam security and academic integrity.
                  </p>
                </div>
              </div>
            </section>
 
            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 animate-pulse">Please scroll down to read all instructions</p>
              </div>
            )}
          </div>
 
          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>By proceeding, you agree to follow all proctoring rules</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptFirstModal}
                  disabled={!hasScrolledToBottom}
                  className={`px-8 py-2 rounded-xl font-semibold transition-all duration-300 ${hasScrolledToBottom
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  I Understand & Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Cheating-Specific Instructions Modal - Now Smaller and More Focused */}
      {showCheatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold  text-red-700">Warnings</h2>
 
                </div>
              </div>
              <button
                onClick={() => setShowCheatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
 
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <h6 className="font-semibold text-gray-900 mb-2">Read carefully:</h6>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <p className="text-sm text-red-600">No Mobile Phones</p>
                      <span>
                        Mobile phones are strictly prohibited. If found using one, the exam will be immediately terminated.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <p className="text-sm text-red-600">Complete the exam in isolation</p>
                      <span>
                        No other person is allowed in the exam room. If another person is detected, the exam will be terminated.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <p className="text-sm text-red-600">No Screenshots</p>
                      <span>
                        Taking screenshots or recording the screen is not allowed. Any such activity will result in termination.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <p className="text-sm text-red-600">Stay Focused</p>
                      <span>
                        You must maintain focus on the screen at all times. If you're found looking away more than 10 times, it
                        will be considered a violation.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <div>
                      <p className="text-sm text-red-600">Keep It Quiet</p>
                      <span>
                        Ensure your environment is free from audio disturbances. Continuous noise or background conversation can
                        lead to exam termination.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-100 rounded-lg">
                <p className="text-base text-red-600 font-semibold animate-pulse">
                  You are allowed a maximum of 3 warnings. The exam will be automatically terminated after the third warning.
                </p>
              </div>
 
 
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <input
                  type="checkbox"
                  id="cheating-agreement"
                  checked={hasAgreedToCheatingTerms}
                  onChange={(e) => setHasAgreedToCheatingTerms(e.target.checked)}
                  className="mt-1 accent-green-600"
                />
                <label htmlFor="cheating-agreement" className="text-sm text-gray-900">
                  I understand that violation of any of these rules may result in immediate termination of my exam session and
                  further disciplinary action, including invalidation of my results
                </label>
              </div>
 
 
            </div>
 
            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCheatingModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={handleAcceptCheatingModal}
                  disabled={!hasAgreedToCheatingTerms}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${hasAgreedToCheatingTerms
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
    </>
  )
}
 