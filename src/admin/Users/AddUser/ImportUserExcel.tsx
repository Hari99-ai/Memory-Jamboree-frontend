import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/client";
import Backbutton from "../../components/Backbutton";

export default function ImportUserExcel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [placeholder, setPlaceholder] = useState("Choose a file or drag it here");
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [userObjects, setUserObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  // Required fields validation
  const requiredFields = ['fname', 'email', 'password', 'birth_date'];

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
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls',
      '.xlsx'
    ];

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = validTypes.some(type =>
      file.type === type || fileExtension === type.replace('.', '')
    );

    if (!isValidType) {
      toast.error("Please upload a valid Excel file (.xls or .xlsx format only)");
      return;
    }

    // Check file size (optional - e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size is too large. Please upload a file smaller than 10MB");
      return;
    }

    setSelectedFile(file);
    setPlaceholder(file.name);
    parseExcel(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const deleteFile = () => {
    setSelectedFile(null);
    setPlaceholder("Choose a file or drag it here");
    setTableData([]);
    setTableHeaders([]);
    setUserObjects([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateExcelStructure = (headers: string[], data: any[][]) => {
    // Check if required headers are present
    const missingHeaders = requiredFields.filter(field =>
      !headers.some(header => header.toLowerCase().trim() === field.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}. Please ensure your Excel file has the correct format.`);
      return false;
    }

    // Check if there's any data
    if (data.length === 0) {
      toast.error("Excel file is empty. Please provide data to import.");
      return false;
    }

    return true;
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast.error("Failed to read file. Please try again.");
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });

        if (!workbook.SheetNames.length) {
          toast.error("Excel file contains no sheets. Please provide a valid Excel file.");
          return;
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          toast.error("Excel sheet is empty. Please provide data to import.");
          return;
        }

        const headers = jsonData[0].map((header: any) => String(header).trim());
        const dataRows = jsonData.slice(1);

        // Validate Excel structure
        if (!validateExcelStructure(headers, dataRows)) {
          deleteFile();
          return;
        }

        setTableHeaders(headers);
        setTableData(dataRows);

        const objects = dataRows.map((row) => {
          const obj: any = {};
          headers.forEach((key: string, idx: number) => {
            obj[key] = row[idx] ? String(row[idx]).trim() : "";
          });
          return obj;
        });

        setUserObjects(objects);
        toast.success(`Excel file parsed successfully. Found ${objects.length} users to import.`);

      } catch (error) {
        console.error("Error parsing Excel:", error);
        toast.error("Failed to parse Excel file. Please ensure it's a valid Excel format.");
        deleteFile();
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file. Please try again.");
    };

    reader.readAsBinaryString(file);
  };

  const validateUserData = (user: any) => {
    const errors: string[] = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (!user[field] || String(user[field]).trim() === '') {
        errors.push(`Missing ${field}`);
      }
    });

    // Validate email format
    if (user.email && (!user.email.includes("@") || !user.email.includes("."))) {
      errors.push("Invalid email format");
    }

    // Validate password strength
    if (user.password) {
      const isValid =
        user.password.length >= 6 &&
        /[0-9]/.test(user.password) &&
        /[a-z]/.test(user.password) &&
        /[A-Z]/.test(user.password);

      if (!isValid) {
        errors.push("Weak password (must include number, uppercase, lowercase & min 6 chars)");
      }
    }

    // Validate date format
    if (user.birth_date && !/^\d{2}-\d{2}-\d{4}$/.test(user.birth_date) && !/^\d{4}-\d{2}-\d{2}$/.test(user.birth_date)) {
      errors.push("Invalid birth_date format (expected DD-MM-YYYY or YYYY-MM-DD)");
    }

    return errors;
  };

  const handleSubmit = async () => {
    if (userObjects.length === 0) {
      toast.error("No users to import. Please upload a valid Excel file first.");
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < userObjects.length; i++) {
      const user = { ...userObjects[i] };

      // Validate user data
      const validationErrors = validateUserData(user);
      if (validationErrors.length > 0) {
        const errorMsg = `(${user.fname || 'Unknown'}): ${validationErrors.join(', ')}`;
        errors.push(errorMsg);
        toast.error(errorMsg);
        errorCount++;
        continue;
      }

      // Format birth_date if needed
      if (user.birth_date && /^\d{2}-\d{2}-\d{4}$/.test(user.birth_date)) {
        const [dd, mm, yyyy] = user.birth_date.split("-");
        user.birth_date = `${yyyy}-${mm}-${dd}`;
      }

      const formData = new FormData();
      Object.entries(user).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      try {
        const token = sessionStorage.getItem("auth_token");
        await axios.post(`${API_BASE_URL}/admin/create-user`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        toast.success(`User ${user.fname} registered successfully`);
        successCount++;

      } catch (error: any) {
        errorCount++;
        let errorMessage = ` `;

        // Log the full error for debugging
        console.error(`Error for user ${user.fname}:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Check for various error indicators
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || errorData?.error || error.message || '';
        const statusCode = error.response?.status;

        // Check for user already exists scenarios
        if (
          statusCode === 409 ||
          statusCode === 400 ||
          statusCode === 422 ||
          errorMsg.toLowerCase().includes('already') ||
          errorMsg.toLowerCase().includes('exists') ||
          errorMsg.toLowerCase().includes('duplicate') ||
          errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('taken') ||
          errorMsg.toLowerCase().includes('unique constraint') ||
          errorMsg.toLowerCase().includes('violation')
        ) {
          errorMessage += "User already registered (duplicate email or user data)";
        } else if (statusCode === 400) {
          if (errorMsg.toLowerCase().includes('validation')) {
            errorMessage += "Validation failed - check data format";
          } else {
            errorMessage += errorMsg || "Bad request - invalid data format";
          }
        } else if (statusCode === 422) {
          errorMessage += "Invalid data format provided";
        } else if (statusCode === 500) {
          errorMessage += "Server error - please try again later";
        } else if (statusCode === 401) {
          errorMessage += "Authentication failed - please login again";
        } else if (statusCode === 403) {
          errorMessage += `user ${user.fname} Already registered`;
        } else {
          // Fallback - try to extract meaningful error message
          if (errorMsg) {
            errorMessage += errorMsg;
          } else {
            errorMessage += "Failed to register user - unknown error";
          }
        }

        errors.push(errorMessage);
        toast.error(errorMessage);
      }
    }

    setLoading(false);

  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white shadow-lg rounded-xl">
      <Backbutton label="Back To Dashboard" />
      <h1 className="mb-2 text-2xl font-bold text-center text-gray-800">Import Users from Excel</h1>
      <div className="flex justify-center gap-2 mb-6">
        <div className="w-10 h-1 bg-pink-500 rounded" />
        <div className="w-10 h-1 bg-yellow-400 rounded" />
      </div>

      {/* Required format info */}
      <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="font-semibold text-blue-800">Required Excel Format:</h3>
        <p className="text-sm text-blue-700">
          Your Excel file must contain these columns: <strong>fname, email, password, birth_date</strong>
        </p>
        <p className="mt-1 text-xs text-blue-600">
          • Date format: DD-MM-YYYY (e.g., 15-03-1990)<br />
          • Password: Min 6 chars with uppercase, lowercase & number<br />
          • File types: .xls or .xlsx only
        </p>
      </div>

      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-300 cursor-pointer ${dragOver ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-300"
          }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {selectedFile ? (
          <>
            <p className="font-medium text-blue-700">{placeholder}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFile();
              }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Remove File
            </button>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M12 3v12m0 0l-3.75-3.75M12 15l3.75-3.75"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{placeholder}</p>
          </>
        )}
        <input
          type="file"
          accept=".xls,.xlsx"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Table Preview */}
      {tableHeaders.length > 0 && (
        <div className="mt-6 max-h-[60vh] overflow-y-auto border border-gray-300 rounded-md shadow-sm">
          <table className="min-w-full text-sm text-gray-700 table-auto">
            <thead className="sticky top-0 bg-gray-100 shadow-sm">
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 font-medium text-left border-b border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {tableHeaders.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-2 text-center border-b border-gray-200"
                    >
                      {row[colIdx]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sticky Submit Button */}
      {tableHeaders.length > 0 && (
        <div className="sticky bottom-0 z-10 py-4 text-center bg-white shadow-md">
          <button
            className="px-6 py-2 text-white transition duration-300 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={async (e) => {
              e.preventDefault();
              await handleSubmit();
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : `Submit ${userObjects.length} Users`}
          </button>
        </div>
      )}
    </div>
  );
}