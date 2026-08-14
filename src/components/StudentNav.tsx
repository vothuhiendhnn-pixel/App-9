import React from 'react';
import { Home, BookOpen, RotateCcw, UserCircle, Shield } from 'lucide-react';
import { UserRole } from '../types';

interface StudentNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: UserRole;
  mistakesCount?: number;
}

export const StudentNav: React.FC<StudentNavProps> = ({
  currentTab,
  onSelectTab,
  role,
  mistakesCount = 0,
}) => {
  if (role === 'teacher') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5DDD0] py-2 px-4 shadow-lg sm:max-w-md sm:mx-auto sm:rounded-t-2xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            onClick={() => onSelectTab('teacher')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'teacher'
                ? 'text-[#8E5D32] bg-[#F7EFE6]'
                : 'text-[#5C6B57] hover:text-[#2D332A]'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Bảng Giáo viên</span>
          </button>
          <button
            onClick={() => onSelectTab('units')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'units'
                ? 'text-[#384732] bg-[#E8EFE6]'
                : 'text-[#5C6B57] hover:text-[#2D332A]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Xem Bài học (Unit)</span>
          </button>
        </div>
      </nav>
    );
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'units', label: 'Units', icon: BookOpen },
    { id: 'review', label: 'Review', icon: RotateCcw, badge: mistakesCount > 0 ? mistakesCount : undefined },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav
      id="student-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5DDD0] py-2 px-3 shadow-lg max-w-lg mx-auto sm:bottom-4 sm:rounded-3xl sm:border sm:shadow-xl"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#384732] font-black'
                  : 'text-[#5C6B57] hover:text-[#2D332A] font-semibold'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-[#E8EFE6] text-[#4B5D44] scale-105 shadow-xs' : 'bg-transparent'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>

              {item.badge !== undefined && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-[#BC8A5F] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
