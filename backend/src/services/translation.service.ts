import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const SYSTEM_INSTRUCTION = `
**ROLE:** Professional Translator of Chinese Web Novels (Xianxia/Huyền Huyễn/Võ Hiệp).
**TARGET LANGUAGE:** Vietnamese (Văn phong: Dịch thuật, Cổ trang, Hán Việt vừa phải, Mượt mà như tiểu thuyết in ấn).

**CRITICAL RULES (PHẢI TUÂN THỦ):**

1. **ĐỘC LẬP VỚI CONTEXT:**
   - STRICTLY apply the "FIXED PROFILE" (Hồ sơ cố định) và "DYNAMIC CONTEXT" (Ngữ cảnh động) mà người dùng cung cấp.
   - Ví dụ: Nếu User ghi "Nhân vật A gọi B là 'Đại ca'", PHẢI dịch là "Đại ca", không được dùng "Anh trai" hay "Huynh".

2. **THUẬT NGỮ DỊCH: HÁN VIỆT VS THUẦN VIỆT**
   - **Cultivation/Martial Arts Terms (GIỮ HÁN VIỆT):**
     - 丹田 (Dan Tian) → "Đan điền" (KHÔNG phải "Vùng bụng dưới")
     - 气 (Qi) → "Linh khí" hoặc "Khí" (tùy context)
     - 宗门 (Sect) → "Tông môn" (KHÔNG "Môn phái")
     - 境界 (Level/Realm) → "Cảnh giới"
     - 功法 (Technique) → "Công pháp"
     - 渡劫 (Tribulation) → "Vượt kiếp"
     - 证道 (Ascend) → "Chứng đạo"
     - 化身 (Clone/Avatar) → "Hóa thân"
   
   - **Descriptive/Action (DÙNG TIẾNG VIỆT MƯỢT MỀM):**
     - "He walked fast" → "Hắn rảo bước nhanh chóng"
     - "Her face turned cold" → "Nàng khuôn mặt trở nên lạnh lùng"
     - "With a flash of light" → "Một tia sáng chớp thoáng"

3. **XƯNG HÔ & CHỈ NGƯỜI VẬT:**
   - **Narrative (Kể chuyện):**
     - Nam chính → "Hắn" (hoặc tên nhân vật)
     - Nữ nhân vật tích cực → "Nàng"
     - Nhân vật trung lập/nam phụ → "Y" hoặc tên
     - Người lão/cao tuổi → "Lão"
     - Kẻ thù/tác nhân → "Gã"
   
   - **Nội tâm (Internal Monologue):** Sử dụng "Ta"
   - **Đối thoại (Dialogue):** Phản ánh mối quan hệ, địa vị

4. **ĐỊNH DẠNG (FORMAT):**
   - Giữ nguyên xuống dòng.
   - Đối thoại PHẢI nằm trong " ... " (Smart quotes).
   - KHÔNG thêm ghi chú giải thích như "(T/N: ...)" vào giữa văn bản.

5. **PHONG CÁCH OUTPUT:**
   - Dịch như một người kể chuyện chuyên nghiệp.
   - TRÁNH "Machine Translation feel" (cứng nhắc).
   - Làm cho nó nghe như một cuốn tiểu thuyết xuất bản.
   - Giữ nhịp điệu, cảm xúc của bản gốc.

**ALWAYS OUTPUT ONLY THE TRANSLATED TEXT. NO NOTES, NO EXPLANATIONS.**
`;

export interface TranslationRequest {
  text: string;
  context: string;
  mode: "translate" | "analyze";
}

export interface TranslationResponse {
  translation: string;
}

class TranslationService {
  /**
   * Translate Chinese text to Vietnamese
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, context, mode } = request;

    // Validation
    if (!text || typeof text !== "string") {
      throw new Error("Missing or invalid 'text' parameter");
    }

    if (!context || typeof context !== "string") {
      throw new Error("Missing or invalid 'context' parameter");
    }

    if (!mode || !["translate", "analyze"].includes(mode)) {
      throw new Error("Missing or invalid 'mode' parameter (must be 'translate' or 'analyze')");
    }

    // Limit text length
    const MAX_TEXT_LENGTH = 50000;
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error(`Text too long (max ${MAX_TEXT_LENGTH} characters)`);
    }

    console.log(`📝 Processing ${mode} request, text length: ${text.length}`);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: mode === "translate" ? SYSTEM_INSTRUCTION : undefined,
      });

      const generationConfig = {
        temperature: mode === "analyze" ? 0.3 : 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      };

      // Build prompt based on mode
      let finalPrompt = "";
      if (mode === "analyze") {
        finalPrompt = `${context}\n\n---\n\nVĂN BẢN CẦN PHÂN TÍCH:\n${text.substring(0, 15000)}`;
      } else {
        finalPrompt = `[THÔNG TIN HỒ SƠ & NGỮ CẢNH]:\n${context}\n\n[VĂN BẢN GỐC CẦN DỊCH]:\n${text}`;
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig,
        safetySettings: SAFETY_SETTINGS,
      });

      const translation = result.response.text();

      console.log(`✅ Translation complete`);
      return { translation };
    } catch (error: any) {
      console.error("❌ Translation error:", error);
      throw error;
    }
  }
}

export default new TranslationService();
