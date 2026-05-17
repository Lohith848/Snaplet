import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Apple, Check, Info, X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export default function WidgetSetup({ onClose }: Props) {
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  const steps = platform === 'ios' ? [
    { text: "Tap the 'Share' icon in Safari", icon: <Smartphone size={16} /> },
    { text: "Scroll down and tap 'Add to Home Screen'", icon: <Plus size={16} /> },
    { text: "Open the Snaplet app from your home screen", icon: <Check size={16} /> },
    { text: "Long-press your home screen and add the Snaplet widget", icon: <Info size={16} /> }
  ] : [
    { text: "Tap the three dots in Chrome", icon: <Smartphone size={16} /> },
    { text: "Tap 'Install App' or 'Add to Home Screen'", icon: <Smartphone size={16} /> },
    { text: "Long-press the app icon and select 'Widgets'", icon: <Info size={16} /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col p-6">
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-bold">Setup Widget</h2>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400">
          <X size={20} />
        </button>
      </header>

      {!platform ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-gray-400 text-center mb-4">Choose your device to see instructions</p>
          <button 
            onClick={() => setPlatform('ios')}
            className="w-full max-w-xs bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-yellow-500 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Apple size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold">iPhone / iPad</p>
              <p className="text-xs text-zinc-500">iOS Guide</p>
            </div>
          </button>

          <button 
            onClick={() => setPlatform('android')}
            className="w-full max-w-xs bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl flex items-center gap-4 hover:border-yellow-500 transition-all"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Smartphone size={24} className="text-green-500" />
            </div>
            <div className="text-left">
              <p className="font-bold">Android Device</p>
              <p className="text-xs text-zinc-500">Samsung, Pixel, etc.</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <button 
            onClick={() => setPlatform(null)}
            className="text-yellow-500 text-sm font-bold mb-6 flex items-center gap-1"
          >
            Change device
          </button>
          
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex gap-4 items-start p-4 bg-zinc-900 rounded-2xl"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="font-medium pt-1">{step.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl text-center">
            <p className="text-yellow-500 text-sm font-medium mb-2">Pro Tip</p>
            <p className="text-zinc-400 text-sm italic">
              "Snaplet works best when added as a PWA first!"
            </p>
          </div>

          <button 
            onClick={onClose}
            className="mt-auto w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}
