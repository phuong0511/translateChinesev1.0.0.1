import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import jwt from "jsonwebtoken";

// Firebase config (from environment)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: number;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(email: string, name: string, password: string): Promise<AuthResponse> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userDoc: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: name,
        provider: "email",
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userDoc,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Generate JWT token
      const token = this.generateToken(userDoc);

      return { user: userDoc, token };
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error("User not found in database");
      }

      const userData = userDoc.data() as AuthUser;

      // Generate JWT token
      const token = this.generateToken(userData);

      return { user: userData, token };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: AuthUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() ? (userDoc.data() as AuthUser) : null;
    } catch (error) {
      console.error("❌ Error getting user:", error);
      return null;
    }
  }
}

export default new AuthService();
