import React, { useState } from 'react';
import { Mail, Lock, User, X } from 'lucide-react';
import authService from '../services/authService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      setIsLoading(false);
      return;
    }

    try {
      authService.register(formData.email, formData.name, formData.password);
      onRegisterSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
            Đăng ký
          </h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Tên đầy đủ
            </label>
            <div className="relative">
              <User
                size={20}
                className="absolute left-3 top-3 text-stone-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-3 text-stone-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-3 text-stone-400"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-3 text-stone-400"
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-400">
          Đã có tài khoản?{' '}
          <button
            onClick={() => {
              onSwitchToLogin();
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              setError(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
