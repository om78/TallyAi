import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, Database, CheckCircle2, Trash2 } from "lucide-react";
import TopHeader from "../components/TopHeader";

export default function UploadData() {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  // ----------- Function to pull the history from the backend -------------
  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/uploads");
      const data = await response.json();
      setUploadHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  // ----------- Fetch history ------------
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading & parsing to database...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setUploadStatus(
          `Success: ${data.rowCount} rows processed into SQLite!`,
        );

        fetchHistory();
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus("Error: Could not connect to Express backend.");
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  return (
    <div>
      <TopHeader
        title="Upload Data"
        subtitle="Import your exported Tally CSV sheets into the secure database."
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border-2 border-dashed border-brand-200 p-12 text-center flex flex-col items-center justify-center shadow-sm relative overflow-hidden transition-all hover:bg-slate-50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              {isUploading ? "Processing..." : "Drag & drop your CSV file here"}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              or click anywhere in this box
            </p>
            <button
              disabled={isUploading}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors mb-3"
            >
              Browse Files
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              Supports CSV • Max size: 10MB
            </p>

            {uploadStatus && (
              <div
                className={`mt-6 text-sm font-bold px-4 py-2 rounded-lg ${uploadStatus.includes("Error") ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {uploadStatus}
              </div>
            )}
          </div>

          {/* --------- Upload History Table ------------ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-xs">
                Upload History
              </h3>
              {uploadHistory.length > 0 && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Clear this log?")) return;
                    await fetch("http://localhost:5000/api/uploads", {
                      method: "DELETE",
                    });
                    fetchHistory(); // Refresh the table
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear Log
                </button>
              )}
            </div>

            {uploadHistory.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">
                No uploads yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium pb-2">
                    <th className="pb-2">Date / Time</th>
                    <th className="pb-2">File Name</th>
                    <th className="pb-2">Rows</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-slate-700 divide-y divide-slate-50">
                  {uploadHistory.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 text-slate-500">
                        {new Date(log.upload_date).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="flex items-center gap-2 py-3">
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          CSV
                        </span>
                        <span className="text-slate-900 truncate max-w-37.5">
                          {log.filename}
                        </span>
                      </td>
                      <td>{log.row_count?.toLocaleString()}</td>
                      <td>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
          <h4 className="font-bold text-slate-900 text-xs mb-3">
            Upload Guidelines
          </h4>
          <ul className="space-y-2.5 text-xs font-medium text-slate-600">
            <li className="flex gap-2 items-start">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />{" "}
              First row must contain column headers.
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />{" "}
              Ensure columns match standard Tally exports (Date, Amount, Type).
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />{" "}
              Date format should be DD-MM-YYYY.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
