# Supabase Row Level Security (RLS) Setup

## Error: "new row violates row-level security policy"

This happens when RLS is enabled but no policies are defined. Follow these steps to fix it:

### Step 1: Run RLS Policy SQL

Go to **Supabase SQL Editor** and run this SQL:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read all profiles (needed for friend finding)
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Friendships table policies
-- Allow users to read friendships where they are involved
CREATE POLICY "Users can read their own friendships"
  ON friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Allow users to create friendships as the initiator
CREATE POLICY "Users can create friendships"
  ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own friendships
CREATE POLICY "Users can update friendships"
  ON friendships
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Photos table policies
-- Allow users to insert photos
CREATE POLICY "Users can insert their own photos"
  ON photos
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to read photos where they're the sender or in recipient_ids
CREATE POLICY "Users can read photos they sent or received"
  ON photos
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = ANY(recipient_ids));

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
  ON photos
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
  ON photos
  FOR DELETE
  USING (auth.uid() = sender_id);
```

### Step 2: Verify Policies Were Created

1. Go to **Authentication** → **Policies** in Supabase Console
2. Select each table and verify policies are listed:
   - **users**: 4 policies (insert, select, update)
   - **friendships**: 3 policies (select, insert, update)
   - **photos**: 4 policies (insert, select, update, delete)

### Step 3: Test the App

1. Refresh your app at https://snaplit-live.vercel.app
2. Login with email/OTP
3. Create a username - should work now! ✅

---

## Why This Error Happens

- By default, Supabase enables RLS on new tables
- RLS blocks ALL database access unless policies explicitly allow it
- Without policies, even authenticated users can't insert/read/update rows

## Security Note

These policies ensure:
- ✅ Users can only modify their own data
- ✅ Users can read all profiles (for friend discovery)
- ✅ Users can only see photos sent to them or by them
- ✅ No unauthorized data access
