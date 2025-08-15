import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Download, Search, Filter, Plus, BookOpen, Settings, Eye, Trash2, BarChart3, FileText, UserMinus, LineChart } from 'lucide-react';
import ManualTestCreator from './ManualTestCreator';
import AnalyticsChart from './AnalyticsChart';
import type { TestResult, User, ManualTest } from '../types';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'tests' | 'students' | 'analytics'>('results');
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [manualTests, setManualTests] = useState<ManualTest[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showTestCreator, setShowTestCreator] = useState(false);
  const [students, setStudents] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<string>('');

  useEffect(() => {
    // Load all test results from localStorage (in a real app, this would come from a database)
    const loadAllResults = () => {
      const results: TestResult[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('testResults_')) {
          const studentResults = JSON.parse(localStorage.getItem(key) || '[]');
          results.push(...studentResults);
        }
      }
      setAllResults(results);
      setFilteredResults(results);
    };

    // Load manual tests
    const savedTests = localStorage.getItem('manualTests');
    if (savedTests) {
      setManualTests(JSON.parse(savedTests));
    }

    // Load all registered students
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setStudents(registeredUsers.filter((user: any) => user.role === 'student'));

    loadAllResults();
  }, []);

  useEffect(() => {
    let filtered = allResults;

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStudent) {
      filtered = filtered.filter(result => result.studentId === selectedStudent);
    }

    setFilteredResults(filtered);
  }, [allResults, searchTerm, selectedStudent]);

  const uniqueStudents = Array.from(
    new Set(allResults.map(result => result.studentId))
  ).map(id => {
    const result = allResults.find(r => r.studentId === id);
    return {
      id,
      name: result?.studentName || 'Unknown'
    };
  });

  const averageScore = allResults.length > 0
    ? Math.round((allResults.reduce((acc, result) => acc + result.overallScore, 0) / allResults.length) * 10) / 10
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBandDescriptor = (score: number) => {
    if (score >= 9) return 'Expert User';
    if (score >= 8) return 'Very Good User';
    if (score >= 7) return 'Good User';
    if (score >= 6) return 'Competent User';
    if (score >= 5) return 'Modest User';
    if (score >= 4) return 'Limited User';
    if (score >= 3) return 'Extremely Limited User';
    if (score >= 2) return 'Intermittent User';
    return 'Non-User';
  };

  const exportResults = () => {
    const csvContent = [
      ['Student Name', 'Test Date', 'Task 1 Score', 'Task 2 Score', 'Overall Score', 'Time Spent (min)'],
      ...filteredResults.map(result => [
        result.studentName,
        new Date(result.testDate).toLocaleDateString(),
        result.task1.score.toString(),
        result.task2.score.toString(),
        result.overallScore.toString(),
        Math.round(result.timeSpent / 60).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ielts_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveTest = (test: ManualTest) => {
    const updatedTests = [...manualTests, test];
    setManualTests(updatedTests);
    localStorage.setItem('manualTests', JSON.stringify(updatedTests));
    setShowTestCreator(false);
    
    // Log for debugging
    console.log('Test saved successfully:', test.title);
    console.log('Total tests now:', updatedTests.length);
  };

  const handleDeleteTest = (testId: string) => {
    const updatedTests = manualTests.filter(test => test.id !== testId);
    setManualTests(updatedTests);
    localStorage.setItem('manualTests', JSON.stringify(updatedTests));
  };

  const toggleTestStatus = (testId: string) => {
    const updatedTests = manualTests.map(test =>
      test.id === testId ? { ...test, isActive: !test.isActive } : test
    );
    setManualTests(updatedTests);
    localStorage.setItem('manualTests', JSON.stringify(updatedTests));
  };

  const removeStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student? This will delete all their test results.')) {
      // Remove from registered users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.filter((user: any) => user.id !== studentId);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Remove their test results
      localStorage.removeItem(`testResults_${studentId}`);
      
      // Update local state
      setStudents(prev => prev.filter(student => student.id !== studentId));
      setAllResults(prev => prev.filter(result => result.studentId !== studentId));
      setFilteredResults(prev => prev.filter(result => result.studentId !== studentId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2 sm:mr-4">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-xl font-semibold text-white">Welcome, {user.name}</h1>
                <p className="text-xs sm:text-sm text-blue-100">IELTS Academic - Teacher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowTestCreator(true)}
                className="hidden sm:flex items-center space-x-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create Test</span>
              </button>
              <button
                onClick={() => setShowTestCreator(true)}
                className="sm:hidden bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="text-white hover:text-blue-100 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'tests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manual Tests ({manualTests.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-lg sm:text-2xl font-semibold text-gray-900">{uniqueStudents.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-lg sm:text-2xl font-semibold text-gray-900">{allResults.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Tests Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-lg sm:text-2xl font-semibold text-gray-900">{averageScore}</div>
                <div className="text-xs sm:text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-lg sm:text-2xl font-semibold text-gray-900">{manualTests.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Manual Tests</div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center">
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" />
                Student Analytics
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedStudentForAnalytics}
                  onChange={(e) => setSelectedStudentForAnalytics(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Students</option>
                  {uniqueStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {allResults.length === 0 ? (
              <div className="text-center py-12">
                <LineChart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No test data available</h3>
                <p className="text-gray-600">Analytics will appear here once students complete tests.</p>
              </div>
            ) : (
              <AnalyticsChart 
                results={selectedStudentForAnalytics 
                  ? allResults.filter(result => result.studentId === selectedStudentForAnalytics)
                  : allResults
                }
                studentName={selectedStudentForAnalytics 
                  ? uniqueStudents.find(s => s.id === selectedStudentForAnalytics)?.name
                  : undefined
                }
                multipleStudents={!selectedStudentForAnalytics}
              />
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Test Results</h2>
              <button
                onClick={exportResults}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by student name or test ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Students</option>
                  {uniqueStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">No test results match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Student</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Date</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Type</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Task 1</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Task 2</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Overall</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Time</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div>
                            <div className="font-medium text-gray-900 text-xs sm:text-sm">{result.studentName}</div>
                            <div className="text-xs text-gray-500">ID: {result.id.slice(-6)}</div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                          {new Date(result.testDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.testType === 'manual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {result.testType === 'manual' ? 'Manual' : 'AI Generated'}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.task1.score)}`}>
                            {result.task1.score}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.task2.score)}`}>
                            {result.task2.score}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                          {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <button
                            onClick={() => setSelectedResult(result)}
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Student Management</h2>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students registered</h3>
                <p className="text-gray-600">Students will appear here once they register for the platform.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Name</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Email</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Tests Taken</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Average Score</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => {
                      const studentResults = allResults.filter(result => result.studentId === student.id);
                      const avgScore = studentResults.length > 0 
                        ? Math.round((studentResults.reduce((acc, result) => acc + result.overallScore, 0) / studentResults.length) * 10) / 10
                        : 0;
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm">{student.name}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                            {student.email}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                            {studentResults.length}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            {avgScore > 0 ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(avgScore)}`}>
                                {avgScore}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs sm:text-sm">No tests</span>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <button
                              onClick={() => removeStudent(student.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium transition-colors"
                            >
                              <UserMinus className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Manual Tests</h2>
              <button
                onClick={() => setShowTestCreator(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Test</span>
              </button>
            </div>

            {manualTests.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No manual tests created</h3>
                <p className="text-gray-600 mb-4">Create custom IELTS tests with your own content and images.</p>
                <button
                  onClick={() => setShowTestCreator(true)}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Create First Test
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {manualTests.map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{test.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Created: {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                        {test.scheduledDate && (
                          <p className="text-xs sm:text-sm text-blue-600">
                            Scheduled: {new Date(test.scheduledDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs sm:text-sm text-blue-800">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          <span className="font-medium">Task 1:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-700 mt-1">{test.task1.title}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center text-xs sm:text-sm text-green-800">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="font-medium">Task 2:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-green-700 mt-1">{test.task2.topic}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
                      <button
                        onClick={() => toggleTestStatus(test.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          test.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>{test.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showTestCreator && (
        <ManualTestCreator
          onSave={handleSaveTest}
          onCancel={() => setShowTestCreator(false)}
        />
      )}

      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto mx-2">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {selectedResult.studentName} - Test Results
                </h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Test Date: {new Date(selectedResult.testDate).toLocaleDateString()} | 
                Duration: {Math.floor(selectedResult.timeSpent / 60)}m {selectedResult.timeSpent % 60}s
              </p>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getScoreColor(selectedResult.overallScore).split(' ')[0]}`}>
                  {selectedResult.overallScore}
                </div>
                <div className="text-base sm:text-lg text-gray-600">Overall Band Score</div>
                <div className="text-sm sm:text-base text-gray-500">{getBandDescriptor(selectedResult.overallScore)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Task 1 Response</h3>
                  {selectedResult.task1.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={selectedResult.task1.imageUrl}
                        alt="Task 1 visual"
                        className="max-w-full h-32 sm:h-48 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                      {selectedResult.task1.response || 'No response provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Task Achievement</span>
                      <span className="font-semibold">{selectedResult.task1.feedback.taskAchievement.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Coherence & Cohesion</span>
                      <span className="font-semibold">{selectedResult.task1.feedback.coherenceCohesion.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Lexical Resource</span>
                      <span className="font-semibold">{selectedResult.task1.feedback.lexicalResource.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Grammar</span>
                      <span className="font-semibold">{selectedResult.task1.feedback.grammaticalRange.score}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Task 2 Response</h3>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                      {selectedResult.task2.response || 'No response provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Task Response</span>
                      <span className="font-semibold">{selectedResult.task2.feedback.taskResponse.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Coherence & Cohesion</span>
                      <span className="font-semibold">{selectedResult.task2.feedback.coherenceCohesion.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Lexical Resource</span>
                      <span className="font-semibold">{selectedResult.task2.feedback.lexicalResource.score}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded">
                      <span className="text-xs sm:text-sm font-medium">Grammar</span>
                      <span className="font-semibold">{selectedResult.task2.feedback.grammaticalRange.score}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-3">AI Feedback Summary</h3>
                <div className="space-y-4 text-xs sm:text-sm text-yellow-800">
                  <div>
                    <strong>Task 1 - Task Achievement:</strong>
                    <p className="mt-1">{selectedResult.task1.feedback.taskAchievement.feedback}</p>
                  </div>
                  <div>
                    <strong>Task 2 - Task Response:</strong>
                    <p className="mt-1">{selectedResult.task2.feedback.taskResponse.feedback}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;