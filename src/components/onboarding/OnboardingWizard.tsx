import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Linkedin, Loader2, Edit3, CheckCircle, Shield, Mail, Lock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Role } from './primitives';

// =============================================================================
// STREAMLINED ONBOARDING WIZARD
// Step 0: Role Selection
// Step 1: LinkedIn OAuth or Email Signup
// After auth: Redirect to conversational profile completion
// =============================================================================

interface OnboardingWizardProps {
    onComplete: () => void;
    onBack?: () => void;
}

export function OnboardingWizard({ onComplete, onBack }: OnboardingWizardProps) {
    const [step, setStep] = useState(0);
    const [role, setRole] = useState<Role | null>(null);
    const [authMode, setAuthMode] = useState<'oauth' | 'email' | null>(null);

    // Email signup state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRoleSelect = (selectedRole: Role) => {
        setRole(selectedRole);
        // Store role for after OAuth redirect
        localStorage.setItem('signal_onboarding_role', selectedRole);
        setStep(1);
    };

    const handleLinkedInOAuth = async () => {
        if (!role) return;
        setIsLoading(true);
        setError(null);

        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'linkedin_oidc',
                options: {
                    redirectTo: `${window.location.origin}?oauth=linkedin`,
                    scopes: 'openid profile email',
                }
            });

            if (oauthError) throw oauthError;
            // User will be redirected to LinkedIn
        } catch (err: any) {
            console.error('LinkedIn OAuth error:', err);
            setError(err.message || 'Failed to connect to LinkedIn');
            setIsLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setIsLoading(true);
        setError(null);

        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            // Create profile with minimal data - rest will be collected via conversation
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                email: email.trim(),
                role: role,
                full_name: fullName.trim() || null,
                verified: false,
                metadata: {
                    signupMethod: 'email',
                }
            });

            if (profileError) throw profileError;

            // Done - will redirect to conversational completion
            onComplete();
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.message?.includes('already registered')) {
                setError('This email is already registered. Try logging in instead.');
            } else {
                setError(err.message || 'Signup failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 0) {
            onBack?.();
        } else if (step === 1 && authMode) {
            setAuthMode(null);
        } else {
            setStep(s => Math.max(0, s - 1));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Back button */}
                {(step > 0 || onBack) && (
                    <button
                        onClick={handleBack}
                        disabled={isLoading}
                        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 0: Role Selection */}
                    {step === 0 && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                                    Welcome to Signal
                                </h1>
                                <p className="text-zinc-500">
                                    How would you like to use Signal?
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleRoleSelect('SIGNAL')}
                                    className="w-full p-4 bg-white border-2 border-zinc-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">👔</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700">
                                                I'm an Executive
                                            </h3>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                Get paid for meeting requests from qualified vendors
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRoleSelect('HUNTER')}
                                    className="w-full p-4 bg-white border-2 border-zinc-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900 group-hover:text-blue-700">
                                                I'm a Sales Leader
                                            </h3>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                Book meetings with decision-makers at target companies
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: Auth Choice */}
                    {step === 1 && !authMode && (
                        <motion.div
                            key="auth-choice"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${role === 'SIGNAL'
                                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                    }`}>
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                                    Create your account
                                </h1>
                                <p className="text-zinc-500">
                                    Choose how you'd like to sign up
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* LinkedIn OAuth - recommended */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleLinkedInOAuth}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 
                                               bg-[#0A66C2] text-white rounded-xl font-bold text-lg
                                               shadow-lg shadow-blue-500/30
                                               hover:bg-[#004182] transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Linkedin className="w-5 h-5" />
                                            Continue with LinkedIn
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Verified profile badge • Auto-fill your info</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gradient-to-br from-zinc-50 to-white px-3 text-zinc-400 font-medium">
                                        or
                                    </span>
                                </div>
                            </div>

                            {/* Email signup option */}
                            <button
                                onClick={() => setAuthMode('email')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                           text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                            >
                                <Edit3 className="w-4 h-4" />
                                Sign up with email
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1b: Email Signup Form */}
                    {step === 1 && authMode === 'email' && (
                        <motion.div
                            key="email-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                                    Create your account
                                </h1>
                                <p className="text-zinc-500">
                                    Enter your details to get started
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleEmailSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Jane Smith"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm 
                                                   focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 
                                                   outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                        Work Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            required
                                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm 
                                                       focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 
                                                       outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm 
                                                       focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 
                                                       outline-none transition-all"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        At least 6 characters
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email || !password}
                                    className={`w-full py-3 rounded-xl font-medium transition-all 
                                               disabled:opacity-50 disabled:cursor-not-allowed
                                               flex items-center justify-center gap-2 ${role === 'SIGNAL'
                                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
