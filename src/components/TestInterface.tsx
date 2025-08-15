import React, { useState, useEffect } from 'react';
import { ArrowRight, Save, Send, FileText, BarChart3 } from 'lucide-react';
import Timer from './Timer';
import ChartDisplay from './ChartDisplay';
import { generateTestPrompt, evaluateWriting } from '../utils/openai';
import type { TestPrompt, ManualTest } from '../types';

interface TestInterfaceProps {
  user: any;
  manualTest?: ManualTest;
  onTestComplete: (result: any) => void;
  onBack: () => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ user, manualTest, onTestComplete, onBack }) => {
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);
  const [testPrompt, setTestPrompt] = useState<TestPrompt | null>(null);
  const [responses, setResponses] = useState({
    task1: '',
    task2: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (manualTest) {
      // Use manual test
      setTestPrompt({
        id: manualTest.id,
        task1: manualTest.task1,
        task2: manualTest.task2
      });
      setIsLoading(false);
    } else {
      // Generate AI test
      generateTest();
    }
  }, []);

  const generateTest = async () => {
    setIsLoading(true);
    try {
      const prompt = await generateTestPrompt();
      setTestPrompt({
        id: Math.random().toString(36).substr(2, 9),
        ...prompt
      });
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setStartTime(new Date());
  };

  const handleTaskSwitch = (task: 1 | 2) => {
    setCurrentTask(task);
  };

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [`task${currentTask}`]: value
    }));
  };

  const handleTimeUp = async () => {
    await submitTest();
  };

  const submitTest = async () => {
    if (!testPrompt || !startTime) return;

    setIsSubmitting(true);
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      // Evaluate both tasks
      const [task1Evaluation, task2Evaluation] = await Promise.all([
        evaluateWriting(1, testPrompt.task1.prompt, responses.task1, testPrompt.task1.imageUrl),
        evaluateWriting(2, testPrompt.task2.prompt, responses.task2)
      ]);

      const result = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: user.id,
        studentName: user.name,
        testDate: new Date().toISOString(),
        testType: manualTest ? 'manual' as const : 'ai-generated' as const,
        testId: manualTest?.id,
        task1: {
          prompt: testPrompt.task1.prompt,
          response: responses.task1,
          score: task1Evaluation.overallScore,
          imageUrl: testPrompt.task1.imageUrl,
          feedback: {
            taskAchievement: task1Evaluation.criteria1 || task1Evaluation.taskAchievement,
            coherenceCohesion: task1Evaluation.coherenceCohesion,
            lexicalResource: task1Evaluation.lexicalResource,
            grammaticalRange: task1Evaluation.grammaticalRange
          },
          chartData: testPrompt.task1.chartData
        },
        task2: {
          prompt: testPrompt.task2.prompt,
          response: responses.task2,
          score: task2Evaluation.overallScore,
          feedback: {
            taskResponse: task2Evaluation.criteria1 || task2Evaluation.taskResponse,
            coherenceCohesion: task2Evaluation.coherenceCohesion,
            lexicalResource: task2Evaluation.lexicalResource,
            grammaticalRange: task2Evaluation.grammaticalRange
          }
        },
        overallScore: Math.round(((task1Evaluation.overallScore + task2Evaluation.overallScore) / 2) * 10) / 10,
        timeSpent,
        status: 'completed' as const
      };

      onTestComplete(result);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {manualTest ? 'Loading your test...' : 'Generating your unique AI test...'}
          </p>
        </div>
      </div>
    );
  }

  if (!testPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Failed to generate test. Please try again.</p>
          <button
            onClick={generateTest}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              IELTS Academic Writing Test
            </h1>
            {manualTest && (
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{manualTest.title}</h2>
            )}
            <p className="text-lg text-gray-600">You have 60 minutes to complete both tasks.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-blue-900">Task 1</h3>
              </div>
              <p className="text-gray-700 mb-2">Recommended time: 20 minutes</p>
              <p className="text-gray-700 mb-2">Word count: 150+ words</p>
              <p className="text-sm text-gray-600">
                {manualTest ? 'Analyze the provided visual data' : 'Describe visual information (charts, graphs, diagrams)'}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-semibold text-green-900">Task 2</h3>
              </div>
              <p className="text-gray-700 mb-2">Recommended time: 40 minutes</p>
              <p className="text-gray-700 mb-2">Word count: 250+ words</p>
              <p className="text-sm text-gray-600">Write an essay responding to a point of view</p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={startTest}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
            >
              Start Test
            </button>
            <br />
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <h1 className="text-sm sm:text-xl font-semibold text-white">
                IELTS Academic Writing Test
                {manualTest && <span className="hidden sm:inline text-blue-100 text-sm ml-2">({manualTest.title})</span>}
              </h1>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => handleTaskSwitch(1)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                    currentTask === 1
                      ? 'bg-white bg-opacity-20 text-white border-2 border-white border-opacity-30'
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Task 1</span>
                  <span className="sm:hidden">T1</span>
                  {responses.task1 && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                </button>
                <button
                  onClick={() => handleTaskSwitch(2)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                    currentTask === 2
                      ? 'bg-white bg-opacity-20 text-white border-2 border-white border-opacity-30'
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Task 2</span>
                  <span className="sm:hidden">T2</span>
                  {responses.task2 && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Timer
                totalMinutes={60}
                onTimeUp={handleTimeUp}
                isActive={true}
              />
              <button
                onClick={submitTest}
                disabled={isSubmitting}
                className="flex items-center space-x-1 sm:space-x-2 bg-white bg-opacity-20 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
                <span className="sm:hidden">{isSubmitting ? 'Submit...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Task {currentTask} {currentTask === 1 ? '- Visual Analysis' : '- Essay Writing'}
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {currentTask === 1 ? '150+ words' : '250+ words'}
                </span>
              </div>
              
              {currentTask === 1 && testPrompt.task1.imageUrl && (
                <div className="mb-4 sm:mb-6">
                  <img
                    src={testPrompt.task1.imageUrl}
                    alt={testPrompt.task1.title}
                    className="w-full max-h-48 sm:max-h-80 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                </div>
              )}
              
              {currentTask === 1 && !testPrompt.task1.imageUrl && testPrompt.task1.chartData && (
                <div className="mb-4 sm:mb-6">
                  <ChartDisplay
                    type={testPrompt.task1.type}
                    title={testPrompt.task1.title}
                    data={testPrompt.task1.chartData}
                  />
                </div>
              )}
              
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-blue-200">
                <div 
                  className="text-gray-800 leading-relaxed text-sm sm:text-base prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: currentTask === 1 ? testPrompt.task1.prompt : testPrompt.task2.prompt 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Your Response</h3>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <span>Words: {responses[`task${currentTask}`].split(/\s+/).filter(word => word.length > 0).length}</span>
                  <Save className="w-4 h-4" />
                </div>
              </div>
              
              <textarea
                value={responses[`task${currentTask}`]}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={`Start writing your response for Task ${currentTask}...`}
                className="w-full h-64 sm:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                <span>Recommended time: {currentTask === 1 ? '20' : '40'} minutes</span>
                <span>Minimum words: {currentTask === 1 ? '150' : '250'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;