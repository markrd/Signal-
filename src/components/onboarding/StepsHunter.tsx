import { Building, Package, DollarSign } from 'lucide-react';
import { StepContainer, StepNavButtons, RadioCardGroup, ChipGrid } from './primitives';
import type { OnboardingData } from './primitives';

// =============================================================================
// STEP 5B: TARGET CRITERIA (Hunter)
// =============================================================================

const TARGET_INDUSTRIES = [
    'B2B SaaS',
    'FinTech',
    'Healthcare',
    'E-commerce',
    'Enterprise',
    'SMB',
    'Cybersecurity',
    'DevOps',
    'Data/Analytics',
    'Marketing Tech',
    'HR Tech',
    'EdTech',
];

const TARGET_SENIORITY = [
    'C-Level (CEO, CTO, CFO)',
    'VP Level',
    'Director Level',
    'Manager Level',
];

interface Step5BTargetCriteriaProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step5BTargetCriteria({ data, onUpdate, onContinue, onBack }: Step5BTargetCriteriaProps) {
    const hasEnough = data.targetIndustries.length >= 1 && data.targetSeniority.length >= 1;

    return (
        <StepContainer
            title="Who are you looking to connect with?"
            subtitle="Define your ideal executive profile"
            icon={<Building className="w-8 h-8 text-white" />}
        >
            <div className="space-y-6">
                {/* Target Industries */}
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-3">
                        Target Industries
                    </label>
                    <ChipGrid
                        options={TARGET_INDUSTRIES}
                        selected={data.targetIndustries}
                        onChange={(targetIndustries) => onUpdate({ targetIndustries })}
                        columns={3}
                        role={data.role}
                    />
                </div>

                {/* Target Seniority */}
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-3">
                        Target Seniority
                    </label>
                    <ChipGrid
                        options={TARGET_SENIORITY}
                        selected={data.targetSeniority}
                        onChange={(targetSeniority) => onUpdate({ targetSeniority })}
                        columns={2}
                        role={data.role}
                    />
                </div>
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

// =============================================================================
// STEP 6B: PRODUCT DESCRIPTION (Hunter)
// =============================================================================

interface Step6BProductProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step6BProduct({ data, onUpdate, onContinue, onBack }: Step6BProductProps) {
    const isValid = data.productDescription.trim().length >= 10;

    return (
        <StepContainer
            title="What do you sell?"
            subtitle="Help executives understand what you're offering"
            icon={<Package className="w-8 h-8 text-white" />}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Describe your product or service
                    </label>
                    <textarea
                        value={data.productDescription}
                        onChange={(e) => onUpdate({ productDescription: e.target.value })}
                        placeholder="We help companies automate their DevOps workflows with AI-powered infrastructure management..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl text-zinc-900 outline-none focus:border-blue-500 transition-all resize-none"
                        autoFocus
                    />
                    <div className="text-sm text-zinc-400 mt-1">
                        {data.productDescription.length} / 500 characters
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                    <p><strong>Tips for a great pitch:</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-blue-600">
                        <li>Lead with the problem you solve</li>
                        <li>Mention key outcomes or ROI</li>
                        <li>Keep it under 3 sentences</li>
                    </ul>
                </div>
            </div>

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!isValid}
                role={data.role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 7B: BUDGET/DEAL SIZE (Hunter)
// =============================================================================

const DEAL_SIZE_OPTIONS = [
    {
        value: 'under10k',
        label: 'Under $10K',
        description: 'SMB / Self-serve deals'
    },
    {
        value: '10k-50k',
        label: '$10K - $50K',
        description: 'Mid-market deals'
    },
    {
        value: '50k-200k',
        label: '$50K - $200K',
        description: 'Enterprise deals'
    },
    {
        value: 'over200k',
        label: '$200K+',
        description: 'Strategic / Platform deals'
    },
];

interface Step7BBudgetProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step7BBudget({ data, onUpdate, onContinue, onBack }: Step7BBudgetProps) {
    return (
        <StepContainer
            title="Typical deal size?"
            subtitle="This helps us match you with the right executives"
            icon={<DollarSign className="w-8 h-8 text-white" />}
        >
            <RadioCardGroup
                options={DEAL_SIZE_OPTIONS}
                value={data.dealSizeRange}
                onChange={(dealSizeRange) => onUpdate({ dealSizeRange })}
                role={data.role}
            />

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!data.dealSizeRange}
                role={data.role}
            />
        </StepContainer>
    );
}
