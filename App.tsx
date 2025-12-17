import React, { useState, useEffect } from 'react';
import TranslationArea from './components/TranslationArea';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import UserMenu from './components/UserMenu';
import InitializeData from './components/InitializeData';
import { ThemeProvider } from './contexts/ThemeContext';
import authService, { AuthUser } from './services/authService';
import { useFirebaseTest } from './hooks/useFirebaseTest';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const { status: firebaseStatus, error: firebaseError } = useFirebaseTest();

  // Load user from storage on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (loginUser: AuthUser) => {
    setUser(loginUser);
    setShowLoginModal(false);
  };

  const handleRegisterSuccess = () => {
    const newUser = authService.getCurrentUser();
    if (newUser) {
      setUser(newUser);
    }
    setShowRegisterModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              Dịch Truyện Phương Đông
            </h1>
            <div className="flex items-center gap-3">
              {/* Dev Tools Button */}
              <button
                onClick={() => setShowDevTools(!showDevTools)}
                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="🔧 Developer Tools"
              >
                🔧 Dev
              </button>
              
              {/* Login/Menu */}
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
          {/* Firebase Status (Dev Tools) */}
          {showDevTools && (
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">🔧 Developer Tools</h3>
                <button
                  onClick={() => setShowDevTools(false)}
                  className="text-sm px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  ✕ Đóng
                </button>
              </div>
              <p className="text-sm mb-2 font-mono">Firebase Status: {firebaseStatus}</p>
              {firebaseError && <p className="text-sm text-red-600 font-mono">{firebaseError}</p>}
              <div className="mt-3 border-t border-yellow-400 pt-3">
                <InitializeData />
              </div>
            </div>
          )}

          <TranslationArea />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </ThemeProvider>
  );
};

export default App;