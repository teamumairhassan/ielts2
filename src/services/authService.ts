import { supabase } from '../lib/supabase';
import type { User } from '../types';

export class AuthService {
  // Sign up a new user
  static async signUp(email: string, password: string, name: string, role: 'student' | 'teacher' = 'student') {
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then, create user profile in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          role,
        })
        .select()
        .single();

      if (userError) throw userError;

      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        } as User,
        session: authData.session,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to sign in');

      // Get user profile from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        } as User,
        session: authData.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (!session) return null;

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;

      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        } as User,
        session,
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Check if user is teacher
  static async isTeacher(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data.role === 'teacher';
    } catch (error) {
      console.error('Check teacher role error:', error);
      return false;
    }
  }
}