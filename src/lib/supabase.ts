import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://your-project.supabase.co' || 
      supabaseAnonKey === 'your-anon-key-here') {
    console.warn('Supabase environment variables not configured. Using fallback mode.');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'student' | 'teacher';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'student' | 'teacher';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'student' | 'teacher';
          created_at?: string;
          updated_at?: string;
        };
      };
      manual_tests: {
        Row: {
          id: string;
          title: string;
          created_by: string;
          created_at: string;
          scheduled_date: string | null;
          is_active: boolean;
          task1_type: string;
          task1_title: string;
          task1_description: string;
          task1_image_url: string | null;
          task1_prompt: string;
          task2_type: string;
          task2_topic: string;
          task2_prompt: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          created_by: string;
          created_at?: string;
          scheduled_date?: string | null;
          is_active?: boolean;
          task1_type: string;
          task1_title: string;
          task1_description: string;
          task1_image_url?: string | null;
          task1_prompt: string;
          task2_type: string;
          task2_topic: string;
          task2_prompt: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          created_by?: string;
          created_at?: string;
          scheduled_date?: string | null;
          is_active?: boolean;
          task1_type?: string;
          task1_title?: string;
          task1_description?: string;
          task1_image_url?: string | null;
          task1_prompt?: string;
          task2_type?: string;
          task2_topic?: string;
          task2_prompt?: string;
          updated_at?: string;
        };
      };
      test_results: {
        Row: {
          id: string;
          student_id: string;
          student_name: string;
          test_date: string;
          test_type: 'ai-generated' | 'manual';
          test_id: string | null;
          task1_prompt: string;
          task1_response: string;
          task1_score: number;
          task1_image_url: string | null;
          task1_feedback: any;
          task2_prompt: string;
          task2_response: string;
          task2_score: number;
          task2_feedback: any;
          overall_score: number;
          time_spent: number;
          status: 'completed' | 'in-progress' | 'abandoned';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_name: string;
          test_date: string;
          test_type: 'ai-generated' | 'manual';
          test_id?: string | null;
          task1_prompt: string;
          task1_response: string;
          task1_score: number;
          task1_image_url?: string | null;
          task1_feedback: any;
          task2_prompt: string;
          task2_response: string;
          task2_score: number;
          task2_feedback: any;
          overall_score: number;
          time_spent: number;
          status: 'completed' | 'in-progress' | 'abandoned';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          student_name?: string;
          test_date?: string;
          test_type?: 'ai-generated' | 'manual';
          test_id?: string | null;
          task1_prompt?: string;
          task1_response?: string;
          task1_score?: number;
          task1_image_url?: string | null;
          task1_feedback?: any;
          task2_prompt?: string;
          task2_response?: string;
          task2_score?: number;
          task2_feedback?: any;
          overall_score?: number;
          time_spent?: number;
          status?: 'completed' | 'in-progress' | 'abandoned';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}