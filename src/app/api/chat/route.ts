import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  console.log(process.env.GOOGLE_API_KEY!)
  try {
    const { prompt, type } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let finalPrompt = prompt;
    
    // Handle different types of prompts
    switch (type) {
      case "summarize":
        finalPrompt = `Summarize the following text:\n\n${prompt}`;
        break;
      case "explain-code":
        finalPrompt = `Explain what the following code does:\n\n${prompt}`;
        break;
      case "generate-quiz":
        finalPrompt = `Generate 5 MCQ questions on the topic "${prompt}" with answers.`;
        break;
      case "resume-helper":
        const { name, skills } = JSON.parse(prompt);
        finalPrompt = `Write a professional resume summary for a person named ${name} skilled in ${skills}`;
        break;
      case "cp-helper":
        finalPrompt = `You are a competitive programming expert. 
          Analyze the following problem and do the following:
          1. Explain the approach/algorithm to solve it
          2. Suggest optimized code in C++ or Java (mention language)
          3. Highlight edge cases\n\nProblem:\n${prompt}`;
        break;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 