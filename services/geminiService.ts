// Translation Service - Using Headless API Architecture
import apiClient from "./apiClient";

export interface TranslateRequest {
  text: string;
  context: string;
  mode: "translate" | "analyze";
}

export interface TranslateResponse {
  translation: string;
}

/**
 * Unified function for both Translation and Analysis.
 * @param text The input text (chapter content).
 * @param contextOrInstruction For 'translate': The combined profile + context. For 'analyze': The analysis prompt template.
 * @param mode 'translate' for full translation. 'analyze' for context extraction.
 */
export const translateText = async (
  text: string, 
  contextOrInstruction: string, 
  mode: 'translate' | 'analyze' = 'translate'
): Promise<string> => {
  if (!text.trim()) return "";

  try {
    console.log(`🌐 Calling Translation API (mode: ${mode})...`);
    
    const response = await apiClient.translate(text, contextOrInstruction, mode) as TranslateResponse;
    return response.translation || "";

  } catch (error: any) {
    console.error("❌ Translation API Error:", error);
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