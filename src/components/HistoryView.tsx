import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Photo, UserProfile } from '../types';
import { subscribeToFeed } from '../services/photoService';
import { formatDate } from '../lib/utils';
import { Heart } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function HistoryView({ profile }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToFeed(profile.uid, [], (newPhotos) => {
      setPhotos(newPhotos);
    });
    return () => unsubscribe();
  }, [profile.uid]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
        <p>No photos here yet. Send a locket to your friends!</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-32">
      <h2 className="text-2xl font-display font-bold mb-6">History</h2>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 mb-4"
          >
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-zinc-900 group">
              <img src={photo.imageUrl} className="w-full h-full object-cover" alt="History" />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <div className="flex items-center gap-2">
                  <img src={photo.senderPhoto} className="w-6 h-6 rounded-full" alt="Sender" />
                  <span className="text-xs font-bold">{photo.senderName}</span>
                </div>
              </div>

              {/* Reaction count bubble */}
              {Object.keys(photo.reactions || {}).length > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1">
                  <Heart size={10} className="fill-white text-white" />
                  <span className="text-[10px] font-bold">{Object.keys(photo.reactions).length}</span>
                </div>
              )}
            </div>
            <div className="px-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                {formatDate(photo.createdAt?.toDate() || new Date())}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
