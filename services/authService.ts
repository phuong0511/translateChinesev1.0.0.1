// Auth Service - Using Headless API Architecture

import apiClient from "./apiClient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider?: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private storageKey = "current_user";

  constructor() {
    this.loadFromStorage();
  }

  // Đăng ký tài khoản mới
  async register(email: string, name: string, password: string): Promise<AuthUser> {
    try {
      const response = (await apiClient.register(email, name, password)) as AuthResponse;
      const authUser = response.user;
      this.setUser(authUser, response.token);
      return authUser;
    } catch (error) {
      throw error;
    }
  }

  // Đăng nhập
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response = (await apiClient.login(email, password)) as AuthResponse;
      const authUser = response.user;
      this.setUser(authUser, response.token);
      return authUser;
    } catch (error) {
      throw error;
    }
  }

  // Set current user
  private setUser(user: AuthUser, token: string) {
    this.currentUser = user;
    apiClient.setToken(token);
    localStorage.setItem(this.storageKey, JSON.stringify({ ...user, token }));
  }

  // Load from storage
  private loadFromStorage() {
    const userStr = localStorage.getItem(this.storageKey);
    if (userStr) {
      try {
        const data = JSON.parse(userStr);
        this.currentUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          provider: data.provider,
        };
        if (data.token) {
          apiClient.setToken(data.token);
        }
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Logout
  logout() {
    this.currentUser = null;
    apiClient.clearToken();
    localStorage.removeItem(this.storageKey);
  }
}

export default new AuthService();
