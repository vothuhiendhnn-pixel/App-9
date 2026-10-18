import React, { useState } from 'react';
import { UserProfile } from '../types';
import { studentService, LoginFormErrors } from '../services/studentService';
import { googleSheetsService } from '../services/googleSheetsService';
import { X, User, Phone, Sparkles, Loader2, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState('9A');
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validation
    const validation = studentService.validateLoginForm(name, phone);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const result = await studentService.login(name, phone, className);
      if (result.success && result.student) {
        onLoginSuccess(result.student);
        onClose();
      } else {
        setServerError(result.error || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
      }
    } catch {
      setServerError('Không thể kết nối. Vui lòng kiểm tra lại đường truyền mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#E8DFC8] shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7D8876] hover:text-[#2D332A] hover:bg-[#F0EAE1] rounded-full transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8EFE6] border border-[#C6D8C2] text-[#4B5D44] mb-3 shadow-xs">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-2xl font-black text-[#2D332A] tracking-tight font-serif">
            CHÀO EM!
          </h2>
          <p className="text-sm text-[#5C6B57] font-medium mt-1">
            Đăng nhập để lưu tiến độ học tập.
          </p>
        </div>

        {/* Server Alert if any */}
        {serverError && (
          <div className="mb-5 p-3.5 bg-[#FDF2F0] border border-[#F5C7C0] rounded-2xl flex items-start gap-2.5 text-xs text-[#A64B3B] font-medium">
            <ShieldAlert className="w-4 h-4 text-[#A64B3B] shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-[#2D332A] uppercase tracking-wider mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D8876]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.name ? 'border-red-400 focus:ring-red-200' : 'border-[#DDD4C3] focus:border-[#4B5D44] focus:ring-[#4B5D44]/20'
                } rounded-2xl text-sm font-medium text-[#2D332A] placeholder-[#9E9B93] focus:outline-hidden focus:ring-3 transition-all`}
                autoFocus
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 font-semibold mt-1 pl-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-bold text-[#2D332A] uppercase tracking-wider mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D8876]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="Ví dụ: 0912345678"
                className={`w-full pl-10 pr-4 py-3 bg-white border ${
                  errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-[#DDD4C3] focus:border-[#4B5D44] focus:ring-[#4B5D44]/20'
                } rounded-2xl text-sm font-medium text-[#2D332A] placeholder-[#9E9B93] focus:outline-hidden focus:ring-3 transition-all`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 font-semibold mt-1 pl-1">
                {errors.phone}
              </p>
            )}
            <p className="text-[11px] text-[#7D8876] mt-1 pl-1">
              Số điện thoại dùng để nhận diện và khôi phục điểm của em (không hiển thị công khai).
            </p>
          </div>

          {/* Lớp */}
          <div>
            <label className="block text-xs font-bold text-[#2D332A] uppercase tracking-wider mb-1.5">
              Lớp học
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['9A', '9B', '9C', '9D'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setClassName(c)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    className === c
                      ? 'bg-[#4B5D44] text-white border-[#4B5D44] shadow-xs'
                      : 'bg-white text-[#5C6B57] border-[#DDD4C3] hover:bg-[#F7F3E9]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-start-learning"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#4B5D44] hover:bg-[#3D4C37] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra dữ liệu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>BẮT ĐẦU HỌC</span>
              </>
            )}
          </button>
        </form>

        {/* Sync Guarantee footer */}
        <div className="mt-5 pt-4 border-t border-[#F0EAE1] text-center">
          <p className="text-[11px] text-[#7D8876]">
            🔒 Không cần email • Không cần mật khẩu • Dữ liệu đồng bộ an toàn
          </p>
        </div>
      </div>
    </div>
  );
};
