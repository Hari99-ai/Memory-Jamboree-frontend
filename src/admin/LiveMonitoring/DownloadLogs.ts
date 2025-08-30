import JSZip from "jszip";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../../lib/client";

export const DownloadLogs = async (logs: any[]) => {
  if (!logs || logs.length === 0) return;

  const zip = new JSZip();

  // Add CSV
  const csvRows = [
    ["Time", "Focus Warning", "Phone Detected", "Person Detected", "Image Names"],
    ...logs.map((log, index) => [
      log.log_time,
      log.final_focus || "",
      log.phone_detection ? "Yes" : "No",
      log.person_status > 0 ? log.person_status : "",
      ['img_log', 'external_img']
        .map((key) => (log[key] ? `${index}_${key}_${log[key].split("/").pop()}` : ""))
        .filter(Boolean)
        .join(", "),
    ]),
  ];
  const csvContent = csvRows.map((e) => e.join(",")).join("\n");
  zip.file("warning_logs.csv", csvContent);

  // Add Images
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    for (const key of ['img_log', 'external_img']) {
      if (log[key]) {
        try {
          const url = `${API_BASE_URL}/${log[key]}`;
          const response = await fetch(url);
          const blob = await response.blob();
          const filename = `${i}_${key}_${log[key].split("/").pop()}`;
          zip.file(filename, blob);
        } catch (err) {
          console.error("Failed to fetch image:", log[key], err);
        }
      }
    }
  }

  // Generate ZIP and download
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "warning_logs_with_images.zip");
};
