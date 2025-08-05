import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

const getGreeting = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage === 100) return"🎯 Perfect Memory! You're a face recognition master!";
  if (percentage >= 90) return "👏 Great job! Your memory is impressive!";
  if (percentage >= 75) return "🙂 Not bad! Keep practicing!";
  if (percentage >= 50) return "💡 Keep trying! You’ll get better with time!";
  return "Keep Practicing!";
};

export default function ResultModal({
  open,
  onClose,
  score,
  total,
  correctAnswers,
  userAnswers,
}: {
  open: boolean;
  onClose: () => void;
  score: number;
  total: number;
  correctAnswers: string[];
  userAnswers: string[];
  onRestart: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {getGreeting(score, total)} 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="text-center my-4 text-lg">
          Your Score: <span className="font-bold">{score} / {total}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {correctAnswers.map((correct, idx) => {
            const userAnswer = userAnswers[idx] || "";
            const isCorrect = correct.toLowerCase() === userAnswer.toLowerCase();
            return (
              <div key={idx} className={`p-3 rounded-xl ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                <p className="font-medium">Correct: {correct}</p>
                <p>
                  Your Answer:{" "}
                  <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                    {userAnswer || "—"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline"  onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
