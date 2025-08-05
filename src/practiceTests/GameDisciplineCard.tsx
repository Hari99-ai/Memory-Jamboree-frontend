type Props = {
  title: string;
  onContinue: () => void;
  isEnabled?: boolean; // You already defined this, now we use it
};

export default function GameDisciplineCard({ title, onContinue, isEnabled = false }: Props) {
  return (
    <div className="border rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition flex flex-col justify-between">
      <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      <button
        onClick={onContinue}
        disabled={!isEnabled}
        className={`px-4 py-2 rounded shadow transition text-lg ${
          isEnabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isEnabled ? "Continue" : "Coming Soon"}
      </button>
    </div>
  );
}