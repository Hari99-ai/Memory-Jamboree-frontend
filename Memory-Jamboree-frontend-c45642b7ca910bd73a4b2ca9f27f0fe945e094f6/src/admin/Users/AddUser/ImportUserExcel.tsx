/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/client";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Trash2, 
  AlertCircle,  
  Loader2, 
  ArrowLeft, 
  Save 
} from "lucide-react";
import { Button } from "../../../components/ui/button"; 

export default function ImportUserExcel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [userObjects, setUserObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Required fields validation
  const requiredFields = ["fname", "email", "password", "birth_date"];

  // --- Event Handlers ---

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    
    // Fallback check for extensions
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["xls", "xlsx", "csv"];

    const isValidType = validTypes.includes(file.type) || (fileExtension && allowedExtensions.includes(fileExtension));

    if (!isValidType) {
      toast.error("Please upload a valid Excel (.xls, .xlsx) or CSV (.csv) file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error("File size is too large. Max 10MB allowed.");
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  };

  const deleteFile = () => {
    setSelectedFile(null);
    setTableData([]);
    setTableHeaders([]);
    setUserObjects([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Parsing Logic ---

  const validateExcelStructure = (headers: string[], data: any[][]) => {
    const missingHeaders = requiredFields.filter(
      (field) => !headers.some((header) => header.toLowerCase().trim() === field.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      toast.error(`Missing columns: ${missingHeaders.join(", ")}`);
      return false;
    }

    if (data.length === 0) {
      toast.error("File is empty.");
      return false;
    }
    return true;
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    const fileExtension = file.name.toLowerCase().split(".").pop();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        let jsonData: any[];

        if (fileExtension === "csv") {
          const text = data as string;
          const lines = text.split(/\r\n|\n/);
          jsonData = lines.map((line) => line.split(","));
        } else {
          const workbook = XLSX.read(data, { type: "binary" });
          if (!workbook.SheetNames.length) {
            toast.error("Invalid Excel file.");
            return;
          }
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        if (jsonData.length === 0) {
          toast.error("File is empty.");
          return;
        }

        const headers = jsonData[0].map((header: any) => String(header).trim());
        const dataRows = jsonData.slice(1);

        if (!validateExcelStructure(headers, dataRows)) {
          deleteFile();
          return;
        }

        setTableHeaders(headers);
        setTableData(dataRows);

        const objects = dataRows
          .filter((row) => row.some((cell: any) => cell !== undefined && String(cell).trim() !== ""))
          .map((row) => {
            const obj: any = {};
            headers.forEach((key: string, idx: number) => {
              obj[key] = row[idx] ? String(row[idx]).trim() : "";
            });
            return obj;
          });

        setUserObjects(objects);
        toast.success(`Parsed ${objects.length} records successfully.`);
      } catch (error) {
        console.error("Parsing error", error);
        toast.error("Failed to parse file.");
        deleteFile();
      }
    };

    if (fileExtension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const validateUserData = (user: any) => {
    const errors: string[] = [];
    requiredFields.forEach((field) => {
      if (!user[field] || String(user[field]).trim() === "") errors.push(`Missing ${field}`);
    });

    if (user.email && (!user.email.includes("@") || !user.email.includes("."))) {
      errors.push("Invalid email");
    }

    if (user.password) {
      const isValid = user.password.length >= 6 && /[0-9]/.test(user.password) && /[a-z]/.test(user.password) && /[A-Z]/.test(user.password);
      if (!isValid) errors.push("Weak password");
    }

    if (user.birth_date && !/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(user.birth_date) && !/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(user.birth_date)) {
      errors.push("Invalid date format");
    }

    return errors;
  };

  const handleSubmit = async () => {
    if (userObjects.length === 0) return;
    setLoading(true);

    for (const userObj of userObjects) {
      const user = { ...userObj };
      const validationErrors = validateUserData(user);
      
      if (validationErrors.length > 0) {
        toast.error(`${user.fname || "Unknown"}: ${validationErrors[0]}`);
        continue;
      }

      // Date normalization
      if (user.birth_date) {
        const sanitized = user.birth_date.replace(/\//g, "-");
        if (/^\d{2}-\d{2}-\d{4}$/.test(sanitized)) {
          const [dd, mm, yyyy] = sanitized.split("-");
          user.birth_date = `${yyyy}-${mm}-${dd}`;
        } else {
          user.birth_date = sanitized;
        }
      }

      const formData = new FormData();
      Object.entries(user).forEach(([key, value]) => {
        if (value) formData.append(key, String(value));
      });

      try {
        const token = sessionStorage.getItem("auth_token");
        await axios.post(`${API_BASE_URL}/admin/create-user`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        toast.success(`Registered: ${user.fname}`);
      } catch (error: any) {
        const msg = error.response?.data?.message || "Failed";
        toast.error(`Error (${user.fname}): ${msg}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen rounded-lg p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-blue-600 pl-0 gap-2"
            onClick={() => navigate("/admin/users/add")}
          >
            <ArrowLeft size={18} /> Back to Options
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Bulk User Import
          </h1>
          <div className="w-24 hidden sm:block"></div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start shadow-sm">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900">Required File Format</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Ensure your Excel or CSV file includes the following columns exactly as written:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {requiredFields.map((field) => (
                <span key={field} className="px-2 py-1 bg-white border border-blue-200 text-blue-800 text-xs font-mono rounded">
                  {field}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              * Dates must be DD-MM-YYYY or YYYY-MM-DD. Passwords require min 6 chars, 1 upper, 1 lower, 1 number.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center p-12 
              border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group
              ${dragOver 
                ? "border-blue-500 bg-blue-50/50 scale-[1.01]" 
                : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
              }
            `}
          >
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className={`p-4 rounded-full mb-4 transition-colors ${dragOver ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
              <UploadCloud size={40} />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              Click to upload or drag and drop
            </h3>
            <p className="text-slate-500 text-sm">
              Excel (.xlsx, .xls) or CSV files (Max 10MB)
            </p>
          </div>
        ) : (
          /* File Selected State */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <FileSpreadsheet size={28} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {userObjects.length} records found
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={deleteFile}
                className="gap-2"
              >
                <Trash2 size={16} /> Remove
              </Button>
            </div>

            {/* Data Preview Table */}
            {tableHeaders.length > 0 && (
              <div className="border rounded-xl overflow-hidden bg-slate-50">
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0 z-10">
                      <tr>
                        {tableHeaders.map((header, idx) => (
                          <th key={idx} className="px-6 py-3 font-semibold border-b border-slate-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {tableData.slice(0, 50).map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                          {tableHeaders.map((_, colIdx) => (
                            <td key={colIdx} className="px-6 py-3 whitespace-nowrap text-slate-700">
                              {row[colIdx] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tableData.length > 50 && (
                  <div className="px-6 py-2 bg-slate-50 text-xs text-slate-500 text-center border-t border-slate-200">
                    Showing first 50 rows of {tableData.length}
                  </div>
                )}
              </div>
            )}

            {/* Action Footer */}
            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-auto text-base gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Processing...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Upload {userObjects.length} Users
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}