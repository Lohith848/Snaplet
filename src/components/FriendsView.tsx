import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, UserPlus, ArrowLeft, Check, UserMinus, Users, ArrowRight } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Friendship } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import ContactSync from './ContactSync';

interface Props {
  profile: UserProfile;
  onBack: () => void;
}

export default function FriendsView({ profile, onBack }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const path = `users/${profile.uid}/friends`;
    const unsub = onSnapshot(collection(db, 'users', profile.uid, 'friends'), (snap) => {
      setFriends(snap.docs.map(doc => doc.data() as Friendship));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsub();
  }, [profile.uid]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    
    setLoading(true);
    const path = 'users';
    try {
      const q = query(collection(db, path), where('username', '==', search.toLowerCase()), limit(20));
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== profile.uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (friend: UserProfile) => {
    const myPath = `users/${profile.uid}/friends/${friend.uid}`;
    const theirPath = `users/${friend.uid}/friends/${profile.uid}`;
    
    const myFriendRef = doc(db, 'users', profile.uid, 'friends', friend.uid);
    const theirFriendRef = doc(db, 'users', friend.uid, 'friends', profile.uid);

    const friendshipData = {
      uid: friend.uid,
      username: friend.username,
      displayName: friend.displayName,
      photoURL: friend.photoURL,
      status: 'accepted',
      updatedAt: serverTimestamp()
    };

    const myDataForThem = {
      uid: profile.uid,
      username: profile.username,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      status: 'accepted',
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(myFriendRef, friendshipData);
      await setDoc(theirFriendRef, myDataForThem);
      setResults([]);
      setSearch('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, myPath);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'friends', friendId));
      await deleteDoc(doc(db, 'users', friendId, 'friends', profile.uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${profile.uid}/friends/${friendId}`);
    }
  };

  const [showSync, setShowSync] = useState(false);

  if (showSync) {
    return <div className="h-full bg-black"><ContactSync onComplete={() => setShowSync(false)} /></div>;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
           <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-display font-bold">Friends</h2>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search for @username"
          className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-yellow-500 outline-none rounded-2xl py-3 pl-12 pr-4 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Sync Action */}
      <button 
        onClick={() => setShowSync(true)}
        className="mb-8 w-full bg-zinc-900 border-2 border-dashed border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-yellow-500/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-yellow-500" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">Find from Contacts</p>
            <p className="text-xs text-zinc-500">Sync phone contacts</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-zinc-700 group-hover:text-yellow-500 transition-colors" />
      </button>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Results</h3>
          {results.map(user => (
            <div key={user.uid} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 mb-2">
              <div className="flex items-center gap-3">
                <img src={user.photoURL} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                <div>
                  <p className="font-bold">{user.displayName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button 
                onClick={() => addFriend(user)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <UserPlus size={16} />
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Friends List */}
      <div className="flex-1 overflow-y-auto pb-24">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Your Friends</h3>
        {friends.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">Your locket is empty!</p>
            <p className="text-xs">Search for your friends and add them to see their photos here.</p>
          </div>
        ) : (
          friends.map(friend => (
            <div key={friend.uid} className="flex items-center justify-between p-3 hover:bg-zinc-900/30 rounded-2xl transition-colors mb-2">
              <div className="flex items-center gap-3">
                <img src={friend.photoURL} className="w-12 h-12 rounded-3xl" alt="" />
                <div>
                  <p className="font-bold">{friend.displayName}</p>
                  <p className="text-xs text-gray-500">@{friend.username}</p>
                </div>
              </div>
              <button 
                onClick={() => removeFriend(friend.uid)}
                className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
              >
                <UserMinus size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
