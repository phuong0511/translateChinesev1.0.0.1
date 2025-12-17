import React, { useState, useEffect } from 'react';
import { 
  FileText, Languages, Sparkles, Users, RefreshCw, Loader2, 
  XCircle, History, Search, Plus, Settings, Save, Trash2, Moon, Sun 
} from 'lucide-react';
import { translateText } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';

// --- TYPES ---
interface ContextVersion {
  id: string;
  content: string;
  timestamp: number;
  label: string;
}

interface NovelProject {
  id: string;
  title: string;
  fixedProfile: string; // Hồ sơ cố định (Thay thế file database cũ)
  contextNotes: string; // Context động hiện tại
  history: ContextVersion[];
  lastUpdated: number;
}

enum TranslationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error'
}

// --- DEFAULT DATA (Dữ liệu mẫu cho truyện đầu tiên) ---
const DEFAULT_NOVEL: NovelProject = {
  id: 'default_novel',
  title: 'Loạn Thế Hoang Niên (Giang Trần)',
  fixedProfile: `*** HỒ SƠ NHÂN VẬT CỐ ĐỊNH ***
1. Giang Trần (Main): Xưng "Ta" (nội tâm), "Hắn" (kể chuyện). Gọi chị dâu là "Đại tẩu".
2. Giang Điền (Anh): Gọi là Đại ca.
3. Tôn Kim Mai (Phản diện): Gọi là Mụ/Bà ta.
4. Trần Hoa (Phản diện): Gọi là Ả/Thị.
5. Quy tắc khác: Văn phong cổ trang, điền văn, hạn chế từ hiện đại.`,
  contextNotes: '',
  history: [],
  lastUpdated: Date.now()
};

const TranslationArea: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // --- STATE QUẢN LÝ TRUYỆN ---
  const [novels, setNovels] = useState<NovelProject[]>([]);
  const [currentNovelId, setCurrentNovelId] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Modal chỉnh sửa hồ sơ cố định
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Modal hướng dẫn sử dụng
  const [isNewNovelOpen, setIsNewNovelOpen] = useState(false); // Modal tạo truyện mới
  const [newNovelTitle, setNewNovelTitle] = useState(''); // Input tên truyện mới
  
  // Các State UI cơ bản
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState(TranslationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  // Review Mode States
  const [pendingContext, setPendingContext] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<string>('');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{line: string, index: number}[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // --- INIT DATA ---
  useEffect(() => {
    const savedNovels = localStorage.getItem('my_novels');
    if (savedNovels) {
      try {
        const parsed = JSON.parse(savedNovels);
        setNovels(parsed);
        if (parsed.length > 0) {
          setCurrentNovelId(parsed[0].id);
        } else {
            setNovels([DEFAULT_NOVEL]);
            setCurrentNovelId(DEFAULT_NOVEL.id);
        }
      } catch (e) {
         setNovels([DEFAULT_NOVEL]);
         setCurrentNovelId(DEFAULT_NOVEL.id);
      }
    } else {
      // Nếu chưa có, tạo truyện mặc định
      setNovels([DEFAULT_NOVEL]);
      setCurrentNovelId(DEFAULT_NOVEL.id);
    }
  }, []);

  // --- HELPERS: Lấy truyện hiện tại ---
  const currentNovel = novels.find(n => n.id === currentNovelId) || novels[0] || DEFAULT_NOVEL;

  // --- ACTION: Lưu dữ liệu truyện ---
  const updateCurrentNovel = (updates: Partial<NovelProject>) => {
    setNovels(prev => {
      const newNovels = prev.map(n => 
        n.id === currentNovelId ? { ...n, ...updates, lastUpdated: Date.now() } : n
      );
      localStorage.setItem('my_novels', JSON.stringify(newNovels));
      return newNovels;
    });
  };

  // --- ACTION: Tạo truyện mới ---
  const createNewNovel = () => {
    if (!newNovelTitle.trim()) return;

    const newNovel: NovelProject = {
      id: Date.now().toString(),
      title: newNovelTitle,
      fixedProfile: `*** HỒ SƠ NHÂN VẬT CỐ ĐỊNH - ${newNovelTitle.toUpperCase()} ***\n(Hãy nhập thông tin nhân vật chính, các quy tắc xưng hô vào đây...)`,
      contextNotes: '',
      history: [],
      lastUpdated: Date.now()
    };

    setNovels(prev => {
      const updated = [...prev, newNovel];
      localStorage.setItem('my_novels', JSON.stringify(updated));
      return updated;
    });
    setCurrentNovelId(newNovel.id);
    setNewNovelTitle('');
    setIsNewNovelOpen(false);
  };

  // --- ACTION: Xóa truyện ---
  const deleteNovel = () => {
    if (novels.length <= 1) return alert("Không thể xóa truyện cuối cùng!");
    if (!confirm(`Bạn chắc chắn muốn xóa truyện "${currentNovel.title}"? Dữ liệu sẽ mất vĩnh viễn.`)) return;

    setNovels(prev => {
      const updated = prev.filter(n => n.id !== currentNovelId);
      localStorage.setItem('my_novels', JSON.stringify(updated));
      // Chuyển về truyện đầu tiên còn lại
      if (updated.length > 0) setCurrentNovelId(updated[0].id);
      return updated;
    });
    setIsSettingsOpen(false);
  };

  // --- HISTORY LOGIC ---
  const saveToHistory = (content: string, label: string) => {
    const newVersion: ContextVersion = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      label
    };
    
    // Update vào novel hiện tại
    const updatedHistory = [newVersion, ...currentNovel.history].slice(0, 20);
    updateCurrentNovel({ history: updatedHistory });
  };

  const restoreVersion = (version: ContextVersion) => {
    if (confirm(`Khôi phục context từ ${new Date(version.timestamp).toLocaleString('vi-VN')}?`)) {
      updateCurrentNovel({ contextNotes: version.content });
      setShowHistory(false);
    }
  };

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const lines = currentNovel.contextNotes.split('\n');
    const results = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(results);
  }, [searchQuery, currentNovel.contextNotes]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
       part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">{part}</mark> : part
    );
  };

  // --- CORE: HANDLE ANALYZE ---
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setStatus(TranslationStatus.LOADING);
    setErrorMessage('');
    
    try {
      const analyzePrompt = `
        **NHIỆM VỤ: PHÂN TÍCH & MERGE CONTEXT (CHẾ ĐỘ REVIEW)**
        
        **1. DỮ LIỆU CỐ ĐỊNH (CỦA TRUYỆN: ${currentNovel.title}):**
        ${currentNovel.fixedProfile}
        
        **2. CONTEXT HIỆN TẠI (MASTER):**
        ${currentNovel.contextNotes || "(Trống)"}
        
        **3. CHƯƠNG MỚI:**
        (Xem văn bản đầu vào)
        
        **4. YÊU CẦU:**
        Đóng vai thư ký, đọc văn bản đầu vào và so sánh với Context hiện tại.
        - Tìm nhân vật mới, địa danh mới.
        - Cập nhật trạng thái nhân vật.
        - Loại bỏ thông tin đã cũ/không cần thiết.
        
        **OUTPUT FORMAT BẮT BUỘC (2 PHẦN):**
        ===LOG_THAY_DOI===
        - [GIỮ/XÓA/MỚI]: ...
        ===KET_QUA_CUOI_CUNG===
        [Context hoàn chỉnh sau khi cập nhật]
      `;

      const rawResult = await translateText(inputText, analyzePrompt, 'analyze');
      
      const separatorRegex = /={3,}\s*KET_QUA_CUOI_CUNG\s*={3,}/i;
      const parts = rawResult.split(separatorRegex);
      
      if (parts.length >= 2) {
        const log = parts[0].replace(/={3,}\s*LOG_THAY_DOI\s*={3,}/i, '').trim();
        setChangeLog(log);
        setPendingContext(parts[1].trim());
      } else {
        setChangeLog("⚠️ AI trả về format lạ. Xem nội dung bên phải để kiểm tra.");
        setPendingContext(rawResult);
      }
      setStatus(TranslationStatus.IDLE);
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi phân tích');
      setStatus(TranslationStatus.ERROR);
    }
  };

  // --- CORE: HANDLE TRANSLATE ---
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setStatus(TranslationStatus.LOADING);
    setErrorMessage('');
    
    try {
      // Combine everything for translation
      const finalPrompt = `
        ${currentNovel.fixedProfile}
        
        **NGỮ CẢNH CẬP NHẬT TỪ NGƯỜI DÙNG:**
        ${currentNovel.contextNotes}
      `;
      
      const translated = await translateText(inputText, finalPrompt, 'translate'); 
      setOutputText(translated);
      setStatus(TranslationStatus.IDLE);
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi dịch thuật');
      setStatus(TranslationStatus.ERROR);
    }
  };

  const confirmUpdate = () => {
    if (pendingContext !== null) {
      updateCurrentNovel({ contextNotes: pendingContext });
      saveToHistory(pendingContext, 'Cập nhật AI');
      setPendingContext(null);
      setChangeLog('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 p-2 md:p-6 font-sans flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col flex-1">
        
        {/* === HEADER & NOVEL SELECTOR === */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30"><Languages size={24} /></div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Translator Pro</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Novel Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wide">Truyện:</span>
              <select 
                value={currentNovelId}
                onChange={(e) => setCurrentNovelId(e.target.value)}
                title="Chọn truyện"
                className="bg-transparent outline-none text-sm font-bold text-indigo-700 dark:text-indigo-400 min-w-[150px] max-w-[250px] cursor-pointer"
              >
                {novels.map(novel => (
                  <option key={novel.id} value={novel.id} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">{novel.title}</option>
                ))}
              </select>
              
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
              
              <button onClick={() => setIsNewNovelOpen(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 transition-colors" title="Thêm truyện mới">
                <Plus size={18} />
              </button>
            </div>
            
            {/* Nav Section: Profile, Settings, Theme */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <button onClick={() => setIsProfileOpen(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1" title="Hồ sơ Cố Định">
                <Users size={18} />
                <span className="text-xs font-semibold uppercase hidden sm:inline">Hồ sơ</span>
              </button>
              
              <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-600"></div>
              
              <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 transition-colors" title="Hướng dẫn sử dụng">
                <Settings size={18} />
              </button>
              
              <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-600"></div>
              
              <button onClick={toggleTheme} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-amber-600 transition-colors" title={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* === MODAL TẠO TRUYỆN MỚI === */}
        {isNewNovelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Plus size={20} className="text-indigo-500"/> Tạo Truyện Mới
                </h3>
                <button onClick={() => { setIsNewNovelOpen(false); setNewNovelTitle(''); }} className="text-slate-400 hover:text-red-500 transition-colors" title="Đóng"><XCircle size={24} /></button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 p-3 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800">
                  <strong>💡 Mẹo:</strong> Nhập tên truyện để tạo dự án mới. Bạn sẽ có thể chỉnh sửa Hồ sơ Cố Định sau.
                </div>
                <input 
                  type="text"
                  placeholder="Ví dụ: Loạn Thế Hoang Niên..."
                  value={newNovelTitle}
                  onChange={(e) => setNewNovelTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewNovel()}
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 ring-indigo-500 outline-none text-slate-700 dark:text-slate-300 font-medium"
                />
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
                <button onClick={() => { setIsNewNovelOpen(false); setNewNovelTitle(''); }} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors">
                  Hủy
                </button>
                <button onClick={createNewNovel} disabled={!newNovelTitle.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                  Tạo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === SETTINGS MODAL (HƯỚNG DẪN SỬ DỤNG) === */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Settings size={20} className="text-indigo-500"/> Hướng Dẫn Sử Dụng
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors" title="Đóng"><XCircle size={24} /></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                      Tạo Truyện Mới
                    </h4>
                    <p className="pl-8">Nhấn nút <strong>+</strong> để tạo một dự án dịch mới. Đặt tên truyện để dễ quản lý.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                      Chỉnh Sửa Hồ Sơ Cố Định
                    </h4>
                    <p className="pl-8">Nhấn nút <strong>👤 Hồ sơ</strong> để mở modal. Nhập thông tin nhân vật chính, mối quan hệ, quy tắc xưng hô. AI sẽ dùng thông tin này để dịch chính xác.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                      Ngữ Cảnh Động
                    </h4>
                    <p className="pl-8">Bên trái có phần <strong>\"Ngữ Cảnh Cập Nhật\"</strong>. Nhập tình huống hiện tại của chương (vị trí, tâm trạng nhân vật, v.v.).</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                      Nhập Văn Bản Gốc
                    </h4>
                    <p className="pl-8">Dán nội dung tiếng Trung cần dịch vào ô <strong>\"Văn bản gốc\"</strong>.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                      Dịch Thuật
                    </h4>
                    <p className="pl-8">Nhấn <strong>\"Dịch Thuật\"</strong> hoặc <strong>\"Phân Tích & Cập Nhật\"</strong> để AI xử lý. Kết quả sẽ hiển thị bên phải.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                      Chế Độ Tối
                    </h4>
                    <p className="pl-8">Nhấn nút <strong>🌙</strong> để chuyển đổi giữa chế độ tối/sáng.</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                    <p className="text-blue-800 dark:text-blue-300"><strong>💡 Mẹo:</strong> Hồ Sơ Cố Định giống như \"bộ não\" của truyện. Hãy cập nhật nó sau mỗi chương để AI dịch chính xác hơn!</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-900">
                <button onClick={() => setIsSettingsOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === PROFILE MODAL (HỒ SƠ CỐ ĐỊNH EDITOR) === */}
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Settings size={20} className="text-indigo-500"/> Hồ Sơ Cố Định: {currentNovel.title}
                </h3>
                <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors" title="Đóng"><XCircle size={24} /></button>
              </div>
              <div className="p-4 flex-1 overflow-hidden flex flex-col gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs border border-blue-100 dark:border-blue-800">
                  <strong>Hướng dẫn:</strong> Đây là "Bộ não" của truyện. Hãy nhập tên nhân vật chính, các mối quan hệ cốt lõi, từ cấm, hoặc quy tắc xưng hô đặc biệt. Dữ liệu này sẽ được AI đọc TRƯỚC khi dịch bất kỳ chương nào.
                </div>
                <textarea 
                  title="Hồ sơ cố định"
                  className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-sm resize-none focus:ring-2 ring-indigo-500 outline-none text-slate-700 dark:text-slate-300 custom-scrollbar"
                  value={currentNovel.fixedProfile}
                  onChange={(e) => updateCurrentNovel({ fixedProfile: e.target.value })}
                  placeholder="Ví dụ: \n1. Main: Tiêu Viêm (xưng Ta - Ngươi)\n2. Sư phụ: Dược Lão (xưng Lão sư - Đồ nhi)..."
                />
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-slate-50 dark:bg-slate-900">
                <button onClick={deleteNovel} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 transition-colors">
                  <Trash2 size={16} /> Xóa Truyện Này
                </button>
                <button onClick={() => setIsProfileOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                  <Save size={18} /> Đóng & Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === MAIN WORKSPACE === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Input Box */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex flex-col h-[40%] shrink-0">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">
                   <FileText size={16} className="text-indigo-500" /> Văn bản gốc (Raw)
                 </div>
                 <span className="text-xs text-slate-400 font-mono">{inputText.length} ký tự</span>
               </div>
               <textarea
                 className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm outline-none resize-none text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors custom-scrollbar"
                 placeholder="Paste chương truyện tiếng Trung vào đây..."
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
               />
            </div>

            {/* Context Box */}
            <div className={`rounded-xl shadow-sm border p-3 flex flex-col flex-1 min-h-0 transition-all duration-300 ${
              pendingContext 
                ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700 ring-1 ring-orange-200' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
               {/* Context Header */}
               <div className="flex justify-between items-center mb-2 shrink-0">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-500">
                    <Users size={16} /> {pendingContext ? '⚠️ REVIEW: CẦN DUYỆT THAY ĐỔI' : 'CONTEXT / NGỮ CẢNH ĐỘNG'}
                  </div>
                  
                  {!pendingContext && (
                    <div className="flex gap-1">
                      <button onClick={() => {setShowSearch(!showSearch); setShowHistory(false)}} className={`p-1.5 rounded transition-colors ${showSearch ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'}`} title="Tìm kiếm"><Search size={14}/></button>
                      <button onClick={() => {setShowHistory(!showHistory); setShowSearch(false)}} className={`p-1.5 rounded transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'}`} title="Lịch sử"><History size={14}/></button>
                    </div>
                  )}

                  {pendingContext && (
                    <div className="flex gap-2">
                      <button onClick={() => { setPendingContext(null); setChangeLog(''); }} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Hủy</button>
                      <button onClick={confirmUpdate} className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold animate-pulse shadow-sm">Áp Dụng</button>
                    </div>
                  )}
               </div>

               {/* Overlays */}
               {showSearch && !pendingContext && (
                 <div className="mb-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-xs shrink-0 animate-fade-in">
                   <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 mb-2">
                      <Search size={12} className="text-slate-400"/>
                      <input autoFocus type="text" placeholder="Tìm tên nhân vật, sự kiện..." className="flex-1 outline-none bg-transparent dark:text-slate-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                   </div>
                   <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1">
                      {searchResults.length === 0 && <p className="text-slate-400 italic text-center">Không tìm thấy.</p>}
                      {searchResults.map((r, i) => <div key={i} className="truncate p-1.5 bg-white dark:bg-slate-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer text-slate-700 dark:text-slate-300 border border-transparent hover:border-indigo-200">{r.line}</div>)}
                   </div>
                 </div>
               )}
               
               {showHistory && !pendingContext && (
                 <div className="mb-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-xs max-h-40 overflow-y-auto custom-scrollbar animate-fade-in">
                   {currentNovel.history.length === 0 && <div className="text-slate-400 italic text-center py-2">Chưa có lịch sử.</div>}
                   {currentNovel.history.map(v => (
                     <div key={v.id} className="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-slate-800 cursor-pointer group rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 mb-1" onClick={() => restoreVersion(v)}>
                       <div className="flex flex-col">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.label}</span>
                          <span className="text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleString()}</span>
                       </div>
                       <span className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Khôi phục</span>
                     </div>
                   ))}
                 </div>
               )}

               {/* Editor Area */}
               {pendingContext ? (
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden min-h-0">
                   <div className="bg-white/50 dark:bg-slate-900/50 p-2 rounded overflow-y-auto text-xs font-mono border border-slate-200 dark:border-slate-700 custom-scrollbar">
                     <div className="font-bold text-slate-500 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">LOG THAY ĐỔI:</div>
                     {changeLog.split('\n').map((line, i) => (
                        <div key={i} className={`mb-0.5 ${line.includes('MỚI') ? 'text-green-600 dark:text-green-400 font-bold' : line.includes('XÓA') ? 'text-red-500 dark:text-red-400 line-through opacity-70' : 'text-slate-600 dark:text-slate-400'}`}>{line}</div>
                     ))}
                   </div>
                   <textarea 
                      title="Nội dung hồ sơ được cập nhật"
                      className="bg-white dark:bg-slate-900 p-2 rounded resize-none text-xs outline-none border border-orange-300 dark:border-orange-700 focus:ring-1 ring-orange-400 text-slate-800 dark:text-slate-200 custom-scrollbar" 
                      value={pendingContext} 
                      onChange={e => setPendingContext(e.target.value)} 
                      placeholder="Hồ sơ cố định sau cập nhật"
                   />
                 </div>
               ) : (
                 <textarea 
                   title="Ngữ cảnh của truyện"
                   className="flex-1 bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 resize-none outline-none text-sm text-slate-700 dark:text-slate-300 custom-scrollbar focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-indigo-300 dark:focus:border-slate-600 transition-colors"
                   placeholder="Ngữ cảnh của truyện này... (Ví dụ: Main đang ở Hắc Giác Vực, vừa thăng cấp Đấu Hoàng...)"
                   value={currentNovel.contextNotes}
                   onChange={(e) => updateCurrentNovel({ contextNotes: e.target.value })}
                 />
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={handleAnalyze} 
                disabled={status === TranslationStatus.LOADING || !inputText.trim()} 
                className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-bold rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 dark:border-amber-800/50"
              >
                {status === TranslationStatus.LOADING && !outputText ? <Loader2 className="animate-spin"/> : <RefreshCw/>} 
                <span className="hidden sm:inline">Cập Nhật Context</span>
                <span className="sm:hidden">Soi Context</span>
              </button>
              
              <button 
                onClick={handleTranslate} 
                disabled={status === TranslationStatus.LOADING || !inputText.trim()} 
                className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {status === TranslationStatus.LOADING && outputText ? <Loader2 className="animate-spin"/> : <Sparkles className="fill-indigo-300"/>} 
                DỊCH CHƯƠNG MỚI
              </button>
            </div>
            
            {errorMessage && (
              <div className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900 flex items-center gap-2 animate-pulse">
                <XCircle size={14}/> {errorMessage}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: OUTPUT */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col h-full min-h-[500px] overflow-hidden">
            <div className="flex items-center justify-between mb-3 font-bold text-slate-700 dark:text-slate-300 shrink-0 border-b border-slate-100 dark:border-slate-700 pb-2">
               <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Languages size={18} /> BẢN DỊCH TIẾNG VIỆT</div>
               {outputText && (
                 <button onClick={() => navigator.clipboard.writeText(outputText)} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 transition-colors font-medium">
                   Copy Text
                 </button>
               )}
            </div>
            <div className="flex-1 bg-[#fdfbf7] dark:bg-[#1a1816] rounded-lg p-4 md:p-6 overflow-y-auto custom-scrollbar prose prose-sm max-w-none dark:text-slate-300 prose-p:my-2 prose-headings:text-red-800 dark:prose-headings:text-red-400 font-vietnamese leading-relaxed text-justify shadow-inner">
              {outputText ? (
                 // Simple rendering: treat double newlines as paragraphs
                 outputText.split('\n\n').map((para, idx) => {
                    const isTitle = idx === 0 && para.length < 100; // Heuristic for title
                    return (
                        <p key={idx} className={isTitle ? "text-center font-bold text-lg text-red-800 dark:text-red-500 mb-6 uppercase" : ""}>
                            {para}
                        </p>
                    )
                 })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-4">
                  <Sparkles size={48} className="opacity-20" />
                  <p className="italic text-sm">Kết quả dịch sẽ hiển thị tại đây...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TranslationArea;