
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResearchBrief = async (pageText: string): Promise<ResearchBrief> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请分析以下网页内容并提供中文研究简报（JSON格式）。
    内容: ${pageText.substring(0, 12000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "页面的核心摘要" },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "核心要点列表" },
          entities: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: {
                name: { type: Type.STRING, description: "实体名称" },
                type: { type: Type.STRING, description: "类型（人物、组织、地点等）" },
                description: { type: Type.STRING, description: "简短描述" }
              },
              required: ["name", "type", "description"]
            } 
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              readingTime: { type: Type.NUMBER, description: "预计阅读分钟数" },
              complexity: { type: Type.STRING, description: "复杂度：简单、中等、深度" },
              sentiment: { type: Type.STRING, description: "情感倾向：中立、积极、消极等" }
            },
            required: ["readingTime", "complexity", "sentiment"]
          }
        },
        required: ["summary", "keyPoints", "entities", "metrics"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const chatWithContext = async (message: string, context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `页面上下文: ${context.substring(0, 10000)}\n\n用户问题: ${message}`,
    config: {
      systemInstruction: "你是一个专业的中文研究助手。请基于提供的页面上下文，提供准确、引经据典的回答。如果页面中没有相关信息，请如实告知。"
    }
  });
  return response.text;
};
