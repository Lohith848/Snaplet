export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
  updatedAt: any;
  hasSyncedContacts?: boolean;
  hasSetupWidget?: boolean;
}

export interface Friendship {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  status: 'pending' | 'accepted';
  updatedAt: any;
}

export interface Photo {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
  recipientIds: string[];
  reactions: Record<string, string>; // uid -> emoji
}
