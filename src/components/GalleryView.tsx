import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Photo } from '../types';

interface Props {
  userId: string;
  onPhotoSelect?: (photo: Photo) => void;
}

export default function GalleryView({ userId, onPhotoSelect }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('photos')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formattedPhotos = (data || []).map(photo => ({
        id: photo.id,
        senderId: photo.sender_id,
        senderName: photo.sender_name,
        senderPhoto: photo.sender_photo,
        imageUrl: photo.image_url,
        caption: photo.caption,
        createdAt: photo.created_at,
        recipientIds: photo.recipient_ids,
        reactions: photo.reactions || {},
      }));

      setPhotos(formattedPhotos);
    } catch (err: any) {
      console.error('Error loading photos:', err);
      setError(err.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      setDeleting(photoId);

      const { error: err } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)
        .eq('sender_id', userId);

      if (err) throw err;

      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError(err.message || 'Failed to delete photo');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-red-500 font-semibold mb-2">Error Loading Photos</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={loadPhotos}
          className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-2xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mb-4 border border-zinc-800">
          <AlertCircle size={32} className="text-zinc-600" />
        </div>
        <p className="text-gray-400 font-medium">No photos yet</p>
        <p className="text-gray-500 text-sm">Capture and send photos to see them here</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-2xl font-display font-bold mb-6">My Photos ({photos.length})</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {photos.map(photo => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-zinc-900 border-2 border-zinc-800 cursor-pointer hover:border-yellow-500 transition-all"
                onClick={() => onPhotoSelect?.(photo)}
              >
                <img
                  src={photo.imageUrl}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
                
                {/* Delete button on hover */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo.id);
                  }}
                  disabled={deleting === photo.id}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {deleting === photo.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={16} className="text-white" />
                  )}
                </motion.button>

                {/* Timestamp */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium">
                    {new Date(photo.createdAt).toLocaleDateString()} {new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
