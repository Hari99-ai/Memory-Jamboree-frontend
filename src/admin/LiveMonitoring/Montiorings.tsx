



import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FaFolder, FaUser } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import toast from "react-hot-toast";
import {
  monioring_logs,
  deleteMonitorings,
  window_event_logs,
  key_logs,
} from "../../lib/api";
import {CardWithLogs,PhoneDetectionLogs,PersonDetectionLogs} from "./LogCard";
import { KeyboardEventData, WindowData } from "../../types";
import { SkeletonCard } from "../components/SkeletonCard";
import { AUDIO_BASE_URL } from "../../lib/client";
import { Mic, ArrowLeft, Eye, EyeOff, Monitor, Keyboard, Volume2 } from "lucide-react";

export default function Monitorings() {
  const [selectedEventId, setSelectedEventId] = useState<any | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<any | null>(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<any | null>(
    null
  );

  const {
    data: folders,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["proctor_logs"],
    queryFn: monioring_logs,
  });

  const { data} = useQuery({
    queryKey: ["windowLogs", selectedUserEmail, setSelectedDisciplineId],
    queryFn: () => window_event_logs(selectedDisciplineId!, selectedUserEmail!),
    enabled: !!selectedUserEmail && !!setSelectedDisciplineId,
  });

  // const { data: keys_log } = useQuery({
  //   queryKey: ["keyboard_logs", selectedUserEmail, selectedDisciplineId],
  //   queryFn: () => key_logs(selectedDisciplineId!, selectedUserEmail!),
  //   enabled: !!selectedUserEmail && !!selectedDisciplineId,
  // });
  const logs = data?.logs ?? []
  const keys_log = data?.key_logs ?? []

  const mutation = useMutation({
    mutationFn: ({
      email,
      discipline_id,
    }: {
      email: string;
      discipline_id: string;
    }) => deleteMonitorings(email, discipline_id),
    onSuccess: () => {
      toast.success("Logs deleted successfully");
      refetch();
      setSelectedUserEmail(null);
    },
    onError: () => {
      toast.error("Failed to delete logs");
    },
  });

  const handleDelete = (email: string, discipline_id: string) => {
    mutation.mutate({ email, discipline_id });
  };

  if (isLoading) return <SkeletonCard />;

  if (!folders || Object.keys(folders).length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100">
            <Monitor className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-700">No Data Available</h3>
          <p className="text-slate-500">No monitoring logs found in the system</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-center text-[#245cab] mb-2">
            Proctoring Dashboard
          </h1>
          <p className="text-slate-600">Monitor and manage exam surveillance logs</p>
        </div>

        {!selectedEventId ? (
          // ------------------- Events View ---------------------
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(folders).map(([eventId, eventData]: any) => (
              <div
                key={eventId}
                onClick={() => setSelectedEventId(eventId)}
                className="p-6 transition-all duration-300 bg-white border shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl border-slate-200 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#245cab]  rounded-xl">
                    <FaFolder className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    Event
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold transition-colors text-slate-800 group-hover:text-blue-600">
                  {eventData.event_name}
                </h3>
                <div className="flex items-center text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{Object.keys(eventData.disciplines).length} Disciplines</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedEventId && !selectedUserEmail ? (
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedEventId(null)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </button>
              <div className="w-px h-6 bg-slate-300"></div>
              <h2 className="text-2xl font-bold text-slate-800">
                Users in {folders[selectedEventId]?.event_name}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                ...new Set(
                  Object.values(
                    folders[selectedEventId].disciplines || {}
                  ).flatMap((d: any) => Object.keys(d.users))
                ),
              ].map((email: string) => (
                <div
                  key={email}
                  onClick={() => setSelectedUserEmail(email)}
                  className="p-4 transition-all duration-300 border cursor-pointer group bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-purple-50 border-slate-200 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 transition-shadow bg-white rounded-lg shadow-sm group-hover:shadow-md">
                      <FaUser className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-800 group-hover:text-blue-800">
                        {email}
                      </p>
                      <p className="text-xs text-slate-500">Click to view logs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedEventId && selectedUserEmail && !selectedDisciplineId ? (
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedUserEmail(null)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
              </button>
              <div className="w-px h-6 bg-slate-300"></div>
              <h2 className="text-2xl font-bold text-slate-800">
                Disciplines for {selectedUserEmail}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(folders[selectedEventId]?.disciplines || {})
                .filter(([_, d]: any) => selectedUserEmail in d.users)
                .map(([discId, discData]: any) => (
                  <div
                    key={discId}
                    onClick={() => setSelectedDisciplineId(discId)}
                    className="p-6 transition-all duration-300 border cursor-pointer group bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 border-slate-200 hover:border-green-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 transition-shadow bg-white shadow-sm rounded-xl group-hover:shadow-md">
                        <Monitor className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                        Discipline
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold transition-colors text-slate-800 group-hover:text-green-700">
                      {discData.discipline_name}
                    </h3>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          // ------------------- Logs View ---------------------
          <div className="space-y-6">
            <div className="p-6 bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedUserEmail(null);
                      setSelectedDisciplineId(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Monitoring Logs</h2>
                    <p className="text-sm text-slate-600">{selectedUserEmail}</p>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-500 rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl"
                  onClick={() =>
                    handleDelete(selectedUserEmail!, selectedDisciplineId!)
                  }
                >
                  <MdDeleteForever className="w-4 h-4" />
                  Delete All Logs
                </button>
              </div>

              {/* Log Cards */}
              <div className="space-y-4">
                <CardWithLogs
                  title="Total Logs"
                  logs={
                    folders[selectedEventId]?.disciplines[selectedDisciplineId]
                      ?.users[selectedUserEmail]?.logs || []
                  }
                />

                <PersonDetectionLogs
                  title="Multiple Person Detection Logs"
                  logs={folders[selectedEventId]?.disciplines[selectedDisciplineId]?.users[selectedUserEmail]?.logs || []}
                />

                <PhoneDetectionLogs
                  title="Phone Detection Logs"
                  logs={folders[selectedEventId]?.disciplines[selectedDisciplineId]?.users[selectedUserEmail]?.logs || []}
                />
                <VoiceLogs
                  title="Voice Detection Logs"
                  logs={
                    folders[selectedEventId]?.disciplines[
                      selectedDisciplineId
                    ]?.users[selectedUserEmail]?.logs.filter(
                      (log: any) => log?.voice_db && log.voice_db > 20
                    ) || []
                  }
                />
                <WindowLogsTable title="Window Detection Logs" data={logs || []} />
                <KeyboardLogsTable
                  title="Keyboard Detection Logs"
                  kdata={keys_log || []}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// Person Detection Logs Component
// type PersonDetectionLogsProps = {
//   title: string;
//   logs: any[];
// };

// PersonDetectionLogs component displays logs of multiple person detections
// function PersonDetectionLogs({ title, logs }: PersonDetectionLogsProps) {
//   const [showTable, setShowTable] = useState(false);

//   return (
//     <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
//       <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 border-slate-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-lg shadow-sm">
//             <Users className="w-5 h-5 text-amber-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-600">{logs.length} records found</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowTable(!showTable)}
//           className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg shadow-lg bg-amber-500 hover:bg-amber-600 hover:shadow-xl"
//         >
//           {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           {showTable ? "Hide Details" : "Show Details"}
//         </button>
//       </div>

//       {showTable && (
//         <div className="p-6">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto">
//             {logs.length > 0 ? (
//               logs.map((log, i) => (
//                 <div key={i} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="text-sm text-slate-600">
//                       <span className="font-medium text-slate-800">
//                         {new Date(log.log_time).toLocaleString()}
//                       </span>
//                     </div>
//                     <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
//                       {log.person_count} persons detected
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     <div>
//                       <h4 className="mb-1 text-sm font-medium text-slate-700">Detection Details</h4>
//                       <pre className="p-2 overflow-x-auto text-xs bg-white border rounded border-slate-200">
//                         {JSON.stringify(log.person_detection || {}, null, 2)}
//                       </pre>
//                     </div>
//                     {log.screenshot && (
//                       <div>
//                         <h4 className="mb-1 text-sm font-medium text-slate-700">Screenshot</h4>
//                         <img
//                           src={`data:image/jpeg;base64,${log.screenshot}`}
//                           alt="Detection screenshot"
//                           className="h-auto max-w-full border rounded border-slate-200"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="py-8 text-center text-slate-500">
//                 No multiple person detection logs found
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// Phone Detection Logs Component
// function PhoneDetectionLogs({ title, logs }: { title: string; logs: any[] }) {
//   const [showTable, setShowTable] = useState(false);

//   return (
//     <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
//       <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50 border-slate-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-lg shadow-sm">
//             <Volume2 className="w-5 h-5 text-blue-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-600">{logs.length} records found</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowTable(!showTable)}
//           className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl"
//         >
//           {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           {showTable ? "Hide Details" : "Show Details"}
//         </button>
//       </div>

//       {showTable && (
//         <div className="p-6">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto">
//             {logs.map((log, i) => (
//               <div key={i} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="text-sm text-slate-600">
//                     <span className="font-medium text-slate-800">
//                       {new Date(log.log_time).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-white rounded-lg shadow-sm">
//                     <Mic className="w-4 h-4 text-blue-600" />
//                   </div>
//                   {log.audio_file && (
//                     <div className="flex-1">
//                       <audio controls className="w-full">
//                         <source
//                           src={`${AUDIO_BASE_URL}/${log.audio_file}`}
//                           type="audio/webm"
//                         />
//                         Your browser does not support the audio tag.
//                       </audio>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// Voice Logs Component
function VoiceLogs({ title, logs }: { title: string; logs: any[] }) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Volume2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">{logs.length} records found</p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-500 rounded-lg shadow-lg hover:bg-purple-600 hover:shadow-xl"
        >
          {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">
                      {new Date(log.log_time).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mic className="w-4 h-4 text-purple-600" />
                  </div>
                  {log.audio_file && (
                    <div className="flex-1">
                      <audio controls className="w-full">
                        <source
                          src={`${AUDIO_BASE_URL}/${log.audio_file}`}
                          type="audio/webm"
                        />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type WindowLogsTableProps = {
  data: WindowData[];
  title: string;
};

const WindowLogsTable = ({ data, title }: WindowLogsTableProps) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">{data.length} records found</p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl"
        >
          {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-200">
                  <th className="p-4 font-semibold text-left text-slate-700">WID</th>
                  <th className="p-4 font-semibold text-left text-slate-700">Window Event</th>
                  <th className="p-4 font-semibold text-left text-slate-700">Transaction Log</th>
                </tr>
              </thead>
              <tbody>
                {data.map((log, index) => (
                  <tr key={index} className="transition-colors border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-slate-700">{log.wid}</td>
                    <td className="p-4">
                      {log.window_event === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-orange-700 bg-orange-100 rounded-full">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Window Event Occurred
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-pre-wrap text-slate-700">{log.transaction_log}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

type KeyboardTableProps = {
  kdata: KeyboardEventData[];
  title: string;
};

const KeyboardLogsTable = ({ kdata, title }: KeyboardTableProps) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Keyboard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">{kdata.length} records found</p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-500 rounded-lg shadow-lg hover:bg-green-600 hover:shadow-xl"
        >
          {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-200">
                  <th className="p-4 font-semibold text-left text-slate-700">KID</th>
                  <th className="p-4 font-semibold text-left text-slate-700">Keyboard Event</th>
                  <th className="p-4 font-semibold text-left text-slate-700">Transaction Log</th>
                </tr>
              </thead>
              <tbody>
                {kdata.map((log, index) => (
                  <tr key={index} className="transition-colors border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-slate-700">{log.kid}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-700 bg-red-100 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {log.keyboard_event} Shortcut Detected
                      </span>
                    </td>
                    <td className="p-4 whitespace-pre-wrap text-slate-700">{log.transaction_log}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// import { useState } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { FaFolder, FaUser } from "react-icons/fa6";
// import { MdDeleteForever } from "react-icons/md";
// import toast from "react-hot-toast";
// import {
//   monioring_logs,
//   deleteMonitorings,
//   window_event_logs,
//   key_logs,
// } from "../../lib/api";
// import CardWithLogs from "./LogCard";
// import { KeyboardEventData, WindowData } from "../../types";
// import { SkeletonCard } from "../components/SkeletonCard";
// import { AUDIO_BASE_URL } from "../../lib/client";
// import { Mic, ArrowLeft, Eye, EyeOff, Monitor, Keyboard, Volume2 } from "lucide-react";

// export default function Monitorings() {
//   const [selectedEventId, setSelectedEventId] = useState<any | null>(null);
//   const [selectedUserEmail, setSelectedUserEmail] = useState<any | null>(null);
//   const [selectedDisciplineId, setSelectedDisciplineId] = useState<any | null>(
//     null
//   );

//   const {
//     data: folders,
//     refetch,
//     isLoading,
//   } = useQuery({
//     queryKey: ["proctor_logs"],
//     queryFn: monioring_logs,
//   });

//   const { data: logs } = useQuery({
//     queryKey: ["windowLogs", selectedUserEmail, setSelectedDisciplineId],
//     queryFn: () => window_event_logs(selectedDisciplineId!, selectedUserEmail!),
//     enabled: !!selectedUserEmail && !!setSelectedDisciplineId,
//   });

//   const { data: keys_log } = useQuery({
//     queryKey: ["keyboard_logs", selectedUserEmail, selectedDisciplineId],
//     queryFn: () => key_logs(selectedDisciplineId!, selectedUserEmail!),
//     enabled: !!selectedUserEmail && !!selectedDisciplineId,
//   });

//   const mutation = useMutation({
//     mutationFn: ({
//       email,
//       discipline_id,
//     }: {
//       email: string;
//       discipline_id: string;
//     }) => deleteMonitorings(email, discipline_id),
//     onSuccess: () => {
//       toast.success("Logs deleted successfully");
//       refetch();
//       setSelectedUserEmail(null);
//     },
//     onError: () => {
//       toast.error("Failed to delete logs");
//     },
//   });

//   const handleDelete = (email: string, discipline_id: string) => {
//     mutation.mutate({ email, discipline_id });
//   };

//   if (isLoading) return <SkeletonCard />;

//   if (!folders || Object.keys(folders).length === 0)
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
//           <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Monitor className="w-12 h-12 text-slate-400" />
//           </div>
//           <h3 className="text-xl font-semibold text-slate-700 mb-2">No Data Available</h3>
//           <p className="text-slate-500">No monitoring logs found in the system</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl text-center text-[#245cab] mb-2">
//             Proctoring Dashboard
//           </h1>
//           <p className="text-slate-600">Monitor and manage exam surveillance logs</p>
//         </div>

//         {!selectedEventId ? (
//           // ------------------- Events View ---------------------
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {Object.entries(folders).map(([eventId, eventData]: any) => (
//               <div
//                 key={eventId}
//                 onClick={() => setSelectedEventId(eventId)}
//                 className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-[#245cab]  rounded-xl">
//                     <FaFolder className="w-6 h-6 text-white" />
//                   </div>
//                   <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
//                     Event
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
//                   {eventData.event_name}
//                 </h3>
//                 <div className="flex items-center text-sm text-slate-600">
//                   <div className="flex items-center gap-1">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span>{Object.keys(eventData.disciplines).length} Disciplines</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : selectedEventId && !selectedUserEmail ? (
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <div className="flex items-center gap-4 mb-6">
//               <button
//                 onClick={() => setSelectedEventId(null)}
//                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Back to Events
//               </button>
//               <div className="h-6 w-px bg-slate-300"></div>
//               <h2 className="text-2xl font-bold text-slate-800">
//                 Users in {folders[selectedEventId]?.event_name}
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {[
//                 ...new Set(
//                   Object.values(
//                     folders[selectedEventId].disciplines || {}
//                   ).flatMap((d: any) => Object.keys(d.users))
//                 ),
//               ].map((email: string) => (
//                 <div
//                   key={email}
//                   onClick={() => setSelectedUserEmail(email)}
//                   className="group cursor-pointer bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:shadow-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
//                       <FaUser className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-800">
//                         {email}
//                       </p>
//                       <p className="text-xs text-slate-500">Click to view logs</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : selectedEventId && selectedUserEmail && !selectedDisciplineId ? (
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <div className="flex items-center gap-4 mb-6">
//               <button
//                 onClick={() => setSelectedUserEmail(null)}
//                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Back to Users
//               </button>
//               <div className="h-6 w-px bg-slate-300"></div>
//               <h2 className="text-2xl font-bold text-slate-800">
//                 Disciplines for {selectedUserEmail}
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {Object.entries(folders[selectedEventId]?.disciplines || {})
//                 .filter(([_, d]: any) => selectedUserEmail in d.users)
//                 .map(([discId, discData]: any) => (
//                   <div
//                     key={discId}
//                     onClick={() => setSelectedDisciplineId(discId)}
//                     className="group cursor-pointer bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 hover:from-green-100 hover:to-blue-100 transition-all duration-300 border border-slate-200 hover:border-green-300 hover:shadow-lg"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
//                         <Monitor className="w-6 h-6 text-green-600" />
//                       </div>
//                       <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
//                         Discipline
//                       </div>
//                     </div>
//                     <h3 className="text-lg font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
//                       {discData.discipline_name}
//                     </h3>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         ) : (
//           // ------------------- Logs View ---------------------
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={() => {
//                       setSelectedUserEmail(null);
//                       setSelectedDisciplineId(null);
//                     }}
//                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
//                   >
//                     <ArrowLeft className="w-4 h-4" />
//                     Back to Users
//                   </button>
//                   <div className="h-6 w-px bg-slate-300"></div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-800">Monitoring Logs</h2>
//                     <p className="text-sm text-slate-600">{selectedUserEmail}</p>
//                   </div>
//                 </div>
//                 <button
//                   className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
//                   onClick={() =>
//                     handleDelete(selectedUserEmail!, selectedDisciplineId!)
//                   }
//                 >
//                   <MdDeleteForever className="w-4 h-4" />
//                   Delete All Logs
//                 </button>
//               </div>

//               {/* Log Cards */}
//               <div className="space-y-4">
//                 <CardWithLogs
//                   title="Total Logs"
//                   logs={
//                     folders[selectedEventId]?.disciplines[selectedDisciplineId]
//                       ?.users[selectedUserEmail]?.logs || []
//                   }
//                 />
//                 <CardWithLogs
//                   title="Phone Detection Logs"
//                   logs={
//                     folders[selectedEventId]?.disciplines[
//                       selectedDisciplineId
//                     ]?.users[selectedUserEmail]?.logs.filter(
//                       (log: any) => log?.phone_detection
//                     ) || []
//                   }
//                 />
//                 <VoiceLogs
//                   title="Voice Detection Logs"
//                   logs={
//                     folders[selectedEventId]?.disciplines[
//                       selectedDisciplineId
//                     ]?.users[selectedUserEmail]?.logs.filter(
//                       (log: any) => log?.voice_db && log.voice_db > 0
//                     ) || []
//                   }
//                 />
//                 <WindowLogsTable title="Window Detection Logs" data={logs || []} />
//                 <KeyboardLogsTable
//                   title="Keyboard Detection Logs"
//                   kdata={keys_log || []}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Voice Logs Component
// function VoiceLogs({ title, logs }: { title: string; logs: any[] }) {
//   const [showTable, setShowTable] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//       <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-lg shadow-sm">
//             <Volume2 className="w-5 h-5 text-purple-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-600">{logs.length} records found</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowTable(!showTable)}
//           className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-lg hover:shadow-xl"
//         >
//           {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           {showTable ? "Hide Details" : "Show Details"}
//         </button>
//       </div>

//       {showTable && (
//         <div className="p-6">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto">
//             {logs.map((log, i) => (
//               <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="text-sm text-slate-600">
//                     <span className="font-medium text-slate-800">
//                       {new Date(log.log_time).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-white rounded-lg shadow-sm">
//                     <Mic className="w-4 h-4 text-purple-600" />
//                   </div>
//                   {log.audio_file && (
//                     <div className="flex-1">
//                       <audio controls className="w-full">
//                         <source
//                           src={`${AUDIO_BASE_URL}/${log.audio_file}`}
//                           type="audio/webm"
//                         />
//                         Your browser does not support the audio tag.
//                       </audio>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// type WindowLogsTableProps = {
//   data: WindowData[];
//   title: string;
// };

// const WindowLogsTable = ({ data, title }: WindowLogsTableProps) => {
//   const [showTable, setShowTable] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//       <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-lg shadow-sm">
//             <Monitor className="w-5 h-5 text-blue-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-600">{data.length} records found</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowTable(!showTable)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
//         >
//           {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           {showTable ? "Hide Details" : "Show Details"}
//         </button>
//       </div>

//       {showTable && (
//         <div className="p-6">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   <th className="text-left p-4 font-semibold text-slate-700">WID</th>
//                   <th className="text-left p-4 font-semibold text-slate-700">Window Event</th>
//                   <th className="text-left p-4 font-semibold text-slate-700">Transaction Log</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((log, index) => (
//                   <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
//                     <td className="p-4 text-slate-700">{log.wid}</td>
//                     <td className="p-4">
//                       {log.window_event === 1 && (
//                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
//                           <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
//                           Window Event Occurred
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-4 text-slate-700 whitespace-pre-wrap">{log.transaction_log}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// type KeyboardTableProps = {
//   kdata: KeyboardEventData[];
//   title: string;
// };

// const KeyboardLogsTable = ({ kdata, title }: KeyboardTableProps) => {
//   const [showTable, setShowTable] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//       <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-lg shadow-sm">
//             <Keyboard className="w-5 h-5 text-green-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-600">{kdata.length} records found</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowTable(!showTable)}
//           className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
//         >
//           {showTable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           {showTable ? "Hide Details" : "Show Details"}
//         </button>
//       </div>

//       {showTable && (
//         <div className="p-6">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   <th className="text-left p-4 font-semibold text-slate-700">KID</th>
//                   <th className="text-left p-4 font-semibold text-slate-700">Keyboard Event</th>
//                   <th className="text-left p-4 font-semibold text-slate-700">Transaction Log</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {kdata.map((log, index) => (
//                   <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
//                     <td className="p-4 text-slate-700">{log.kid}</td>
//                     <td className="p-4">
//                       <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
//                         <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                         {log.keyboard_event} Shortcut Detected
//                       </span>
//                     </td>
//                     <td className="p-4 text-slate-700 whitespace-pre-wrap">{log.transaction_log}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };