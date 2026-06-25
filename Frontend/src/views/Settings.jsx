import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Trash2 } from "lucide-react";
import TopHeader from "../components/TopHeader";

export default function SettingsView() {
  const [statusMsg, setStatusMsg] = useState("");

  const handleClearTransactions = async () => {
    if (
      !window.confirm(
        "Are you sure? This will delete all your uploaded Tally data from the database. This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "DELETE",
      });
      if (response.ok) {
        setStatusMsg("✅ Database transactions successfully wiped.");
      }
    } catch (error) {
      setStatusMsg("❌ Error connecting to server.");
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm("Are you sure you want to clear your upload history log?")
    )
      return;

    try {
      const response = await fetch("http://localhost:5000/api/uploads", {
        method: "DELETE",
      });
      if (response.ok) {
        setStatusMsg("✅ Upload history log cleared.");
      }
    } catch (error) {
      setStatusMsg("❌ Error connecting to server.");
    }
  };

  return (
    <div className="max-w-3xl">
      <TopHeader
        title="System Settings"
        subtitle="Manage your account preferences and data storage."
      />

      {statusMsg && (
        <div className="mb-6 p-4 rounded-xl bg-slate-800 text-white font-medium text-sm">
          {statusMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-rose-900">Danger Zone</h3>
            <p className="text-xs text-rose-600 mt-0.5">
              Permanent data deletion actions.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6 divide-y divide-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Clear Accounting Data
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Deletes all uploaded Tally transactions from the SQLite
                database. Your AI will lose access to this data.
              </p>
            </div>
            <button
              onClick={handleClearTransactions}
              className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Delete Data
            </button>
          </div>

          <div className="flex items-center justify-between pt-6">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Clear Upload History
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Wipes the log of previously uploaded files. Does not affect the
                actual transaction data.
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
