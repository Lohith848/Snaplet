# Supabase Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Supabase Database Tables

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Select your project: **snaplet** (ynhjcydfvdobzbmoebdp)
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below, then click **Run**:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  has_synced_contacts BOOLEAN DEFAULT false,
  has_setup_widget BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_photo TEXT,
  image_url TEXT NOT NULL,
  caption TEXT,
  recipient_ids UUID[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_photos_sender_id ON photos(sender_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
```

### Step 1b: Create Row Level Security (RLS) Policies ⚠️ IMPORTANT

**If you get error "new row violates row-level security policy", follow these steps:**

1. Click **New Query** again in SQL Editor
2. Paste this SQL and click **Run**:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Friendships table policies
CREATE POLICY "Users can read their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Photos table policies
CREATE POLICY "Users can insert their own photos"
  ON photos FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read photos they sent or received"
  ON photos FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = ANY(recipient_ids));

CREATE POLICY "Users can update their own photos"
  ON photos FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own photos"
  ON photos FOR DELETE USING (auth.uid() = sender_id);
```

### Step 2: Enable Email OTP Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **Email** in the list and click it
3. Enable the toggle
4. Under "Email OTP Settings", make sure it's enabled
5. Click **Save**

### Step 3: Enable Google OAuth (Optional but recommended)

1. In **Authentication** → **Providers**, click **Google**
2. Get OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Google+ API"
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add Authorized redirect URI: `https://ynhjcydfvdobzbmoebdp.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
3. Paste Client ID and Client Secret into Supabase Google provider settings
4. Click **Save**

### Step 4: Enable Realtime (for live updates)

1. Go to **Replication** (left sidebar under "Database")
2. Toggle **ON** for the `photos` table
3. Toggle **ON** for the `friendships` table

### Step 5: Set Environment Variables on Vercel

Already done! Your Vercel project should auto-redeploy.

If not, manually redeploy:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **snaplit-live** project
3. Go to **Deployments** tab
4. Click **Redeploy** on the latest deployment

---

## Testing

1. Go to https://snaplit-live.vercel.app
2. Click **Continue with Email** (or Google if configured)
3. Enter your email and verify with the 6-digit OTP
4. Create a username
5. You should now see the app!

---

## Troubleshooting

**"new row violates row-level security policy" error?**
- You skipped Step 1b (RLS Policies)
- Run the RLS SQL from Step 1b above

**"Username already taken" for every username?**
- Make sure the `users` table was created (check Supabase SQL Editor → Tables)
- Make sure RLS policies are set (check Authentication → Policies)

**Still seeing black screen?**
- Open DevTools (F12) → Console tab
- Tell me what error messages appear

**OTP not arriving?**
- Check spam folder
- Make sure Email provider is enabled in Supabase Authentication

**Google login shows "invalid_client" error?**
- You skipped Step 3
- Make sure OAuth credentials are added to Supabase
