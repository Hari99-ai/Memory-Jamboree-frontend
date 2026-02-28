import JSZip from "jszip";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../../lib/client";

// This original function is left unchanged.
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


// ✨ NEW function to download warnings with detailed user and event info.
export const DownloadWarningLogs = async (
  logs: any[],
  details: {
    eventName: string;
    username: string;
    email: string;
    score: number | string;
    status: string;
    disciplineName: string;
  }
) => {
  if (!logs || logs.length === 0) {
    alert("No warning logs to download.");
    return;
  }

  const zip = new JSZip();

  // Helper to generate a descriptive warning name from log data
  const getWarningName = (log: any): string => {
    const warnings = [];
    if (log.phone_detection) {
      warnings.push("Phone Detected");
    }
    if (log.final_focus?.includes("Incorrect Position")) {
      warnings.push(`Focus Warning: ${log.final_focus}`);
    }
    if (log.person_status > 0) {
      warnings.push(`Multiple Persons Detected (${log.person_status})`);
    }
    return warnings.join("; ") || "N/A";
  };

  // 1. Create CSV content with the new structure
  const csvHeader = [
    "Event Name",
    "Username",
    "Email",
    "Score",
    "Status",
    "Discipline Name",
    "Warning Name",
    "Timestamp",
    "Image Names"
  ];

  const csvRows = logs.map((log, index) => {
    const imageNames = ['img_log', 'external_img']
      .map(key => (log[key] ? `${index}_${key}_${log[key].split("/").pop()}` : ""))
      .filter(Boolean)
      .join("; ");

    return [
      `"${details.eventName}"`,
      `"${details.username}"`,
      `"${details.email}"`,
      details.score,
      `"${details.status}"`,
      `"${details.disciplineName}"`,
      `"${getWarningName(log)}"`,
      log.log_time,
      `"${imageNames}"`
    ];
  });

  const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");
  zip.file("warning_report.csv", csvContent);

  // 2. Fetch all images and add them to the zip
  const imagePromises = [];
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    for (const key of ['img_log', 'external_img']) {
      if (log[key]) {
        const imageUrl = `${API_BASE_URL}/${log[key]}`;
        const filename = `${i}_${key}_${log[key].split("/").pop()}`;
        
        const promise = fetch(imageUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
            }
            return response.blob();
          })
          .then(blob => {
            zip.file(filename, blob);
          })
          .catch(err => {
            console.error(err);
            // Add a text file to the zip indicating the failed download
            zip.file(`ERROR_${filename}.txt`, `Could not download image from: ${imageUrl}\nError: ${err.message}`);
          });
        imagePromises.push(promise);
      }
    }
  }
  
  await Promise.all(imagePromises);

  // 3. Generate and trigger the zip file download
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${details.username}_warning_report.zip`);
};