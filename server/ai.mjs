
import { GoogleGenAI } from "@google/genai";

// Initialize the generative AI model
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateComponent = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send("A prompt is required.");
  }

  try {
    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result.text;
    res.send(text);
  } catch (error) {
    console.error("Error generating component:", error);
    res.status(500).send("Failed to generate component.");
  }
};
