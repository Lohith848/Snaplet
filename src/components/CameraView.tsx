import React, { useRef, useState, useEffect } from 'react';
import { Camera, Send, Check, Plus, Smartphone, Image, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendPhoto, subscribeToFeed, getFriends } from '../services/photoService';
import { UserProfile, Photo } from '../types';
import WidgetPreview from './WidgetPreview';
import GalleryView from './GalleryView';
import { cn } from '../lib/utils';

interface Props {
  profile: UserProfile;
  takePhotoTrigger?: number;
}

export default function CameraView({ profile, takePhotoTrigger = 0 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [askingWidgetPermission, setAskingWidgetPermission] = useState(false);
  const [latestPhotos, setLatestPhotos] = useState<Photo[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    
    // Subscribe to feed
    const unsubscribe = subscribeToFeed(profile.uid, [], (photos) => {
      setLatestPhotos(photos);
    });

    return () => {
      stopCamera();
      unsubscribe();
    };
  }, [profile.uid]);

  useEffect(() => {
    if (takePhotoTrigger > 0 && !capturedImage && !sent && !sending) {
      takePhoto();
    }
  }, [takePhotoTrigger]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', aspectRatio: 1 }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera access denied. Please enable it in settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState < 2) {
      console.warn("Video not ready for capture");
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const size = Math.min(videoWidth, videoHeight);
    
    canvas.width = size;
    canvas.height = size;
    
    context.clearRect(0, 0, size, size);
    
    context.save();
    context.translate(size, 0);
    context.scale(-1, 1);
    
    try {
      context.drawImage(
        video, 
        (videoWidth - size) / 2, 
        (videoHeight - size) / 2, 
        size, size, 
        0, 0, size, size
      );
    } catch (e) {
      console.error("Draw image failed:", e);
    }
    
    context.restore();
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    setAskingWidgetPermission(true);
  };

  const handleSend = async () => {
    if (!capturedImage || sending) return;

    setSending(true);
    setSendError(null);
    
    try {
      const friends = await getFriends(profile.uid);
      const friendIds = friends.map(f => f.uid);
      
      if (friendIds.length === 0) {
        setSendError('You have no friends yet. Add friends to share photos!');
        setSending(false);
        return;
      }
      
      await sendPhoto(
        profile.uid,
        profile.displayName,
        profile.photoURL,
        capturedImage,
        friendIds
      );
      
      console.log("Photo sent successfully!");
      
      setSent(true);
      setTimeout(() => {
        setCapturedImage(null);
        setSent(false);
        setSending(false);
        setAskingWidgetPermission(false);
      }, 1500);
    } catch (error: any) {
      console.error("Send failed:", error);
      setSendError(error.message || 'Failed to send photo. Make sure you have friends and the database is set up.');
      setSending(false);
    }
  };

  if (showGallery) {
    return <GalleryView userId={profile.uid} onPhotoSelect={(photo) => setShowGallery(false)} />;
  }

  return (
    <div className="relative h-full flex flex-col p-4">
      <div className="h-1/3 flex items-center justify-center">
        {latestPhotos.length > 0 ? (
          <WidgetPreview photo={latestPhotos[0]} currentUserId={profile.uid} />
        ) : (
          <div className="w-48 h-48 rounded-[3rem] bg-zinc-900 flex flex-col items-center justify-center border-2 border-zinc-800 p-6 text-center">
            <Plus className="text-zinc-700 mb-2" size={32} />
            <p className="text-zinc-600 text-sm font-medium">No photos yet. Add some friends!</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl border-2 border-zinc-800">
           {cameraError ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
               <Camera size={48} className="text-zinc-700 mb-4" />
               <p className="text-zinc-500">{cameraError}</p>
             </div>
           ) : capturedImage ? (
             <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              src={capturedImage} 
              className="w-full h-full object-cover" 
              alt="Captured" 
             />
           ) : (
             <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]" 
             />
           )}
           
           <canvas ref={canvasRef} className="hidden" />

           <AnimatePresence>
             {askingWidgetPermission && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center"
               >
                 <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                   <Smartphone size={32} className="text-black" />
                 </div>
                 <h3 className="text-xl font-display font-bold mb-2">Sync with Widget?</h3>
                 <p className="text-gray-300 text-sm mb-8">
                   Allow Snaplit to update your friends' home screen widgets with this photo. Available on iOS and Android.
                 </p>
                 <div className="w-full flex flex-col gap-3">
                   <button 
                     onClick={() => setAskingWidgetPermission(false)}
                     className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold"
                   >
                     Allow & Continue
                   </button>
                   <button 
                     onClick={() => {
                       setAskingWidgetPermission(false);
                       setCapturedImage(null);
                     }}
                     className="w-full text-gray-400 py-2 text-sm font-medium"
                   >
                     Cancel
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {sendError && (
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-0 right-0 px-6"
               >
                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3">
                   <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="text-red-500 text-sm font-medium">{sendError}</p>
                   </div>
                   <button
                     onClick={() => setSendError(null)}
                     className="text-red-500 ml-auto text-sm font-medium hover:text-red-400"
                   >
                     Dismiss
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {capturedImage && !sent && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="absolute bottom-6 left-0 right-0 px-6 flex justify-between gap-4"
               >
                 <button 
                   onClick={() => {
                     setCapturedImage(null);
                     setSendError(null);
                   }}
                   disabled={sending}
                   className="flex-1 bg-zinc-900/80 backdrop-blur-md text-white py-4 rounded-2xl font-bold border border-white/10"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handleSend}
                   disabled={sending}
                   className="flex-[2] bg-yellow-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                 >
                   {sending ? (
                     <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                       <Send size={20} />
                       Send to Friends
                     </>
                   )}
                 </button>
               </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {sent && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.5 }}
                 className="absolute inset-0 bg-yellow-500/90 flex flex-col items-center justify-center z-20"
               >
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                   className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4"
                 >
                   <Check size={48} className="text-yellow-500" strokeWidth={4} />
                 </motion.div>
                 <h3 className="text-black text-2xl font-display font-bold">Sent!</h3>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {!capturedImage && !cameraError && (
        <div className="mt-8 flex justify-between items-center pb-24 px-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGallery(true)}
            className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center hover:border-yellow-500 transition-colors"
          >
            <Image size={24} className="text-yellow-500" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={takePhoto}
            className="w-20 h-20 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 flex items-center justify-center active:shadow-yellow-500/30 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center">
              <Camera size={28} className="text-black" />
            </div>
          </motion.button>

          <div className="w-16 h-16" />
        </div>
      )}
    </div>
  );
}
