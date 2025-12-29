import { useState } from 'react';
import { Lock, Rocket, Check, AlertCircle, User, Building, Mail, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { StepContainer, InputField } from './primitives';
import type { OnboardingData } from './primitives';
import { cn } from '../../lib/utils';

// =============================================================================
// STEP 8: PASSWORD SETUP & ACCOUNT CREATION
// =============================================================================

interface Step8PasswordProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onSubmit: () => Promise<void>;
    onBack: () => void;
    isSubmitting: boolean;
    submitError: string | null;
}

export function Step8Password({
    data,
    onUpdate,
    onSubmit,
    onBack,
    isSubmitting,
    submitError
}: Step8PasswordProps) {
    const [showPassword, setShowPassword] = useState(false);

    const passwordsMatch = data.password === data.confirmPassword;
    const passwordLongEnough = data.password.length >= 6;
    const isValid = passwordsMatch && passwordLongEnough && data.password.length > 0;

    return (
        <StepContainer
            title="Secure your account"
            subtitle="Almost there! Create a password to finish"
            icon={<Lock className="w-8 h-8 text-white" />}
        >
            {/* Profile Summary Card */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Your Profile Summary
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-900 font-medium">{data.fullName}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-600">{data.jobTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-600">{data.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-600">{data.email}</span>
                    </div>
                    {data.role === 'SIGNAL' && data.selectedPrice && (
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 font-semibold">${data.selectedPrice} per meeting</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
                <InputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(v) => onUpdate({ password: v })}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={data.password && !passwordLongEnough ? "At least 6 characters required" : undefined}
                />

                <InputField
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.confirmPassword}
                    onChange={(v) => onUpdate({ confirmPassword: v })}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={data.confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
                />

                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded border-zinc-300"
                    />
                    Show passwords
                </label>
            </div>

            {/* Error Message */}
            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl"
                >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{submitError}</span>
                </motion.div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="text-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-50"
                >
                    ← Back
                </button>

                <button
                    onClick={onSubmit}
                    disabled={!isValid || isSubmitting}
                    className={cn(
                        "flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg",
                        isValid && !isSubmitting
                            ? data.role === 'HUNTER'
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 shadow-blue-500/30"
                                : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 shadow-emerald-500/30"
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <Rocket className="w-5 h-5 animate-bounce" />
                            <span>Launching...</span>
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5" />
                            <span>Launch My Profile</span>
                        </>
                    )}
                </button>
            </div>
        </StepContainer>
    );
}

// =============================================================================
// SUCCESS SCREEN
// =============================================================================

interface SuccessScreenProps {
    data: OnboardingData;
    onContinue: () => void;
}

export function SuccessScreen({ data, onContinue }: SuccessScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto text-center"
        >
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl",
                    data.role === 'HUNTER'
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30"
                        : "bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/30"
                )}
            >
                <Check className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-zinc-900 mb-3"
            >
                You're all set, {data.fullName?.split(' ')[0]}! 🎉
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-500 text-lg mb-8"
            >
                {data.role === 'SIGNAL'
                    ? "Your listing is live. Get ready for meeting requests!"
                    : "Start browsing executives and book your first meeting."
                }
            </motion.p>

            {/* CTA Button */}
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={onContinue}
                className={cn(
                    "px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90",
                    data.role === 'HUNTER'
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-emerald-500/30"
                )}
            >
                {data.role === 'SIGNAL' ? "Go to Dashboard" : "Browse Marketplace"}
            </motion.button>
        </motion.div>
    );
}
