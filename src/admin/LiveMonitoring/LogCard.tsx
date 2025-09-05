import { useState, useEffect } from "react";
import { FaUser, FaClock, FaMobile, FaMicrophone, FaRegEye } from "react-icons/fa6";
import { API_BASE_URL } from "../../lib/client";
// import { FaExclamationTriangle } from "react-icons/fa";
// import { DownloadLogs } from "./DownloadLogs";
import JSZip from "jszip";
import saveAs from "file-saver";

// Utility function to convert timestamp to Indian Standard Time (IST)
export const convertToIST = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') return "Invalid Time";

  try {
    // Assuming the source time is in UTC or a compatible format
    const date = new Date(timeString.replace(' ', 'T') + 'Z');

    // Add 5 hours and 30 minutes for IST offset
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);

    // Format the date back to a readable string
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} IST`;
  } catch (error) {
    console.error("Error converting time:", error);
    return timeString; // Return original string on error
  }
};


// Session storage caching utilities
const getImageFromCache = (url: string): string | null => {
  try {
    return sessionStorage.getItem(`img_cache_${url}`);
  } catch {
    return null;
  }
};

const setImageInCache = (url: string, base64: string) => {
  try {
    sessionStorage.setItem(`img_cache_${url}`, base64);
  } catch {}
};

// Convert image to base64
const imageToBase64 = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  // Helper for consistent portrait image style
const portraitImgClass = "object-contain w-full h-80 rounded-lg shadow-sm";

export function CardWithLogs({ title, logs }: { title: string; logs: any[] }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [_, setLoadingImages] = useState<Set<string>>(new Set());
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // Collect all image URLs from both desktop and phone logs
  const imageUrls = logs.flatMap(log => {
    const urls: string[] = [];
    if (log.img_log)
      urls.push(`${API_BASE_URL.replace(/\/$/, "")}/${log.img_log.replace(/^\/+/, "")}`);
    if (log.external_img)
      urls.push(`${API_BASE_URL.replace(/\/$/, "")}/${log.external_img.replace(/^\/+/, "")}`);
    return urls;
  });

  // Preload images
  useEffect(() => {
    const preload = async () => {
      if (!imageUrls.length) return;
      setIsPreloading(true);
      setPreloadingProgress(0);
      const cache: Record<string, string> = {};
      const loading = new Set<string>();

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const cached = getImageFromCache(url);
        if (cached) {
          cache[url] = cached;
          setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
          continue;
        }

        try {
          loading.add(url);
          setLoadingImages(new Set(loading));
          const base64 = await imageToBase64(url);
          cache[url] = base64;
          setImageInCache(url, base64);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        } catch (err) {
          console.error(`Failed to preload image: ${url}`, err);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        }

        setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
      }

      setImageCache(cache);
      setIsPreloading(false);
    };

    preload();
  }, [logs]);

  if (!logs || logs.length === 0)
    return (
      <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm rounded-full bg-slate-100 text-slate-600">0 logs</div>
        </div>
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
            <FaRegEye className="w-8 h-8 text-slate-400" />
          </div>
          <p className="italic text-slate-500">No logs available</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {logs.length} logs
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {isPreloading && imageUrls.length > 0 && (
        <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Preloading images...</span>
            <span className="text-sm text-blue-600">{Math.round(preloadingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
              style={{ width: `${preloadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {logs.map((log, index) => (
            <div key={index} className="p-4 border bg-slate-50 rounded-xl border-slate-200 hover:shadow-md">
              {/* Desktop log */}
              {log.img_log && (
                <div className="relative mb-4">
                  <img
                    src={imageCache[`${API_BASE_URL}/${log.img_log}`] || `${API_BASE_URL}/${log.img_log}`}
                    alt="Desktop log"
                    className={portraitImgClass}

                  />
                </div>
              )}

              {/* Phone log */}
              {log.external_img && (
                <div className="relative mb-4">
                  <img
                    src={imageCache[`${API_BASE_URL}/${log.external_img}`] || `${API_BASE_URL}/${log.external_img}`}
                    alt="Phone log"
                  className={portraitImgClass}

                  />
                </div>
              )}

              {/* Log details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaClock className="w-3 h-3" />
                  <span className="font-medium">{convertToIST(log.log_time)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaUser className="w-3 h-3" />
                  <span className="text-slate-600">Person:</span>
                  {log.person_status > 0 ? (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Detected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Not Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaMobile className="w-3 h-3" />
                  <span className="text-slate-600">Phone:</span>
                  {log.phone_detection ? (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Detected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Not Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaRegEye className="w-3 h-3" />
                  <span>Eyes:</span>
                  <span className="font-medium">{log.user_movements_eyes}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaUser className="w-3 h-3" />
                  <span>Head:</span>
                  <span className="font-medium">{log.user_movements_updown}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaMicrophone className="w-3 h-3" />
                  <span className="text-slate-600">Voice DB:</span>
                  {log.voice_db < 10 ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Normal
                    </span>
                  ) : log.voice_db < 20 ? (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                      Little Disturbance
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      More Disturbance
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExternalLogs({ title, logs }: { title: string; logs: any[] }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // Collect all external image URLs
  const imageUrls = logs
    .filter(log => log.external_img)
    .map(log => `${API_BASE_URL.replace(/\/$/, "")}/${log.external_img.replace(/^\/+/, "")}`);

  // Preload external images
  useEffect(() => {
    const preload = async () => {
      if (!imageUrls.length) return;
      setIsPreloading(true);
      setPreloadingProgress(0);
      const cache: Record<string, string> = {};
      const loading = new Set<string>();

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const cached = getImageFromCache(url);
        if (cached) {
          cache[url] = cached;
          setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
          continue;
        }

        try {
          loading.add(url);
          setLoadingImages(new Set(loading));
          const base64 = await imageToBase64(url);
          cache[url] = base64;
          setImageInCache(url, base64);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        } catch (err) {
          console.error(`Failed to preload image: ${url}`, err);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        }

        setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
      }

      setImageCache(cache);
      setIsPreloading(false);
    };

    preload();
  }, [logs]);

  // Filter logs that actually have an external_img
  const filteredLogs = logs.filter(log => log.external_img);

  if (!filteredLogs || filteredLogs.length === 0) {
    return (
      <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            0 logs
          </div>
          
        </div>
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
            <FaMobile className="w-8 h-8 text-slate-400" />
          </div>
          <p className="italic text-slate-500">No mobile logs available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-slate-800">Mobile Logs</h4>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      

      {/* Preloading progress bar */}
      {isPreloading && imageUrls.length > 0 && (
        <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Preloading images...</span>
            <span className="text-sm text-blue-600">{Math.round(preloadingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
              style={{ width: `${preloadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <ul className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLogs.map((log, index) => (
            <li key={index} className="p-4 border bg-slate-50 rounded-xl border-slate-200 hover:shadow-md">
              {log.external_img && (
                <>
                  {imageCache[`${API_BASE_URL}/${log.external_img}`] ? (
                    <img
                      src={imageCache[`${API_BASE_URL}/${log.external_img}`]}
                      alt="External log"
                     className={portraitImgClass}

                    />
                  ) : loadingImages.has(`${API_BASE_URL}/${log.external_img}`) ? (
                    <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                      <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                      <span className="text-sm text-slate-500">Image unavailable</span>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaClock className="w-3 h-3" />
                  <span className="font-medium">{convertToIST(log.log_time)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaUser className="w-3 h-3" />
                  <span className="text-slate-600">Person:</span>
                  {log.phone_detection ? (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Detected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Not Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaMobile className="w-3 h-3" />
                  <span className="text-slate-600">Phone:</span>
                  {log.phone_detection ? (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Detected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Not Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaMicrophone className="w-3 h-3" />
                  <span className="text-slate-600">Voice DB:</span>
                  {log.voice_db < 10 ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Normal
                    </span>
                  ) : log.voice_db < 20 ? (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                      Little Disturbance
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      More Disturbance
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export function PhoneDetectionLogs({
  title,
  logs,
}: {
  title: string;
  logs: any[];
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Only logs with phone detection
  const phoneDetectedLogs = logs.filter(log => log?.phone_detection > 0);

  // Normalize image URLs (img_log + external_img)
  const imageUrls = phoneDetectedLogs.flatMap(log => {
    const urls: string[] = [];
    if (log.img_log) urls.push(`${API_BASE_URL}/${log.img_log}`);
    if (log.external_img) urls.push(`${API_BASE_URL}/${log.external_img}`);
    return urls;
  });

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      if (imageUrls.length === 0) return;

      setIsPreloading(true);
      setPreloadingProgress(0);

      const cache: Record<string, string> = {};
      const loading = new Set<string>();

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const cachedImage = getImageFromCache(url);

        if (cachedImage) {
          cache[url] = cachedImage;
          setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
          continue;
        }

        try {
          loading.add(url);
          setLoadingImages(new Set(loading));

          const base64 = await imageToBase64(url);
          cache[url] = base64;
          setImageInCache(url, base64);

          loading.delete(url);
          setLoadingImages(new Set(loading));
        } catch (error) {
          console.error(`Failed to preload image: ${url}`, error);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        }

        setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
      }

      setImageCache(cache);
      setIsPreloading(false);
    };

    preloadImages();
  }, [logs]);

  if (!phoneDetectedLogs || phoneDetectedLogs.length === 0) {
    return (
      <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm rounded-full bg-slate-100 text-slate-600">
            0 detections
          </div>
        </div>
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
            <FaMobile className="w-8 h-8 text-slate-400" />
          </div>
          <p className="italic text-slate-500">No phone detections found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-6 border shadow-lg bg-gradient-to-r from-cyan-50 to-blue-100 rounded-2xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
            {phoneDetectedLogs.length} detections
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-500 rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl"
        >
          <FaMobile className="w-4 h-4" />
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Preloading progress bar */}
      {isPreloading && imageUrls.length > 0 && (
        <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">
              Preloading images...
            </span>
            <span className="text-sm text-red-600">
              {Math.round(preloadingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-red-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 bg-red-500 rounded-full"
              style={{ width: `${preloadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {phoneDetectedLogs.map((log: any, index: number) => (
            <div
              key={index}
              className="p-4 transition-shadow border border-red-200 bg-red-50 rounded-xl hover:shadow-md"
            >
              {/* Display all image fields */}
              {['img_log', 'external_img'].map((key) => {
                const url = log[key] ? `${API_BASE_URL}/${log[key]}` : null;
                if (!url) return null;

                return (
                  <div key={key} className="relative mb-4">
                    {imageCache[url] ? (
                      <img
                        src={imageCache[url]}
                        alt={key}
                       className={portraitImgClass}

                      />
                    ) : loadingImages.has(url) ? (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <div className="w-8 h-8 border-b-2 border-red-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <span className="text-sm text-slate-500">
                          Image unavailable
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="p-1 bg-white rounded">
                    <FaClock className="w-3 h-3" />
                  </div>
                  <span className="font-medium">{convertToIST(log.log_time)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 bg-white rounded">
                    <FaMobile className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="text-slate-600">Phone:</span>
                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                    Detected
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export const WarningCountLogs = ({
  title,
  logs,
}: {
  title: string;
  logs: any[];
}) => {
 const [showDetails, setShowDetails] = useState(false);
    const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // Only warnings (phone detected or focus loss)
  const warningLogs = logs.filter(
    (log) => log.phone_detection || log.final_focus?.includes("Incorrect Position")
  );

  // Download logs with images
  const downloadWarnings = async () => {
    if (!warningLogs.length) return;
    const zip = new JSZip();

    // CSV
    const csvRows = [
      ["Time", "Focus Warning", "Phone Detected", "Person Detected", "Images"],
      ...warningLogs.map((log) => [
        convertToIST(log.log_time),
        log.final_focus || "",
        log.phone_detection ? "Yes" : "No",
        log.person_status || 0,
        ["img_log", "external_img"]
          .map((key) => (log[key] ? log[key].split("/").pop() : ""))
          .filter(Boolean)
          .join(", "),
      ]),
    ];
    zip.file("warning_logs.csv", csvRows.map((r) => r.join(",")).join("\n"));

    // Images
    for (let i = 0; i < warningLogs.length; i++) {
      const log = warningLogs[i];
      for (const key of ["img_log", "external_img"] as const) {
        if (log[key] && imageCache[log[key]]) {
          const blob = await (await fetch(imageCache[log[key]])).blob();
          zip.file(`${i}_${key}_${log[key].split("/").pop()}`, blob);
        }
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "warning_logs.zip");
  };

  const imageUrls = warningLogs.flatMap((log) => {
    const urls: string[] = [];
    if (log.img_log) urls.push(`${API_BASE_URL}/${log.img_log}`);
    if (log.external_img) urls.push(`${API_BASE_URL}/${log.external_img}`);
    return urls;
  });



   useEffect(() => {
    const preloadImages = async () => {
      if (imageUrls.length === 0) return;

      setIsPreloading(true);
      setPreloadingProgress(0);

      const cache: Record<string, string> = {};
      const loading = new Set<string>();

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const cachedImage = getImageFromCache(url);
        if (cachedImage) {
          cache[url] = cachedImage;
          setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
          continue;
        }

        try {
          loading.add(url);
          setLoadingImages(new Set(loading));
          const base64 = await imageToBase64(url);
          cache[url] = base64;
          setImageInCache(url, base64);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        } catch (error) {
          console.error(`Failed to preload image: ${url}`, error);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        }
        setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
      }

      setImageCache(cache);
      setIsPreloading(false);
    };

    preloadImages();
  }, [logs]);

  if (!warningLogs.length) {
    return (
      <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm rounded-full bg-slate-100 text-slate-600">
            0 warnings
          </div>
        </div>
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
            <FaUser className="w-8 h-8 text-slate-400" />
          </div>
          <p className="italic text-slate-500">No warnings found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-6 border shadow-lg bg-gradient-to-br from-slate-50 to-orange-100 rounded-2xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
            {warningLogs.length} warnings
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={downloadWarnings}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Download Warnings
          </button>
        </div>
      </div>

      {isPreloading && imageUrls.length > 0 && (
        <div className="p-3 mb-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">
              Preloading images...
            </span>
            <span className="text-sm text-orange-600">
              {Math.round(preloadingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-orange-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 bg-orange-500 rounded-full"
              style={{ width: `${preloadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {warningLogs.map((log: any, index: number) => (
            <div
              key={index}
              className="p-4 transition-shadow border border-orange-200 bg-orange-50 rounded-xl hover:shadow-md"
            >
              {/* Display all image fields */}
              {['img_log', 'external_img'].map((key) => {
                const url = log[key] ? `${API_BASE_URL}/${log[key]}` : null;
                if (!url) return null;
                return (
                  <div key={key} className="relative mb-4">
                    {imageCache[url] ? (
                      <img
                        src={imageCache[url]}
                        alt={key}
                       className={portraitImgClass}

                      />
                    ) : loadingImages.has(url) ? (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <span className="text-sm text-slate-500">Image unavailable</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-2 text-sm text-slate-600">
                {log.final_focus && <p>⚠️ Focus: {log.final_focus}</p>}
                {log.focus_loss_count > 0 && <p>⚠️ Focus Loss Count: {log.focus_loss_count}</p>}
                {log.phone_detection && <p>📱 Phone detected</p>}
                {log.person_status > 0 && (
                  <p>👤 Person Detected ({log.person_status > 0})</p>
                )}
                <p className="text-xs text-slate-500">{convertToIST(log.log_time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

};



// Person Detection Logs Component
export function PersonDetectionLogs({
  title,
  logs,
}: {
  title: string;
  logs: any[];
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // Filter logs to only show person detections
  const personDetectedLogs = logs.filter(log => log?.person_status > 0);

  // Extract all image URLs (img_log + external_img)
  const imageUrls = personDetectedLogs.flatMap(log => {
    const urls: string[] = [];
    if (log.img_log) urls.push(`${API_BASE_URL}/${log.img_log}`);
    if (log.external_img) urls.push(`${API_BASE_URL}/${log.external_img}`);
    return urls;
  });

  // Preload images when component mounts or logs change
  useEffect(() => {
    const preloadImages = async () => {
      if (imageUrls.length === 0) return;

      setIsPreloading(true);
      setPreloadingProgress(0);

      const cache: Record<string, string> = {};
      const loading = new Set<string>();

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];

        const cachedImage = getImageFromCache(url);
        if (cachedImage) {
          cache[url] = cachedImage;
          setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
          continue;
        }

        try {
          loading.add(url);
          setLoadingImages(new Set(loading));

          const base64 = await imageToBase64(url);
          cache[url] = base64;
          setImageInCache(url, base64);

          loading.delete(url);
          setLoadingImages(new Set(loading));
        } catch (error) {
          console.error(`Failed to preload image: ${url}`, error);
          loading.delete(url);
          setLoadingImages(new Set(loading));
        }

        setPreloadingProgress(((i + 1) / imageUrls.length) * 100);
      }

      setImageCache(cache);
      setIsPreloading(false);
    };

    preloadImages();
  }, [logs]);

  if (!personDetectedLogs || personDetectedLogs.length === 0) {
    return (
      <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm rounded-full bg-slate-100 text-slate-600">
            0 detections
          </div>
        </div>
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
            <FaUser className="w-8 h-8 text-slate-400" />
          </div>
          <p className="italic text-slate-500">No person detections found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-6 border shadow-lg bg-gradient-to-br from-slate-50 to-orange-100 rounded-2xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
          <div className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
            {personDetectedLogs.length} detections
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-orange-500 rounded-lg shadow-lg hover:bg-orange-600 hover:shadow-xl"
        >
          <FaUser className="w-4 h-4" />
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Preloading progress bar */}
      {isPreloading && imageUrls.length > 0 && (
        <div className="p-3 mb-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">
              Preloading images...
            </span>
            <span className="text-sm text-orange-600">
              {Math.round(preloadingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-orange-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 bg-orange-500 rounded-full"
              style={{ width: `${preloadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {personDetectedLogs.map((log: any, index: number) => (
            <div
              key={index}
              className="p-4 transition-shadow border border-orange-200 bg-orange-50 rounded-xl hover:shadow-md"
            >
              {/* Display all image fields */}
              {['img_log', 'external_img'].map((key) => {
                const url = log[key] ? `${API_BASE_URL}/${log[key]}` : null;
                if (!url) return null;

                return (
                  <div key={key} className="relative mb-4">
                    {imageCache[url] ? (
                      <img
                        src={imageCache[url]}
                        alt={key}
                        className={portraitImgClass}

                      />
                    ) : loadingImages.has(url) ? (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 rounded-lg bg-slate-200">
                        <span className="text-sm text-slate-500">
                          Image unavailable
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="p-1 bg-white rounded">
                    <FaClock className="w-3 h-3" />
                  </div>
                  <span className="font-medium">{convertToIST(log.log_time)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 bg-white rounded">
                    <FaUser className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-slate-600">Person:</span>
                  <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                    Detected ({log.person_status} person{log.person_status > 0 ? 's' : ''})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="p-1 bg-white rounded">
                    <FaRegEye className="w-3 h-3" />
                  </div>
                  <span>Eyes:</span>
                  <span className="font-medium">{log.user_movements_eyes}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="p-1 bg-white rounded">
                    <FaUser className="w-3 h-3" />
                  </div>
                  <span>Head:</span>
                  <span className="font-medium">{log.user_movements_updown}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}