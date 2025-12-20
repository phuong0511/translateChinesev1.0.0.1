// services/authService.ts

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseService';
import databaseService from './firebaseService';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        let appUser = await databaseService.getUserById(user.uid);
        if (!appUser) {
          // If user exists in Auth but not in Firestore, create them.
          const newUser = {
            id: user.uid,
            email: user.email!,
            name: user.displayName || 'New User',
            role: 'user' as const,
            isActive: true,
          };
          await databaseService.createUser(newUser);
          this.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          };
        } else {
            this.currentUser = {
                id: appUser.id,
                name: appUser.name,
                email: appUser.email,
            };
        }
      } else {
        this.currentUser = null;
      }
    });
  }

  // Đăng ký tài khoản mới
  async register(email: string, name: string, password: string): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: name,
      role: 'user' as const,
      isActive: true,
    };
    await databaseService.createUser(newUser);

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
    this.currentUser = authUser;
    return authUser;
  }

  // Đăng nhập
  async login(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const appUser = await databaseService.getUserById(firebaseUser.uid);
    if (!appUser) {
        throw new Error("User not found in database.");
    }
    
    const authUser: AuthUser = {
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
    };
    this.currentUser = authUser;
    return authUser;
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }
  
  // Get current user from Auth state
  observeUser(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const appUser = await databaseService.getUserById(user.uid);
        if (appUser) {
          callback({
            id: appUser.id,
            name: appUser.name,
            email: appUser.email,
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }


  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Logout
  async logout() {
    await signOut(auth);
    this.currentUser = null;
  }
}

export default new AuthService();
