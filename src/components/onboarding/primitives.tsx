import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type Role = 'SIGNAL' | 'HUNTER';

export interface OnboardingData {
    // Role
    role: Role | null;

    // Profile (Step 1-2)
    linkedInUrl: string;
    fullName: string;
    jobTitle: string;
    company: string;
    industry: string;

    // Contact (Step 3)
    email: string;

    // Interests (Step 4)
    interests: string[];

    // Executive-specific (Steps 5A, 6A, 7A)
    buyingStage: 'active' | 'researching' | 'planning' | 'exploring' | '';
    techStack: string[];
    suggestedPrice: number;
    selectedPrice: number;

    // Hunter-specific (Steps 5B, 6B, 7B)
    targetIndustries: string[];
    targetSeniority: string[];
    productDescription: string;
    dealSizeRange: string;

    // Account (Step 8)
    password: string;
    confirmPassword: string;
}

export const initialOnboardingData: OnboardingData = {
    role: null,
    linkedInUrl: '',
    fullName: '',
    jobTitle: '',
    company: '',
    industry: '',
    email: '',
    interests: [],
    buyingStage: '',
    techStack: [],
    suggestedPrice: 300,
    selectedPrice: 300,
    targetIndustries: [],
    targetSeniority: [],
    productDescription: '',
    dealSizeRange: '',
    password: '',
    confirmPassword: '',
};

// =============================================================================
// STORAGE HELPERS
// =============================================================================

const STORAGE_KEY = 'signal_onboarding_progress';

export function saveProgress(data: OnboardingData, step: number) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step, timestamp: Date.now() }));
    } catch (e) {
        console.warn('Failed to save onboarding progress:', e);
    }
}

export function loadProgress(): { data: OnboardingData; step: number } | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        // Expire after 24 hours
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return { data: parsed.data, step: parsed.step };
    } catch (e) {
        return null;
    }
}

export function clearProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

// =============================================================================
// PROGRESS BAR COMPONENT
// =============================================================================

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    role: Role | null;
}

export function ProgressBar({ currentStep, totalSteps, role }: ProgressBarProps) {
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="w-full">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-zinc-400">
                    {Math.round(progress)}% complete
                </span>
            </div>

            {/* Progress track */}
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <motion.div
                    className={cn(
                        "h-full rounded-full",
                        role === 'SIGNAL'
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                            : role === 'HUNTER'
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                : "bg-gradient-to-r from-zinc-400 to-zinc-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

// =============================================================================
// STEP CONTAINER COMPONENT
// =============================================================================

interface StepContainerProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    icon?: ReactNode;
}

export function StepContainer({ children, title, subtitle, icon }: StepContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-lg mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-8">
                {icon && (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                        {icon}
                    </div>
                )}
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">{title}</h2>
                {subtitle && (
                    <p className="text-zinc-500">{subtitle}</p>
                )}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );
}

// =============================================================================
// STEP NAVIGATION BUTTONS
// =============================================================================

interface StepNavButtonsProps {
    onBack?: () => void;
    onContinue: () => void;
    continueLabel?: string;
    continueDisabled?: boolean;
    isLoading?: boolean;
    showBack?: boolean;
    role?: Role | null;
}

export function StepNavButtons({
    onBack,
    onContinue,
    continueLabel = "Continue",
    continueDisabled = false,
    isLoading = false,
    showBack = true,
    role = null,
}: StepNavButtonsProps) {
    return (
        <div className="flex items-center justify-between pt-6">
            {showBack && onBack ? (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                </button>
            ) : (
                <div />
            )}

            <button
                onClick={onContinue}
                disabled={continueDisabled || isLoading}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg",
                    continueDisabled || isLoading
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                        : role === 'HUNTER'
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 shadow-blue-500/30"
                            : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 shadow-emerald-500/30"
                )}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <span>{continueLabel}</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
}

// =============================================================================
// CHIP GRID COMPONENT (Reusable multi-select)
// =============================================================================

interface ChipGridProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    columns?: number;
    role?: Role | null;
    allowCustom?: boolean;
}

export function ChipGrid({
    options,
    selected,
    onChange,
    columns = 3,
    role = null,
    allowCustom = false,
}: ChipGridProps) {
    const [customInput, setCustomInput] = useState('');

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const addCustom = () => {
        const trimmed = customInput.trim();
        if (trimmed && !selected.includes(trimmed)) {
            onChange([...selected, trimmed]);
            setCustomInput('');
        }
    };

    return (
        <div className="space-y-3">
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
                {options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                        <motion.button
                            key={option}
                            onClick={() => toggleOption(option)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                isSelected
                                    ? role === 'HUNTER'
                                        ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30"
                                        : "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30"
                                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                            )}
                        >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {option}
                        </motion.button>
                    );
                })}
            </div>

            {allowCustom && (
                <div className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                        placeholder="Add custom..."
                        className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-400"
                    />
                    <button
                        onClick={addCustom}
                        disabled={!customInput.trim()}
                        className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            )}

            {/* Show custom selections */}
            {selected.filter(s => !options.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                    {selected.filter(s => !options.includes(s)).map((custom) => (
                        <span
                            key={custom}
                            className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
                                role === 'HUNTER'
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-emerald-100 text-emerald-700"
                            )}
                        >
                            {custom}
                            <button
                                onClick={() => toggleOption(custom)}
                                className="hover:opacity-70"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================================================
// RADIO CARD GROUP COMPONENT
// =============================================================================

interface RadioOption {
    value: string;
    label: string;
    description?: string;
}

interface RadioCardGroupProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    role?: Role | null;
}

export function RadioCardGroup({ options, value, onChange, role }: RadioCardGroupProps) {
    return (
        <div className="space-y-3">
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <motion.button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "w-full p-4 rounded-xl text-left transition-all border-2",
                            isSelected
                                ? role === 'HUNTER'
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-emerald-500 bg-emerald-50"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    isSelected
                                        ? role === 'HUNTER'
                                            ? "border-blue-500"
                                            : "border-emerald-500"
                                        : "border-zinc-300"
                                )}
                            >
                                {isSelected && (
                                    <div
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            role === 'HUNTER' ? "bg-blue-500" : "bg-emerald-500"
                                        )}
                                    />
                                )}
                            </div>
                            <div>
                                <div className="font-semibold text-zinc-900">{option.label}</div>
                                {option.description && (
                                    <div className="text-sm text-zinc-500">{option.description}</div>
                                )}
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

// =============================================================================
// INPUT FIELD COMPONENT
// =============================================================================

interface InputFieldProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'url';
    icon?: ReactNode;
    error?: string;
    hint?: string;
    autoFocus?: boolean;
}

export function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
    error,
    hint,
    autoFocus = false,
}: InputFieldProps) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-zinc-700">{label}</label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl text-zinc-900 outline-none transition-all",
                        icon && "pl-10",
                        error
                            ? "border-red-300 focus:border-red-500"
                            : "border-zinc-200 focus:border-emerald-500"
                    )}
                />
            </div>
            {hint && !error && (
                <p className="text-sm text-zinc-500">{hint}</p>
            )}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
