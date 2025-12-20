import React, { useContext } from 'react';
import { LogOut, User } from 'lucide-react';
import authService, { AuthUser } from '../services/authService';

interface UserMenuProps {
  user: AuthUser | null;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
      >
        <span className="text-sm font-medium text-stone-900 dark:text-white">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 z-40">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
            <p className="text-sm font-medium text-stone-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {user.email}
            </p>
            {user.provider && (
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
                {user.provider === 'google' ? 'Google' : 'Microsoft'}
              </p>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-stone-800 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
