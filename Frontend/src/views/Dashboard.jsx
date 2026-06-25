import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  Send,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard({ chatMessages, setChatMessages }) {
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [metrics, setMetrics] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    pending: 0,
    gst: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  // NEW: State for graph filtering
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("ALL"); //Note: Options: 1W, 1M, 6M, 1Y, 5Y, ALL

  // Fetch raw data once on mount
  useEffect(() => {
    const fetchAndCalculateData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/transactions");
        const data = await response.json();
        let rev = 0;
        let exp = 0;
        let pend = 0;
        let gst = 0;

        data.forEach((row) => {
          if (row.type?.toLowerCase() === "sales") {
            rev += row.amount;
            gst += row.gst_amount || 0;
          }

          if (row.type?.toLowerCase() === "expense") {
            exp += row.amount;
            gst -= row.gst_amount || 0;
          }

          if (row.status?.toLowerCase() === "unpaid") {
            pend += row.amount;
          }
        });

        setMetrics({
          revenue: rev,
          expenses: exp,
          profit: rev - exp,
          pending: pend,
          gst: gst,
        });
        setRecentTransactions(data.slice(0, 5));
        setAllTransactions(data); // Store all data for the graph to filter
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchAndCalculateData();
  }, []);

  useEffect(() => {
    if (!allTransactions || allTransactions.length === 0) return;

    const parsedTxns = allTransactions
      .map((row) => {
        let d;
        if (row.date && row.date.includes("-")) {
          const parts = row.date.split("-");
          if (parts[0].length === 4) {
            d = new Date(parts[0], parts[1] - 1, parts[2]);
          } // YYYY-MM-DD
          else {
            d = new Date(parts[2], parts[1] - 1, parts[0]);
          } // DD-MM-YYYY
        } else {
          d = new Date(row.date);
        }
        return { ...row, parsedDate: d };
      })
      .filter((r) => !isNaN(r.parsedDate));

    if (parsedTxns.length === 0) return;

    parsedTxns.sort((a, b) => a.parsedDate - b.parsedDate);

    const maxDate = parsedTxns[parsedTxns.length - 1].parsedDate;
    const cutoffDate = new Date(maxDate);

    if (timeRange === "1W") cutoffDate.setDate(maxDate.getDate() - 7);
    else if (timeRange === "1M") cutoffDate.setMonth(maxDate.getMonth() - 1);
    else if (timeRange === "6M") cutoffDate.setMonth(maxDate.getMonth() - 6);
    else if (timeRange === "1Y")
      cutoffDate.setFullYear(maxDate.getFullYear() - 1);
    else if (timeRange === "5Y")
      cutoffDate.setFullYear(maxDate.getFullYear() - 5);
    else cutoffDate.setFullYear(1900); // Show ALL

    const dailyTrends = {};
    parsedTxns.forEach((row) => {
      if (row.parsedDate >= cutoffDate) {
        const dateOptions = ["1Y", "5Y", "ALL"].includes(timeRange)
          ? { month: "short", year: "numeric" }
          : { day: "2-digit", month: "short" };

        const dateStr = row.parsedDate.toLocaleDateString("en-GB", dateOptions);

        if (!dailyTrends[dateStr]) {
          dailyTrends[dateStr] = {
            date: dateStr,
            Sales: 0,
            Expenses: 0,
            sortKey: row.parsedDate.getTime(),
          };
        }

        if (row.type?.toLowerCase() === "sales")
          dailyTrends[dateStr].Sales += row.amount;
        if (row.type?.toLowerCase() === "expense")
          dailyTrends[dateStr].Expenses += row.amount;
      }
    });

    const formattedChartData = Object.values(dailyTrends).sort(
      (a, b) => a.sortKey - b.sortKey,
    );
    setChartData(formattedChartData);
  }, [allTransactions, timeRange]);

  //---------------------For AI Chat Handler --------------------------------
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });
      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "I couldn't process that query.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Error connecting to the backend server.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Get insights from your accounting data in seconds.
            </p>
          </div>
          <Link
            to="/upload"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <UploadCloud size={16} /> Upload New File
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-indigo-50 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">
                ₹
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total Revenue
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              ₹ {metrics.revenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-xs font-bold">
                ₹
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total Expenses
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              ₹ {metrics.expenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xs font-bold">
                ₹
              </div>
              <span className="text-xs font-medium text-slate-500">
                Net Profit
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              ₹ {metrics.profit.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
                ₹
              </div>
              <span className="text-xs font-medium text-slate-500">
                GST Payable
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{metrics.gst ? metrics.gst.toLocaleString("en-IN") : "0"}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xs font-bold">
                ₹
              </div>
              <span className="text-xs font-medium text-slate-500">
                Pending Value
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              ₹ {metrics.pending.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* --- Graph Analysis --- */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 h-88">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Revenue vs Expenses
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Financial trend analysis over time
              </p>
            </div>

            {/* --------------- TIME RANGE BUTTONS ------------- */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              {["1W", "1M", "6M", "1Y", "5Y", "ALL"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === range
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginBottom: "4px",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="Sales"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Expenses"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <span>No transactions found for this time period.</span>
            </div>
          )}
        </div>

        {/* --- Recent Transactions Table --- */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Recent Transactions
            </h3>
            <Link
              to="/viewer"
              className="text-brand-600 hover:text-brand-700 text-xs font-semibold flex items-center gap-1"
            >
              View All Data <ArrowRight size={14} />
            </Link>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Voucher No.</th>
                <th className="py-2.5">Party / Customer</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Amount (₹)</th>
                <th className="py-2.5">GST (₹)</th>{" "}
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-700 divide-y divide-slate-50">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((row, i) => (
                  <tr key={i}>
                    <td className="py-3">{row.date}</td>
                    <td>{row.voucher_no}</td>
                    <td className="text-slate-900">{row.particulars}</td>
                    <td>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                        {row.type}
                      </span>
                    </td>
                    <td>{row.amount?.toLocaleString("en-IN")}</td>
                    <td>
                      {row.gst_amount
                        ? row.gst_amount.toLocaleString("en-IN")
                        : "0"}
                    </td>{" "}
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-slate-400">
                    No recent transactions. Upload data to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Floating AI Assistant Sidebar Right Side  --- */}
      <div className="w-80 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm h-[calc(100vh-4rem)] sticky top-8 shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">AI Assistant</h3>
              <p className="text-[10px] text-slate-400">Powered by Gemini</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1`}
            >
              <div
                className={`p-3 rounded-2xl max-w-[90%] font-medium ${msg.sender === "user" ? "bg-brand-600 text-white rounded-tr-none" : "bg-slate-50 text-slate-700 rounded-tl-none"}`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 px-1">{msg.time}</span>
            </div>
          ))}
          {isTyping && (
            <div className="text-[10px] text-slate-400 italic">
              AI is analyzing database...
            </div>
          )}
        </div>

        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {[
            "Total sales?",
            "Who are my top customers?",
            "How many unpaid invoices?",
          ].map((pill) => (
            <button
              key={pill}
              onClick={() => setChatInput(pill)}
              className="text-[10px] text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-full font-medium border border-brand-100 transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleAskQuestion}
          className="p-3 border-t border-slate-100 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-50 text-xs border border-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="bg-brand-600 text-white p-2 rounded-xl hover:bg-brand-700 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
