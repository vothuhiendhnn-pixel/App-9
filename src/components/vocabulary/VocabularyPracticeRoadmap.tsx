import React from 'react';
import { CheckCircle2, Lock, Play, RotateCcw, Trophy } from 'lucide-react';
import type { UserProfile, VocabPracticeType, VocabularyUnitPracticeProgress } from '../../types';
import { store } from '../../services/store';

interface Props {
  unit: number;
  user: UserProfile;
  progress: VocabularyUnitPracticeProgress;
  onSelectPractice: (type: VocabPracticeType | 'review_wrong_words') => void;
}

const stages: { type: VocabPracticeType; title: string; description: string; icon: string }[] = [
  { type: 'match', title: 'Match Words', description: 'Match each English word with its meaning.', icon: '🧩' },
  { type: 'choose_meaning', title: 'Choose the Meaning', description: 'Choose the correct meaning of each word.', icon: '✅' },
  { type: 'listen_and_choose', title: 'Listen & Choose', description: 'Listen carefully and select the right word.', icon: '🎧' },
  { type: 'type_word', title: 'Type the Word', description: 'Write the English word for each meaning.', icon: '✍️' },
  { type: 'complete_sentence', title: 'Complete Sentences', description: 'Use the correct words in context.', icon: '📝' },
  { type: 'challenge', title: 'Vocabulary Challenge', description: 'Finish the final challenge to complete this unit.', icon: '🏆' },
];

export const VocabularyPracticeRoadmap: React.FC<Props> = ({ unit, user, progress, onSelectPractice }) => {
  const completedCount = stages.filter(s => (progress.bestScores[s.type] ?? 0) >= 80).length;
  const needsReview = store.getWordsNeedingReview(user.id, unit, 50).length;
  return (
    <section className="space-y-6" aria-label={`Vocabulary Unit ${unit} stages`}>
      <div className="rounded-[28px] bg-gradient-to-br from-[#103D2B] via-[#155239] to-[#236449] text-white shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest uppercase text-[#E8D7AF]">Unit {unit} · Vocabulary Journey</p>
            <h2 className="mt-2 font-serif font-black text-3xl sm:text-4xl">Learn, Practise & Achieve</h2>
            <p className="mt-3 text-base text-[#E6F5EC]">Pass each stage with at least 80% to unlock the next one.</p>
          </div>
          <div className="rounded-2xl bg-white/15 border border-white/30 px-6 py-4 text-center min-w-36">
            <p className="text-sm font-bold text-[#E5F2E9]">Stages Completed</p>
            <p className="font-black text-4xl mt-1">{completedCount}/6</p>
          </div>
        </div>
        <div className="mt-6 h-3 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={6} aria-label="Stages completed">
          <div className="h-full rounded-full bg-[#F2C16D] transition-all" style={{ width: `${completedCount / 6 * 100}%` }} />
        </div>
        {completedCount === 6 && <div className="mt-4 inline-flex gap-2 items-center text-lg font-black text-[#FFDB8C]"><Trophy size={24} /> Vocabulary Completed!</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stages.map((stage, index) => {
          const passed = (progress.bestScores[stage.type] ?? 0) >= 80;
          const unlocked = progress.unlocked[stage.type] ?? index === 0;
          const attempts = progress.attempts[stage.type] ?? 0;
          return (
            <article key={stage.type} className={`rounded-[26px] border-2 p-5 sm:p-6 shadow-sm transition-all ${passed ? 'bg-[#EFF9F1] border-[#6CB58A]' : unlocked ? 'bg-white border-[#DFD4C4] hover:border-[#BA803B] hover:shadow-lg' : 'bg-[#F3EFE8] border-[#E3DBCF]'}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="w-14 h-14 flex items-center justify-center text-3xl rounded-2xl bg-[#F5E9DA]" aria-hidden="true">{stage.icon}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ${passed ? 'bg-[#D5F1DE] text-[#11633C]' : unlocked ? 'bg-[#FFF0D5] text-[#8C4B11]' : 'bg-[#E5E1D9] text-[#6D706B]'}`}>
                  {passed ? <CheckCircle2 size={17}/> : !unlocked ? <Lock size={16}/> : null}
                  {passed ? 'Completed' : unlocked ? 'Ready' : 'Locked'}
                </span>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#986021] mt-5">Stage {index + 1} of 6</p>
              <h3 className="font-serif text-2xl sm:text-[28px] leading-tight font-black text-[#163D2C] mt-1">{stage.title}</h3>
              <p className="text-base text-[#4C6357] mt-2 min-h-12">{stage.description}</p>
              <div className="flex items-center justify-between gap-3 border-t border-[#DCD6C9] mt-5 pt-4">
                <p className="text-sm sm:text-base font-semibold text-[#365345]">{attempts ? `Best: ${progress.bestScores[stage.type]}%` : 'Not started'}</p>
                <button type="button" disabled={!unlocked} onClick={() => onSelectPractice(stage.type)} className={`min-h-12 rounded-xl px-4 sm:px-5 text-sm sm:text-base font-black inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#E6A044] ${!unlocked ? 'bg-[#DDD9D1] text-[#777A73] cursor-not-allowed' : passed ? 'bg-[#E0EFE2] text-[#125336] hover:bg-[#CBE6D2]' : 'bg-[#135237] text-white hover:bg-[#0A3C28]'}`}>
                  {passed ? <RotateCcw size={18}/> : <Play size={18}/>}{passed ? 'Try Again' : 'Start'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {needsReview > 0 && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#E9C895] bg-[#FFF6E7] p-5">
        <p className="text-base font-semibold text-[#794615]">{needsReview} words to review</p>
        <button type="button" onClick={() => onSelectPractice('review_wrong_words')} className="rounded-xl bg-[#A75F23] text-white font-bold px-5 py-3">Review Words</button>
      </div>}
    </section>
  );
};
