import { supabase } from '../lib/supabase';
import type { ManualTest, TestResult } from '../types';

export class TestService {
  // Create a new manual test
  static async createManualTest(test: Omit<ManualTest, 'id' | 'createdAt'>) {
    if (!supabase) {
      // Fallback to localStorage
      const tests = JSON.parse(localStorage.getItem('manualTests') || '[]');
      const newTest = {
        ...test,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      tests.push(newTest);
      localStorage.setItem('manualTests', JSON.stringify(tests));
      return { data: newTest, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('manual_tests')
        .insert({
          title: test.title,
          created_by: test.createdBy,
          scheduled_date: test.scheduledDate || null,
          is_active: test.isActive,
          task1_type: test.task1.type,
          task1_title: test.task1.title,
          task1_description: test.task1.description,
          task1_image_url: test.task1.imageUrl || null,
          task1_prompt: test.task1.prompt,
          task2_type: test.task2.type,
          task2_topic: test.task2.topic,
          task2_prompt: test.task2.prompt,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseTestToManualTest(data);
    } catch (error) {
      console.error('Create manual test error:', error);
      throw error;
    }
  }

  // Get all active manual tests
  static async getActiveManualTests(): Promise<ManualTest[]> {
    if (!supabase) {
      // Fallback to localStorage
      const tests = JSON.parse(localStorage.getItem('manualTests') || '[]');
      return { data: tests, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('manual_tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseTestToManualTest);
    } catch (error) {
      console.error('Get active manual tests error:', error);
      return [];
    }
  }

  // Get all manual tests (for teachers)
  static async getAllManualTests(): Promise<ManualTest[]> {
    if (!supabase) {
      // Fallback to localStorage
      const tests = JSON.parse(localStorage.getItem('manualTests') || '[]');
      return { data: tests, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('manual_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseTestToManualTest);
    } catch (error) {
      console.error('Get all manual tests error:', error);
      return [];
    }
  }

  // Update manual test
  static async updateManualTest(testId: string, updates: Partial<ManualTest>) {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      if (updates.task1) {
        if (updates.task1.type) updateData.task1_type = updates.task1.type;
        if (updates.task1.title) updateData.task1_title = updates.task1.title;
        if (updates.task1.description) updateData.task1_description = updates.task1.description;
        if (updates.task1.imageUrl !== undefined) updateData.task1_image_url = updates.task1.imageUrl;
        if (updates.task1.prompt) updateData.task1_prompt = updates.task1.prompt;
      }
      
      if (updates.task2) {
        if (updates.task2.type) updateData.task2_type = updates.task2.type;
        if (updates.task2.topic) updateData.task2_topic = updates.task2.topic;
        if (updates.task2.prompt) updateData.task2_prompt = updates.task2.prompt;
      }

      const { data, error } = await supabase
        .from('manual_tests')
        .update(updateData)
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseTestToManualTest(data);
    } catch (error) {
      console.error('Update manual test error:', error);
      throw error;
    }
  }

  // Delete manual test
  static async deleteManualTest(testId: string) {
    try {
      const { error } = await supabase
        .from('manual_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete manual test error:', error);
      throw error;
    }
  }

  // Save test result
  static async saveTestResult(result: Omit<TestResult, 'id'>) {
    if (!supabase) {
      // Fallback to localStorage
      const key = `testResults_${result.studentId}`;
      const results = JSON.parse(localStorage.getItem(key) || '[]');
      const newResult = {
        ...result,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      results.push(newResult);
      localStorage.setItem(key, JSON.stringify(results));
      return { data: newResult, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          student_id: result.studentId,
          student_name: result.studentName,
          test_date: result.testDate,
          test_type: result.testType,
          test_id: result.testId || null,
          task1_prompt: result.task1.prompt,
          task1_response: result.task1.response,
          task1_score: result.task1.score,
          task1_image_url: result.task1.imageUrl || null,
          task1_feedback: result.task1.feedback,
          task2_prompt: result.task2.prompt,
          task2_response: result.task2.response,
          task2_score: result.task2.score,
          task2_feedback: result.task2.feedback,
          overall_score: result.overallScore,
          time_spent: result.timeSpent,
          status: result.status,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseResultToTestResult(data);
    } catch (error) {
      console.error('Save test result error:', error);
      throw error;
    }
  }

  // Get test results for a student
  static async getStudentTestResults(studentId: string): Promise<TestResult[]> {
    if (!supabase) {
      // Fallback to localStorage
      if (studentId) {
        const results = JSON.parse(localStorage.getItem(`testResults_${studentId}`) || '[]');
        return { data: results, error: null };
      } else {
        // Get all results for teacher view
        const allResults: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('testResults_')) {
            const results = JSON.parse(localStorage.getItem(key) || '[]');
            allResults.push(...results);
          }
        }
        return { data: allResults, error: null };
      }
    }

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', studentId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseResultToTestResult);
    } catch (error) {
      console.error('Get student test results error:', error);
      return [];
    }
  }

  // Get all test results (for teachers)
  static async getAllTestResults(): Promise<TestResult[]> {
    if (!supabase) {
      // Fallback to localStorage
      const allResults: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('testResults_')) {
          const results = JSON.parse(localStorage.getItem(key) || '[]');
          allResults.push(...results);
        }
      }
      return { data: allResults, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .order('test_date', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseResultToTestResult);
    } catch (error) {
      console.error('Get all test results error:', error);
      return [];
    }
  }

  // Helper method to map database test to ManualTest type
  private static mapDatabaseTestToManualTest(data: any): ManualTest {
    return {
      id: data.id,
      title: data.title,
      createdBy: data.created_by,
      createdAt: data.created_at,
      scheduledDate: data.scheduled_date,
      isActive: data.is_active,
      task1: {
        type: data.task1_type,
        title: data.task1_title,
        description: data.task1_description,
        imageUrl: data.task1_image_url,
        prompt: data.task1_prompt,
      },
      task2: {
        type: data.task2_type,
        topic: data.task2_topic,
        prompt: data.task2_prompt,
      },
    };
  }

  // Helper method to map database result to TestResult type
  private static mapDatabaseResultToTestResult(data: any): TestResult {
    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student_name,
      testDate: data.test_date,
      testType: data.test_type,
      testId: data.test_id,
      task1: {
        prompt: data.task1_prompt,
        response: data.task1_response,
        score: data.task1_score,
        imageUrl: data.task1_image_url,
        feedback: data.task1_feedback,
      },
      task2: {
        prompt: data.task2_prompt,
        response: data.task2_response,
        score: data.task2_score,
        feedback: data.task2_feedback,
      },
      overallScore: data.overall_score,
      timeSpent: data.time_spent,
      status: data.status,
    };
  }
}