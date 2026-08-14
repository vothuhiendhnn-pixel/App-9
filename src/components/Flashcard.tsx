import React, { useState } from 'react';
import { VocabularyItem, VocabularyStatus } from '../types';
import { AudioButton } from './AudioButton';
import { RotateCw, CheckCircle2, BookOpen, Clock } from 'lucide-react';

interface FlashcardProps {
  item: VocabularyItem;
  onAnswer: (status: VocabularyStatus) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ item, onAnswer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleChoice = (status: VocabularyStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    onAnswer(status);
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div
        id="flashcard-container"
        onClick={handleFlip}
        className={`w-full min-h-[360px] bg-white rounded-[22px] p-6 shadow-sm border-2 cursor-pointer transition-all duration-300 transform flex flex-col justify-between select-none ${
          isFlipped ? 'border-[#4B5D44] bg-gradient-to-b from-white to-[#FAF7F2]' : 'border-[#E5DDD0] hover:border-[#D9C5B2]'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between text-xs text-[#5C6B57]">
          <span className="bg-[#FAF7F2] border border-[#E5DDD0] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
            {item.partOfSpeech}
          </span>
          <div className="flex items-center gap-1 text-[#4B5D44] font-bold">
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Nhấp để lật mặt trước' : 'Nhấp để xem nghĩa'}</span>
          </div>
        </div>

        {/* Card Content */}
        {!isFlipped ? (
          /* Front */
          <div className="my-auto text-center py-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332A] tracking-tight font-serif">
              {item.word}
            </h2>
            <div className="flex justify-center">
              <AudioButton text={item.word} size="lg" label="Nghe phát âm" />
            </div>
            <p className="text-xs text-[#5C6B57] italic">Chạm vào thẻ để lật mặt sau</p>
          </div>
        ) : (
          /* Back */
          <div className="my-auto text-center py-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2D332A] font-serif">
                {item.word}
              </h3>
              <AudioButton text={item.word} size="sm" />
            </div>
            
            <p className="font-mono text-sm sm:text-base font-bold text-[#384732] bg-[#E8EFE6] inline-block px-3 py-1 rounded-xl border border-[#C6D8C2]">
              {item.ipa}
            </p>

            <div className="py-2">
              <span className="text-xs uppercase font-black text-[#5C6B57] block mb-1">Nghĩa tiếng Việt</span>
              <p className="text-xl sm:text-2xl font-black text-[#8E5D32] font-serif">
                {item.meaningVi}
              </p>
            </div>

            {item.example && (
              <div className="bg-[#FAF7F2] border border-[#E5DDD0] p-3 rounded-2xl text-left text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5C6B57]">Ví dụ:</span>
                  <AudioButton text={item.example} size="sm" />
                </div>
                <p className="text-[#2D332A] font-medium leading-relaxed">
                  "{item.example}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Buttons (Visible on back) */}
        {isFlipped ? (
          <div className="pt-4 border-t border-[#E5DDD0] space-y-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] text-center font-bold text-[#5C6B57]">
              Mức độ nhớ từ này của bạn thế nào?
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <button
                id="btn-again"
                onClick={(e) => handleChoice('new', e)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F9EBE9] hover:bg-[#F4D9D6] text-[#88372A] font-bold text-xs transition-colors border border-[#ECC7C3]"
              >
                <span>AGAIN</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">Sớm</span>
              </button>

              <button
                id="btn-hard"
                onClick={(e) => handleChoice('learning', e)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FAF2E4] hover:bg-[#F3E5CA] text-[#875514] font-bold text-xs transition-colors border border-[#F0DEBA]"
              >
                <span>HARD</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">1 ngày</span>
              </button>

              <button
                id="btn-good"
                onClick={(e) => handleChoice('good', e)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F7EFE6] hover:bg-[#EFE2D2] text-[#8E5D32] font-bold text-xs transition-colors border border-[#E5D2C0]"
              >
                <span>GOOD</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">3 ngày</span>
              </button>

              <button
                id="btn-easy"
                onClick={(e) => handleChoice('mastered', e)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#E8EFE6] hover:bg-[#D6E6D2] text-[#384732] font-bold text-xs transition-colors border border-[#C6D8C2]"
              >
                <span>EASY</span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">7 ngày</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center pt-2">
            <span className="text-xs font-bold text-[#4B5D44] bg-[#E8EFE6] border border-[#C6D8C2] px-4 py-1.5 rounded-full inline-block">
              Chạm để lật thẻ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
