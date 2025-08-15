import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import TestInterface from './components/TestInterface';
import TestResults from './components/TestResults';
import type { User, TestResult, ManualTest } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'test' | 'results'>('auth');
  const [currentTestResult, setCurrentTestResult] = useState<TestResult | null>(null);
  const [currentManualTest, setCurrentManualTest] = useState<ManualTest | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Ensure user data is properly stored in registeredUsers if it's a student
    if (userData.role === 'student') {
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUserIndex = savedUsers.findIndex((u: any) => u.id === userData.id);
      
      if (existingUserIndex === -1) {
        // Add user to registered users if not already there
        savedUsers.push({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          password: '', // Password not stored in currentUser
          role: userData.role
        });
        localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
      }
      
      // Ensure test results array exists
      const existingResults = localStorage.getItem(`testResults_${userData.id}`);
      if (!existingResults) {
        localStorage.setItem(`testResults_${userData.id}`, JSON.stringify([]));
      }
    }
    
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('auth');
  };

  const handleStartTest = () => {
    setCurrentManualTest(null);
    setCurrentView('test');
  };

  const handleStartManualTest = (test: ManualTest) => {
    setCurrentManualTest(test);
    setCurrentView('test');
  };

  const handleTestComplete = (result: TestResult) => {
    setCurrentTestResult(result);
    
    // Save result to localStorage
    if (user) {
      const existingResults = localStorage.getItem(`testResults_${user.id}`);
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift(result);
      localStorage.setItem(`testResults_${user.id}`, JSON.stringify(results));
    }
    
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentTestResult(null);
    setCurrentManualTest(null);
  };

  const handleTakeAnotherTest = () => {
    setCurrentTestResult(null);
    setCurrentManualTest(null);
    setCurrentView('test');
  };

  if (currentView === 'auth') {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentView === 'test' && user) {
    return (
      <TestInterface
        user={user}
        manualTest={currentManualTest}
        onTestComplete={handleTestComplete}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'results' && currentTestResult) {
    return (
      <TestResults
        result={currentTestResult}
        onBackToDashboard={handleBackToDashboard}
        onTakeAnotherTest={handleTakeAnotherTest}
      />
    );
  }

  if (currentView === 'dashboard' && user) {
    return user.role === 'student' ? (
      <StudentDashboard
        user={user}
        onStartTest={handleStartTest}
        onStartManualTest={handleStartManualTest}
        onLogout={handleLogout}
      />
    ) : (
      <TeacherDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">IELTS Academic AI Platform</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default App;