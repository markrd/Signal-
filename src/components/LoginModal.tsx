import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUp: () => void;
    onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSignUp, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (signInError) throw signInError;
            if (data.user) {
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message?.includes('Invalid login')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Please check your email to confirm your account.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: window.location.origin
            });
            if (error) throw error;
            setError(null);
            alert('Password reset email sent! Check your inbox.');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal - Centered */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-start justify-center pt-[10vh] px-4 z-50 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md pointer-events-auto ring-1 ring-black/5">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-10 text-white">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <span className="text-2xl font-bold">Signal</span>
                                </div>
                                <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
                                <p className="text-sm text-white/70">Sign in to continue to your dashboard</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="p-8 space-y-5">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            required
                                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-zinc-700">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email || !password}
                                    className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                {/* Sign Up Link */}
                                <div className="text-center pt-4 border-t border-zinc-100">
                                    <span className="text-sm text-zinc-500">Don't have an account?</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onSignUp();
                                        }}
                                        className="ml-2 text-sm font-bold text-zinc-900 hover:underline"
                                    >
                                        Sign up for free
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
