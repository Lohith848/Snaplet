<div align="center">

# Snaplet

**Live photos from your best friends, right on your Home Screen.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://snaplet-sage.vercel.app)
[![Built with Firebase](https://img.shields.io/badge/Built%20with-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>

## Features

- **Google Sign-In** - Secure authentication with Firebase Auth
- **Friend System** - Add friends and share live photos
- **Camera Integration** - Capture and share moments instantly
- **Home Screen Widget** - Display friend photos on your home screen
- **Real-time Updates** - Powered by Firestore for instant sync
- **Beautiful UI** - Smooth animations with Motion, styled with Tailwind CSS

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Backend:** Firebase Auth, Firestore
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

3. Create a `.env.local` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_FIRESTORE_DATABASE_ID=your_database_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Google Sign-In** in Authentication → Sign-in method
3. Add your domains to **Authorized domains** (localhost, your Vercel URL)
4. Create a Firestore database
5. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

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
├── components/     # React components
│   ├── CameraView.tsx
│   ├── ContactSync.tsx
│   ├── FriendsView.tsx
│   ├── HistoryView.tsx
│   ├── WidgetPreview.tsx
│   └── WidgetSetup.tsx
├── hooks/          # Custom React hooks
│   └── useAuth.ts
├── lib/            # Utilities and configurations
│   ├── firebase.ts
│   ├── firestore-errors.ts
│   └── utils.ts
├── services/       # API and Firestore services
│   ├── photoService.ts
│   └── userService.ts
├── App.tsx         # Main application component
├── index.css       # Global styles
└── types.ts        # TypeScript interfaces
```

## Made by

LOHITH G
