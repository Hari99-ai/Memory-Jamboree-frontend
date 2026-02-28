import { Badge } from "../../components/ui/badge";
import { useRecoilValue } from "recoil";
import { eventStatusState } from "../../atoms/eventAtom";
import { useEventWebSocket } from "../../hooks/useEventStatusUpdate";
import clsx from "clsx";

export const StatusCell = ({
  eventId,
  etype,
}: {
  eventId: string;
  etype?: number;
}) => {
  // Initialize WebSocket & status updates
  useEventWebSocket(eventId);

  // Get dynamic status from Recoil
  const dynamicStatus = useRecoilValue(eventStatusState(eventId));

  // Decide final status: Prefer WebSocket status, fallback to etype
  const status =
    dynamicStatus ||
    (etype === 1
      ? "Live"
      : etype === 2
      ? "Upcoming"
      : etype === 0
      ? "Expired"
      : "Unknown");

  // Dynamic styling based on status
  const customClass = clsx({
    "bg-green-100 text-green-800": status === "Live",
    "bg-yellow-100 text-yellow-800": status === "Upcoming",
    "bg-red-100 text-red-800": status === "Expired",
    "bg-gray-100 text-gray-800": status === "Unknown",
  });

  return (
    <Badge className={clsx("px-2 py-1 text-sm rounded-md border", customClass)}>
      {status}
    </Badge>
  );
};
