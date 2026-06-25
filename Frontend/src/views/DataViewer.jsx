import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import { Database, Settings, Filter, Download } from "lucide-react";

export default function DataViewer() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --------------Fetch data from backend ------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/transactions");
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  //----------- Filter the data based on the search term................

  const filteredData = tableData.filter((row) => {
    if (!searchTerm) return true; // If search is empty, show all rows

    const lowerCaseTerm = searchTerm.toLowerCase();

    // Check if the search term exists in ANY of these columns
    return (
      row.date?.toLowerCase().includes(lowerCaseTerm) ||
      row.voucher_no?.toLowerCase().includes(lowerCaseTerm) ||
      row.particulars?.toLowerCase().includes(lowerCaseTerm) ||
      row.type?.toLowerCase().includes(lowerCaseTerm) ||
      row.amount?.toString().includes(lowerCaseTerm) ||
      row.status?.toLowerCase().includes(lowerCaseTerm)
    );
  });

  return (
    <div>
      <TopHeader
        title="Data Viewer"
        subtitle="Explore your raw accounting database."
      />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, voucher, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-80 transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex gap-2">
            <button className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors hover:bg-brand-100">
              <Filter size={13} /> Filter
            </button>
            <button className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors hover:bg-slate-100">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium animate-pulse">
            Loading database...
          </div>
        ) : tableData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No data found. Please upload a CSV file first.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-150">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Date</th>
                  <th className="p-3">Voucher No.</th>
                  <th className="p-3">Particulars</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount (₹)</th>
                  <th className="p-3">GST (₹)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">{row.date}</td>
                      <td className="p-3 font-semibold text-slate-700">
                        {row.voucher_no}
                      </td>
                      <td className="p-3 text-slate-900 font-bold">
                        {row.particulars}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                          {row.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {row.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-slate-600">
                        {row.gst_amount
                          ? row.gst_amount.toLocaleString("en-IN")
                          : "0"}
                      </td>{" "}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-slate-400 text-sm"
                    >
                      No results found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
