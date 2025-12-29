import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, ArrowRight, Zap, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUp: () => void;
    onSuccess: () => void;
}

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

export function LoginModal({ isOpen, onClose, onSignUp, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<'linkedin' | 'google' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
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
                setError('Invalid email or password. Please check your credentials.');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Please check your email to confirm your account before logging in.');
            } else if (err.message?.includes('rate limit')) {
                setError('Too many login attempts. Please wait a moment and try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'linkedin_oidc' | 'google') => {
        const providerName = provider === 'linkedin_oidc' ? 'linkedin' : 'google';
        setSocialLoading(providerName);
        setError(null);

        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}?oauth=${providerName}`,
                    ...(provider === 'linkedin_oidc' && { scopes: 'openid profile email' })
                }
            });

            if (oauthError) throw oauthError;
            // User will be redirected
        } catch (err: any) {
            console.error(`${providerName} OAuth error:`, err);
            if (err.message?.includes('not enabled')) {
                setError(`${providerName === 'google' ? 'Google' : 'LinkedIn'} login is not configured. Please use email/password.`);
            } else {
                setError(err.message || `Failed to connect to ${providerName}. Please try again.`);
            }
            setSocialLoading(null);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            setSuccessMessage('Password reset email sent! Check your inbox.');
        } catch (err: any) {
            if (err.message?.includes('rate limit')) {
                setError('Please wait before requesting another reset email.');
            } else {
                setError(err.message || 'Failed to send reset email.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || socialLoading !== null;

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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-start justify-center pt-[8vh] px-4 z-50 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md pointer-events-auto ring-1 ring-black/5">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-8 text-white">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <span className="text-xl font-bold">Signal</span>
                                </div>
                                <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
                                <p className="text-sm text-white/70">Sign in to continue to your dashboard</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Error message */}
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {successMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                                        >
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Social Login Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSocialLogin('linkedin_oidc')}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 
                                                   bg-[#0A66C2] text-white rounded-xl font-medium
                                                   hover:bg-[#004182] transition-all disabled:opacity-50
                                                   shadow-lg shadow-blue-500/20"
                                    >
                                        {socialLoading === 'linkedin' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Linkedin className="w-5 h-5" />
                                        )}
                                        Continue with LinkedIn
                                    </button>

                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 
                                                   bg-white border-2 border-zinc-200 text-zinc-700 rounded-xl font-medium
                                                   hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50"
                                    >
                                        {socialLoading === 'google' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <GoogleIcon className="w-5 h-5" />
                                        )}
                                        Continue with Google
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-3 text-zinc-400 font-medium">
                                            or continue with email
                                        </span>
                                    </div>
                                </div>

                                {/* Email/Password Form */}
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                required
                                                disabled={isLoading}
                                                className="w-full pl-11 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm 
                                                           focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 
                                                           outline-none transition-all disabled:bg-zinc-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-sm font-medium text-zinc-700">
                                                Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={isLoading}
                                                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                disabled={isLoading}
                                                className="w-full pl-11 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm 
                                                           focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 
                                                           outline-none transition-all disabled:bg-zinc-50"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email || !password}
                                        className="w-full py-2.5 bg-zinc-900 text-white font-medium rounded-xl 
                                                   hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                                                   flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Sign Up Link */}
                                <div className="text-center pt-3 border-t border-zinc-100">
                                    <span className="text-sm text-zinc-500">Don't have an account?</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onSignUp();
                                        }}
                                        disabled={isLoading}
                                        className="ml-2 text-sm font-bold text-zinc-900 hover:underline disabled:opacity-50"
                                    >
                                        Sign up for free
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
