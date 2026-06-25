const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "accounting.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Table 1: ------ Transactions Data ---------
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            voucher_no TEXT,
            particulars TEXT,
            type TEXT,
            amount REAL,
            gst_amount REAL, 
            status TEXT
        )`);

    // Table 2: ------ Upload History Log --------
    db.run(`CREATE TABLE IF NOT EXISTS upload_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            row_count INTEGER,
            status TEXT
        )`);
  }
});

module.exports = db;
