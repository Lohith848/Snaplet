import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, History, Users, Settings, Plus, X, Smartphone } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { signInWithPopup, signInWithRedirect, getRedirectResult, googleProvider, auth } from './lib/firebase';
import { createUserProfile, checkUsernameUnique } from './services/userService';
import CameraView from './components/CameraView';
import HistoryView from './components/HistoryView';
import FriendsView from './components/FriendsView';
import ContactSync from './components/ContactSync';
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
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoginError('');
      setLoginLoading(true);
      console.log('Attempting Google sign-in with popup...');
      await signInWithPopup(auth, googleProvider);
      console.log('Sign-in successful');
    } catch (error: any) {
      console.error('Popup sign-in failed:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, falling back to redirect...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          console.error('Redirect sign-in failed:', redirectError);
          setLoginError('Login failed. Please allow popups or try a different browser.');
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError('Domain not authorized. Add localhost to Firebase authorized domains.');
      } else {
        setLoginError(`Login failed: ${error.message}`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle redirect result on page load
  React.useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Redirect sign-in successful');
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
        setLoginError('Login failed. Please try again.');
      });
  }, []);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username) return;

    setCheckingUsername(true);
    setUsernameError('');

    const isUnique = await checkUsernameUnique(username);
    if (!isUnique) {
      setUsernameError('Username already taken');
      setCheckingUsername(false);
      return;
    }

    const newProfile = {
      uid: user.uid,
      username: username.toLowerCase(),
      displayName: user.displayName || username,
      photoURL: user.photoURL || '',
    };

    await createUserProfile(newProfile);
    setProfile(newProfile as any);
    setCheckingUsername(false);
  };

  const handleContactSyncComplete = async () => {
    if (!profile) return;
    await updateProfile(profile.uid, { hasSyncedContacts: true });
    setProfile({ ...profile, hasSyncedContacts: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-yellow-500 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,184,0,0.3)]"
        >
          <Camera size={48} className="text-black" strokeWidth={2.5} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">Snaplet</h1>
        <p className="text-gray-400 text-center mb-12 max-w-xs">
          Live photos from your best friends, right on your Home Screen.
        </p>
        <button 
          onClick={handleLogin}
          disabled={loginLoading}
          className="w-full max-w-sm bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </>
          )}
        </button>
        {loginError && <p className="text-red-500 text-sm mt-4">{loginError}</p>}
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6">
        <h2 className="text-3xl font-display font-bold mb-2">Pick a username</h2>
        <p className="text-gray-400 mb-8 text-center">This is how your friends will find you on Snaplet.</p>
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
              <span className="text-yellow-500 font-display font-bold text-xl">Snaplet</span>
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
                    onClick={() => {
                      auth.signOut();
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
