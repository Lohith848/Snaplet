import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Photo } from '../types';
import { reactToPhoto } from '../services/photoService';
import { formatDate } from '../lib/utils';

interface Props {
  photo: Photo;
  currentUserId: string;
}

const EMOJIS = ['❤️', '😂', '😮', '🔥', '👍', '😢'];

export default function WidgetPreview({ photo, currentUserId }: Props) {
  const [showReactions, setShowReactions] = useState(false);
  const userReaction = photo.reactions?.[currentUserId];

  const handleReact = (emoji: string) => {
    reactToPhoto(photo.id, currentUserId, emoji);
    setShowReactions(false);
  };

  return (
    <motion.div 
      layoutId={photo.id}
      className="relative w-48 h-48 rounded-[3rem] overflow-hidden shadow-2xl border-2 border-zinc-800 bg-zinc-900 group"
    >
      <img 
        src={photo.imageUrl} 
        className="w-full h-full object-cover" 
        alt="Snaplet" 
      />
      
      {/* Sender Info Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-2">
         <img src={photo.senderPhoto} className="w-6 h-6 rounded-full border border-white/20" alt={photo.senderName} />
         <div className="flex flex-col">
           <span className="text-[10px] font-bold leading-none">{photo.senderId === currentUserId ? 'You' : photo.senderName}</span>
           <span className="text-[8px] opacity-70 leading-none">{formatDate(photo.createdAt?.toDate() || new Date())}</span>
         </div>
      </div>

      {/* Quick Reaction Button */}
      <button 
        onClick={() => setShowReactions(!showReactions)}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
      >
        {userReaction ? (
          <span className="text-sm">{userReaction}</span>
        ) : (
          <Heart size={14} className="text-white" />
        )}
      </button>

      {/* Reaction Picker Popover */}
      <AnimatePresence>
        {showReactions && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-12 right-2 bg-black/80 backdrop-blur-xl p-2 rounded-2xl flex gap-2 border border-white/10 shadow-2xl z-50"
          >
            {EMOJIS.map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Reactions Indicators */}
      <div className="absolute bottom-2 left-2 flex -space-x-1">
        {Object.entries(photo.reactions || {}).slice(0, 3).map(([uid, emoji]) => (
          <div key={uid} className="w-5 h-5 rounded-full bg-zinc-900 border border-black flex items-center justify-center text-[10px]">
            {emoji}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
