import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Backend API URL - points to Node.js server (API key is safe there)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * Unified function for both Translation and Analysis.
 * @param text The input text (chapter content).
 * @param contextOrInstruction For 'translate': The combined profile + context. For 'analyze': The analysis prompt template.
 * @param mode 'translate' uses backend with system instruction. 'analyze' uses backend with low temp extraction.
 */
export const translateText = async (
  text: string, 
  contextOrInstruction: string, 
  mode: 'translate' | 'analyze' = 'translate'
): Promise<string> => {
  if (!text.trim()) return "";

  try {
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/translate (mode: ${mode})`);
    
    const response = await fetch(`${BACKEND_URL}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        context: contextOrInstruction,
        mode: mode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translation || "";

  } catch (error: any) {
    console.error("Backend API Error:", error);
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
        } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "Không thể kết nối backend. Kiểm tra server có chạy không?";
        } else {
            errorMessage = error.message;
        }
    }
    return new Error(errorMessage);
}