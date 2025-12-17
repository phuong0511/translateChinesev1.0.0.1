// Firebase Configuration and Database Service

import { initializeApp } from 'firebase/app';
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
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  User,
  Novel,
  Chapter,
  Translation,
  Genre,
  StaticProfile,
  DynamicContext,
  DATABASE_COLLECTIONS,
} from '../database.schema';

// Firebase Configuration - Từ .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============================================
// DATABASE SERVICE CLASS
// ============================================

class DatabaseService {
  // ==================
  // USERS OPERATIONS
  // ==================

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>) {
    const userRef = doc(db, DATABASE_COLLECTIONS.USERS, user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, DATABASE_COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data() as User) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.USERS),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }

  // ==================
  // GENRES OPERATIONS
  // ==================

  async createGenre(genre: any) {
    try {
      console.log('🔧 firebaseService.createGenre called with:', genre);
      const genreRef = doc(db, 'genres', genre.id);
      const dataToWrite = {
        id: genre.id,
        name: genre.name,
        slug: genre.slug,
        description: genre.description,
        novelCount: 0,
        createdAt: Date.now(),
      };
      console.log('📝 Writing to Firestore:', dataToWrite);
      await setDoc(genreRef, dataToWrite);
      console.log('✅ Genre created successfully:', genre.id);
    } catch (error: any) {
      console.error('❌ Error creating genre:', error);
      throw error;
    }
  }

  async getAllGenres(): Promise<Genre[]> {
    const snapshot = await getDocs(collection(db, DATABASE_COLLECTIONS.GENRES));
    return snapshot.docs.map(doc => doc.data() as Genre);
  }

  async getGenreById(genreId: string): Promise<Genre | null> {
    const genreRef = doc(db, DATABASE_COLLECTIONS.GENRES, genreId);
    const genreDoc = await getDoc(genreRef);
    return genreDoc.exists() ? (genreDoc.data() as Genre) : null;
  }

  // ==================
  // NOVELS OPERATIONS
  // ==================

  async createNovel(novel: Omit<Novel, 'createdAt' | 'updatedAt'>) {
    const novelRef = doc(db, DATABASE_COLLECTIONS.NOVELS, novel.id);
    await setDoc(novelRef, {
      ...novel,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update genre novel count
    for (const genreId of novel.genres) {
      const genreRef = doc(db, DATABASE_COLLECTIONS.GENRES, genreId);
      await updateDoc(genreRef, {
        novelCount: (await this.getGenreById(genreId))?.novelCount || 0 + 1,
      });
    }
  }

  async getNovelById(novelId: string): Promise<Novel | null> {
    const novelRef = doc(db, DATABASE_COLLECTIONS.NOVELS, novelId);
    const novelDoc = await getDoc(novelRef);
    return novelDoc.exists() ? (novelDoc.data() as Novel) : null;
  }

  async getNovelsByGenre(genreId: string): Promise<Novel[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.NOVELS),
      where('genres', 'array-contains', genreId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Novel);
  }

  async getAllNovels(): Promise<Novel[]> {
    const snapshot = await getDocs(collection(db, DATABASE_COLLECTIONS.NOVELS));
    return snapshot.docs.map(doc => doc.data() as Novel);
  }

  // ==================
  // CHAPTERS OPERATIONS
  // ==================

  async createChapter(chapter: Omit<Chapter, 'createdAt' | 'updatedAt'>) {
    const chapterRef = doc(db, DATABASE_COLLECTIONS.CHAPTERS, chapter.id);
    await setDoc(chapterRef, {
      ...chapter,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update novel chapter count
    const novelRef = doc(db, DATABASE_COLLECTIONS.NOVELS, chapter.novelId);
    const novel = await this.getNovelById(chapter.novelId);
    if (novel) {
      await updateDoc(novelRef, {
        chapterCount: novel.chapterCount + 1,
        updatedAt: Timestamp.now(),
      });
    }
  }

  async getChaptersByNovel(novelId: string): Promise<Chapter[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.CHAPTERS),
      where('novelId', '==', novelId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Chapter);
  }

  async getChapterById(chapterId: string): Promise<Chapter | null> {
    const chapterRef = doc(db, DATABASE_COLLECTIONS.CHAPTERS, chapterId);
    const chapterDoc = await getDoc(chapterRef);
    return chapterDoc.exists() ? (chapterDoc.data() as Chapter) : null;
  }

  // ==================
  // TRANSLATIONS OPERATIONS
  // ==================

  async createTranslation(translation: Omit<Translation, 'createdAt' | 'updatedAt'>) {
    const translationRef = doc(db, DATABASE_COLLECTIONS.TRANSLATIONS, translation.id);
    await setDoc(translationRef, {
      ...translation,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getTranslationsByChapter(chapterId: string): Promise<Translation[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.TRANSLATIONS),
      where('chapterId', '==', chapterId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Translation);
  }

  async getTranslationsByTranslator(translatorId: string): Promise<Translation[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.TRANSLATIONS),
      where('translatorId', '==', translatorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Translation);
  }

  async updateTranslation(translationId: string, updates: Partial<Translation>) {
    const translationRef = doc(db, DATABASE_COLLECTIONS.TRANSLATIONS, translationId);
    await updateDoc(translationRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // ==================
  // STATIC PROFILES OPERATIONS
  // ==================

  async createProfile(profile: Omit<StaticProfile, 'createdAt' | 'updatedAt'>) {
    const profileRef = doc(db, DATABASE_COLLECTIONS.STATIC_PROFILES, profile.id);
    await setDoc(profileRef, {
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getProfilesByType(type: string): Promise<StaticProfile[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.STATIC_PROFILES),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as StaticProfile);
  }

  async getProfilesByNovel(novelId: string): Promise<StaticProfile[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.STATIC_PROFILES),
      where('novels', 'array-contains', novelId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as StaticProfile);
  }

  // ==================
  // DYNAMIC CONTEXTS OPERATIONS
  // ==================

  async createContext(context: Omit<DynamicContext, 'createdAt' | 'updatedAt'>) {
    const contextRef = doc(db, DATABASE_COLLECTIONS.DYNAMIC_CONTEXTS, context.id);
    await setDoc(contextRef, {
      ...context,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  async getContextsByChapter(chapterId: string): Promise<DynamicContext[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.DYNAMIC_CONTEXTS),
      where('chapterId', '==', chapterId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DynamicContext);
  }

  async getContextsByProfile(profileId: string): Promise<DynamicContext[]> {
    const q = query(
      collection(db, DATABASE_COLLECTIONS.DYNAMIC_CONTEXTS),
      where('profileId', '==', profileId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DynamicContext);
  }
}

export default new DatabaseService();
