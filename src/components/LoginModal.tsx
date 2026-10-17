import React, { useState } from "react";
import { X, GraduationCap, Shield, User, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { studentService } from "../services/studentService";
import { UserProfile } from "../types";

interface LoginModalProps { isOpen: boolean; onClose: () => void; onLoginSuccess: (user: UserProfile) => void; }

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [role, setRole] = useState<"student" | "teacher">("teacher");
  const [identifier, setIdentifier] = useState("vothuhiendhnn@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanId = (identifier || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) { setError("Vui lòng điền đầy đủ thông tin."); return; }
    setLoading(true);

    // ==========================================
    // BẢO MẬT TÀI KHOẢN GIÁO VIÊN (KHÔNG QUA MẠNG SUPABASE)
    // ==========================================
    if (role === "teacher") {
      const emailLower = cleanId.toLowerCase();
      if (emailLower === "vothuhiendhnn@gmail.com" && cleanPass === "654321") {
        const teacherProfile: UserProfile = {
          id: "teacher-01", role: "teacher", name: "Cô Thu Hiền", phone: "vothuhiendhnn@gmail.com",
          className: "9A1", xp: 0, streak: 0, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(),
          overallProgress: 100, vocabularyScore: 100, grammarScore: 100, pronunciationScore: 100, listeningScore: 100,
          vocabularyProgress: 100, grammarProgress: 100, pronunciationProgress: 100, listeningProgress: 100,
          lastActivity: "Quản lý hệ thống", syncStatus: "synced"
        };
        onLoginSuccess(teacherProfile);
        setLoading(false);
        onClose();
        return;
      } else {
        setError("Tài khoản hoặc mật khẩu Giáo viên không chính xác!");
        setLoading(false);
        return;
      }
    }

    // ==========================================
    // KẾT NỐI SUPABASE CHO HỌC SINH
    // ==========================================
    try {
      const res = await studentService.login(cleanId, cleanPass);
      if (res.success && res.student) {
        onLoginSuccess(res.student);
        onClose();
      } else {
        setError(res.error || "Mã học sinh hoặc mật khẩu không đúng.");
      }
    } catch (err: any) {
      setError("Lỗi kết nối dữ liệu. Xin hãy kiểm tra và chạy app trên đường link Vercel chính thức!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#7D8876] hover:bg-[#F2ECE1] rounded-full"><X className="w-5 h-5" /></button>
        <div className="p-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#4B5D44] text-white flex items-center justify-center font-serif text-2xl">E9</div>
          <h2 className="text-xl font-extrabold text-[#2D332A] font-serif">English 9 - Miss Hiền</h2>
          <div className="flex bg-[#F2ECE1] p-1 rounded-2xl mt-5">
            <button type="button" onClick={() => { setRole("student"); setIdentifier(""); setPassword(""); setError(null); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${role === "student" ? "bg-white text-[#4B5D44]" : "text-[#7D8876]"}`}>Học sinh</button>
            <button type="button" onClick={() => { setRole("teacher"); setIdentifier("vothuhiendhnn@gmail.com"); setPassword(""); setError(null); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${role === "teacher" ? "bg-white text-[#8E5D32]" : "text-[#7D8876]"}`}>Giáo viên</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && <div className="p-3 bg-[#FDF2F2] text-[#A64B3B] text-xs font-medium rounded-2xl">{error}</div>}
          <div>
            <label className="block text-[11px] font-bold text-[#5C6B57] mb-1.5">{role === "teacher" ? "Email Giáo viên" : "Mã Học sinh (Từ danh sách)"}</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#7D8876]" />
              <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={role === "teacher" ? "vothuhiendhnn@gmail.com" : "Ví dụ: HS01"} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#5C6B57] mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#7D8876]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={role === "teacher" ? "Nhập 654321" : "Mật khẩu học sinh"} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl text-xs" />
            </div>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3 rounded-2xl font-bold text-xs text-white ${role === "teacher" ? "bg-[#8E5D32]" : "bg-[#4B5D44]"} ${loading ? "opacity-70" : ""}`}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};