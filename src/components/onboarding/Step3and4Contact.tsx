import { Mail, Zap, Target } from 'lucide-react';
import { StepContainer, StepNavButtons, InputField, ChipGrid } from './primitives';
import type { OnboardingData } from './primitives';

// =============================================================================
// STEP 3: EMAIL INPUT
// =============================================================================

interface Step3EmailProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step3Email({ data, onUpdate, onContinue, onBack }: Step3EmailProps) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

    return (
        <StepContainer
            title="What's your work email?"
            subtitle="We'll use this to notify you of new opportunities"
            icon={<Mail className="w-8 h-8 text-white" />}
        >
            <InputField
                value={data.email}
                onChange={(v) => onUpdate({ email: v })}
                type="email"
                placeholder="you@company.com"
                autoFocus
                error={data.email && !isValidEmail ? "Please enter a valid email" : undefined}
            />

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!isValidEmail}
                role={data.role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 4: INTERESTS PICKER
// =============================================================================

const INTEREST_OPTIONS = [
    'AI/ML',
    'Cloud Infrastructure',
    'DevOps',
    'Cybersecurity',
    'Data Engineering',
    'Product Management',
    'Sales Operations',
    'Marketing Tech',
    'FinTech',
    'Healthcare Tech',
    'E-commerce',
    'Developer Tools',
];

interface Step4InterestsProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step4Interests({ data, onUpdate, onContinue, onBack }: Step4InterestsProps) {
    const hasEnough = data.interests.length >= 1;

    return (
        <StepContainer
            title="What areas do you focus on?"
            subtitle="Select all that apply to your work"
            icon={data.role === 'HUNTER' ? <Target className="w-8 h-8 text-white" /> : <Zap className="w-8 h-8 text-white" />}
        >
            <ChipGrid
                options={INTEREST_OPTIONS}
                selected={data.interests}
                onChange={(interests) => onUpdate({ interests })}
                columns={3}
                role={data.role}
                allowCustom
            />

            <div className="text-sm text-zinc-500 text-center">
                {data.interests.length === 0
                    ? "Select at least one area"
                    : `${data.interests.length} selected`}
            </div>

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!hasEnough}
                role={data.role}
            />
        </StepContainer>
    );
}
