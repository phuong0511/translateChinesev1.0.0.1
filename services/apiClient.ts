/**
 * API Client for backend microservices
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    const user = localStorage.getItem("current_user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.token = userData.token;
      } catch (e) {
        console.error("Failed to parse user from storage");
      }
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("api_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("api_token");
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`❌ API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================
  // AUTH API
  // ==================

  async register(email: string, name: string, password: string) {
    return this.request("/api/auth/register", "POST", {
      email,
      name,
      password,
    });
  }

  async login(email: string, password: string) {
    return this.request("/api/auth/login", "POST", {
      email,
      password,
    });
  }

  async verifyToken() {
    return this.request("/api/auth/verify", "GET");
  }

  // ==================
  // TRANSLATION API
  // ==================

  async translate(text: string, context: string, mode: "translate" | "analyze" = "translate") {
    return this.request("/api/translation/translate", "POST", {
      text,
      context,
      mode,
    });
  }

  // ==================
  // NOVELS API
  // ==================

  async createNovel(novel: any) {
    return this.request("/api/novels", "POST", novel);
  }

  async getNovel(novelId: string) {
    return this.request(`/api/novels/${novelId}`, "GET");
  }

  async getNovels() {
    return this.request("/api/novels", "GET");
  }

  async updateNovel(novelId: string, updates: any) {
    return this.request(`/api/novels/${novelId}`, "PUT", updates);
  }

  async deleteNovel(novelId: string) {
    return this.request(`/api/novels/${novelId}`, "DELETE");
  }

  // ==================
  // CHAPTERS API
  // ==================

  async createChapter(chapter: any) {
    return this.request("/api/chapters", "POST", chapter);
  }

  async getChapters(novelId: string) {
    return this.request(`/api/chapters/${novelId}`, "GET");
  }

  async updateChapter(chapterId: string, updates: any) {
    return this.request(`/api/chapters/${chapterId}`, "PUT", updates);
  }

  async deleteChapter(chapterId: string) {
    return this.request(`/api/chapters/${chapterId}`, "DELETE");
  }

  // ==================
  // TRANSLATIONS API
  // ==================

  async createTranslation(translation: any) {
    return this.request("/api/translations", "POST", translation);
  }

  async getTranslations(chapterId: string) {
    return this.request(`/api/translations/${chapterId}`, "GET");
  }

  async updateTranslation(translationId: string, updates: any) {
    return this.request(`/api/translations/${translationId}`, "PUT", updates);
  }

  async deleteTranslation(translationId: string) {
    return this.request(`/api/translations/${translationId}`, "DELETE");
  }
}

export default new ApiClient();
