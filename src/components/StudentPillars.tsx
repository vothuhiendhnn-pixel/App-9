
import React from 'react';

export const StudentPillars = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xl">🎯</span>
        <h2 className="text-lg font-bold text-gray-800">Lộ trình học tập (Trọng tâm)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ô 1: Từ Vựng */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-400 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-green-200 text-green-700 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">📚</div>
            <h3 className="font-bold text-green-800 text-lg mb-1">Từ vựng</h3>
            <p className="text-green-700 text-sm text-opacity-90 leading-snug">Flashcard hình ảnh & Trắc nghiệm từ mới</p>
          </div>
          <div className="mt-5 pt-4 border-t border-green-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">Bước 1</span>
            <span className="text-green-600 font-bold text-sm flex items-center">Học ngay <span className="ml-1">➔</span></span>
          </div>
        </div>

        {/* Ô 2: Ngữ Pháp */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-200 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">🧩</div>
            <h3 className="font-bold text-blue-800 text-lg mb-1">Ngữ pháp</h3>
            <p className="text-blue-700 text-sm text-opacity-90 leading-snug">Khám phá cấu trúc câu & Vận dụng logic</p>
          </div>
          <div className="mt-5 pt-4 border-t border-blue-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Bước 2</span>
            <span className="text-blue-600 font-bold text-sm flex items-center">Học ngay <span className="ml-1">➔</span></span>
          </div>
        </div>

        {/* Ô 3: Thực Hành */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-400 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-orange-200 text-orange-700 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">🎧</div>
            <h3 className="font-bold text-orange-800 text-lg mb-1">Thực hành</h3>
            <p className="text-orange-700 text-sm text-opacity-90 leading-snug">Luyện Nghe điền từ & Tổng hợp lấy điểm</p>
          </div>
          <div className="mt-5 pt-4 border-t border-orange-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md">Bước 3</span>
            <span className="text-orange-600 font-bold text-sm flex items-center">Bắt đầu <span className="ml-1">➔</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
