import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================
// VALIDATION
// ============================================
if (!GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: "50mb" }));

// CORS Configuration - Restrict to frontend domain only
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests from GitHub Pages, Railway domain, and localhost
    const allowedOrigins = [
      FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://phuong0511.github.io",
      /translatechinesev/i, // Allow any subdomain with 'translatechinesev'
    ];

    // No origin means same-origin or mobile app - allow
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Request logging (development only)
if (NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// ============================================
// GEMINI API SETUP
// ============================================
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// System instruction for consistent Vietnamese translation
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
     - "He walked fast" → "Hắn rảo bước nhanh chóng" (thay vì "Hắn đi bộ nhanh")
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
   - Nếu input là Title chương, định dạng: "**Chương [X]: [Tên Chương]**"

5. **PHONG CÁCH OUTPUT:**
   - Dịch như một người kể chuyện chuyên nghiệp.
   - TRÁNH "Machine Translation feel" (cứng nhắc).
   - Làm cho nó nghe như một cuốn tiểu thuyết xuất bản.
   - Giữ nhịp điệu, cảm xúc của bản gốc.

**ALWAYS OUTPUT ONLY THE TRANSLATED TEXT. NO NOTES, NO EXPLANATIONS.**
`;

// ============================================
// API ROUTES
// ============================================

/**
 * POST /api/translate
 * Translates Chinese text to Vietnamese
 */
app.post("/api/translate", async (req: Request, res: Response) => {
  try {
    const { text, context, mode } = req.body;

    // Validation
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' parameter" });
    }

    if (!context || typeof context !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'context' parameter" });
    }

    if (!mode || !["translate", "analyze"].includes(mode)) {
      return res.status(400).json({ error: "Missing or invalid 'mode' parameter (must be 'translate' or 'analyze')" });
    }

    // Limit text length to prevent abuse
    const MAX_TEXT_LENGTH = 50000;
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` });
    }

    console.log(`📝 Processing ${mode} request, text length: ${text.length}`);

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

    const translatedText = result.response.text();

    console.log(`✅ Translation complete`);
    res.json({ translation: translatedText });

  } catch (error: any) {
    console.error("❌ Translation error:", error);

    // Handle specific error types
    if (error.message?.includes("429")) {
      return res.status(429).json({ error: "Quota exceeded. Please try again later." });
    }

    if (error.message?.includes("SAFETY")) {
      return res.status(400).json({ error: "Content blocked by safety filter" });
    }

    if (error.message?.includes("API key")) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    res.status(500).json({ 
      error: error.message || "Translation failed",
      details: NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : "An error occurred",
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
🚀 Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL:       http://localhost:${PORT}
Health:    http://localhost:${PORT}/health
API:       POST http://localhost:${PORT}/api/translate
CORS:      ${FRONTEND_URL}
ENV:       ${NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
