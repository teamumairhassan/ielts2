import React, { useState } from 'react';
import { Save, Upload, X, Calendar, FileText, Image } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { ManualTest } from '../types';

interface ManualTestCreatorProps {
  onSave: (test: ManualTest) => void;
  onCancel: () => void;
}

const ManualTestCreator: React.FC<ManualTestCreatorProps> = ({ onSave, onCancel }) => {
  const [testData, setTestData] = useState({
    title: '',
    scheduledDate: '',
    task1: {
      type: 'image' as const,
      title: '',
      description: '',
      imageUrl: '',
      prompt: 'You should spend about 20 minutes on this task.\n\nThe chart below shows...\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nYou should write at least 150 words.'
    },
    task2: {
      type: 'opinion' as const,
      topic: '',
      prompt: 'You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\n[Your essay question here]\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.'
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setTestData(prev => ({
          ...prev,
          task1: { ...prev.task1, imageUrl: result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!testData.title.trim()) {
      alert('Please enter a test title');
      return;
    }
    
    if (!testData.task1.imageUrl) {
      alert('Please upload an image for Task 1');
      return;
    }
    
    if (!testData.task1.prompt.trim()) {
      alert('Please enter Task 1 instructions');
      return;
    }
    
    if (!testData.task2.prompt.trim()) {
      alert('Please enter Task 2 question');
      return;
    }
    
    const newTest: ManualTest = {
      id: Math.random().toString(36).substr(2, 9),
      title: testData.title,
      createdBy: 'teacher-admin',
      createdAt: new Date().toISOString(),
      scheduledDate: testData.scheduledDate || undefined,
      isActive: true,
      task1: {
        ...testData.task1,
        title: testData.task1.title || 'Writing Task 1'
      },
      task2: {
        ...testData.task2,
        topic: testData.task2.topic || 'Writing Task 2'
      }
    };

    console.log('Creating new test:', newTest);
    onSave(newTest);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl mx-2">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Manual Test</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Design a custom IELTS Academic Writing test</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Test Details */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Test Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  value={testData.title}
                  onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., IELTS Practice Test - Week 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="datetime-local"
                    value={testData.scheduledDate}
                    onChange={(e) => setTestData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Task 1 */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Writing Task 1 (20 minutes, 150+ words)
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task 1 Instructions *
                </label>
                <div className="h-64">
                  <RichTextEditor
                    value={testData.task1.prompt}
                    onChange={(value) => setTestData(prev => ({
                      ...prev,
                      task1: { ...prev.task1, prompt: value }
                    }))}
                    placeholder="Enter Task 1 instructions..."
                    height="200px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Chart/Graph Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Chart preview"
                        className="max-w-full h-48 sm:h-64 object-contain mx-auto rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setTestData(prev => ({
                            ...prev,
                            task1: { ...prev.task1, imageUrl: '' }
                          }));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">Click to upload chart or graph</p>
                      <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm sm:text-base"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task 2 */}
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Writing Task 2 (40 minutes, 250+ words)
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Essay Question *
              </label>
              <div className="h-64">
                <RichTextEditor
                  value={testData.task2.prompt}
                  onChange={(value) => setTestData(prev => ({
                    ...prev,
                    task2: { ...prev.task2, prompt: value }
                  }))}
                  placeholder="Enter Task 2 essay question..."
                  height="200px"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>Create Test</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualTestCreator;