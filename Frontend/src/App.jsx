import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Database,
  MessageSquare,
  Bookmark,
  BarChart3,
  Settings,
  ChevronDown,
  Bot,
  Send,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Eye,
  Trash2,
  Filter,
  Download,
  ArrowRight,
} from "lucide-react";

// Imports match exactly what is being rendered below
import Dashboard from "./views/Dashboard";
import UploadData from "./views/UploadData";
import DataViewer from "./views/DataViewer";
import SettingsView from "./views/Settings";

function Sidebar() {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/upload", icon: <UploadCloud size={20} />, label: "Upload Data" },
    { to: "/viewer", icon: <Database size={20} />, label: "Data Viewer" },
    { to: "/ask", icon: <MessageSquare size={20} />, label: "Ask Questions" },
    { to: "/saved", icon: <Bookmark size={20} />, label: "Saved Queries" },
    { to: "/reports", icon: <BarChart3 size={20} />, label: "Reports" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
            <Bot size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">
              AI Accounting
            </h1>
            <p className="text-xs text-slate-500 font-medium">Assistant</p>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs">
              OM
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Om User</p>
              <p className="text-[10px] text-slate-400">Admin Plan</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ title }) {
  return (
    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
  );
}

export default function App() {
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hi Om! 👋 I am connected to your database. Ask me anything about your uploaded Tally files.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-[calc(100vw-16rem)]">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                />
              }
            />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/viewer" element={<DataViewer />} />
            <Route
              path="/ask"
              element={<PlaceholderView title="Ask AI Interface" />}
            />
            <Route
              path="/saved"
              element={<PlaceholderView title="Saved Queries" />}
            />
            <Route
              path="/reports"
              element={<PlaceholderView title="Generated Reports" />}
            />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
