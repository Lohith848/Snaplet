import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Photo, Friendship } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const sendPhoto = async (
  senderId: string, 
  senderName: string,
  senderPhoto: string,
  imageUrl: string, 
  recipientIds: string[]
) => {
  const path = 'photos';
  const photoData = {
    senderId,
    senderName,
    senderPhoto,
    imageUrl,
    caption: '',
    createdAt: serverTimestamp(),
    recipientIds,
    reactions: {}
  };
  
  try {
    return await addDoc(collection(db, path), photoData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const reactToPhoto = async (photoId: string, userId: string, emoji: string) => {
  const path = `photos/${photoId}`;
  const photoRef = doc(db, 'photos', photoId);
  try {
    return await updateDoc(photoRef, {
      [`reactions.${userId}`]: emoji
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getFriends = async (userId: string): Promise<Friendship[]> => {
  const path = `users/${userId}/friends`;
  try {
    const friendsRef = collection(db, 'users', userId, 'friends');
    const q = query(friendsRef, where('status', '==', 'accepted'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Friendship);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const subscribeToFeed = (userId: string, friendIds: string[], callback: (photos: Photo[]) => void) => {
  const path = 'photos';
  let q;
  
  if (friendIds.length === 0) {
    q = query(
      collection(db, path),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, path),
      where('recipientIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};
