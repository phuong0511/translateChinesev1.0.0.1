import React, { useState, useEffect } from 'react';
import TranslationArea from './components/TranslationArea';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import UserMenu from './components/UserMenu';
import { ThemeProvider } from './contexts/ThemeContext';
import authService, { AuthUser } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Observe user auth state on component mount
  useEffect(() => {
    const unsubscribe = authService.observeUser((user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLoginSuccess = (loginUser: AuthUser) => {
    setUser(loginUser);
    setShowLoginModal(false);
  };

  const handleRegisterSuccess = () => {
    // onAuthStateChanged will handle setting the user
    setShowRegisterModal(false);
    // Optionally, we can show the login modal after registration
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <p className="text-lg text-stone-700 dark:text-stone-300">Loading...</p>
      </div>
    );
  }

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
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  title="Đăng nhập"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
          {user ? (
            <TranslationArea user={user} />
          ) : (
            <div className="text-center p-8 bg-white dark:bg-stone-800 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-stone-800 dark:text-stone-200">Chào mừng bạn!</h2>
              <p className="text-stone-600 dark:text-stone-400">Vui lòng đăng nhập để bắt đầu dịch truyện.</p>
            </div>
          )}
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