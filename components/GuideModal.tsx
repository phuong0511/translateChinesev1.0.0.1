/*
 * Unused modal component (commented out per cleanup request).
 * Restore this block if a guided tour modal is reintroduced.
import React from 'react';
import { X, BookOpen, Search, Send, RotateCcw, CircleHelp } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fcfaf7] dark:bg-stone-900 w-full max-w-2xl rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#f3eee7] dark:bg-stone-900/50">
          <h2 className="text-lg font-bold text-red-900 dark:text-red-400 flex items-center gap-2">
            <BookOpen size={20} />
            Hướng Dẫn Sử Dụng
          </h2>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-red-700 dark:text-stone-400 dark:hover:text-red-400 transition-colors"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-vietnamese custom-scrollbar">
          
          <section>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
              <span className="bg-stone-200 dark:bg-stone-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-roboto">1</span>
              Nhập liệu & Phân tích
            </h3>
            <p className="mb-3">
              Dán văn bản tiếng Trung vào ô <strong>Tiếng Trung (Raw)</strong> bên trái.
            </p>
            <div className="bg-amber-50 dark:bg-stone-800/50 p-3 rounded-lg border border-amber-100 dark:border-stone-700 text-xs">
              <strong className="text-amber-800 dark:text-amber-500 flex items-center gap-1 mb-1">
                <Search size={14} /> Mẹo: Soi Context
              </strong>
              Trước khi dịch, hãy bấm nút "Soi Context". AI (Gemini 2.5 Flash) sẽ đọc lướt chương truyện để phát hiện nhân vật mới hoặc tình huống đặc biệt, tự động điền vào ô ngữ cảnh.
            </div>
          </section>

          <section>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
               <span className="bg-stone-200 dark:bg-stone-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-roboto">2</span>
               Dịch thuật
            </h3>
            <p>
              Bấm nút "Dịch Ngay" <Send size={12} className="inline"/> để bắt đầu.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
               <span className="bg-stone-200 dark:bg-stone-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-roboto">3</span>
               Chỉnh sửa & Hoàn thiện
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kết quả sẽ hiện ở cột bên phải.</li>
              <li>Bạn có thể sửa trực tiếp vào văn bản nếu thấy chưa ưng ý.</li>
            </ul>
          </section>

          <div className="border-t border-stone-200 dark:border-stone-700 pt-4 mt-4">
             <h4 className="font-bold text-red-800 dark:text-red-400 mb-1 text-xs uppercase tracking-wider flex items-center gap-1">
                <CircleHelp size={14} /> Lưu ý quan trọng
             </h4>
             <p className="text-xs text-stone-600 dark:text-stone-400">
               Hệ thống tối ưu cho truyện Cổ Trang / Lịch Sử / Điền Văn.
             </p>
          </div>

        </div>
        
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-lg transition-colors"
           >
             Đã hiểu
           </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
*/