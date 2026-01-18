
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getFeedback(userInput: string, targetTask: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一名专注雅思提分的资深私教。请根据学生的今日产出内容进行针对性批改。
        
        【今日任务要求】: ${targetTask}
        【学生产出内容】: ${userInput}
        
        请严格按以下结构进行简短高效的反馈（中文）：
        1. ✅ 点评产出：判断学生是否达到了任务要求（例如同义词替换是否准确、逻辑是否清晰）。
        2. 💡 黄金建议：指出一个可以提升至 7 分+ 的具体改动点（词汇或语法）。
        3. 🚀 高分锦囊：提供 2-3 个与该话题极度相关的 C1/C2 级别词汇或词组。
        
        语气要专业、干脆，像真正的提分专家一样。`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "⚠️ 抱歉，老师正在批改其他卷子，请确认网络连接或稍后再试。";
    }
  }
}

export const geminiService = new GeminiService();
