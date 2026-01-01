// Type definitions for backend
export interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  description?: string;
  author?: string;
  genres: string[];
  chapterCount: number;
  fixedProfile: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Translation {
  id: string;
  chapterId: string;
  novelId: string;
  translatorId: string;
  rawText: string;
  translatedText: string;
  status: "draft" | "completed" | "published";
  createdAt: number;
  updatedAt: number;
}
