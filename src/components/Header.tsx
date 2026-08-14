import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Flame, Sparkles, User, LogOut, ChevronDown, Check, GraduationCap, Shield } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  allUsers,
  onSwitchUser,
  onLogout,
  onOpenLoginModal,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8DFC8] px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4B5D44] flex items-center justify-center text-[#F7F3E9] font-serif font-black text-xl shadow-xs shadow-[#4B5D44]/30">
            E9
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[#2D332A] text-lg sm:text-xl tracking-tight leading-none font-serif">
                English 9
              </h1>
              <span className="bg-[#F7EFE6] text-[#8E5D32] border border-[#E5D2C0] font-bold text-xs px-2 py-0.5 rounded-full">
                Miss Hiền
              </span>
            </div>
            <p className="text-[11px] text-[#5C6B57] font-medium hidden sm:block">
              Global Success • Tiếng Anh Lớp 9
            </p>
          </div>
        </div>

        {/* Right Stats & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && user.role === 'student' && (
            <>
              {/* Streak */}
              <div
                id="streak-badge"
                className="flex items-center gap-1.5 bg-[#FAF2E4] border border-[#F0DEBA] text-[#875514] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs"
                title="Chuỗi ngày học liên tục"
              >
                <Flame className="w-3.5 h-3.5 fill-[#BC8A5F] text-[#BC8A5F]" />
                <span>{user.streak} ngày</span>
              </div>

              {/* XP */}
              <div
                id="xp-badge"
                className="flex items-center gap-1.5 bg-[#E8EFE6] border border-[#C6D8C2] text-[#384732] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs"
                title="Điểm kinh nghiệm (XP)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4B5D44]" />
                <span>{user.xp.toLocaleString()} XP</span>
              </div>
            </>
          )}

          {/* User Switcher Dropdown */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F0EAE1] border border-[#E5DDD0] px-3 py-1.5 rounded-2xl transition-all text-xs font-bold text-[#2D332A]"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black ${
                  user.role === 'teacher' ? 'bg-[#BC8A5F]' : 'bg-[#4B5D44]'
                }`}>
                  {user.role === 'teacher' ? <Shield className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[90px] sm:max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5C6B57]" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5DDD0] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#F0EAE1] mb-1">
                      <p className="text-xs text-[#5C6B57]">Đang đăng nhập với vai trò</p>
                      <p className="font-extrabold text-sm text-[#2D332A] flex items-center gap-1.5 mt-0.5">
                        {user.name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          user.role === 'teacher'
                            ? 'bg-[#F7EFE6] text-[#8E5D32] border border-[#E5D2C0]'
                            : 'bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2]'
                        }`}>
                          {user.role === 'teacher' ? 'Giáo viên' : `Học sinh (${user.className})`}
                        </span>
                      </p>
                    </div>

                    <p className="text-[11px] font-bold text-[#5C6B57] px-3 py-1 uppercase tracking-wider">
                      Chuyển đổi tài khoản demo
                    </p>

                    <div className="space-y-1">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setShowDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                            u.id === user.id
                              ? 'bg-[#E8EFE6] text-[#384732]'
                              : 'hover:bg-[#FAF7F2] text-[#2D332A]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${u.role === 'teacher' ? 'bg-[#BC8A5F]' : 'bg-[#4B5D44]'}`} />
                            <span>{u.name}</span>
                            <span className="text-[10px] text-[#5C6B57] font-normal">
                              ({u.role === 'teacher' ? 'GV' : u.className})
                            </span>
                          </div>
                          {u.id === user.id && <Check className="w-3.5 h-3.5 text-[#4B5D44]" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-[#F0EAE1] mt-2 pt-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#A64B3B] hover:bg-[#F9EBE9] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              id="login-btn"
              onClick={onOpenLoginModal}
              className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
