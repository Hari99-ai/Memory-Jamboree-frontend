interface Props {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    imageUrl: string;
    description: string;
  };
  open: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ event, open, onClose }: Props) {
  if (!open) return null;

  const { title, date, location, imageUrl, description } = event;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h2>
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p><span className="font-medium">Date:</span> {date}</p>
          <p><span className="font-medium">Location:</span> {location}</p>
        </div>
        <p className="text-gray-700 text-sm mb-4">{description}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
