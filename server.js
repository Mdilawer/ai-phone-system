import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Home route (for testing)
app.get("/", (req, res) => {
  res.send("Server is working");
});

const PORT = process.env.PORT || 3000;

app.post("/chat", async (req, res) => {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Add timeout protection (10 seconds)
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI timeout after 10 seconds")), 10000)
      )
    ]);

    return res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("ERROR DETAILS:", error);

    return res.status(500).json({
      error: "Something went wrong",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
