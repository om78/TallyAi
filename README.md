# 📊 Tally AI Accounting Assistant

> An AI-powered accounting dashboard that transforms raw Tally ERP CSV exports into actionable insights using natural language, interactive analytics, and automated SQL generation.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

**Tally AI Accounting Assistant** is a full-stack web application that enables businesses to upload **Tally ERP accounting exports (CSV)** and instantly analyze financial data through an AI-powered conversational interface.

Instead of manually filtering spreadsheets or writing SQL queries, users can simply ask questions in plain English, and the AI converts them into SQLite queries, executes them securely, and returns easy-to-understand answers.

---

## ✨ Features

### 📂 Intelligent CSV Processing

* Upload standard Tally ERP CSV exports
* Automatic CSV parsing and sanitization
* Stores data securely in a local SQLite database
* Maintains upload history for auditing

---

### 🤖 AI Accounting Assistant

Powered by **Google Gemini 2.5 Flash**.

Ask natural language questions like:

* *What were my total expenses last month?*
* *How many unpaid invoices do I have?*
* *Who is my highest-paying customer?*
* *Show revenue generated this quarter.*

The assistant:

* Converts natural language → SQL
* Executes queries securely
* Returns formatted business-friendly responses
* Falls back gracefully if AI services are unavailable

---

### 📈 Interactive Dashboard

Visualize accounting data with dynamic charts built using **Recharts**.

Features include:

* Revenue vs Expenses
* Time-series analytics
* Filter by:

  * 1 Week
  * 1 Month
  * 6 Months
  * 1 Year
  * 5 Years

---

### 🔍 Data Viewer

* Search across all imported records
* View complete accounting entries
* Fast filtering
* Clean table interface

---

### ⚙️ Database Management

Settings page includes a **Danger Zone** for administrators.

Functions:

* Clear accounting records
* Delete imported datasets
* Reset database tables

---

### 🛡️ Robust Error Handling

The backend gracefully handles Google Gemini API failures.

Implemented fallbacks for:

* HTTP 429 (Rate Limit)
* HTTP 503 (Service Overloaded)
* Invalid AI responses

Ensures the application continues serving useful data even when AI responses are temporarily unavailable.

---

# 🛠 Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Recharts
* Lucide React

## Backend

* Node.js
* Express.js
* SQLite3
* Multer
* CSV Parser

## AI

* Google Gemini API
* Gemini 2.5 Flash

---

# 📁 Project Structure

```text
project-root/
│
├── Frontend/          # React Frontend
│
├── Backend/          # Express Backend
│
├── accounting.db           # SQLite Database (auto-generated)
│
└── README.md
```
<img width="1536" height="1024" alt="ChatGPT Image Jun 25, 2026, 06_40_34 PM" src="https://github.com/user-attachments/assets/0130dee9-143d-46af-bb8c-ffd35a5552ff" />

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js (v16 or later)
* npm
* Google AI Studio API Key

Generate a free API key:

https://aistudio.google.com/

---

# 1️⃣ Backend Setup

Navigate to the backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_google_api_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

On first launch, SQLite automatically creates:

```text
accounting.db
```

Backend runs at:

```text
http://localhost:5000
```

---

# 2️⃣ Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# 🧪 Testing the Application

## Upload Data

Navigate to:

```
Upload Data
```

Upload a sample Tally CSV export.

---

## Dashboard

View:

* Financial summary cards
* Revenue charts
* Expense charts
* Time filters

---

## AI Assistant

Try asking:

```text
What is my total sales?
```

```text
How many invoices are unpaid?
```

```text
Who is my top customer by revenue?
```

```text
Show expenses from the previous month.
```

```text
Which vendor received the highest payment?
```

---

## Data Viewer

Test:

* Global search
* Record browsing
* Sorting and filtering

---

## Settings

Navigate to:

```
Settings
```

Use the **Danger Zone** to:

* Delete uploaded accounting data
* Reset SQLite tables

---

# 🔒 Security

* Parameterized SQLite queries
* Input sanitization
* Secure file uploads
* Environment variables for API keys
* Graceful API fallback handling

---

# 📸 Screenshots

<img width="1901" height="905" alt="image" src="https://github.com/user-attachments/assets/0da1a97d-617c-497e-b0bb-22b47b15046a" />
<img width="1913" height="900" alt="image" src="https://github.com/user-attachments/assets/2da06b50-8e5a-4be3-a654-7847f0006428" />
<img width="1912" height="902" alt="image" src="https://github.com/user-attachments/assets/637398b2-42bf-4d3f-a4d0-0b7794684309" />

```

---

# 👨‍💻 Author
Om Sonavane
Developed as an AI-powered internal accounting tool for simplifying financial analysis using modern web technologies and Google's Gemini AI.

---

# 📄 License

This project is licensed under the MIT License.

Feel free to use, modify, and distribute it for educational or commercial purposes.
