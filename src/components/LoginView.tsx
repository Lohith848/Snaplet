import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Mail, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onLoginSuccess: () => void;
}

type LoginStep = 'method' | 'email' | 'otp';

export default function LoginView({ onLoginSuccess }: Props) {
  const [step, setStep] = useState<LoginStep>('method');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setStep('otp');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // OTP verified, user is now signed in
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (err) {
        setError(err.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed. Make sure OAuth is configured in Supabase.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-yellow-500 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,184,0,0.3)]"
      >
        <Camera size={48} className="text-black" strokeWidth={2.5} />
      </motion.div>

      <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">Snaplit</h1>
      <p className="text-gray-400 text-center mb-12 max-w-xs">
        Live photos from your best friends, right on your Home Screen.
      </p>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm"
      >
        {step === 'method' && (
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </>
              )}
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with email</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('email')}
              className="w-full bg-zinc-900 text-white font-semibold py-4 rounded-2xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3 border border-zinc-800"
            >
              <Mail size={20} />
              Continue with Email
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-4">
            <button 
              onClick={() => {
                setStep('method');
                setError(null);
                setEmail('');
              }}
              className="text-gray-400 text-sm hover:text-white mb-4"
            >
              ← Back
            </button>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-yellow-500 outline-none rounded-2xl py-4 px-4 font-medium transition-all text-white placeholder-gray-500"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !email}
                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <button 
              onClick={() => {
                setStep('email');
                setError(null);
                setOtp('');
              }}
              className="text-gray-400 text-sm hover:text-white mb-4"
            >
              ← Back
            </button>

            <div>
              <p className="text-gray-400 text-sm mb-4">
                Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-yellow-500 outline-none rounded-2xl py-4 px-4 font-mono text-2xl text-center font-bold transition-all text-white tracking-widest"
                required
              />

              <button 
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <button 
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full text-gray-400 hover:text-white text-sm py-2"
            >
              Didn't receive a code? Resend
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <div className="mt-12 text-center text-gray-500 text-xs max-w-xs">
        <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-4 text-gray-600">
          <strong>Note:</strong> If Google login fails, ensure OAuth is configured in your Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
