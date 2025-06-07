import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "your-fallback-api-key",
});

async function generate(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return (
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini."
    );
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

// API route handler
export async function POST(req: Request) {
  try {
    const { type, prompt } = await req.json();

    if (!prompt || !type) {
      return NextResponse.json({ error: "Prompt and type are required." }, { status: 400 });
    }

    let finalPrompt = "";

    switch (type) {
      case "summarize":
        finalPrompt = `Summarize the following text:\n\n${prompt}`;
        break;

      case "explain-code":
        finalPrompt = `Explain what the following code does:\n\n${prompt}`;
        break;

      case "generate-quiz":
        finalPrompt = `Generate 5 multiple choice questions with answers based on the topic: "${prompt}".`;
        break;

      case "resume-helper":
        let parsed = typeof prompt === "string" ? JSON.parse(prompt) : prompt;
        const { name = "the candidate", skills = "", extraDetails = "" } = parsed;
        finalPrompt = `Write a short, professional resume summary for ${name}, who is skilled in ${skills}. Extra details: ${extraDetails}`;
        break;

      case "cp-helper":
        if (!prompt.trim()) {
          return NextResponse.json({ error: "Problem description is required." }, { status: 400 });
        }
        finalPrompt = `You are a competitive programming expert.
Analyze the following problem and do the following:
1. Explain the approach/algorithm to solve it
2. Provide optimized code in C++ or Java
3. Highlight edge cases

Problem:
${prompt}`;
        break;

      case "chat":
      default:
        finalPrompt = prompt;
        break;
    }

    const result = await generate(finalPrompt);
    return NextResponse.json({ result });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}