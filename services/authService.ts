// Auth Service for Email/Password Authentication

import userDatabase, { User } from './userDatabase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private storageKey = 'current_user';

  constructor() {
    this.loadFromStorage();
  }

  // Đăng ký tài khoản mới
  register(email: string, name: string, password: string): AuthUser {
    try {
      const user = userDatabase.registerUser(email, name, password);
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      this.setUser(authUser);
      return authUser;
    } catch (error) {
      throw error;
    }
  }

  // Đăng nhập
  login(email: string, password: string): AuthUser {
    try {
      const user = userDatabase.loginUser(email, password);
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      this.setUser(authUser);
      return authUser;
    } catch (error) {
      throw error;
    }
  }

  // Set current user
  private setUser(user: AuthUser) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  // Load from storage
  private loadFromStorage() {
    const userStr = localStorage.getItem(this.storageKey);
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
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
    localStorage.removeItem(this.storageKey);
  }
}

export default new AuthService();
