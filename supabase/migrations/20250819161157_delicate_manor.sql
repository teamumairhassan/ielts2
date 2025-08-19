/*
  # Initial Schema for IELTS Academic AI Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (enum: student, teacher)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `manual_tests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `scheduled_date` (timestamp, nullable)
      - `is_active` (boolean)
      - Task 1 fields (type, title, description, image_url, prompt)
      - Task 2 fields (type, topic, prompt)
      - `updated_at` (timestamp)
    
    - `test_results`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to users)
      - `student_name` (text)
      - `test_date` (timestamp)
      - `test_type` (enum: ai-generated, manual)
      - `test_id` (uuid, nullable, foreign key to manual_tests)
      - Task 1 and Task 2 data fields
      - `overall_score` (numeric)
      - `time_spent` (integer, seconds)
      - `status` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for teachers to manage tests and view all results
    - Add policies for students to view available tests and their own results
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher');
CREATE TYPE test_type AS ENUM ('ai-generated', 'manual');
CREATE TYPE test_status AS ENUM ('completed', 'in-progress', 'abandoned');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create manual_tests table
CREATE TABLE IF NOT EXISTS manual_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  scheduled_date timestamptz,
  is_active boolean DEFAULT true,
  task1_type text NOT NULL DEFAULT 'image',
  task1_title text NOT NULL,
  task1_description text DEFAULT '',
  task1_image_url text,
  task1_prompt text NOT NULL,
  task2_type text NOT NULL DEFAULT 'opinion',
  task2_topic text NOT NULL,
  task2_prompt text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  test_date timestamptz NOT NULL,
  test_type test_type NOT NULL,
  test_id uuid REFERENCES manual_tests(id) ON DELETE SET NULL,
  task1_prompt text NOT NULL,
  task1_response text NOT NULL,
  task1_score numeric(3,1) NOT NULL,
  task1_image_url text,
  task1_feedback jsonb NOT NULL,
  task2_prompt text NOT NULL,
  task2_response text NOT NULL,
  task2_score numeric(3,1) NOT NULL,
  task2_feedback jsonb NOT NULL,
  overall_score numeric(3,1) NOT NULL,
  time_spent integer NOT NULL,
  status test_status DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_manual_tests_created_by ON manual_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_manual_tests_is_active ON manual_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_results_test_date ON test_results(test_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for manual_tests table
CREATE POLICY "Anyone can read active tests"
  ON manual_tests
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Teachers can manage all tests"
  ON manual_tests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can insert tests"
  ON manual_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for test_results table
CREATE POLICY "Students can read own results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can read all results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_tests_updated_at
  BEFORE UPDATE ON manual_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();