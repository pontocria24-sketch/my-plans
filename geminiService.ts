
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Idea } from "./types";

// Always initialize with direct environment variable as per SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPrioritySuggestion = async (tasks: Task[]) => {
  // Use 'gemini-3-pro-preview' for complex text tasks like reasoning and workflow planning.
  const prompt = `Analyze these tasks and suggest an optimized workflow for today based on priority and deadlines: ${JSON.stringify(tasks)}. Respond with a brief summary and top 3 priorities.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Access the .text property directly as it is no longer a method in this SDK version.
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Não foi possível carregar as sugestões de IA no momento.";
  }
};

export const convertIdeaToTask = async (idea: Idea) => {
  // Complex reasoning tasks such as converting an idea into detailed task steps use 'gemini-3-pro-preview'.
  const prompt = `Convert this idea into a detailed task with potential sub-tasks: "${idea.title}: ${idea.content}". Format as JSON with title, description, and subTasks array.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            subTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          propertyOrdering: ["title", "description", "subTasks"]
        }
      }
    });
    // Access the .text property directly.
    const text = response.text;
    return JSON.parse(text?.trim() || "{}");
  } catch (error) {
    console.error("AI Conversion Error:", error);
    return null;
  }
};