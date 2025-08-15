import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, TrendingUp, BookOpen, Award, Calendar, BarChart3, Zap, Users, LineChart } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import type { TestResult, User, ManualTest } from '../types';

interface StudentDashboardProps {
  user: User;
  onStartTest: () => void;
  onStartManualTest: (test: ManualTest) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onStartTest, onStartManualTest, onLogout }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [manualTests, setManualTests] = useState<ManualTest[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    // Load test results from localStorage
    const savedResults = localStorage.getItem(`testResults_${user.id}`);
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setTestResults(Array.isArray(parsedResults) ? parsedResults : []);
      } catch (error) {
        console.error('Error parsing test results:', error);
        setTestResults([]);
        // Reset corrupted data
        localStorage.setItem(`testResults_${user.id}`, JSON.stringify([]));
      }
    } else {
      // Initialize empty array if no results exist
      localStorage.setItem(`testResults_${user.id}`, JSON.stringify([]));
      setTestResults([]);
    }

    // Load available manual tests
    const savedManualTests = localStorage.getItem('manualTests');
    if (savedManualTests) {
      try {
        const allTests = JSON.parse(savedManualTests);
        if (Array.isArray(allTests)) {
          // Filter tests that are active and either not scheduled or scheduled for now/past
          const now = new Date();
          const availableTests = allTests.filter((test: ManualTest) => {
            if (!test.isActive) return false;
            if (!test.scheduledDate) return true;
            return new Date(test.scheduledDate) <= now;
          });
          setManualTests(availableTests);
        } else {
          setManualTests([]);
        }
      } catch (error) {
        console.error('Error parsing manual tests:', error);
        setManualTests([]);
      }
    } else {
      setManualTests([]);
    }
  }, [user.id]);

  const averageScore = testResults.length > 0 
    ? Math.round((testResults.reduce((acc, result) => acc + result.overallScore, 0) / testResults.length) * 10) / 10
    : 0;

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

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
                <p className="text-xs sm:text-sm text-blue-100">IELTS Academic - Student Portal</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-white hover:text-blue-100 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* AI Generated Tests */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                  AI Generated Tests
                </h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">AI-Powered Practice</h3>
                    <p className="text-blue-700 mb-4">
                      Take unlimited unique IELTS Academic Writing tests generated by AI. Each test is different and provides detailed feedback.
                    </p>
                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-blue-600 gap-2 sm:gap-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>60 minutes</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>2 tasks</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        <span>AI evaluation</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onStartTest}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Start AI Test</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Tests */}
            {manualTests.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" />
                    Teacher-Created Tests
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manualTests.map((test) => (
                    <div key={test.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-purple-900 mb-1 text-sm sm:text-base">{test.title}</h3>
                          <p className="text-sm text-purple-700 mb-2">
                            Created: {new Date(test.createdAt).toLocaleDateString()}
                          </p>
                          {test.scheduledDate && (
                            <p className="text-xs text-purple-600">
                              Scheduled: {new Date(test.scheduledDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-purple-700">
                          <strong>Task 1:</strong> {test.task1.title}
                        </div>
                        <div className="text-xs text-purple-700">
                          <strong>Task 2:</strong> {test.task2.topic}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onStartManualTest(test)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-xs sm:text-sm font-medium"
                      >
                        Take This Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Chart */}
            {testResults.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center">
                    <LineChart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" />
                    Performance Analytics
                  </h2>
                </div>
                <AnalyticsChart results={testResults} studentName={user.name} />
              </div>
            )}

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Recent Tests</h2>
              </div>
              
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                  <p className="text-gray-600 mb-4">Take your first IELTS Writing test to see your results here.</p>
                  <button
                    onClick={onStartTest}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm sm:text-base"
                  >
                    Take First Test
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                          <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                            result.testType === 'manual' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            <Award className={`w-4 h-4 sm:w-6 sm:h-6 ${
                              result.testType === 'manual' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                {result.testType === 'manual' ? 'Manual Test' : 'AI Test'} #{result.id.slice(-6)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.overallScore)}`}>
                                Band {result.overallScore}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{new Date(result.testDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right sm:text-center">
                          <div className="text-base sm:text-lg font-semibold text-gray-900">{result.overallScore}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Overall Band</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Performance Overview</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`text-2xl sm:text-3xl font-bold mb-2 ${getScoreColor(averageScore).split(' ')[0]}`}>
                    {averageScore || 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Average Band Score</div>
                  {averageScore > 0 && (
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">{getBandDescriptor(averageScore)}</div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{testResults.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Tests Taken</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {testResults.length > 0 
                        ? Math.round(testResults.reduce((acc, result) => acc + result.timeSpent, 0) / 60)
                        : 0
                      }m
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Time</div>
                  </div>
                </div>

                {testResults.length > 1 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">
                          {testResults.length >= 2
                            ? (testResults[0].overallScore - testResults[testResults.length - 1].overallScore) > 0
                              ? `+${(testResults[0].overallScore - testResults[testResults.length - 1].overallScore).toFixed(1)}`
                              : (testResults[0].overallScore - testResults[testResults.length - 1].overallScore).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Tips for Improvement</h2>
              <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Practice regularly with different task types to improve consistency</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Focus on time management - allocate 20 minutes for Task 1 and 40 for Task 2</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Review feedback carefully to understand areas for improvement</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Expand vocabulary and practice using complex sentence structures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl mx-2">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  Test Results - {new Date(selectedResult.testDate).toLocaleDateString()}
                </h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Task 1 - Band {selectedResult.task1.score}</h3>
                    {selectedResult.task1.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={selectedResult.task1.imageUrl}
                          alt="Task 1 visual"
                          className="max-w-full h-32 sm:h-48 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Task Achievement</span>
                        <span className="font-semibold">{selectedResult.task1.feedback.taskAchievement.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Coherence & Cohesion</span>
                        <span className="font-semibold">{selectedResult.task1.feedback.coherenceCohesion.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Lexical Resource</span>
                        <span className="font-semibold">{selectedResult.task1.feedback.lexicalResource.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Grammar</span>
                        <span className="font-semibold">{selectedResult.task1.feedback.grammaticalRange.score}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Task 2 - Band {selectedResult.task2.score}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Task Response</span>
                        <span className="font-semibold">{selectedResult.task2.feedback.taskResponse.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Coherence & Cohesion</span>
                        <span className="font-semibold">{selectedResult.task2.feedback.coherenceCohesion.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Lexical Resource</span>
                        <span className="font-semibold">{selectedResult.task2.feedback.lexicalResource.score}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm sm:text-base">Grammar</span>
                        <span className="font-semibold">{selectedResult.task2.feedback.grammaticalRange.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Detailed Feedback</h3>
                <div className="space-y-4 text-xs sm:text-sm text-blue-800">
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

export default StudentDashboard;