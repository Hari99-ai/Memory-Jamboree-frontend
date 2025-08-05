// import type React from "react"
// import { AlertTriangle, X } from "lucide-react"
 
// interface WarningDialogProps {
//   open: boolean
//   title: string
//   totalWarnings: number
//   lastWarningType: string
//   onClose: () => void
// }
 
// export const WarningDialog: React.FC<WarningDialogProps> = ({
//   open,
//   title,
//   totalWarnings,
//   lastWarningType,
//   onClose,
// }) => {
//   if (!open) return null
 
//   const getWarningColor = (count: number) => {
//     if (count === 1) return "text-yellow-600 bg-yellow-50 border-yellow-200"
//     if (count === 2) return "text-orange-600 bg-orange-50 border-orange-200"
//     return "text-red-600 bg-red-50 border-red-200"
//   }
 
//   const getWarningMessage = (count: number) => {
//     if (count === 1) return "First warning - Please be careful!"
//     if (count === 2) return "Second warning - One more violation will terminate your game!"
//     return "Final warning - Game will be terminated immediately!"
//   }
 
//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in-0 zoom-in-95 duration-300">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
 
//         <div className="p-8 text-center">
//           <div className="mb-6">
//             <div
//               className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${getWarningColor(totalWarnings)}`}
//             >
//               <AlertTriangle className="h-8 w-8" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
//           </div>
 
//           <div className={`rounded-xl p-4 mb-6 border ${getWarningColor(totalWarnings)}`}>
//             <p className="font-semibold mb-2">
//               Warning {totalWarnings}/3: {lastWarningType}
//             </p>
//             <p className="text-sm">{getWarningMessage(totalWarnings)}</p>
//           </div>
 
//           {totalWarnings > 3 && (
//             <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
//               <p className="text-red-800 text-sm font-medium">
//                 ⚠️ Critical: Any additional violation will result in immediate game termination and automatic score
//                 submission.
//               </p>
//             </div>
//           )}
//           <button
//             onClick={onClose}
//             className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
//               totalWarnings >= 3
//                 ? "bg-red-600 hover:bg-red-700 text-white"
//                 : totalWarnings === 2
//                   ? "bg-orange-600 hover:bg-orange-700 text-white"
//                   : "bg-yellow-600 hover:bg-yellow-700 text-white"
//             }`}
//           >
//             I Understand - Continue Game
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
 


"use client"

import type React from "react"
import { AlertTriangle } from "lucide-react"

interface WarningDialogProps {
  open: boolean
  title: string
  totalWarnings: number
  lastWarningType: string
  onClose: () => void
}

export const WarningDialog: React.FC<WarningDialogProps> = ({
  open,
  title,
  totalWarnings,
  lastWarningType,
  onClose,
}) => {
  if (!open) return null

  const getWarningColor = (count: number) => {
    if (count === 2) return "text-orange-600 bg-orange-50 border-orange-200"
    if (count >= 3) return "text-red-600 bg-red-50 border-red-200"
    return "text-yellow-600 bg-yellow-50 border-yellow-200"
  }

  const getWarningMessage = (count: number) => {
    if (count === 2) return "Second warning - One more violation will terminate your game!"
    if (count >= 3) return "Final warning - Game will be terminated immediately!"
    return "Please be careful and follow the monitoring guidelines!"
  }

  const getButtonText = (count: number) => {
    if (count >= 3) return "I Understand - Game Will Terminate"
    return "I Understand - Continue Game"
  }

  const getMonitoringStatusMessage = (count: number) => {
    if (count >= 3) return "Game termination in progress..."
    return "Monitoring has been paused. After you confirm understanding, monitoring will resume automatically."
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${getWarningColor(totalWarnings)}`}
            >
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          </div>

          <div className={`rounded-xl p-4 mb-6 border ${getWarningColor(totalWarnings)}`}>
            <p className="font-semibold mb-2">
              Warning {totalWarnings}/3: {lastWarningType}
            </p>
            <p className="text-sm">{getWarningMessage(totalWarnings)}</p>
          </div>

          {/* Monitoring Status Message */}
          <div
            className={`rounded-xl p-4 mb-6 border ${
              totalWarnings >= 3 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            <p className={`text-sm font-medium ${totalWarnings >= 3 ? "text-red-800" : "text-blue-800"}`}>
              ⚠️ {getMonitoringStatusMessage(totalWarnings)}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
              totalWarnings >= 3
                ? "bg-red-600 hover:bg-red-700 text-white"
                : totalWarnings === 2
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {getButtonText(totalWarnings)}
          </button>
        </div>
      </div>
    </div>
  )
}
