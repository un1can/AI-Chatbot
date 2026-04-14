// Load environment variables from .env file
// We use __dirname so dotenv always finds backend/.env
// regardless of which folder you run "npm start" from
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// Serve the frontend folder as static files
// This means visiting http://localhost:3000 loads frontend/index.html
app.use(express.static(path.join(__dirname, "../frontend")));

// POST /chat — the only API endpoint in this app
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  // Validate: messages must exist and be a non-empty array
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array cannot be empty." });
  }

  // Validate: API key must be set in the environment
  if (!process.env.GROQ_API_KEY) {
    return res
      .status(500)
      .json({ error: "Server is missing the API key. Contact the admin." });
  }

  try {
    // Call the Groq API
    // Groq uses the same request format as OpenAI, so this pattern is transferable
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Free model available on Groq
          messages: messages,
        }),
      }
    );

    // If Groq returned an error status, handle it clearly
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return res
        .status(502)
        .json({ error: "The AI service returned an error. Please try again." });
    }

    const data = await response.json();

    // Extract the reply text from Groq's response
    const reply = data.choices[0].message.content;

    // Return the reply to the frontend
    return res.json({ reply });
  } catch (err) {
    // Network error or unexpected failure
    console.error("Server error:", err.message);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
