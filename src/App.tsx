import React, { useState, useEffect } from 'react';
import { UserProfile, StudentProgress } from './types';
import { store } from './services/store';
import { Header } from './components/Header';
import { StudentNav } from './components/StudentNav';

// Screens
import { StudentHomeScreen } from './screens/StudentHomeScreen';
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => store.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => store.getUsers());
  const [currentTab, setCurrentTab] = useState<'home' | 'units' | 'review' | 'profile'>('home');
  const [activeUnitNumber, setActiveUnitNumber] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice' | 'challenge' | null>(null);
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudentProgress>(() => store.getStudentProgress(currentUser.id, 1));

  // Sync users & progress when user changes
  useEffect(() => {
    store.setCurrentUser(currentUser);
    setProgress(store.getStudentProgress(currentUser.id, 1));
  }, [currentUser]);

  const handleUpdateProgress = () => {
    setProgress(store.getStudentProgress(currentUser.id, 1));
    setCurrentUser(store.getCurrentUser());
    setAllUsers(store.getUsers());
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    store.setCurrentUser(user);
    setProgress(store.getStudentProgress(user.id, 1));
    setActiveUnitNumber(null);
    setActiveModule(null);
    setSelectedStudentForTeacher(null);
  };

  const handleSelectUnit = (unitNumber: number) => {
    setActiveUnitNumber(unitNumber);
    setActiveModule(null);
  };

  const handleSelectModule = (unitNumber: number, moduleName: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice') => {
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
    // 1. TEACHER ROLE
    if (currentUser.role === 'teacher') {
      if (selectedStudentForTeacher) {
        return (
          <TeacherStudentDetailScreen
            studentId={selectedStudentForTeacher}
            onBack={() => setSelectedStudentForTeacher(null)}
          />
        );
      }
      return (
        <TeacherDashboardScreen
          user={currentUser}
          onSelectStudent={(studentId) => setSelectedStudentForTeacher(studentId)}
        />
      );
    }

    // 2. STUDENT ROLE - Active Unit Sub-module views
    if (activeUnitNumber !== null) {
      if (activeModule === 'vocab') {
        return (
          <VocabularyScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => setActiveModule(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'grammar') {
        return (
          <GrammarScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => setActiveModule(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'pronunciation') {
        return (
          <PronunciationScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => setActiveModule(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'listening') {
        return (
          <ListeningScreen
            user={currentUser}
            initialUnitId={activeUnitNumber || 1}
            onBack={() => setActiveModule(null)}
            onUpdateProgress={handleUpdateProgress}
          />
        );
      }
      if (activeModule === 'practice') {
        return (
          <PracticeScreen
            user={currentUser}
            onBack={() => setActiveModule(null)}
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
          progress={progress}
          onBack={() => setActiveUnitNumber(null)}
          onSelectModule={(mod) => setActiveModule(mod)}
        />
      );
    }

    // 3. STUDENT MAIN TABS
    switch (currentTab) {
      case 'home':
        return (
          <StudentHomeScreen
            user={currentUser}
            progress={progress}
            onNavigateUnit={handleSelectUnit}
            onNavigateModule={handleSelectModule}
            onNavigateReview={() => handleTabChange('review')}
            onNavigateUnits={() => handleTabChange('units')}
          />
        );
      case 'units':
        return (
          <UnitsScreen
            user={currentUser}
            onSelectUnit={handleSelectUnit}
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
            progress={progress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E9] text-[#2D332A] font-sans antialiased flex flex-col selection:bg-[#BC8A5F]/20 selection:text-[#2D332A]">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        {renderContent()}
      </main>

      {/* Student Bottom Navigation (Only visible for students) */}
      {currentUser.role === 'student' && (
        <StudentNav
          activeTab={activeTabName()}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );

  function activeTabName(): 'home' | 'units' | 'review' | 'profile' {
    if (activeUnitNumber !== null) return 'units';
    return currentTab;
  }
}
