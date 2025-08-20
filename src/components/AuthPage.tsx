import React, { useState } from 'react';
import { User, Mail, Lock, UserCheck, BookOpen } from 'lucide-react';
import { AuthService } from '../services/authService';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for teacher credentials
    if (formData.email === 'teamumair145@gmail.com' && formData.password === 'umair123') {
      const user = {
        id: 'teacher-admin',
        name: 'Admin Teacher',
        email: formData.email,
        role: 'teacher' as const
      };
      onLogin(user);
      return;
    }

    try {
      if (isLogin) {
        // Try Supabase login first
        try {
          const { user } = await AuthService.signIn(formData.email, formData.password);
          onLogin(user);
        } catch (supabaseError) {
          // Fallback to localStorage for existing users
          const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const user = savedUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
          
          if (user) {
            const userWithRole = {
              ...user,
              role: user.role || 'student'
            };
            onLogin({
              id: userWithRole.id,
              name: userWithRole.name,
              email: userWithRole.email,
              role: userWithRole.role
            });
          } else {
            setError('Invalid email or password');
          }
        }
      } else {
        // Signup logic
        if (!formData.name.trim()) {
          setError('Please enter your full name');
          return;
        }
        
        if (!formData.email.trim()) {
          setError('Please enter your email address');
          return;
        }
        
        if (!formData.password.trim()) {
          setError('Please enter a password');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        // Try Supabase signup first
        try {
          const { user } = await AuthService.signUp(formData.email, formData.password, formData.name, 'student');
          onLogin(user);
        } catch (supabaseError) {
          // Fallback to localStorage
          const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const existingUser = savedUsers.find((u: any) => u.email === formData.email);
          
          if (existingUser) {
            setError('Email already registered. Please login instead.');
            return;
          }

          const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'student'
          };

          savedUsers.push(newUser);
          localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
          localStorage.setItem(`testResults_${newUser.id}`, JSON.stringify([]));
          
          onLogin({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: 'student'
          });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-8 border border-gray-100 mx-2">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            IELTS Academic AI
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {isLogin ? 'Welcome back to your IELTS journey' : 'Start your IELTS preparation today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg text-sm sm:text-base"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors duration-200"
          >
            {isLogin 
              ? "New student? Create your account" 
              : "Already registered? Sign in"
            }
          </button>
          
          {isLogin && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600">
                <strong>Teachers:</strong> Use your admin credentials to access teacher dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;