import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  limit,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  const path = 'users';
  try {
    const usersRef = collection(db, path);
    const q = query(usersRef, where('username', '==', username.toLowerCase()), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return false;
  }
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
  if (!profile.uid) throw new Error('UID is required');
  const path = `users/${profile.uid}`;
  
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      username: profile.username?.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
