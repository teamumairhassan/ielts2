import React from 'react';
import { CheckCircle, Award, Clock, ArrowRight, Home } from 'lucide-react';
import type { TestResult } from '../types';

interface TestResultsProps {
  result: TestResult;
  onBackToDashboard: () => void;
  onTakeAnotherTest: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ result, onBackToDashboard, onTakeAnotherTest }) => {
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
    if (score >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-base sm:text-lg text-gray-600">Here are your detailed results and AI feedback</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${getScoreColor(result.overallScore)}`}>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{result.overallScore}</div>
                <div className="text-xs sm:text-sm">BAND</div>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-4">Overall Band Score</h2>
            <p className="text-gray-600 text-sm sm:text-base">{getBandDescriptor(result.overallScore)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{result.task1.score}</div>
              <div className="text-xs sm:text-sm text-gray-600">Task 1 Band</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{result.task2.score}</div>
              <div className="text-xs sm:text-sm text-gray-600">Task 2 Band</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{formatTime(result.timeSpent)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Used</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Task 1 - Detailed Scores</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900 text-sm sm:text-base">Task Achievement</span>
                <span className="text-lg sm:text-xl font-bold text-blue-900">{result.task1.feedback.taskAchievement.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900 text-sm sm:text-base">Coherence & Cohesion</span>
                <span className="text-lg sm:text-xl font-bold text-blue-900">{result.task1.feedback.coherenceCohesion.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900 text-sm sm:text-base">Lexical Resource</span>
                <span className="text-lg sm:text-xl font-bold text-blue-900">{result.task1.feedback.lexicalResource.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900 text-sm sm:text-base">Grammatical Range</span>
                <span className="text-lg sm:text-xl font-bold text-blue-900">{result.task1.feedback.grammaticalRange.score}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Task 2 - Detailed Scores</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900 text-sm sm:text-base">Task Response</span>
                <span className="text-lg sm:text-xl font-bold text-green-900">{result.task2.feedback.taskResponse.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900 text-sm sm:text-base">Coherence & Cohesion</span>
                <span className="text-lg sm:text-xl font-bold text-green-900">{result.task2.feedback.coherenceCohesion.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900 text-sm sm:text-base">Lexical Resource</span>
                <span className="text-lg sm:text-xl font-bold text-green-900">{result.task2.feedback.lexicalResource.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900 text-sm sm:text-base">Grammatical Range</span>
                <span className="text-lg sm:text-xl font-bold text-green-900">{result.task2.feedback.grammaticalRange.score}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">AI Feedback & Recommendations</h3>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Task 1 - Task Achievement</h4>
              <p className="text-blue-800 text-xs sm:text-sm">{result.task1.feedback.taskAchievement.feedback}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Task 2 - Task Response</h4>
              <p className="text-green-800 text-xs sm:text-sm">{result.task2.feedback.taskResponse.feedback}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">Language Use - Coherence & Cohesion</h4>
              <p className="text-yellow-800 text-xs sm:text-sm">{result.task1.feedback.coherenceCohesion.feedback}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            <Home className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={onTakeAnotherTest}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <span>Take Another Test</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;