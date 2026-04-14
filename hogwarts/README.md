# AI Chat App

A minimal web chat application that lets users send messages and receive responses from an AI, built as a case study for understanding how frontend, backend, and LLM APIs work together.

---

## Features

- Single-page chat interface
- Message sent to backend via HTTP POST
- Backend calls the Groq LLM API and returns the AI response
- API key stored securely in environment variables — never exposed to the browser
- Basic input validation and error handling
- Loading state shown while waiting for the AI

---

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend  | Node.js + Express   |
| LLM API  | Groq (llama3-8b)    |
| Env vars | dotenv              |

---

## Project Structure

```
hogwarts/
├── backend/
│   ├── server.js       # Express server with POST /chat endpoint
│   └── .env            # Your API key — DO NOT commit this
├── frontend/
│   ├── index.html      # Single-page UI
│   ├── style.css       # Minimal plain styles
│   └── script.js       # Fetch logic, loading state, error handling
├── .env.example        # Template — safe to commit
├── .gitignore          # Excludes .env and node_modules
├── package.json        # Dependencies
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free [Groq API key](https://console.groq.com)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hogwarts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

Copy the example file and add your real API key:

```bash
cp .env.example backend/.env
```

Then open `backend/.env` and replace the placeholder:

```
GROQ_API_KEY=your_real_api_key_here
PORT=3000
```

> **Important:** Never commit `backend/.env` to GitHub. It is already listed in `.gitignore`.

### 4. Run the app locally

```bash
npm start
```

You should see:

```
Server running at http://localhost:3000
```

### 5. Open in your browser

Go to [http://localhost:3000]

---

## Environment Variables

| Variable       | Required | Description                        |
|----------------|----------|------------------------------------|
| `GROQ_API_KEY` | Yes      | Your API key from console.groq.com |
| `PORT`         | No       | Server port (defaults to 3000)     |

---

## Sample Usage

1. Open the app in your browser
2. Type a question (e.g., "What is machine learning?")
3. Click **Send** or press **Ctrl+Enter**
4. The AI response appears below within a few seconds