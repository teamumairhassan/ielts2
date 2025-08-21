import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthService } from './services/authService';
import { TestService } from './services/testService';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import TestInterface from './components/TestInterface';
import TestResults from './components/TestResults';
import type { User, TestResult, ManualTest } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'test' | 'results'>('auth');
  const [currentTestResult, setCurrentTestResult] = useState<TestResult | null>(null);
  const [currentManualTest, setCurrentManualTest] = useState<ManualTest | null>(null);

  useEffect(() => {
    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        if (supabase) {
          const sessionData = await AuthService.getCurrentSession();
          if (sessionData) {
            setUser(sessionData.user);
            setCurrentView('dashboard');
          }
        } else {
          // Fallback to localStorage for existing users
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              setCurrentView('dashboard');
            } catch (error) {
              console.error('Error parsing saved user:', error);
              localStorage.removeItem('currentUser');
            }
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Fallback to localStorage for existing users
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setCurrentView('dashboard');
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    let subscription: any = null;
    
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session) {
            const sessionData = await AuthService.getCurrentSession();
            if (sessionData) {
              setUser(sessionData.user);
              setCurrentView('dashboard');
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setCurrentView('auth');
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      });
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogin = async (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setCurrentView('auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to localStorage cleanup
      setUser(null);
      localStorage.removeItem('currentUser');
      setCurrentView('auth');
    }
  };

  const handleStartTest = () => {
    setCurrentManualTest(null);
    setCurrentView('test');
  };

  const handleStartManualTest = (test: ManualTest) => {
    setCurrentManualTest(test);
    setCurrentView('test');
  };

  const handleTestComplete = async (result: TestResult) => {
    setCurrentTestResult(result);
    
    // Save result to Supabase
    try {
      await TestService.saveTestResult(result);
    } catch (error) {
      console.error('Error saving test result:', error);
      // Fallback to localStorage
      if (user) {
        const existingResults = localStorage.getItem(`testResults_${user.id}`);
        const results = existingResults ? JSON.parse(existingResults) : [];
        results.unshift(result);
        localStorage.setItem(`testResults_${user.id}`, JSON.stringify(results));
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">IELTS Academic AI Platform</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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