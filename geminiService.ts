
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Idea } from "./types.ts";

// Safe check for process and environment variables
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getAIPrioritySuggestion = async (tasks: Task[]) => {
  if (!ai) return "IA não configurada ou API Key ausente.";
  
  const prompt = `Analyze these tasks and suggest an optimized workflow for today based on priority and deadlines: ${JSON.stringify(tasks)}. Respond with a brief summary and top 3 priorities.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Não foi possível carregar as sugestões de IA no momento.";
  }
};

export const convertIdeaToTask = async (idea: Idea) => {
  if (!ai) return null;

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
          required: ["title", "description"]
        }
      }
    });
    const text = response.text;
    return JSON.parse(text?.trim() || "{}");
  } catch (error) {
    console.error("AI Conversion Error:", error);
    return null;
  }
};
