import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { User, Novel, Chapter, Translation } from "../types/index";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class DatabaseService {
  // ==================
  // NOVELS OPERATIONS
  // ==================

  async createNovel(novel: Omit<Novel, "createdAt" | "updatedAt">) {
    const novelRef = doc(db, "novels", novel.id);
    await setDoc(novelRef, {
      ...novel,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getNovelById(novelId: string): Promise<Novel | null> {
    const novelRef = doc(db, "novels", novelId);
    const novelDoc = await getDoc(novelRef);
    return novelDoc.exists() ? (novelDoc.data() as Novel) : null;
  }

  async getNovelsByUserId(userId: string): Promise<Novel[]> {
    const q = query(collection(db, "novels"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Novel);
  }

  async updateNovel(novelId: string, updates: Partial<Novel>) {
    const novelRef = doc(db, "novels", novelId);
    await updateDoc(novelRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteNovel(novelId: string) {
    await deleteDoc(doc(db, "novels", novelId));
  }

  // ==================
  // CHAPTERS OPERATIONS
  // ==================

  async createChapter(chapter: Omit<Chapter, "createdAt" | "updatedAt">) {
    const chapterRef = doc(db, "chapters", chapter.id);
    await setDoc(chapterRef, {
      ...chapter,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update novel chapter count
    const novelRef = doc(db, "novels", chapter.novelId);
    const novel = await this.getNovelById(chapter.novelId);
    if (novel) {
      await updateDoc(novelRef, {
        chapterCount: novel.chapterCount + 1,
        updatedAt: Timestamp.now(),
      });
    }
  }

  async getChaptersByNovel(novelId: string): Promise<Chapter[]> {
    const q = query(collection(db, "chapters"), where("novelId", "==", novelId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Chapter);
  }

  async getChapterById(chapterId: string): Promise<Chapter | null> {
    const chapterRef = doc(db, "chapters", chapterId);
    const chapterDoc = await getDoc(chapterRef);
    return chapterDoc.exists() ? (chapterDoc.data() as Chapter) : null;
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>) {
    const chapterRef = doc(db, "chapters", chapterId);
    await updateDoc(chapterRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteChapter(chapterId: string) {
    await deleteDoc(doc(db, "chapters", chapterId));
  }

  // ==================
  // TRANSLATIONS OPERATIONS
  // ==================

  async createTranslation(translation: Omit<Translation, "createdAt" | "updatedAt">) {
    const translationRef = doc(db, "translations", translation.id);
    await setDoc(translationRef, {
      ...translation,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getTranslationsByChapter(chapterId: string): Promise<Translation[]> {
    const q = query(collection(db, "translations"), where("chapterId", "==", chapterId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Translation);
  }

  async getTranslationById(translationId: string): Promise<Translation | null> {
    const translationRef = doc(db, "translations", translationId);
    const translationDoc = await getDoc(translationRef);
    return translationDoc.exists() ? (translationDoc.data() as Translation) : null;
  }

  async updateTranslation(translationId: string, updates: Partial<Translation>) {
    const translationRef = doc(db, "translations", translationId);
    await updateDoc(translationRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteTranslation(translationId: string) {
    await deleteDoc(doc(db, "translations", translationId));
  }
}

export default new DatabaseService();
