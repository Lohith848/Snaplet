import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, History, Users, Settings, Plus, X, Smartphone } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { createUserProfile, checkUsernameUnique } from './services/userService';
import CameraView from './components/CameraView';
import HistoryView from './components/HistoryView';
import FriendsView from './components/FriendsView';
import ContactSync from './components/ContactSync';
import LoginView from './components/LoginView';
import WidgetSetup from './components/WidgetSetup';
import { updateProfile } from './services/userService';
import { cn } from './lib/utils';

type View = 'camera' | 'history' | 'friends' | 'settings';

export default function App() {
  const { user, profile, loading, setProfile } = useAuth();
  const [view, setView] = useState<View>('camera');
  const [showWidgetSetup, setShowWidgetSetup] = useState(false);
  const [takePhotoTrigger, setTakePhotoTrigger] = useState(0);
  const [username, setUsername] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username) return;

    setCheckingUsername(true);
    setUsernameError('');

    try {
      console.log('Starting onboarding for username:', username);
      console.log('Checking if username is unique:', username);
      const isUnique = await checkUsernameUnique(username);
      console.log('Username check result - isUnique:', isUnique);
      
      if (!isUnique) {
        console.log('Username already taken:', username);
        setUsernameError('Username already taken. Try another one.');
        setCheckingUsername(false);
        return;
      }

      console.log('Username is unique, creating profile...');
      const newProfile = {
        uid: user.id,
        username: username.toLowerCase(),
        displayName: user.user_metadata?.name || username,
        photoURL: user.user_metadata?.avatar_url || '',
      };

      await createUserProfile(newProfile);
      console.log('Profile created successfully, updating local state');
      setProfile(newProfile as any);
      setCheckingUsername(false);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      // Check if it's an RLS error
      let message = error?.message || 'Failed to create profile';
      
      if (message.includes('row-level security') || message.includes('RLS')) {
        message = 'Database permission error. Please contact support or refresh and try again.';
      } else if (message.includes('duplicate') || message.includes('unique')) {
        message = 'Username already taken. Try another one.';
      }
      
      setUsernameError(message);
      setCheckingUsername(false);
    }
  };

  const handleContactSyncComplete = async () => {
    if (!profile) return;
    try {
      // Update local state first for immediate UI feedback
      const updatedProfile = { ...profile, hasSyncedContacts: true };
      setProfile(updatedProfile);
      
      // Then update database
      await updateProfile(profile.uid, { hasSyncedContacts: true });
      console.log('Contact sync complete');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Even if database update fails, keep the local state updated
      // so user can proceed
    }
  };

  if (!user) {
    return <LoginView onLoginSuccess={() => {
      // This triggers a re-render through useAuth hook when session changes
    }} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6">
        <h2 className="text-3xl font-display font-bold mb-2">Pick a username</h2>
        <p className="text-gray-400 mb-8 text-center">This is how your friends will find you on Snaplit.</p>
        <form onSubmit={handleOnboarding} className="w-full max-w-sm space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-yellow-500 outline-none rounded-2xl py-4 pl-10 pr-4 font-medium transition-all"
              required
              minLength={3}
              maxLength={20}
            />
          </div>
          {usernameError && <p className="text-red-500 text-sm ml-1">{usernameError}</p>}
          <button 
            type="submit"
            disabled={checkingUsername || username.length < 3}
            className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {checkingUsername ? 'Checking...' : 'Finish'}
          </button>
        </form>
      </div>
    );
  }

  if (profile && !profile.hasSyncedContacts) {
    return <ContactSync onComplete={handleContactSyncComplete} />;
  }

  return (
    <div className="h-screen bg-black flex flex-col font-sans overflow-hidden">
      {/* Viewport for Mobile Feel */}
      <div className="flex-1 relative flex flex-col items-center">
        <div className="w-full h-full max-w-md bg-black relative flex flex-col">
          
          {/* Header */}
          <header className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black to-transparent">
            <button 
              onClick={() => setView('settings')}
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800"
            >
              <Settings size={20} className="text-white" />
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-yellow-500 font-display font-bold text-xl">Snaplit</span>
            </div>

            <button 
              onClick={() => setView('friends')}
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800"
            >
              <Users size={20} className="text-white" />
            </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 relative">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {view === 'camera' && <CameraView profile={profile!} takePhotoTrigger={takePhotoTrigger} />}
              {view === 'history' && <HistoryView profile={profile!} />}
              {view === 'friends' && <FriendsView profile={profile!} onBack={() => setView('camera')} />}
              {view === 'settings' && (
                <div className="p-6 h-full overflow-y-auto">
                   <div className="flex items-center gap-4 mb-8">
                     <img src={profile?.photoURL} className="w-16 h-16 rounded-3xl" alt="Me" />
                     <div>
                       <h3 className="text-xl font-bold">{profile?.displayName}</h3>
                       <p className="text-gray-400">@{profile?.username}</p>
                     </div>
                   </div>

                   <button 
                    onClick={() => setShowWidgetSetup(true)}
                    className="w-full bg-zinc-900 text-yellow-500 py-4 rounded-2xl font-bold mb-4 flex items-center justify-center gap-3"
                   >
                     <Smartphone size={20} />
                     Setup Home Widget
                   </button>

                   <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.reload();
                    }}
                    className="w-full bg-zinc-900 text-red-500 py-4 rounded-2xl font-bold"
                  >
                    Log Out
                  </button>
                  <button 
                    onClick={() => setView('camera')}
                    className="w-full mt-4 text-gray-400 py-4"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </main>

          {/* Tabs */}
          <nav className="p-6 flex items-center justify-center gap-12 z-10 bg-gradient-to-t from-black to-transparent">
             <button 
              onClick={() => setView('history')}
              className={cn(
                "p-3 rounded-full transition-all",
                view === 'history' ? "text-yellow-500" : "text-gray-500"
              )}
            >
              <History size={28} />
            </button>
            
            <button 
              onClick={() => {
                if (view === 'camera') {
                  setTakePhotoTrigger(prev => prev + 1);
                } else {
                  setView('camera');
                }
              }}
              className={cn(
                "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all shadow-lg active:scale-90",
                view === 'camera' ? "bg-yellow-500 scale-110" : "bg-zinc-800"
              )}
            >
              <Camera size={36} className={view === 'camera' ? "text-black" : "text-gray-400"} />
            </button>

            <button 
              onClick={() => setView('friends')}
              className={cn(
                "p-3 rounded-full transition-all",
                view === 'friends' ? "text-yellow-500" : "text-gray-500"
              )}
            >
              <Users size={28} />
            </button>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {showWidgetSetup && (
          <WidgetSetup onClose={() => setShowWidgetSetup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
