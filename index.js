import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GEMINI_MODEL = "gemini-2.5flash";

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server ready on http://localhost:${PORT}`));

function extractText(resp) {
  try {
    const text = resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? resp?.response?.candidates?.[0]?.content?.text;
    return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
    console.error("error extracting text:", err);
    return JSON.stringify(resp, null, 2);
  }
}
// Endpoint to generate text using Gemini API
app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    console.log("Gemini API response:", JSON.stringify(resp, null, 2)); // Log the full response
    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error in /generate-text:", err); // Log the error
    res.status(500).json({ error: err.message });
  }
});
// Endpoint to generate a document using Gemini API and save to file
app.post("/generate-document", async (req, res) => {
  try {
    const { prompt, filename = "gemini_output.txt" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const content = extractText(resp);
    await fs.writeFile(filename, content, "utf8");
    res.json({ message: `File generated successfully as ${filename}` });
  } catch (err) {
    console.error("Error in /generate-document:", err);
    res.status(500).json({ error: err.message });
  }
});
