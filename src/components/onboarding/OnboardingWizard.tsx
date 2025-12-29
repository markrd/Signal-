import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
    initialOnboardingData,
    saveProgress,
    loadProgress,
    clearProgress,
    ProgressBar,
} from './primitives';
import type { OnboardingData, Role } from './primitives';
import { RoleSelector } from './Step0Role';
import { Step1LinkedIn, Step2Profile } from './Step1and2Profile';
import { Step3Email, Step4Interests } from './Step3and4Contact';
import { Step5ABuyingStage, Step6ATechStack, Step7APricing } from './StepsExecutive';
import { Step5BTargetCriteria, Step6BProduct, Step7BBudget } from './StepsHunter';
import { Step8Password, SuccessScreen } from './Step8Password';
import { supabase } from '../../lib/supabase';

// =============================================================================
// MAIN WIZARD COMPONENT
// =============================================================================

interface OnboardingWizardProps {
    onComplete: () => void;
    onBack?: () => void;
}

export function OnboardingWizard({ onComplete, onBack }: OnboardingWizardProps) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(initialOnboardingData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Calculate total steps based on role
    const totalSteps = data.role ? 8 : 0;

    // Load saved progress on mount
    useEffect(() => {
        const saved = loadProgress();
        if (saved && saved.data.role) {
            setData(saved.data);
            setStep(saved.step);
        }
    }, []);

    // Save progress on changes
    useEffect(() => {
        if (step > 0 && data.role) {
            saveProgress(data, step);
        }
    }, [data, step]);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const handleRoleSelect = (role: Role) => {
        updateData({ role });
        setStep(1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            // Create profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                email: data.email,
                role: data.role,
                full_name: data.fullName,
                company: data.company,
                verified: false,
                metadata: {
                    jobTitle: data.jobTitle,
                    industry: data.industry,
                    linkedIn: data.linkedInUrl,
                    interests: data.interests,
                    // Executive-specific
                    buyingStage: data.buyingStage || undefined,
                    techStack: data.techStack.length > 0 ? data.techStack : undefined,
                    // Hunter-specific
                    targetIndustries: data.targetIndustries.length > 0 ? data.targetIndustries : undefined,
                    targetSeniority: data.targetSeniority.length > 0 ? data.targetSeniority : undefined,
                    productDescription: data.productDescription || undefined,
                    dealSizeRange: data.dealSizeRange || undefined,
                },
            });

            if (profileError && !profileError.message.includes('duplicate key')) {
                throw profileError;
            }

            // Create listing for Executives
            if (data.role === 'SIGNAL') {
                await supabase.from('listings').insert({
                    user_id: authData.user.id,
                    type: 'access',
                    title: data.jobTitle,
                    description: data.interests.join(', ') || 'Available for meetings',
                    price: data.selectedPrice || data.suggestedPrice || 300,
                    tags: [...data.techStack, ...data.interests].slice(0, 10),
                    status: 'active',
                });
            }

            // Clear saved progress
            clearProgress();

            // Show success screen
            setShowSuccess(true);

        } catch (err: any) {
            console.error('Account creation error:', err);
            setSubmitError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <SuccessScreen data={data} onContinue={onComplete} />
            </div>
        );
    }

    // Role selection (Step 0)
    if (step === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <RoleSelector onSelect={handleRoleSelect} onBack={onBack} />
            </div>
        );
    }

    // Wizard steps
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header with progress */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
                <div className="max-w-lg mx-auto">
                    {/* Back to home */}
                    {onBack && step === 1 && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to Home</span>
                        </button>
                    )}

                    <ProgressBar
                        currentStep={step}
                        totalSteps={totalSteps}
                        role={data.role}
                    />
                </div>
            </header>

            {/* Step content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </main>
        </div>
    );

    function renderStep() {
        const commonProps = {
            data,
            onUpdate: updateData,
            onContinue: nextStep,
            onBack: prevStep,
        };

        switch (step) {
            case 1:
                return <Step1LinkedIn key="step1" {...commonProps} />;
            case 2:
                return <Step2Profile key="step2" {...commonProps} />;
            case 3:
                return <Step3Email key="step3" {...commonProps} />;
            case 4:
                return <Step4Interests key="step4" {...commonProps} />;
            case 5:
                return data.role === 'SIGNAL'
                    ? <Step5ABuyingStage key="step5a" {...commonProps} />
                    : <Step5BTargetCriteria key="step5b" {...commonProps} />;
            case 6:
                return data.role === 'SIGNAL'
                    ? <Step6ATechStack key="step6a" {...commonProps} />
                    : <Step6BProduct key="step6b" {...commonProps} />;
            case 7:
                return data.role === 'SIGNAL'
                    ? <Step7APricing key="step7a" {...commonProps} />
                    : <Step7BBudget key="step7b" {...commonProps} />;
            case 8:
                return (
                    <Step8Password
                        key="step8"
                        data={data}
                        onUpdate={updateData}
                        onSubmit={handleSubmit}
                        onBack={prevStep}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                    />
                );
            default:
                return null;
        }
    }
}
