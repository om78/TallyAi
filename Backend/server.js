require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ------ Initialize Gemini ------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// ----------------  Setup Multer to handle file uploads (saves temporarily to an 'uploads' folder) --------------
const upload = multer({ dest: "uploads/" });

// ==========================================
// ROUTE 1: UPLOAD & PARSE CSV
// ==========================================
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const originalFileName = req.file.originalname;
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      db.run("DELETE FROM transactions", (err) => {
        if (err) console.error(err);

        const stmt = db.prepare(`INSERT INTO transactions 
                    (date, voucher_no, particulars, type, amount, gst_amount, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`);

        db.serialize(() => {
          db.run("BEGIN TRANSACTION");
          results.forEach((row) => {
            stmt.run([
              row.Date || row.date || "",
              row["Voucher No."] || row.voucher_no || "",
              row.Particulars || row.particulars || "",
              row.Type || row.type || "",
              parseFloat(row.Amount || row.amount || 0),
              parseFloat(row["GST"] || row.gst_amount || 0),
              row.Status || row.status || "Paid",
            ]);
          });
          db.run("COMMIT");
          stmt.finalize();
          db.run(
            `INSERT INTO upload_history (filename, row_count, status) VALUES (?, ?, ?)`,
            [originalFileName, results.length, "Processed"],
            function (err) {
              if (err) console.error("History Insert Error:", err);
            },
          );
        });

        fs.unlinkSync(req.file.path);

        res.json({
          message: "Data imported successfully",
          rowCount: results.length,
        });
      });
    });
});

// ==========================================
// ROUTE 2: ASK GEMINI (TEXT-TO-SQL)
// ==========================================

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  db.get("SELECT COUNT(*) AS count FROM transactions", [], async (err, row) => {
    if (err) {
      console.error("Count Error:", err);
      return res
        .status(500)
        .json({ answer: "I'm having trouble reading the database right now." });
    }

    if (row.count === 0) {
      return res.json({
        answer:
          "It looks like your database is completely empty right now. Please head over to the Upload Data page and import your Tally CSV file first! 📂",
      });
    }

    try {
      const schemaPrompt = `
        You are an expert SQL data analyst. I have a SQLite database table named 'transactions' with this schema:
        - date (TEXT)
        - voucher_no (TEXT)
        - particulars (TEXT) : Usually the customer or vendor name.
        - type (TEXT) : 'Sales', 'Expense', or 'Receipt'
        - amount (REAL) : The total monetary value
        - gst_amount (REAL) : The tax or GST collected/paid
        - status (TEXT) : 'Paid' or 'Unpaid'

        To calculate "GST Payable", sum the gst_amount for 'Sales' and subtract the gst_amount for 'Expense'.

        Convert the user question into a valid SQLite query.
        Return ONLY the SQL query. No markdown, no explanations.

        User Question: "${question}"
        `;

      const sqlResult = await model.generateContent(schemaPrompt);
      let sqlQuery = sqlResult.response.text().trim();
      sqlQuery = sqlQuery
        .replace(/```sql/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Gemini generated this SQL:", sqlQuery);

      db.all(sqlQuery, [], async (err, rows) => {
        if (err) {
          console.error("SQL Execution Error:", err);
          return res.status(500).json({
            answer:
              "I couldn't process the data for that query. Try rephrasing.",
          });
        }

        try {
          const formattingPrompt = `
                    You are a helpful AI Accounting Assistant. Answer the user's question using ONLY the provided JSON database result.
                    Keep the answer conversational, short, and to the point. Format currency in Indian Rupees (₹). 

                    User Question: "${question}"
                    Database Result: ${JSON.stringify(rows)}
                    `;

          const finalResult = await model.generateContent(formattingPrompt);
          res.json({ answer: finalResult.response.text().trim() });
        } catch (innerError) {
          console.error("Gemini Formatting Error:", innerError.message);

          // A cleaner way to show fallback data without the [ { } ] brackets
          const cleanData = rows
            .map((row) => Object.values(row).join(" "))
            .join(", ");

          res.json({
            answer: `I found the data, but my language generator is currently busy. The raw result is: ${cleanData}`,
          });
        }
      });
    } catch (error) {
      console.error("Gemini API Error:", error.message);

      if (error.status === 429) {
        return res.status(429).json({
          answer:
            "You have exceeded your Gemini API quota limit. Please check your Google AI Studio plan.",
        });
      }
      if (error.status === 503) {
        return res.status(503).json({
          answer:
            "Google's AI servers are currently experiencing high demand. Please try again in a few minutes.",
        });
      }

      res.status(500).json({
        answer:
          "Sorry, I am having trouble connecting to the AI network right now.",
      });
    }
  });
});

// ==========================================
// ROUTE 3: GET ALL TRANSACTIONS
// ==========================================
app.get("/api/transactions", (req, res) => {
  db.all(
    "SELECT * FROM transactions ORDER BY id DESC LIMIT 100",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch Error:", err);
        return res.status(500).json({ error: "Failed to fetch transactions" });
      }
      res.json(rows);
    },
  );
});

// ==========================================
// ROUTE 4: GET UPLOAD HISTORY
// ==========================================
app.get("/api/uploads", (req, res) => {
  db.all(
    "SELECT * FROM upload_history ORDER BY upload_date DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch History Error:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch upload history" });
      }
      res.json(rows);
    },
  );
});

// ==========================================
// ROUTE 5: CLEAR TRANSACTIONS DATA
// ==========================================
app.delete("/api/transactions", (req, res) => {
  db.run("DELETE FROM transactions", function (err) {
    if (err) {
      console.error("Delete Transactions Error:", err);
      return res
        .status(500)
        .json({ error: "Failed to clear transactions data" });
    }
    res.json({ message: "All transactions cleared successfully." });
  });
});

// ==========================================
// ROUTE 6: CLEAR UPLOAD HISTORY
// ==========================================
app.delete("/api/uploads", (req, res) => {
  db.run("DELETE FROM upload_history", function (err) {
    if (err) {
      console.error("Delete History Error:", err);
      return res.status(500).json({ error: "Failed to clear upload history" });
    }
    res.json({ message: "Upload history cleared successfully." });
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});
