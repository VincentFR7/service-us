/*
  # Initial schema setup for military service tracker

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `fullname` (text, unique)
      - `password` (text)
      - `regiment` (text)
      - `role` (text)
      - `force_password_change` (boolean)
      - `created_at` (timestamptz)
      - `last_seen` (timestamptz)

    - `service_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (interval)
      - `created_at` (timestamptz)

    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `is_confidential` (boolean)
      - `author_id` (uuid, references users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fullname text UNIQUE NOT NULL,
  password text NOT NULL,
  regiment text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  force_password_change boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

-- Create service_records table
CREATE TABLE IF NOT EXISTS service_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration interval,
  created_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_confidential boolean DEFAULT false,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Service records policies
CREATE POLICY "Users can read their own service records"
  ON service_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own service records"
  ON service_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own service records"
  ON service_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Announcements policies
CREATE POLICY "Anyone can read non-confidential announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (NOT is_confidential OR author_id = auth.uid());

CREATE POLICY "État-Major can read all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
  ));

CREATE POLICY "État-Major can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'moderator')
  ));