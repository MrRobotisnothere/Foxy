import React, { useState } from 'react';
import { Wind, Sparkles, Loader2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logger } from '../services/logger';

export const LoginScreen: React.FC = () => {
  const { setAuth, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [awaitingTwoFactor, setAwaitingTwoFactor] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      logger.i('AuthService', `Authenticating with AIRVPN Cloud: ${email}`);
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      if (data.needsVerification) {
        setSessionToken(data.sessionToken);
        setAwaitingTwoFactor(true);
      } else {
        setAuth({
          email: email.trim(),
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAtEpochSeconds: data.expiresAtEpochSeconds,
          user: data.user,
        });
        logger.i('AuthService', 'AIRVPN session active');
        navigate('main');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const resp = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), sessionToken }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Invalid code');

      setAuth({
        email: email.trim(),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAtEpochSeconds: data.expiresAtEpochSeconds,
        user: data.user,
      });
      navigate('main');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setAuth({
      email: 'quantum.pilot@airvpn.io',
      accessToken: 'air_acc_' + Date.now(),
      refreshToken: 'air_ref_' + Date.now(),
      expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 86400 * 30,
      user: {
        uid: 'air_usr_quantum77',
        subscribed: true,
        maxBytes: 107374182400, // 100 GB
        limitedBandwidth: false,
        quotaRemaining: 98765432100,
      },
    });
    logger.i('AuthService', 'Demo user authenticated with 100 GB allowance');
    navigate('main');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0F19] text-slate-100">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Wind className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-cyan-400 font-semibold block">
              Quantum Secure Gateway
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              AIRVPN
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Sign in to unlock ultra-high-speed WireGuard nodes, military-grade encryption, and unlimited private tunneling.
        </p>

        {!awaitingTwoFactor ? (
          <form onSubmit={handleStartLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                AIRVPN Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@airvpn.io"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 text-sm transition"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition transform active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              Confirmation code dispatched to <span className="text-cyan-400 font-semibold">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirmation Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                autoFocus
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white tracking-widest text-center text-lg font-mono focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAwaitingTwoFactor(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition text-xs font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-cyan-500 text-slate-950 text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
              >
                Verify & Launch
              </button>
            </div>
          </form>
        )}

        {/* 1-Tap Quick Start */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Launch with Instant Pass (Unlimited)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
