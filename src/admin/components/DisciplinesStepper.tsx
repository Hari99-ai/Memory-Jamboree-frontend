import { cn } from "../../lib/utils";

interface Discipline {
  disc_id: number;
  discipline_name: string;
}

interface DisciplinesStepperProps {
  disciplines: Discipline[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export default function DisciplinesStepper({
  disciplines,
  activeTab,
  setActiveTab,
}: DisciplinesStepperProps) {
  return (
    <div className="flex gap-4 border-b border-gray-300 mb-4">
      {/* Manually added Overall button */}
      <button
        key="overall"
        onClick={() => setActiveTab("overall")}
        className={cn(
          "relative py-2 px-4 text-center transition-colors duration-300",
          activeTab === "overall"
            ? "text-black font-semibold"
            : "text-gray-500"
        )}
      >
        Overall
        <span
          className={cn(
            "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
            activeTab === "overall" ? "bg-blue-600 w-full" : "w-0"
          )}
        />
      </button>

      {/* Discipline buttons */}
      {disciplines.map((disc) => (
        <button
          key={disc.disc_id}
          onClick={() => setActiveTab(String(disc.disc_id))}
          className={cn(
            "relative py-2 px-4 text-center transition-colors duration-300",
            activeTab === String(disc.disc_id)
              ? "text-black font-semibold"
              : "text-gray-500"
          )}
        >
          {disc.discipline_name}
          <span
            className={cn(
              "absolute bottom-0 left-0 h-[2px] transition-all duration-300",
              activeTab === String(disc.disc_id)
                ? "bg-blue-600 w-full"
                : "w-0"
            )}
          />
        </button>
      ))}
    </div>
  );
}
