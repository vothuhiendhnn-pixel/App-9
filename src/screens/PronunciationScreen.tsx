import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PronunciationPracticeItem, PronunciationSubItem, PronunciationAssessmentResult } from '../types';
import { PRONUNCIATION_PRACTICE_DATA, getPronunciationByUnit } from '../data/pronunciationData';
import { speechAssessmentEngine } from '../services/speechAssessment';
import { audioService } from '../services/audioService';
import { store } from '../services/store';
import {
  ArrowLeft,
  Volume2,
  Mic,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Sparkles,
  Lock,
  ChevronRight,
  Play,
  Award,
  Sliders,
  HelpCircle,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PronunciationScreenProps {
  user: UserProfile;
  initialUnitId?: number;
  onBack: () => void;
  onUpdateProgress: () => void;
}

export const PronunciationScreen: React.FC<PronunciationScreenProps> = ({
  user,
  initialUnitId = 1,
  onBack,
  onUpdateProgress,
}) => {
  const [activeUnitId, setActiveUnitId] = useState<number>(initialUnitId);
  const [items, setItems] = useState<PronunciationPracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // For pair items (word1 vs word2, sentence1 vs sentence2, statement vs question)
  const [activeSubKey, setActiveSubKey] = useState<'item1' | 'item2'>('item1');

  // Audio Playback speed rate (0.75x or 0.9x)
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAnalysing, setIsAnalysing] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Assessment results for active sub-item
  const [assessmentResult, setAssessmentResult] = useState<PronunciationAssessmentResult | null>(null);
  
  // Per-item sub-scores map: key -> { passed: boolean, score: number, attempts: number, audioUrl?: string }
  const [itemProgressMap, setItemProgressMap] = useState<Record<string, { passed: boolean; score: number; attempts: number; audioUrl?: string }>>({});

  // Unit completion celebration
  const [isUnitCompleted, setIsUnitCompleted] = useState<boolean>(false);

  const countdownTimerRef = useRef<any>(null);

  // Load items when unit changes
  useEffect(() => {
    const unitItems = getPronunciationByUnit(activeUnitId);
    setItems(unitItems);
    setCurrentIndex(0);
    setActiveSubKey('item1');
    setAssessmentResult(null);
    setIsUnitCompleted(false);

    // Hydrate progress from store
    const initialMap: Record<string, { passed: boolean; score: number; attempts: number; audioUrl?: string }> = {};
    unitItems.forEach(item => {
      const state1 = store.getPronunciationItemState(user.id, item.id, 'item1');
      if (state1) {
        initialMap[`${item.id}_item1`] = {
          passed: state1.passed || state1.overallScore >= 80,
          score: state1.bestScore || state1.overallScore || 0,
          attempts: state1.attempt || 1,
          audioUrl: state1.recordedAudioUrl,
        };
      }
      const state2 = store.getPronunciationItemState(user.id, item.id, 'item2');
      if (state2) {
        initialMap[`${item.id}_item2`] = {
          passed: state2.passed || state2.overallScore >= 80,
          score: state2.bestScore || state2.overallScore || 0,
          attempts: state2.attempt || 1,
          audioUrl: state2.recordedAudioUrl,
        };
      }
    });
    setItemProgressMap(initialMap);
  }, [activeUnitId, user.id]);

  const currentItem = items[currentIndex] || items[0];

  // Helper to extract active sub-item based on item type & activeSubKey
  const getActiveSubItem = (): { subItem: PronunciationSubItem; subKey: 'item1' | 'item2'; label: string } => {
    if (!currentItem) {
      return {
        subItem: { text: '', ipa: '' },
        subKey: 'item1',
        label: 'Mục 1',
      };
    }

    if (currentItem.type === 'word_pair' || currentItem.type === 'word_stress') {
      const sub = activeSubKey === 'item1' ? currentItem.word1 : currentItem.word2;
      return {
        subItem: sub || currentItem.word1 || { text: '' },
        subKey: activeSubKey,
        label: activeSubKey === 'item1' ? 'Từ 1' : 'Từ 2',
      };
    }

    if (currentItem.type === 'sentence_rhythm' || currentItem.type === 'sentence_stress') {
      const sub = activeSubKey === 'item1' ? currentItem.sentence1 : currentItem.sentence2;
      return {
        subItem: sub || currentItem.sentence1 || { text: '' },
        subKey: activeSubKey,
        label: activeSubKey === 'item1' ? 'Câu 1' : 'Câu 2',
      };
    }

    if (currentItem.type === 'intonation') {
      const sub = activeSubKey === 'item1' ? currentItem.statement : currentItem.question;
      return {
        subItem: sub || currentItem.statement || { text: '' },
        subKey: activeSubKey,
        label: activeSubKey === 'item1' ? 'Câu trần thuật ↘' : 'Câu hỏi ngạc nhiên ↗',
      };
    }

    return {
      subItem: currentItem.singleWord || { text: '' },
      subKey: 'item1',
      label: 'Từ vựng',
    };
  };

  const { subItem: currentSubItem, subKey: currentSubKey } = getActiveSubItem();

  // Progress helpers
  const sub1State = itemProgressMap[`${currentItem?.id}_item1`];
  const sub2State = itemProgressMap[`${currentItem?.id}_item2`];
  const isCurrentSubPassed = itemProgressMap[`${currentItem?.id}_${currentSubKey}`]?.passed || false;
  
  // Pair is completed when both sub-items are passed (or single item is passed)
  const isCurrentItemCompleted = currentItem?.type === 'single_word'
    ? sub1State?.passed
    : (sub1State?.passed && sub2State?.passed);

  // Model audio speech player
  const handlePlayModel = (textToSpeak?: string) => {
    const text = textToSpeak || currentSubItem.text;
    if (!text) return;
    audioService.speak(text, speechRate, undefined, 'en-GB');
  };

  // Student recorded audio playback
  const handlePlayRecorded = () => {
    const audioUrl = assessmentResult?.recordedAudioUrl || itemProgressMap[`${currentItem.id}_${currentSubKey}`]?.audioUrl;
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Start Recording
  const handleStartRecording = async () => {
    setMicPermissionError(null);
    setInterimTranscript('');
    setRecordingSeconds(0);

    try {
      await speechAssessmentEngine.startRecording(
        (transcript) => setInterimTranscript(transcript),
        (level) => setAudioLevel(level)
      );

      setIsRecording(true);

      // 10 second maximum countdown
      let count = 0;
      countdownTimerRef.current = setInterval(() => {
        count += 1;
        setRecordingSeconds(count);
        if (count >= 10) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err: any) {
      setMicPermissionError(err.message || 'Không thể truy cập microphone. Vui lòng cho phép quyền micro.');
      setIsRecording(false);
    }
  };

  // Stop Recording & Run Speech Evaluation
  const handleStopRecording = async () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setIsRecording(false);
    setIsAnalysing(true);

    try {
      const { spokenTranscript, audioBlobUrl, durationSeconds } = await speechAssessmentEngine.stopRecording();
      
      const transcriptToEval = spokenTranscript || interimTranscript;

      // Existing attempt count
      const existingState = itemProgressMap[`${currentItem.id}_${currentSubKey}`];
      const attemptNumber = (existingState?.attempts || 0) + 1;
      const bestScore = existingState?.score || 0;

      // Perform speech evaluation
      const result = speechAssessmentEngine.evaluatePronunciation(
        currentSubItem,
        currentItem.type,
        transcriptToEval,
        durationSeconds,
        user.id,
        currentItem.id,
        currentSubKey,
        attemptNumber,
        bestScore,
        audioBlobUrl
      );

      setAssessmentResult(result);

      // Save result into store
      store.savePronunciationResult({
        ...result,
        unit: activeUnitId,
      });

      // Update state map
      setItemProgressMap(prev => ({
        ...prev,
        [`${currentItem.id}_${currentSubKey}`]: {
          passed: result.passed,
          score: Math.max(bestScore, result.overallScore),
          attempts: attemptNumber,
          audioUrl: audioBlobUrl,
        },
      }));

      // If passed (>= 80%), celebrate!
      if (result.passed) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onUpdateProgress();

        // If sub1 is passed and sub2 is pending, guide student to switch to sub2
        if (currentSubKey === 'item1' && currentItem.type !== 'single_word' && !sub2State?.passed) {
          setTimeout(() => {
            setActiveSubKey('item2');
            setAssessmentResult(null);
          }, 1800);
        }
      }
    } catch (e) {
      console.warn('Speech analysis failed', e);
    } finally {
      setIsAnalysing(false);
    }
  };

  // Retry Active Item
  const handleRetry = () => {
    setAssessmentResult(null);
    setInterimTranscript('');
  };

  // Next Item Navigation
  const handleNextItem = () => {
    if (!isCurrentItemCompleted) return;

    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setActiveSubKey('item1');
      setAssessmentResult(null);
      setInterimTranscript('');
    } else {
      // Completed all items in unit!
      setIsUnitCompleted(true);
      store.updateModuleProgress(user.id, activeUnitId, 'pronunciation', 100);
      store.addXP(user.id, 50);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      onUpdateProgress();
    }
  };

  // Total completed in current unit
  const totalPassedItems = items.filter(item => {
    const s1 = itemProgressMap[`${item.id}_item1`]?.passed;
    const s2 = itemProgressMap[`${item.id}_item2`]?.passed;
    return item.type === 'single_word' ? s1 : (s1 && s2);
  }).length;

  const unitPercentage = items.length > 0 ? Math.round((totalPassedItems / items.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="btn-pronunciation-back"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3.5 py-2 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại tổng quan</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#4B5D44] animate-pulse" />
            <span>Pronunciation Practice • Giọng chuẩn en-GB</span>
          </span>
        </div>
      </div>

      {/* 12-Unit Pill Navigator */}
      <div className="bg-white rounded-2xl p-3 border border-[#E5DDD0] shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-[#2D332A] uppercase tracking-wider font-serif">
            Chọn Unit luyện phát âm (1 - 12)
          </span>
          <span className="text-xs font-bold text-[#5C6B57]">
            Unit {activeUnitId} • Tiến độ: {unitPercentage}%
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((unitNum) => {
            const isActive = unitNum === activeUnitId;
            return (
              <button
                key={unitNum}
                id={`btn-unit-pill-${unitNum}`}
                onClick={() => {
                  if (unitNum !== activeUnitId) {
                    setActiveUnitId(unitNum);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#4B5D44] text-white shadow-xs scale-102 ring-2 ring-[#4B5D44]/30'
                    : 'bg-[#FAF7F2] text-[#5C6B57] hover:bg-[#EBE3D5] hover:text-[#2D332A] border border-[#E5DDD0]'
                }`}
              >
                <span>Unit {unitNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Focus Concept Banner */}
      <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-[#875514] uppercase tracking-wider bg-[#FAF2E4] border border-[#F0DEBA] px-2.5 py-0.5 rounded-md">
              Chủ đề trọng tâm Unit {activeUnitId}
            </span>
            <h2 className="text-lg font-black text-[#2D332A] font-serif">
              {currentItem?.title || `Pronunciation Unit ${activeUnitId}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#5C6B57] block">Yêu cầu tối thiểu</span>
              <span className="text-xs font-black text-[#4B5D44] bg-[#E8EFE6] px-2 py-0.5 rounded-md">
                80% điểm
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#5C6B57] leading-relaxed">
          {currentItem?.instructionVi}
        </p>

        {/* Progress bar across items in unit */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#5C6B57] mb-1">
            <span>Tiến độ Unit: {totalPassedItems} / {items.length} bài đạt</span>
            <span>{unitPercentage}%</span>
          </div>
          <div className="w-full bg-[#EBE3D5] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#4B5D44] h-full rounded-full transition-all duration-500"
              style={{ width: `${unitPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Pronunciation Studio Card */}
      {!isUnitCompleted ? (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E5DDD0] shadow-xs space-y-6">
          {/* Item Navigation Dots */}
          <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-4">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {items.map((it, idx) => {
                const s1 = itemProgressMap[`${it.id}_item1`]?.passed;
                const s2 = itemProgressMap[`${it.id}_item2`]?.passed;
                const itPassed = it.type === 'single_word' ? s1 : (s1 && s2);
                const isSelected = idx === currentIndex;

                return (
                  <button
                    key={it.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setActiveSubKey('item1');
                      setAssessmentResult(null);
                      setInterimTranscript('');
                    }}
                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#2D332A] text-white ring-2 ring-[#2D332A]/30 scale-110'
                        : itPassed
                        ? 'bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2]'
                        : 'bg-[#FAF7F2] text-[#8C827A] border border-[#E5DDD0] hover:bg-[#EBE3D5]'
                    }`}
                  >
                    {itPassed ? '✓' : idx + 1}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-extrabold text-[#5C6B57]">
              Bài {currentIndex + 1} / {items.length}
            </span>
          </div>

          {/* Sub-item Selector Tabs (Word 1 vs Word 2 / Sentence 1 vs Sentence 2) */}
          {currentItem?.type !== 'single_word' && (
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              <button
                id="btn-sub-item-1"
                onClick={() => {
                  setActiveSubKey('item1');
                  setAssessmentResult(null);
                  setInterimTranscript('');
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  activeSubKey === 'item1'
                    ? 'bg-[#E8EFE6] border-[#4B5D44] ring-2 ring-[#4B5D44]/30 shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E5DDD0] hover:bg-white text-[#5C6B57]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#384732]">
                    {currentItem.type === 'intonation' ? '1. Câu trần thuật ↘' : '1. Từ thứ nhất'}
                  </span>
                  {sub1State?.passed && <CheckCircle2 className="w-3.5 h-3.5 text-[#4B5D44]" />}
                </div>
                <span className="text-base font-black text-[#2D332A] font-serif block truncate">
                  {currentItem.word1?.text || currentItem.sentence1?.text || currentItem.statement?.text}
                </span>
                {sub1State ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mt-1 ${
                    sub1State.passed ? 'bg-[#E8EFE6] text-[#384732]' : 'bg-[#FAF2E4] text-[#875514]'
                  }`}>
                    {sub1State.score}% • {sub1State.attempts} lần đọc
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8C827A] mt-1 block">Chưa đọc</span>
                )}
              </button>

              <button
                id="btn-sub-item-2"
                onClick={() => {
                  setActiveSubKey('item2');
                  setAssessmentResult(null);
                  setInterimTranscript('');
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  activeSubKey === 'item2'
                    ? 'bg-[#E8EFE6] border-[#4B5D44] ring-2 ring-[#4B5D44]/30 shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E5DDD0] hover:bg-white text-[#5C6B57]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#384732]">
                    {currentItem.type === 'intonation' ? '2. Câu hỏi xác nhận ↗' : '2. Từ thứ hai'}
                  </span>
                  {sub2State?.passed && <CheckCircle2 className="w-3.5 h-3.5 text-[#4B5D44]" />}
                </div>
                <span className="text-base font-black text-[#2D332A] font-serif block truncate">
                  {currentItem.word2?.text || currentItem.sentence2?.text || currentItem.question?.text}
                </span>
                {sub2State ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mt-1 ${
                    sub2State.passed ? 'bg-[#E8EFE6] text-[#384732]' : 'bg-[#FAF2E4] text-[#875514]'
                  }`}>
                    {sub2State.score}% • {sub2State.attempts} lần đọc
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8C827A] mt-1 block">Chưa đọc</span>
                )}
              </button>
            </div>
          )}

          {/* Active Target Card */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E5DDD0] text-center space-y-4 relative overflow-hidden">
            {/* Target sound/stress tag */}
            <div className="flex items-center justify-center gap-2">
              {currentSubItem.targetSound && (
                <span className="text-xs font-black font-mono bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2] px-3 py-1 rounded-full shadow-xs">
                  Âm mục tiêu: {currentSubItem.targetSound}
                </span>
              )}
              {currentSubItem.stressSyllable && (
                <span className="text-xs font-black bg-[#FAF2E4] text-[#875514] border border-[#F0DEBA] px-3 py-1 rounded-full shadow-xs">
                  Trọng âm: [{currentSubItem.stressSyllable}]
                </span>
              )}
              {currentSubItem.targetStressWord && (
                <span className="text-xs font-black bg-[#FAF2E4] text-[#875514] border border-[#F0DEBA] px-3 py-1 rounded-full shadow-xs">
                  Nhấn từ: "{currentSubItem.targetStressWord}"
                </span>
              )}
              {currentSubItem.targetIntonation && (
                <span className="text-xs font-black bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2] px-3 py-1 rounded-full shadow-xs">
                  Ngữ điệu: {currentSubItem.targetIntonation === 'falling' ? 'Xuống giọng ↘' : 'Lên giọng ↗'}
                </span>
              )}
            </div>

            {/* Target Big Word / Sentence */}
            <div className="space-y-1 py-2">
              <h3 className="text-3xl sm:text-4xl font-black text-[#2D332A] font-serif tracking-tight">
                {currentSubItem.text}
              </h3>
              {currentSubItem.ipa && (
                <p className="text-base font-mono font-bold text-[#875514]">
                  {currentSubItem.ipa}
                </p>
              )}
              {currentSubItem.meaningVi && (
                <p className="text-xs text-[#5C6B57] font-medium italic">
                  "{currentSubItem.meaningVi}"
                </p>
              )}
            </div>

            {/* Listen to Model Audio Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-listen-model"
                onClick={() => handlePlayModel()}
                className="bg-[#E8EFE6] hover:bg-[#D5E4D1] text-[#384732] border border-[#C6D8C2] px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs hover:scale-102"
              >
                <Volume2 className="w-4 h-4 text-[#4B5D44]" />
                <span>🔊 Nghe mẫu (en-GB)</span>
              </button>

              <button
                onClick={() => handlePlayModel()}
                className="text-[11px] font-bold text-[#5C6B57] hover:text-[#2D332A] underline underline-offset-2 transition-colors"
                title="Nghe lại phát âm chuẩn"
              >
                Nghe lại
              </button>

              {/* Speed toggle */}
              <button
                onClick={() => setSpeechRate(prev => (prev === 0.85 ? 0.7 : 0.85))}
                className="text-[11px] font-bold text-[#5C6B57] bg-white border border-[#E5DDD0] px-2.5 py-1 rounded-lg"
              >
                Tốc độ: {speechRate === 0.85 ? '1.0x' : '0.75x chậm'}
              </button>
            </div>
          </div>

          {/* Recording Console */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E5DDD0] text-center space-y-4">
            {/* Status Guide text */}
            <div className="text-xs font-bold text-[#5C6B57]">
              {!isRecording && !isAnalysing && (
                <span>Nghe mẫu và bấm micro khi em sẵn sàng.</span>
              )}
              {isRecording && (
                <span className="text-[#875514] font-extrabold animate-pulse">
                  🎙️ Đang nghe... Hãy đọc rõ ràng. ({10 - recordingSeconds}s)
                </span>
              )}
              {isAnalysing && (
                <span className="text-[#4B5D44] font-extrabold animate-pulse">
                  ✨ AI đang phân tích phát âm của em...
                </span>
              )}
            </div>

            {/* Live Audio Visualizer bar while recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-8 max-w-xs mx-auto">
                {Array.from({ length: 16 }).map((_, i) => {
                  const barHeight = Math.max(15, (audioLevel * ((i % 4) + 1) * 2) % 100);
                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-[#4B5D44] rounded-full transition-all duration-75"
                      style={{ height: `${barHeight}%` }}
                    />
                  );
                })}
              </div>
            )}

            {/* Live Interim Transcript */}
            {interimTranscript && (
              <div className="bg-white p-3 rounded-xl border border-[#E5DDD0] max-w-md mx-auto text-xs text-[#2D332A] font-mono">
                <span className="text-[10px] text-[#8C827A] block mb-0.5">Giọng nói nhận diện:</span>
                "{interimTranscript}"
              </div>
            )}

            {/* Mic Permission error */}
            {micPermissionError && (
              <div className="bg-[#F9EBE9] border border-[#ECC7C3] p-3 rounded-xl text-xs text-[#88372A] font-bold max-w-md mx-auto">
                ⚠️ {micPermissionError}
              </div>
            )}

            {/* Primary Action Button: Record or Stop */}
            <div className="flex justify-center pt-1">
              {!isRecording ? (
                <button
                  id="btn-start-record"
                  onClick={handleStartRecording}
                  disabled={isAnalysing}
                  className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-8 py-4 rounded-3xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <span>🎙️ Bắt đầu đọc</span>
                </button>
              ) : (
                <button
                  id="btn-stop-record"
                  onClick={handleStopRecording}
                  className="bg-[#A64B3B] hover:bg-[#8A3A2C] text-white px-8 py-4 rounded-3xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-3 active:scale-95 animate-pulse"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>⏹ Dừng ({10 - recordingSeconds}s)</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Assessment Results (When available) */}
          {assessmentResult && (
            <div className="bg-white rounded-3xl p-6 border-2 border-[#E5DDD0] shadow-sm space-y-5 animate-in fade-in">
              {/* Feedback Status Header */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                assessmentResult.feedback.status === 'excellent' || assessmentResult.feedback.status === 'passed'
                  ? 'bg-[#E8EFE6] border-[#C6D8C2]'
                  : 'bg-[#FAF2E4] border-[#F0DEBA]'
              }`}>
                <span className="text-3xl">{assessmentResult.feedback.icon}</span>
                <div className="space-y-0.5">
                  <h4 className="font-black text-base text-[#2D332A] font-serif">
                    {assessmentResult.feedback.title}
                  </h4>
                  <p className="text-xs text-[#5C6B57]">
                    {assessmentResult.feedback.message}
                  </p>
                </div>
              </div>

              {/* Score Display Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Overall Score */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0] text-center sm:col-span-1 flex flex-col justify-center items-center">
                  <span className="text-[11px] font-extrabold text-[#5C6B57] uppercase tracking-wider mb-1">
                    Điểm phát âm
                  </span>
                  <div className={`text-4xl font-black font-serif ${
                    assessmentResult.overallScore >= 80 ? 'text-[#4B5D44]' : 'text-[#875514]'
                  }`}>
                    {assessmentResult.overallScore}%
                  </div>
                  <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                    assessmentResult.passed ? 'bg-[#E8EFE6] text-[#384732]' : 'bg-[#F9EBE9] text-[#88372A]'
                  }`}>
                    {assessmentResult.passed ? 'ĐẠT (>=80%)' : 'CHƯA ĐẠT'}
                  </span>
                </div>

                {/* Score Components Breakdown */}
                <div className="sm:col-span-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0] space-y-2.5 flex flex-col justify-center">
                  {/* Accuracy (60%) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2D332A] mb-1">
                      <span>Độ chính xác (Accuracy - 60%)</span>
                      <span className="font-mono text-[#4B5D44] font-black">{assessmentResult.accuracyScore}%</span>
                    </div>
                    <div className="w-full bg-[#EBE3D5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4B5D44] h-full rounded-full"
                        style={{ width: `${assessmentResult.accuracyScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Fluency (20%) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2D332A] mb-1">
                      <span>Độ trôi chảy (Fluency - 20%)</span>
                      <span className="font-mono text-[#BC8A5F] font-black">{assessmentResult.fluencyScore}%</span>
                    </div>
                    <div className="w-full bg-[#EBE3D5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#BC8A5F] h-full rounded-full"
                        style={{ width: `${assessmentResult.fluencyScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Completeness (20%) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2D332A] mb-1">
                      <span>Độ hoàn chỉnh (Completeness - 20%)</span>
                      <span className="font-mono text-[#384732] font-black">{assessmentResult.completenessScore}%</span>
                    </div>
                    <div className="w-full bg-[#EBE3D5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#384732] h-full rounded-full"
                        style={{ width: `${assessmentResult.completenessScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-side Audio Comparison & Suggestions */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#2D332A]">
                    So sánh phát âm của em và giọng mẫu:
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {assessmentResult.recordedAudioUrl && (
                      <button
                        onClick={handlePlayRecorded}
                        className="bg-white hover:bg-[#EBE3D5] text-[#2D332A] border border-[#E5DDD0] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 text-[#4B5D44]" />
                        <span>Nghe bản thu của em</span>
                      </button>
                    )}
                    <button
                      onClick={() => handlePlayModel()}
                      className="bg-white hover:bg-[#EBE3D5] text-[#2D332A] border border-[#E5DDD0] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#BC8A5F]" />
                      <span>Nghe mẫu Miss Hiền</span>
                    </button>
                  </div>
                </div>

                {/* Pedagogical Suggestion */}
                {assessmentResult.feedback.suggestion && (
                  <div className="text-xs text-[#875514] bg-[#FAF2E4] p-3 rounded-xl border border-[#F0DEBA]">
                    💡 <strong>Gợi ý từ cô Hiền:</strong> {assessmentResult.feedback.suggestion}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EBE3D5]">
            <button
              id="btn-retry-pronunciation"
              onClick={handleRetry}
              className="bg-white hover:bg-[#FAF7F2] text-[#2D332A] border border-[#E5DDD0] px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 Thử lại</span>
            </button>

            <div className="flex items-center gap-3">
              {!isCurrentItemCompleted && (
                <span className="text-[11px] font-bold text-[#8C827A] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#8C827A]" />
                  <span>Cần đạt ≥80% cả hai từ để chuyển bài</span>
                </span>
              )}

              <button
                id="btn-next-pronunciation"
                onClick={handleNextItem}
                disabled={!isCurrentItemCompleted}
                className="bg-[#2D332A] hover:bg-[#1E231C] disabled:opacity-35 disabled:cursor-not-allowed text-white px-7 py-3 rounded-2xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <span>{currentIndex < items.length - 1 ? 'Tiếp theo ➜' : 'Hoàn thành Unit 🏆'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Unit Completion Celebration Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5DDD0] shadow-sm space-y-6 max-w-xl mx-auto animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-[#E8EFE6] text-[#384732] mx-auto flex items-center justify-center shadow-inner">
            <Trophy className="w-10 h-10 text-[#4B5D44] animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black text-[#4B5D44] uppercase tracking-wider bg-[#E8EFE6] px-3 py-1 rounded-full">
              Chúc mừng hoàn thành Unit {activeUnitId}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif">
              Xuất sắc! Em đã hoàn thành phần Pronunciation!
            </h3>
            <p className="text-xs text-[#5C6B57] max-w-md mx-auto leading-relaxed">
              Em đã luyện tập và vượt qua tất cả các bài phân biệt âm & ngữ điệu của Unit {activeUnitId} với điểm số trên 80%. (+50 XP)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#5C6B57] block">Số bài đạt</span>
              <span className="text-2xl font-black text-[#4B5D44] font-serif">
                {items.length} / {items.length}
              </span>
            </div>
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#5C6B57] block">Tỉ lệ hoàn thành</span>
              <span className="text-2xl font-black text-[#384732] font-serif">
                100%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setIsUnitCompleted(false);
                setCurrentIndex(0);
                setActiveSubKey('item1');
              }}
              className="bg-white border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A] px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition-colors"
            >
              Luyện lại Unit {activeUnitId}
            </button>

            {activeUnitId < 12 && (
              <button
                onClick={() => {
                  setActiveUnitId(prev => prev + 1);
                }}
                className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-7 py-3 rounded-2xl font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Sang Unit {activeUnitId + 1} ➜</span>
              </button>
            )}

            <button
              onClick={onBack}
              className="bg-[#2D332A] hover:bg-[#1E231C] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-xs transition-colors"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
