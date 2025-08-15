export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
}

export interface ManualTest {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  scheduledDate?: string;
  isActive: boolean;
  task1: {
    type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'table' | 'process' | 'map' | 'image';
    title: string;
    description: string;
    imageUrl?: string;
    chartData?: any;
    prompt: string;
  };
  task2: {
    type: 'opinion' | 'discussion' | 'problem-solution' | 'advantages-disadvantages';
    topic: string;
    prompt: string;
  };
}

export interface TestResult {
  id: string;
  studentId: string;
  studentName: string;
  testDate: string;
  testType: 'ai-generated' | 'manual';
  testId?: string;
  task1: {
    prompt: string;
    response: string;
    score: number;
    imageUrl?: string;
    feedback: {
      taskAchievement: { score: number; feedback: string };
      coherenceCohesion: { score: number; feedback: string };
      lexicalResource: { score: number; feedback: string };
      grammaticalRange: { score: number; feedback: string };
    };
    chartData?: any;
  };
  task2: {
    prompt: string;
    response: string;
    score: number;
    feedback: {
      taskResponse: { score: number; feedback: string };
      coherenceCohesion: { score: number; feedback: string };
      lexicalResource: { score: number; feedback: string };
      grammaticalRange: { score: number; feedback: string };
    };
  };
  overallScore: number;
  timeSpent: number;
  status: 'completed' | 'in-progress' | 'abandoned';
}

export interface TestPrompt {
  id: string;
  task1: {
    type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'table' | 'process' | 'map';
    title: string;
    description: string;
    chartData: any;
    prompt: string;
  };
  task2: {
    type: 'opinion' | 'discussion' | 'problem-solution' | 'advantages-disadvantages';
    topic: string;
    prompt: string;
  };
}

export interface ChartDataItem {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}