/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import { useParams } from "react-router-dom";
import Certificate from "../components/ui/Certificate";
import { getcertificates } from "../lib/api"; // adjust path

// const urlParams = new URLSearchParams(window.location.search);

// const eventId = Number(urlParams.get("event_id"));

const CertificateViewer = () => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const [certificateData, setCertificateData] = useState({
    championship: "",
    name: "",
    rank: "",
    score: "",
    date: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user_id");
    const eventId = Number(urlParams.get("event_id"));
 
    if (!userId) return;
 
    const fetchCertificate = async () => {
      try {
        const data = await getcertificates(Number(userId));
        const targetEvent = data.find((e: any) => e.event_id === eventId) ?? data[0];

        if (targetEvent) {
          setCertificateData({
            championship: targetEvent.event_name ?? "Championship",
            name:
              targetEvent.fname || targetEvent.lname
                ? `${targetEvent.fname ?? ""} ${targetEvent.lname ?? ""}`.trim()
                : "Participant",
            rank: `Event Rank: ${targetEvent.event_rank}, Category Rank: ${targetEvent.cat_rank}`,
            score: targetEvent.overall_score?.toString() ?? "0",
            date: new Date().toLocaleDateString(),
          });
        }

      } catch (error) {
        console.error("Error fetching certificate:", error);
      }
    };

    fetchCertificate();
    
  }, []);



  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, { scale: 2 } as any);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("certificate.pdf");
  };

  const { championship, name, rank, score, date } = certificateData;
  const formattedScore = Number(score).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-gray-100">
      <div className="p-2 bg-white shadow-md">
        <div ref={certificateRef}>
          <Certificate championship={championship} name={name} rank={rank} score={formattedScore} date={date} categoryRank={""} />
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="px-2 py-1 text-sm text-white bg-blue-600 rounded shadow-md hover:bg-blue-800"
      >
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateViewer;
