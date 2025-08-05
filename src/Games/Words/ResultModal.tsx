import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "../../components/ui/button";

type ColumnScore = { score: number; total: number; allEmpty: boolean };
type PageColumnScores = ColumnScore[][];

export default function ResultModal({
  open,
  onClose,
  score,
  total,
  message,
  allPageColumnScores,
}: {
  open: boolean;
  onClose: () => void;
  score: number;
  total: number;
  correctAnswers: string[];
  userAnswers: string[];
  onRestart: () => void;
  message: React.ReactNode;
  allPageColumnScores?: PageColumnScores;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all">
              <Dialog.Title className="text-2xl font-bold mb-2">
                Your Results
              </Dialog.Title>
              <p className="text-lg mb-1">
                You scored <strong>{score}</strong> out of <strong>{total}</strong>
              </p>
              <p className="text-xl text-green-600 mb-4">{message}</p>

              {/* Per-page, per-column scores */}
              {allPageColumnScores && allPageColumnScores.length > 0 && (
                <div className="mb-4">
                  {allPageColumnScores.map((pageCols, pageIdx) => (
                    <div key={pageIdx} className="mb-2">
                      <div className="text-sm font-semibold mb-1">
                        Page {pageIdx + 1}
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {pageCols.map((col, idx) => (
                          <div
                            key={idx}
                            className="text-center font-bold py-2 rounded-lg bg-blue-600 "
                          >
                            {col.allEmpty ? "0" : col.score}/{col.total}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 mt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="bg-red-600 text-white text-lg px-6 py-3 hover:bg-blue-600 rounded-full"
                >
                  Close
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
