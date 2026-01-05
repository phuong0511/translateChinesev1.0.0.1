// ============================================
// DATABASE SCHEMA FOR NOVEL TRANSLATION APP
// ============================================

// ============================================
// 1. USERS (Tài khoản người dùng)
// ============================================
export interface User {
  id: string;                    // Unique ID
  email: string;                 // Email đăng nhập
  name: string;                  // Tên hiển thị
  password?: string;             // Hash mật khẩu (backend only)
  avatar?: string;               // URL ảnh đại diện
  bio?: string;                  // Tiểu sử
  role: 'user' | 'translator' | 'admin'; // Vai trò
  createdAt: number;             // Ngày tạo tài khoản
  updatedAt: number;             // Cập nhật lần cuối
  isActive: boolean;             // Tài khoản hoạt động
}

// ============================================
// 2. GENRES (Thể loại truyện)
// ============================================
export interface Genre {
  id: string;
  name: string;                  // Tên thể loại (Tiên Hiệp, Huyễn Thực, Dị Tề...)
  slug: string;                  // URL slug
  description: string;           // Mô tả
  icon?: string;                 // Icon/hình ảnh
  novelCount: number;            // Số truyện trong thể loại
  createdAt: number;
}

// ============================================
// 3. NOVELS (Truyện)
// ============================================
export interface Novel {
  id: string;
  title: string;                 // Tên truyện
  originalTitle: string;         // Tên gốc (Tiếng Trung)
  slug: string;                  // URL slug
  author: string;                // Tác giả gốc
  translator?: string;           // Người dịch (UserID)
  genres: string[];              // Mảng Genre IDs
  description: string;           // Mô tả truyện
  coverImage?: string;           // URL ảnh bìa
  status: 'ongoing' | 'completed' | 'paused'; // Trạng thái
  rating: number;                // Đánh giá (0-5)
  viewCount: number;             // Lượt xem
  chapterCount: number;          // Số chương
  createdAt: number;
  updatedAt: number;
  // Fields from NovelProject
  fixedProfile: string;
  history?: any[];
  contextNotes?: string;
}

// ============================================
// 4. CHAPTERS (Chương truyện)
// ============================================
export interface Chapter {
  id: string;
  novelId: string;               // ID truyện
  chapterNumber: number;         // Số chương (1, 2, 3...)
  title: string;                 // Tiêu đề chương
  originalContent: string;       // Nội dung gốc (Tiếng Trung)
  translationId?: string;        // ID bản dịch chính
  status: 'draft' | 'published' | 'pending_review'; // Trạng thái
  views: number;                 // Lượt xem
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

// ============================================
// 5. TRANSLATIONS (Bản dịch)
// ============================================
export interface Translation {
  id: string;
  chapterId: string;             // ID chương
  novelId: string;               // ID truyện
  translatorId: string;          // ID người dịch
  content: string;               // Nội dung dịch
  status: 'draft' | 'submitted' | 'approved' | 'published'; // Trạng thái
  quality: number;               // Chất lượng (0-100)
  likes: number;                 // Lượt thích
  comments: number;              // Số bình luận
  version: number;               // Phiên bản dịch
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

// ============================================
// 6. STATIC PROFILES (Hồ sơ cố định)
// ============================================
export interface StaticProfile {
  id: string;
  type: 'character' | 'place' | 'sect' | 'item'; // Loại hồ sơ
  name: string;                  // Tên nhân vật/địa điểm/...
  originalName: string;          // Tên gốc
  novels: string[];              // Các truyện xuất hiện
  description: string;           // Mô tả chi tiết
  aliases: string[];             // Các tên khác
  firstAppearance?: string;       // Lần xuất hiện đầu tiên (chapter ID)
  image?: string;                // Hình ảnh
  attributes?: Record<string, any>; // Các thuộc tính tùy chỉnh
  createdAt: number;
  updatedAt: number;
}

// ============================================
// 7. DYNAMIC CONTEXTS (Ngữ cảnh động)
// ============================================
export interface DynamicContext {
  id: string;
  chapterId: string;             // ID chương
  novelId: string;               // ID truyện
  profileId?: string;            // ID hồ sơ liên quan (nếu có)
  type: 'character_action' | 'plot_point' | 'world_building' | 'relationship'; // Loại ngữ cảnh
  originalText: string;          // Đoạn văn bản gốc
  translatedText?: string;       // Đoạn dịch
  context: string;               // Giải thích ngữ cảnh
  structuredContext?: StructuredContext; // Ngữ cảnh chuẩn hóa dạng JSON
  importance: 'low' | 'medium' | 'high'; // Mức độ quan trọng
  notes?: string;                // Ghi chú thêm
  createdAt: number;
  updatedAt: number;
  createdBy: string;             // ID người tạo
}

// Chuẩn hóa ngữ cảnh dạng JSON để AI dễ bám theo
export interface StructuredContext {
  characters: Array<{
    name: string;
    role?: string;
    aliases?: string[];
    pronouns?: string;
    relations?: string[];
    status?: string;
  }>;
  locations?: Array<{
    name: string;
    detail?: string;
  }>;
  tone?: string;
  plotPoints?: string[];
}

// ============================================
// 8. TRANSLATION HISTORY (Lịch sử dịch)
// ============================================
export interface TranslationHistory {
  id: string;
  translationId: string;         // ID bản dịch
  chapterId: string;
  novelId: string;
  previousContent: string;       // Nội dung trước
  newContent: string;            // Nội dung mới
  changedBy: string;             // ID người thay đổi
  changeReason?: string;         // Lý do thay đổi
  version: number;               // Phiên bản
  createdAt: number;
}

// ============================================
// DATABASE COLLECTIONS SUMMARY
// ============================================
export const DATABASE_COLLECTIONS = {
  USERS: 'users',
  GENRES: 'genres',
  NOVELS: 'novels',
  CHAPTERS: 'chapters',
  TRANSLATIONS: 'translations',
  STATIC_PROFILES: 'static_profiles',
  DYNAMIC_CONTEXTS: 'dynamic_contexts',
  TRANSLATION_HISTORY: 'translation_history',
};

// ============================================
// RELATIONSHIPS
// ============================================
/*
USERS (1) ──── (M) NOVELS (translators)
USERS (1) ──── (M) TRANSLATIONS (translators)

GENRES (M) ──── (M) NOVELS

NOVELS (1) ──── (M) CHAPTERS
NOVELS (1) ──── (M) TRANSLATIONS
NOVELS (1) ──── (M) STATIC_PROFILES
NOVELS (1) ──── (M) DYNAMIC_CONTEXTS

CHAPTERS (1) ──── (M) TRANSLATIONS
CHAPTERS (1) ──── (M) DYNAMIC_CONTEXTS

TRANSLATIONS (1) ──── (M) TRANSLATION_HISTORY

STATIC_PROFILES (1) ──── (M) DYNAMIC_CONTEXTS
*/
