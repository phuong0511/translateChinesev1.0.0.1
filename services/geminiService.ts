import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Unified function for both Translation and Analysis.
 * @param text The input text (chapter content).
 * @param contextOrInstruction For 'translate': The combined profile + context. For 'analyze': The analysis prompt template.
 * @param mode 'translate' uses Flash model (balanced). 'analyze' uses Flash model for speed.
 */
export const translateText = async (
  text: string, 
  contextOrInstruction: string, 
  mode: 'translate' | 'analyze' = 'translate'
): Promise<string> => {
  if (!text.trim()) return "";

  try {
    if (mode === 'analyze') {
      // MODE ANALYZE: Gemini 2.5 Flash - Quick context extraction
      // Temperature: 0.3 for factual extraction (less creative)
      
      const fullPrompt = contextOrInstruction.replace('(Xem văn bản đầu vào)', `\n${text.substring(0, 15000)}\n`);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ],
        config: {
          temperature: 0.3, // Low temp for factual extraction
        }
      });

      return response.text || "";

    } else {
      // MODE TRANSLATE: Gemini 2.5 Flash (Balanced quality & quota efficiency)
      // System Instruction applied here for consistent Vietnamese translation style
      
      const fullPrompt = `
[THÔNG TIN HỒ SƠ & NGỮ CẢNH CỦA TRUYỆN]:
${contextOrInstruction}

[VĂN BẢN GỐC CẦN DỊCH]:
${text}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
          topK: 64,
          topP: 0.95
        }
      });

      return response.text || "";
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw formatError(error);
  }
};

const formatError = (error: any): Error => {
    let errorMessage = "Đã xảy ra lỗi không xác định.";
    if (error instanceof Error) {
        if (error.message.includes("429")) {
            errorMessage = "Hệ thống quá tải (Quota Exceeded). Vui lòng đợi 30s.";
        } else if (error.message.includes("SAFETY")) {
            errorMessage = "Nội dung bị chặn bởi bộ lọc an toàn.";
        } else {
            errorMessage = error.message;
        }
    }
    return new Error(errorMessage);
}