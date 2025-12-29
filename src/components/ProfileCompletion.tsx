import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, Sparkles, Loader2, CheckCircle, Target } from 'lucide-react';
import { StepContainer, InputField, ChipGrid, StepNavButtons, ProgressBar } from './onboarding/primitives';
import type { Role } from './onboarding/primitives';
import { supabase } from '../lib/supabase';

// =============================================================================
// PROFILE COMPLETION WIZARD
// Shows after OAuth when profile is missing key fields
// =============================================================================

interface ProfileCompletionProps {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: Role;
    onComplete: () => void;
}

interface CompletionData {
    jobTitle: string;
    company: string;
    industry: string;
    interests: string[];
    techStack: string[];
}

const INTEREST_OPTIONS = [
    'AI/ML', 'Cloud', 'Security', 'DevOps', 'Data',
    'Mobile', 'SaaS', 'Fintech', 'Healthcare', 'E-commerce',
    'Enterprise', 'Startup'
];

const TECH_OPTIONS = [
    'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker',
    'React', 'Node.js', 'Python', 'Go', 'Java',
    'PostgreSQL', 'MongoDB', 'Snowflake', 'Databricks'
];

export function ProfileCompletion({
    userId,
    userEmail,
    userName,
    userRole,
    onComplete
}: ProfileCompletionProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [data, setData] = useState<CompletionData>({
        jobTitle: '',
        company: '',
        industry: '',
        interests: [],
        techStack: [],
    });

    const updateData = (updates: Partial<CompletionData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Update profile with completed data
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: userName,
                    company: data.company,
                    metadata: {
                        jobTitle: data.jobTitle,
                        industry: data.industry,
                        interests: data.interests,
                        techStack: data.techStack,
                        profileCompleted: true,
                        completedAt: new Date().toISOString(),
                    }
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // If executive, create a listing
            if (userRole === 'SIGNAL') {
                await supabase.from('listings').upsert({
                    user_id: userId,
                    type: 'access',
                    title: data.jobTitle,
                    description: data.interests.join(', ') || 'Available for meetings',
                    price: 300, // Default price
                    tags: [...data.techStack, ...data.interests].slice(0, 10),
                    status: 'active',
                }, { onConflict: 'user_id' });
            }

            onComplete();
        } catch (err: any) {
            console.error('Profile completion error:', err);
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 3;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900">Welcome, {userName}!</p>
                            <p className="text-sm text-zinc-500">Complete your profile to get started</p>
                        </div>
                    </div>
                    <ProgressBar currentStep={step} totalSteps={totalSteps} role={userRole} />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <Step1Professional
                            key="step1"
                            data={data}
                            onUpdate={updateData}
                            onContinue={nextStep}
                            role={userRole}
                        />
                    )}
                    {step === 2 && (
                        <Step2Focus
                            key="step2"
                            data={data}
                            onUpdate={updateData}
                            onContinue={nextStep}
                            onBack={prevStep}
                            role={userRole}
                        />
                    )}
                    {step === 3 && (
                        <Step3TechStack
                            key="step3"
                            data={data}
                            onUpdate={updateData}
                            onSubmit={handleSubmit}
                            onBack={prevStep}
                            role={userRole}
                            isSubmitting={isSubmitting}
                            error={error}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// =============================================================================
// STEP 1: PROFESSIONAL INFO
// =============================================================================

interface StepProps {
    data: CompletionData;
    onUpdate: (updates: Partial<CompletionData>) => void;
    onContinue: () => void;
    onBack?: () => void;
    role: Role;
}

function Step1Professional({ data, onUpdate, onContinue, role }: StepProps) {
    const isValid = data.jobTitle.trim() && data.company.trim();

    return (
        <StepContainer
            title="Your professional info"
            subtitle="This helps us match you with the right connections"
            icon={<Briefcase className="w-8 h-8 text-white" />}
        >
            <div className="space-y-4">
                <InputField
                    label="Job Title"
                    value={data.jobTitle}
                    onChange={(v) => onUpdate({ jobTitle: v })}
                    placeholder={role === 'SIGNAL' ? "VP of Engineering" : "Account Executive"}
                    autoFocus
                />

                <InputField
                    label="Company"
                    value={data.company}
                    onChange={(v) => onUpdate({ company: v })}
                    placeholder="Acme Corp"
                />

                <InputField
                    label="Industry"
                    value={data.industry}
                    onChange={(v) => onUpdate({ industry: v })}
                    placeholder="B2B SaaS"
                    hint="What industry are you in or selling to?"
                />
            </div>

            <StepNavButtons
                onContinue={onContinue}
                continueDisabled={!isValid}
                showBack={false}
                role={role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 2: FOCUS AREAS
// =============================================================================

function Step2Focus({ data, onUpdate, onContinue, onBack, role }: StepProps) {
    const isValid = data.interests.length > 0;

    return (
        <StepContainer
            title={role === 'SIGNAL' ? "What are you focused on?" : "What solutions do you offer?"}
            subtitle={role === 'SIGNAL'
                ? "Select areas you're actively exploring or investing in"
                : "Select categories that match your product/service"
            }
            icon={<Target className="w-8 h-8 text-white" />}
        >
            <ChipGrid
                options={INTEREST_OPTIONS}
                selected={data.interests}
                onChange={(v) => onUpdate({ interests: v })}
                columns={3}
                role={role}
                allowCustom
            />

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!isValid}
                role={role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 3: TECH STACK
// =============================================================================

interface Step3Props {
    data: CompletionData;
    onUpdate: (updates: Partial<CompletionData>) => void;
    onSubmit: () => void;
    onBack: () => void;
    role: Role;
    isSubmitting: boolean;
    error: string | null;
}

function Step3TechStack({ data, onUpdate, onSubmit, onBack, role, isSubmitting, error }: Step3Props) {
    return (
        <StepContainer
            title={role === 'SIGNAL' ? "Your tech environment" : "Technologies you work with"}
            subtitle="Select technologies relevant to your work"
            icon={<Sparkles className="w-8 h-8 text-white" />}
        >
            <ChipGrid
                options={TECH_OPTIONS}
                selected={data.techStack}
                onChange={(v) => onUpdate({ techStack: v })}
                columns={4}
                role={role}
                allowCustom
            />

            {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    ← Back
                </button>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                        ${role === 'HUNTER'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-emerald-500/30'
                        }
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                    `}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Complete Profile</span>
                        </>
                    )}
                </button>
            </div>
        </StepContainer>
    );
}
