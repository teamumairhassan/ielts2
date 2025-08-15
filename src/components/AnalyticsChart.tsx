import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TestResult } from '../types';

interface AnalyticsChartProps {
  results: TestResult[];
  studentName?: string;
  multipleStudents?: boolean;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ results, studentName, multipleStudents = false }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No test data available for chart</p>
      </div>
    );
  }

  const chartData = results
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .map((result, index) => ({
      test: `Test ${index + 1}`,
      date: new Date(result.testDate).toLocaleDateString(),
      overallScore: result.overallScore,
      task1Score: result.task1.score,
      task2Score: result.task2.score,
      studentName: result.studentName
    }));

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (multipleStudents) {
    // Group by student
    const studentGroups = results.reduce((acc, result) => {
      if (!acc[result.studentName]) {
        acc[result.studentName] = [];
      }
      acc[result.studentName].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    // Create combined data
    const allTests = new Set<string>();
    Object.values(studentGroups).forEach(studentResults => {
      studentResults.forEach((_, index) => {
        allTests.add(`Test ${index + 1}`);
      });
    });

    const combinedData = Array.from(allTests).map(testName => {
      const dataPoint: any = { test: testName };
      Object.entries(studentGroups).forEach(([student, studentResults]) => {
        const testIndex = parseInt(testName.split(' ')[1]) - 1;
        if (studentResults[testIndex]) {
          dataPoint[student] = studentResults[testIndex].overallScore;
        }
      });
      return dataPoint;
    });

    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test" />
            <YAxis domain={[0, 9]} />
            <Tooltip />
            <Legend />
            {Object.keys(studentGroups).map((student, index) => (
              <Line
                key={student}
                type="monotone"
                dataKey={student}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="test" />
          <YAxis domain={[0, 9]} />
          <Tooltip 
            formatter={(value, name) => [value, name === 'overallScore' ? 'Overall Score' : name === 'task1Score' ? 'Task 1' : 'Task 2']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="overallScore" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ r: 5 }}
            name="Overall Score"
          />
          <Line 
            type="monotone" 
            dataKey="task1Score" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Task 1"
          />
          <Line 
            type="monotone" 
            dataKey="task2Score" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Task 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;