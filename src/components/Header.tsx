import React, { useState, useEffect } from 'react';
import { UserProfile, SyncStatus } from '../types';
import { studentService } from '../services/studentService';
import { googleSheetsService } from '../services/googleSheetsService';
import {
  Flame,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  GraduationCap,
  Shield,
  RotateCw,
  CheckCircle2,
  CloudOff,
  BarChart3,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  allUsers?: UserProfile[];
  onSwitchUser?: (userId: string) => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onNavigateProfile?: () => void;
  onOpenSheetsConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  allUsers = [],
  onSwitchUser,
  onLogout,
  onOpenLoginModal,
  onNavigateProfile,
  onOpenSheetsConfig,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(googleSheetsService.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = googleSheetsService.subscribeStatus((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      if (user && user.role === 'student') {
        await studentService.syncWithServer(user.id);
      }
      const count = await googleSheetsService.processQueue();
      if (googleSheetsService.isConfigured()) {
        setSyncToast('✓ Đã đồng bộ kết quả học tập.');
      } else {
        setSyncToast('☁️ Kết quả đã được lưu trên thiết bị. App sẽ đồng bộ lại khi có kết nối.');
      }
    } catch {
      setSyncToast('☁️ Kết quả đã được lưu trên thiết bị. App sẽ đồng bộ lại khi có kết nối.');
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  const displayName = user ? studentService.getStudentDisplayName(user.name) : '';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8DFC8] px-4 py-3 sm:px-6">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toast Notification */}
          {syncToast && (
            <div className="fixed top-16 right-4 z-50 bg-[#2D332A] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-2">
              <span>{syncToast}</span>
            </div>
          )}

          {/* Discreet Sync Status Indicator */}
          <div
            onClick={handleManualSync}
            className="cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all select-none"
            title="Nhấn để đồng bộ dữ liệu"
          >
            {syncStatus === 'synced' ? (
              <span className="flex items-center gap-1 text-[#4B5D44] bg-[#E8EFE6] border-[#C6D8C2] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-[#4B5D44]" />
                <span className="hidden md:inline">Đã đồng bộ ✓</span>
              </span>
            ) : syncStatus === 'syncing' || isManualSyncing ? (
              <span className="flex items-center gap-1 text-[#8E5D32] bg-[#FAF2E4] border-[#F0DEBA] px-2 py-0.5 rounded-full">
                <RotateCw className="w-3 h-3 animate-spin text-[#8E5D32]" />
                <span className="hidden md:inline">Đang đồng bộ...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#7D8876] bg-[#F2ECE1] border-[#DDD4C3] px-2 py-0.5 rounded-full">
                <CloudOff className="w-3 h-3 text-[#7D8876]" />
                <span className="hidden md:inline">Chưa đồng bộ</span>
              </span>
            )}
          </div>

          {/* Student Stats (Streak & XP) */}
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

          {/* User Menu Button */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F0EAE1] border border-[#E5DDD0] px-3 py-1.5 rounded-2xl transition-all text-xs font-bold text-[#2D332A] cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black ${
                    user.role === 'teacher' ? 'bg-[#BC8A5F]' : 'bg-[#4B5D44]'
                  }`}
                >
                  {user.role === 'teacher' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
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
                    {/* User Info Header: Full Name and Class (NO Phone Number) */}
                    <div className="px-3 py-2.5 border-b border-[#F0EAE1] mb-1.5">
                      <p className="text-[11px] text-[#7D8876] font-medium">Họ và tên</p>
                      <p className="font-extrabold text-sm text-[#2D332A] tracking-tight">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[#5C6B57] font-semibold">
                          Lớp: <strong className="text-[#2D332A]">{user.className || '9A'}</strong>
                        </span>
                        {user.role === 'teacher' && (
                          <span className="bg-[#F7EFE6] text-[#8E5D32] border border-[#E5D2C0] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            Giáo viên
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="space-y-1">
                      {/* Tiến độ học tập */}
                      {onNavigateProfile && user.role === 'student' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            onNavigateProfile();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#2D332A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          <BarChart3 className="w-4 h-4 text-[#4B5D44]" />
                          <span>Tiến độ học tập</span>
                        </button>
                      )}

                      {/* Đồng bộ dữ liệu */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          handleManualSync();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#2D332A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <RotateCw className={`w-4 h-4 text-[#8E5D32] ${isManualSyncing ? 'animate-spin' : ''}`} />
                          <span>Đồng bộ dữ liệu</span>
                        </div>
                        <span className="text-[10px] text-[#7D8876]">
                          {syncStatus === 'synced' ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                        </span>
                      </button>

                      {/* Cấu hình Google Sheets */}
                      {onOpenSheetsConfig && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            onOpenSheetsConfig();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#5C6B57] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#5C6B57]" />
                          <span>Cấu hình Google Sheets</span>
                        </button>
                      )}
                    </div>

                    {/* Switch role/demo user if teacher */}
                    {user.role === 'teacher' && allUsers.length > 0 && onSwitchUser && (
                      <div className="border-t border-[#F0EAE1] mt-2 pt-2">
                        <p className="text-[10px] font-bold text-[#7D8876] px-3 py-1 uppercase tracking-wider">
                          Chuyển tài khoản demo
                        </p>
                        <div className="space-y-0.5">
                          {allUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u.id);
                                setShowDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs ${
                                u.id === user.id ? 'font-bold text-[#4B5D44] bg-[#E8EFE6]' : 'text-[#5C6B57] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              <span>{u.name}</span>
                              <span className="text-[10px] opacity-70">({u.role === 'teacher' ? 'GV' : u.className})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="border-t border-[#F0EAE1] mt-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#A64B3B] hover:bg-[#F9EBE9] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
              className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
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
