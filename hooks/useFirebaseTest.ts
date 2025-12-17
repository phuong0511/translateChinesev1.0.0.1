// Hook để test Firebase connection
import { useEffect, useState } from 'react';
import { db } from '../services/firebaseService';
import { collection, getDocs } from 'firebase/firestore';

export const useFirebaseTest = () => {
  const [status, setStatus] = useState('testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Kiểm tra Firestore connection
        const genresRef = collection(db, 'genres');
        const snapshot = await getDocs(genresRef);
        
        setStatus(`✅ Firebase connected! Found ${snapshot.size} genres`);
        setError(null);
      } catch (err: any) {
        setError(`❌ Firebase error: ${err.message}`);
        setStatus('error');
      }
    };

    testConnection();
  }, []);

  return { status, error };
};
