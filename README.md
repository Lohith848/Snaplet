<div align="center">

# Snaplit

**Live photos from your best friends, right on your Home Screen.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://snaplit-sage.vercel.app)
[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>

## Features

- **Email OTP & Google Sign-In** - Secure authentication via Supabase Auth
- **Friend System** - Add friends and share live photos
- **Camera Integration** - Capture and share moments instantly
- **Home Screen Widget** - Display friend photos on your home screen
- **Real-time Updates** - Powered by Supabase for instant sync
- **Beautiful UI** - Smooth animations with Motion, styled with Tailwind CSS

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (https://supabase.com)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Lohith848/Snaplet.git
   cd Snaplet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase configuration:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Create a new project

### 2. Create Database Tables
Run these SQL queries in your Supabase SQL Editor:

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

### 3. Enable Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider with OTP option
3. Enable **Google** provider and add OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Add Client ID and Client Secret to Supabase

### 4. Enable Realtime
1. Go to **Realtime** → **Replication**
2. Enable replication for:
   - `photos` table
   - `friendships` table

### 5. Set Up Storage (Optional)
1. Go to **Storage**
2. Create a bucket named `photos`
3. Configure access rules as needed

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Type check with TypeScript |
| `npm run clean` | Remove build artifacts |

## Project Structure

```
src/
├── components/         # React components
│   ├── CameraView.tsx
│   ├── ContactSync.tsx
│   ├── FriendsView.tsx
│   ├── HistoryView.tsx
│   ├── LoginView.tsx
│   ├── WidgetPreview.tsx
│   └── WidgetSetup.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.ts
├── lib/                # Utilities and configurations
│   ├── supabase.ts
│   ├── firestore-errors.ts
│   └── utils.ts
├── services/           # API and database services
│   ├── photoService.ts
│   └── userService.ts
├── App.tsx             # Main application component
├── index.css           # Global styles
└── types.ts            # TypeScript interfaces
```

## Made by

LOHITH G 🌻
