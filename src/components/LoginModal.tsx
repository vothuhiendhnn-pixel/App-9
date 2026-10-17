import React, { useState } from "react";
import { X, GraduationCap, Shield, User, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { studentService } from "../services/studentService";
import { UserProfile } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const res = await studentService.login(identifier.trim(), password);
      if (res.success && res.student) {
        onLoginSuccess(res.student);
        onClose();
      } else {
        setError(res.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8DFC8] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7D8876] hover:text-[#2D332A] rounded-full hover:bg-[#F2ECE1] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#4B5D44] text-[#F7F3E9] flex items-center justify-center font-serif font-black text-2xl shadow-md">
            E9
          </div>
          <h2 className="text-xl font-extrabold text-[#2D332A] font-serif">English 9 - Miss Hiền</h2>
          <p className="text-xs text-[#5C6B57] mt-1">Hệ thống học tập Tiếng Anh 9 trực tuyến</p>

          <div className="flex bg-[#F2ECE1] p-1 rounded-2xl mt-5 border border-[#E8DFC8]">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(null); setIdentifier(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "student" ? "bg-white text-[#4B5D44] shadow-xs" : "text-[#7D8876] hover:text-[#2D332A]"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Học sinh</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole("teacher"); setError(null); setIdentifier("vothuhiendhnn@gmail.com"); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "teacher" ? "bg-white text-[#8E5D32] shadow-xs" : "text-[#7D8876] hover:text-[#2D332A]"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Giáo viên</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] text-[#A64B3B] text-xs font-medium rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-1.5">
              {role === "teacher" ? "Email Giáo viên" : "Mã Học sinh (Cấp theo danh sách)"}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8876]" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "teacher" ? "vothuhiendhnn@gmail.com" : "Nhập mã học sinh..."}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs font-semibold text-[#2D332A] focus:outline-none focus:border-[#4B5D44]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D8876]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role === "teacher" ? "Nhập 654321" : "Nhập mật khẩu..."}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs font-semibold text-[#2D332A] focus:outline-none focus:border-[#4B5D44]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === "teacher" ? "bg-[#8E5D32] hover:bg-[#784E29]" : "bg-[#4B5D44] hover:bg-[#3D4C37]"
            } ${loading ? "opacity-70" : ""}`}
          >
            <span>{loading ? "Đang xác thực..." : role === "teacher" ? "Đăng nhập Giáo viên" : "Bắt đầu học"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
