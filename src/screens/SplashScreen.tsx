import React, { useEffect } from 'react';
import { Wind, Shield, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { auth, navigate } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (auth && auth.accessToken) {
        navigate('main');
      } else {
        navigate('login');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [auth, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-radial from-slate-900 via-slate-950 to-[#0B0F19] text-white">
      <div className="flex flex-col items-center animate-fade-in relative">
        {/* Glow Halo */}
        <div className="absolute -inset-8 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Icon */}
        <div className="relative mb-5 p-5 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.5)]">
          <Wind className="w-14 h-14 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span>AIRVPN</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            v2.0
          </span>
        </h1>
        <p className="mt-2 text-xs font-mono uppercase tracking-widest text-cyan-400/80">
          Quantum Speed • Zero-Log Architecture
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};
