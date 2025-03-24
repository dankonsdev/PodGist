-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Podcasts table
CREATE TABLE podcasts (
  id SERIAL PRIMARY KEY,
  podcast_index_id TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  image_url TEXT,
  feed_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER REFERENCES podcasts(id),
  episode_guid TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transcriptions table
CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(id),
  storage_path TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Summaries table
CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  transcription_id INTEGER REFERENCES transcriptions(id),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User saved episodes
CREATE TABLE user_episodes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  episode_id INTEGER REFERENCES episodes(id),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, episode_id)
);

-- RLS policies for all tables
-- [Add appropriate policies based on your app's requirements] 