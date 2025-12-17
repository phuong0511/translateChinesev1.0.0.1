import React, { useState, useEffect } from 'react';
import databaseService from '../services/firebaseService';
import { Genre } from '../database.schema';

const InitializeData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGenres = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('🔧 Bắt đầu khởi tạo genres...');
      
      const genres: Omit<Genre, 'novelCount' | 'createdAt'>[] = [
        {
          id: 'xianxia',
          name: 'Tiên Hiệp',
          slug: 'xianxia',
          description: 'Truyện về tu luyện, vượt cảnh界, kiếm đạo',
        },
        {
          id: 'xuanhuan',
          name: 'Huyễn Thực',
          slug: 'xuanhuan',
          description: 'Thế giới huyễn tưởng với phép thuật, pháp sư',
        },
        {
          id: 'wuxia',
          name: 'Võ Hiệp',
          slug: 'wuxia',
          description: 'Truyện võ lâm, giang hồ, anh hùng',
        },
        {
          id: 'urban',
          name: 'Đô Thị',
          slug: 'urban',
          description: 'Truyện hiện đại, thành phố',
        },
        {
          id: 'historical',
          name: 'Lịch Sử',
          slug: 'historical',
          description: 'Truyện ngoại truyện, lịch sử cổ đại',
        },
      ];

      let createdCount = 0;
      for (const genre of genres) {
        try {
          console.log(`📝 Tạo genre: ${genre.id}...`);
          await databaseService.createGenre(genre);
          createdCount++;
          console.log(`✅ Tạo thành công: ${genre.id}`);
        } catch (err: any) {
          console.warn(`⚠️ Genre ${genre.id} error:`, err.message);
        }
      }

      console.log(`✅ Hoàn tất! Tạo ${createdCount} genres`);
      setMessage(`✅ Xử lý hoàn tất! Đã thêm/cập nhật ${createdCount}/${genres.length} thể loại`);
      setIsInitialized(true);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('❌ Lỗi khởi tạo:', err);
      setError(`❌ Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg">
      <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-100">📚 Khởi tạo dữ liệu Firebase</h4>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
        💡 Kiểm tra Browser Console (F12) để xem chi tiết
      </p>
      <button
        onClick={initializeGenres}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium transition-colors"
      >
        {isLoading ? '⏳ Đang xử lý...' : isInitialized ? '✅ Đã khởi tạo' : '➕ Thêm Thể Loại Mẫu'}
      </button>
      {message && (
        <p className="mt-2 p-2 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-2 p-2 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default InitializeData;
