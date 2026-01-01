import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authService from "./services/auth.service";
import translationService from "./services/translation.service";
import databaseService from "./services/database.service";
import { authMiddleware, errorHandler } from "./middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

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
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// API ROUTES - AUTH
// ============================================

/**
 * POST /api/auth/register
 * Register new user
 */
app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await authService.register(email, name, password);
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
app.get("/api/auth/verify", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// ============================================
// API ROUTES - TRANSLATION
// ============================================

/**
 * POST /api/translation/translate
 * Translate Chinese text to Vietnamese
 */
app.post("/api/translation/translate", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, context, mode } = req.body;

    const result = await translationService.translate({
      text,
      context,
      mode: mode || "translate",
    });

    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// ============================================
// API ROUTES - DATABASE
// ============================================

/**
 * POST /api/novels
 * Create new novel
 */
app.post("/api/novels", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, author, genres, fixedProfile } = req.body;
    const userId = req.user.id;

    const novelId = Date.now().toString();
    const novel = {
      id: novelId,
      userId,
      title,
      description,
      author,
      genres,
      fixedProfile,
      chapterCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await databaseService.createNovel(novel);
    res.status(201).json(novel);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/novels/:novelId
 * Get novel by ID
 */
app.get("/api/novels/:novelId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const novel = await databaseService.getNovelById(req.params.novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    res.json(novel);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/novels
 * Get all novels for user
 */
app.get("/api/novels", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const novels = await databaseService.getNovelsByUserId(req.user.id);
    res.json(novels);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/novels/:novelId
 * Update novel
 */
app.put("/api/novels/:novelId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { novelId } = req.params;
    const updates = req.body;

    await databaseService.updateNovel(novelId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const novel = await databaseService.getNovelById(novelId);
    res.json(novel);
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/novels/:novelId
 * Delete novel
 */
app.delete("/api/novels/:novelId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await databaseService.deleteNovel(req.params.novelId);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// ============================================
// API ROUTES - CHAPTERS
// ============================================

/**
 * POST /api/chapters
 * Create new chapter
 */
app.post("/api/chapters", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { novelId, chapterNumber, title, content } = req.body;

    const chapterId = `${novelId}_${chapterNumber}`;
    const chapter = {
      id: chapterId,
      novelId,
      chapterNumber,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await databaseService.createChapter(chapter);
    res.status(201).json(chapter);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/chapters/:novelId
 * Get chapters by novel
 */
app.get("/api/chapters/:novelId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapters = await databaseService.getChaptersByNovel(req.params.novelId);
    res.json(chapters);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/chapters/:chapterId
 * Update chapter
 */
app.put("/api/chapters/:chapterId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    await databaseService.updateChapter(req.params.chapterId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const chapter = await databaseService.getChapterById(req.params.chapterId);
    res.json(chapter);
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/chapters/:chapterId
 * Delete chapter
 */
app.delete("/api/chapters/:chapterId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await databaseService.deleteChapter(req.params.chapterId);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// ============================================
// API ROUTES - TRANSLATIONS
// ============================================

/**
 * POST /api/translations
 * Create new translation
 */
app.post("/api/translations", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId, novelId, rawText, translatedText } = req.body;

    const translationId = `${chapterId}_${Date.now()}`;
    const translation = {
      id: translationId,
      chapterId,
      novelId,
      translatorId: req.user.id,
      rawText,
      translatedText,
      status: "draft" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await databaseService.createTranslation(translation);
    res.status(201).json(translation);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/translations/:chapterId
 * Get translations by chapter
 */
app.get("/api/translations/:chapterId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const translations = await databaseService.getTranslationsByChapter(req.params.chapterId);
    res.json(translations);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/translations/:translationId
 * Update translation
 */
app.put("/api/translations/:translationId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    await databaseService.updateTranslation(req.params.translationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const translation = await databaseService.getTranslationById(req.params.translationId);
    res.json(translation);
  } catch (error: any) {
    next(error);
  }
});

/**
 * DELETE /api/translations/:translationId
 * Delete translation
 */
app.delete("/api/translations/:translationId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await databaseService.deleteTranslation(req.params.translationId);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
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
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
🚀 Backend Server Running (Microservice Architecture)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL:              http://localhost:${PORT}
Health:           http://localhost:${PORT}/health
Frontend:         ${FRONTEND_URL}
Environment:      ${NODE_ENV}

📋 API Routes:
  Authentication:
    POST   /api/auth/register
    POST   /api/auth/login
    GET    /api/auth/verify

  Translation:
    POST   /api/translation/translate

  Novels:
    GET    /api/novels
    POST   /api/novels
    GET    /api/novels/:novelId
    PUT    /api/novels/:novelId
    DELETE /api/novels/:novelId

  Chapters:
    GET    /api/chapters/:novelId
    POST   /api/chapters
    PUT    /api/chapters/:chapterId
    DELETE /api/chapters/:chapterId

  Translations:
    GET    /api/translations/:chapterId
    POST   /api/translations
    PUT    /api/translations/:translationId
    DELETE /api/translations/:translationId
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
