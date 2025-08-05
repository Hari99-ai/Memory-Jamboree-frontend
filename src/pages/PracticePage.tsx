
import { ArrowLeft, Sparkles } from "lucide-react";
import { PracticeTestResultCard } from "../components/studentComponents/dashboard/practice-test-result-card";
import {  useNavigate } from "react-router-dom";



export default function PractisePage() {
  const navigate = useNavigate();

  // return (
  // <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-4">
     
  //               <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
  //           <Sparkles className="text-purple-500 w-6 h-6" />
  //         Practise Test Result
  //         </h1>
       
        
       
  //      <PracticeTestResultCard />
  //   </div>


  // );


   return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 py-10 px-4 overflow-x-hidden">
      {/* Animated Background Bubbles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10"></div>
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10"></div>
      <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10"></div>

      

      {/* Main Event Info (hidden during game) */}
   
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline hover:text-indigo-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-500 w-6 h-6" />
            Practise Test Result
          </h1> 
          <div className="w-[100%] flex" style={{    alignItems: "center",  justifyContent: "center"
}}>
             <div className="w-[50%] text-center">
               <PracticeTestResultCard />

          </div>
          </div>
         
        </div>
    
    </div>
  );
  

}


