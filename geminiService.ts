
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Idea } from "./types";

// Initialize the Google GenAI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPrioritySuggestion = async (tasks: Task[]) => {
  const prompt = `Analyze these tasks and suggest an optimized workflow for today based on priority and deadlines: ${JSON.stringify(tasks)}. Respond with a brief summary and top 3 priorities.`;
  
  try {
    // @google/genai: Using gemini-3-pro-preview for complex reasoning task as per guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Não foi possível carregar as sugestões de IA no momento.";
  }
};

export const convertIdeaToTask = async (idea: Idea) => {
  const prompt = `Convert this idea into a detailed task with potential sub-tasks: "${idea.title}: ${idea.content}". Format as JSON with title, description, and subTasks array.`;
  
  try {
    // @google/genai: Using gemini-3-pro-preview and responseSchema for structured JSON output.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The name of the converted task."
            },
            description: {
              type: Type.STRING,
              description: "Detailed description of the task."
            },
            subTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "A list of actionable sub-tasks."
            }
          },
          propertyOrdering: ["title", "description", "subTasks"]
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
