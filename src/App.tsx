
import React, { useState } from 'react';
import { UserProfile, StudentProgress } from './types';
import { store } from './services/store';
import { studentService } from './services/studentService';
import { progressService } from './services/progressService';
import { supabase } from './lib/supabaseClient';
import { Header } from './components/Header';
import { StudentNav } from './components/StudentNav';
import { LoginModal } from './components/LoginModal';
import { GoogleSheetsConfigModal } from './components/GoogleSheetsConfigModal';

// Screens
import { LearningHubScreen } from './screens/LearningHubScreen';
import { UnitsScreen } from './screens/UnitsScreen';
import { UnitDetailScreen } from './screens/UnitDetailScreen';
import { VocabularyScreen } from './screens/VocabularyScreen';
import { GrammarScreen } from './screens/GrammarScreen';
import { PronunciationScreen } from './screens/PronunciationScreen';
import { ListeningScreen } from './screens/ListeningScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { UnitChallengeScreen } from './screens/UnitChallengeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { StudentProfileScreen } from './screens/StudentProfileScreen';
import { TeacherDashboardScreen } from './screens/TeacherDashboardScreen';
import { TeacherStudentDetailScreen } from './screens/TeacherStudentDetailScreen';

export default function App() {
  // SECURITY: Never render a default/mock student before real login.
  // Opening or refreshing the app always starts at the account selection screen.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedLearningUnit, setSelectedLearningUnit] = useState(1);
  const [currentTab, setCurrentTab] = useState<'home' | 'units' | 'review' | 'profile'>('home');
  const [activeUnitNumber, setActiveUnitNumber] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice' | 'challenge' | null>(null);
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'student' | 'teacher'>('student');
  const [isSheetsConfigOpen, setIsSheetsConfigOpen] = useState(false);

  const openLogin = (tab: 'student' | 'teacher') => {
    setLoginTab(tab);
    setIsLoginModalOpen(true);
  };

  const handleUpdateProgress = () => {
    if (!currentUser || currentUser.role !== 'student') return;
    const freshUser = store.getCurrentUser();
    if (!freshUser || freshUser.id !== currentUser.id) return;
    setProgress(store.getStudentProgress(freshUser.id, 1));
    setCurrentUser(freshUser);
    progressService.autoSaveStudentProgress(freshUser);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    // Called only by LoginModal after Supabase authentication succeeds.
    store.setCurrentUser(user);
    setCurrentUser(user);
    setProgress(user.role === 'student' ? store.getStudentProgress(user.id, 1) : null);
    setActiveUnitNumber(null);
    setActiveModule(null);
    setSelectedStudentForTeacher(null);
    setCurrentTab('home');
    setSelectedLearningUnit(1);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    // Clear only the current login identity. Never delete submissions or progress.
    const wasTeacher = currentUser?.role === 'teacher';
    try {
      studentService.logout();
      store.setCurrentUser(null);
    } catch (error) {
      console.error('Local logout cleanup failed:', error);
    }

    // Return the React view to the guest landing screen immediately.
    setCurrentUser(null);
    setProgress(null);
    setActiveUnitNumber(null);
    setActiveModule(null);
    setSelectedStudentForTeacher(null);
    setCurrentTab('home');
    setSelectedLearningUnit(1);
    setIsLoginModalOpen(false);
    setIsSheetsConfigOpen(false);

    if (wasTeacher) {
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) console.error('Supabase teacher sign out failed:', error.message);
      } catch (error) {
        console.error('Supabase teacher sign out failed:', error);
      }
    }

    // The app intentionally has no auto-login on reload. Reloading the UI
    // also clears any stale mounted screen/menu after a logout.
    window.location.replace(window.location.pathname + window.location.search);
  };

  const handleSelectUnit = (unitNumber: number) => {
    setSelectedLearningUnit(unitNumber);
    setActiveUnitNumber(null);
    setActiveModule(null);
    setCurrentTab('home');
  };

  const handleSelectModule = (unitNumber: number, moduleName: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice') => {
    setSelectedLearningUnit(unitNumber);
    setActiveUnitNumber(unitNumber);
    setActiveModule(moduleName);
  };

  const handleTabChange = (tab: 'home' | 'units' | 'review' | 'profile') => {
    setCurrentTab(tab);
    setActiveUnitNumber(null);
    setActiveModule(null);
    setSelectedStudentForTeacher(null);
  };

  // Render View based on role and state
  const renderContent = () => {
    if (!currentUser) return null;

    // 2. STUDENT ROLE - Active Unit Sub-module views
    if (activeUnitNumber !== null) {
      if (activeModule === 'vocab') {
        return (
          <VocabularyScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => { setActiveModule(null); setActiveUnitNumber(null); setCurrentTab('home'); }}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'grammar') {
        return (
          <GrammarScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => { setActiveModule(null); setActiveUnitNumber(null); setCurrentTab('home'); }}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'pronunciation') {
        return (
          <PronunciationScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => { setActiveModule(null); setActiveUnitNumber(null); setCurrentTab('home'); }}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'listening') {
        return (
          <ListeningScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => { setActiveModule(null); setActiveUnitNumber(null); setCurrentTab('home'); }}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'practice') {
        return (
          <PracticeScreen
            user={currentUser}
            onBack={() => { setActiveModule(null); setActiveUnitNumber(null); setCurrentTab('home'); }}
            onNavigateChallenge={() => setActiveModule('challenge')}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'challenge') {
        return (
          <UnitChallengeScreen
            user={currentUser}
            onBack={() => {
              setActiveModule(null);
              setActiveUnitNumber(null);
            }}
            onNavigateReview={() => {
              setActiveModule(null);
              setActiveUnitNumber(null);
              setCurrentTab('review');
            }}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      return (
        <UnitDetailScreen
          unitNumber={activeUnitNumber}
          user={currentUser}
          progress={progress!}
          onBack={() => setActiveUnitNumber(null)}
          onSelectModule={(mod) => setActiveModule(mod)}
        />
      );
    }

    // 3. STUDENT MAIN TABS
    switch (currentTab) {
      case 'home':
      case 'units':
        return (
          <LearningHubScreen
            user={currentUser}
            selectedUnit={selectedLearningUnit}
            onSelectUnit={handleSelectUnit}
            onOpenVocabulary={() => handleSelectModule(selectedLearningUnit, 'vocab')}
            onOpenGrammar={() => handleSelectModule(selectedLearningUnit, 'grammar')}
            onOpenListening={() => handleSelectModule(selectedLearningUnit, 'listening')}
            onOpenMore={() => { setActiveUnitNumber(selectedLearningUnit); setActiveModule(null); }}
          />
        );
      case 'review':
        return (
          <ReviewScreen
            user={currentUser}
            onNavigateHome={() => handleTabChange('home')}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      case 'profile':
        return (
          <StudentProfileScreen
            user={currentUser}
            progress={progress!}
          />
        );
      default:
        return null;
    }
  };

  // Guest-only landing page: no header, class, XP, demo account or student tasks.
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] text-[#2D332A] flex items-center justify-center px-4 py-10 font-sans">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-9">
            <div className="mx-auto mb-5 w-20 h-20 bg-[#5A7258] rounded-3xl flex items-center justify-center text-white text-3xl font-serif shadow-lg">E9</div>
            <p className="text-[#5A7258] font-semibold tracking-widest uppercase text-xs mb-3">Lớp học tiếng Anh số</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">English 9 – Miss Hiền</h1>
            <p className="text-[#5B6658]">Chọn tài khoản để bắt đầu học tập và quản lý kết quả.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button type="button" onClick={() => openLogin('student')}
              className="text-left bg-white rounded-3xl border border-[#E2E5DA] p-7 shadow-sm hover:shadow-lg hover:border-[#5A7258] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5A7258] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F1E7] text-[#456743] flex items-center justify-center text-3xl mb-5" aria-hidden="true">📚</div>
              <h2 className="text-2xl font-serif font-bold mb-2">Học sinh</h2>
              <p className="text-sm text-[#647060] mb-7 min-h-[44px]">Đăng nhập bằng mã học sinh và mật khẩu được cấp.</p>
              <span className="block text-center rounded-xl bg-[#5A7258] text-white py-3.5 font-bold">Đăng nhập học sinh →</span>
            </button>
            <button type="button" onClick={() => openLogin('teacher')}
              className="text-left bg-white rounded-3xl border border-[#E2E5DA] p-7 shadow-sm hover:shadow-lg hover:border-[#8B5A2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B5A2B] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#F7EEE5] text-[#8B5A2B] flex items-center justify-center text-3xl mb-5" aria-hidden="true">🎓</div>
              <h2 className="text-2xl font-serif font-bold mb-2">Giáo viên</h2>
              <p className="text-sm text-[#647060] mb-7 min-h-[44px]">Đăng nhập bằng email và mật khẩu giáo viên.</p>
              <span className="block text-center rounded-xl bg-[#8B5A2B] text-white py-3.5 font-bold">Đăng nhập giáo viên →</span>
            </button>
          </div>
          <p className="text-center text-sm text-[#75816F] mt-8">Học tập và theo dõi kết quả trên Supabase</p>
        </div>
        <LoginModal
          key={loginTab}
          initialTab={loginTab}
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  if (currentUser.role === 'teacher') {
    if (selectedStudentForTeacher) {
      return <TeacherStudentDetailScreen studentId={selectedStudentForTeacher} onBack={() => setSelectedStudentForTeacher(null)} />;
    }
    return <TeacherDashboardScreen user={currentUser} onBack={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F3E9] text-[#2D332A] font-sans antialiased flex flex-col selection:bg-[#BC8A5F]/20 selection:text-[#2D332A]">
      {/* Global Header */}
      <Header
        user={currentUser}
        allUsers={[currentUser]}
        onSwitchUser={() => { /* Switching accounts requires logging out and signing in. */ }}
        onLogout={handleLogout}
        onOpenLoginModal={() => openLogin('student')}
        onNavigateProfile={() => handleTabChange('profile')}
        onOpenSheetsConfig={() => setIsSheetsConfigOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        {progress ? renderContent() : null}
      </main>

      {/* Student Bottom Navigation (Only visible for students) */}
      {currentUser.role === 'student' && progress && (
        <StudentNav
          activeTab={activeTabName()}
          onTabChange={handleTabChange}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        key={loginTab}
        initialTab={loginTab}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Google Sheets Apps Script Setup / Config Modal */}
      <GoogleSheetsConfigModal
        isOpen={isSheetsConfigOpen}
        onClose={() => setIsSheetsConfigOpen(false)}
        onSuccess={() => handleUpdateProgress()}
      />
    </div>
  );

  function activeTabName(): 'home' | 'units' | 'review' | 'profile' {
    if (activeUnitNumber !== null) return 'units';
    return currentTab;
  }
}
