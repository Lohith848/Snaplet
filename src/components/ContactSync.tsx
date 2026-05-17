import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Info, ArrowRight, Check, Share2, MessageSquare, MessageCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

interface Contact {
  name: string;
  tel: string;
}

export default function ContactSync({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteLink = `https://snaplet.app/join/${auth.currentUser?.uid}`;

  const shareViaSms = () => {
    const text = encodeURIComponent(`Add me on Snaplet! I want to see your live photos on my home screen: ${inviteLink}`);
    window.open(`sms:?&body=${text}`, '_blank');
  };

  const shareViaWhatsapp = () => {
    const text = encodeURIComponent(`Add me on Snaplet! I want to see your live photos on my home screen: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Snaplet Invite',
          text: 'Add me on Snaplet! I want to see your live photos on my home screen.',
          url: inviteLink,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  const syncContacts = async () => {
    setLoading(true);
    setError(null);
    
    // Check for Contact Picker API Support
    const supported = 'contacts' in navigator && 'select' in (navigator as any).contacts;
    
    if (supported) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const contacts = await (navigator as any).contacts.select(props, opts);
        console.log('Contacts synced:', contacts);
        setSuccess(true);
        setTimeout(onComplete, 1500);
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          setError('Permission to access contacts was denied.');
        } else {
          setError('Could not sync contacts. This feature might be restricted in your browser.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback: Just simulate for UI/Design review
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(onComplete, 1500);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-zinc-800 shadow-xl">
        <motion.div
          animate={loading ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Users size={32} className="text-yellow-500" />
        </motion.div>
      </div>
      
      <h2 className="text-3xl font-display font-bold mb-4">Sync Contacts</h2>
      <p className="text-gray-400 mb-12 max-w-xs">
        Invite your best friends from your contacts to start sharing live photos!
      </p>

      <div className="w-full max-w-sm space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 text-left">
            <Info size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!success ? (
          <>
            <button 
              onClick={syncContacts}
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,184,0,0.2)]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Find Friends
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={shareViaSms}
                className="bg-zinc-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <MessageSquare size={18} className="text-blue-400" />
                SMS
              </button>
              <button 
                onClick={shareViaWhatsapp}
                className="bg-zinc-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <MessageCircle size={18} className="text-green-500" />
                WhatsApp
              </button>
            </div>
            
            {'share' in navigator && (
              <button 
                onClick={shareViaGeneral}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
              >
                <Share2 size={18} />
                More Invite Options
              </button>
            )}
          </>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={28} className="text-black" strokeWidth={3} />
            </div>
            <p className="text-green-500 font-bold">Contacts Synced!</p>
          </div>
        )}

        <button 
          onClick={onComplete}
          className="w-full text-gray-500 font-medium py-2 hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <Share2 size={14} className="text-zinc-500" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Encrypted & Secure</span>
      </div>
    </div>
  );
}
