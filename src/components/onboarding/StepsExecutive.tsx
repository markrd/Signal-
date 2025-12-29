import { useState, useEffect } from 'react';
import { Briefcase, Cpu, DollarSign } from 'lucide-react';
import { StepContainer, StepNavButtons, RadioCardGroup, ChipGrid } from './primitives';
import type { OnboardingData } from './primitives';
import { calculateSuggestedPrice } from '../../lib/llm';

// =============================================================================
// STEP 5A: BUYING STAGE (Executive)
// =============================================================================

const BUYING_STAGES = [
    {
        value: 'active',
        label: 'Actively Evaluating',
        description: "I'm comparing solutions and making decisions soon"
    },
    {
        value: 'researching',
        label: 'Researching Options',
        description: "I'm exploring what's available in the market"
    },
    {
        value: 'planning',
        label: 'Future Planning',
        description: "I'm thinking about needs for next quarter/year"
    },
    {
        value: 'exploring',
        label: 'Just Exploring',
        description: "I'm open to learning about innovative solutions"
    },
];

interface Step5ABuyingStageProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step5ABuyingStage({ data, onUpdate, onContinue, onBack }: Step5ABuyingStageProps) {
    return (
        <StepContainer
            title="What's your buying stage?"
            subtitle="This helps sales leaders understand your readiness"
            icon={<Briefcase className="w-8 h-8 text-white" />}
        >
            <RadioCardGroup
                options={BUYING_STAGES}
                value={data.buyingStage}
                onChange={(buyingStage) => onUpdate({ buyingStage: buyingStage as OnboardingData['buyingStage'] })}
                role={data.role}
            />

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={!data.buyingStage}
                role={data.role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 6A: TECH STACK (Executive)
// =============================================================================

const TECH_STACK_OPTIONS = [
    'AWS',
    'Azure',
    'GCP',
    'Kubernetes',
    'Docker',
    'Terraform',
    'Snowflake',
    'Databricks',
    'Salesforce',
    'HubSpot',
    'Slack',
    'Notion',
    'Jira',
    'GitHub',
    'Datadog',
    'Splunk',
];

interface Step6ATechStackProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step6ATechStack({ data, onUpdate, onContinue, onBack }: Step6ATechStackProps) {
    return (
        <StepContainer
            title="What's in your tech stack?"
            subtitle="Select the tools and platforms you use or evaluate"
            icon={<Cpu className="w-8 h-8 text-white" />}
        >
            <ChipGrid
                options={TECH_STACK_OPTIONS}
                selected={data.techStack}
                onChange={(techStack) => onUpdate({ techStack })}
                columns={4}
                role={data.role}
                allowCustom
            />

            <div className="text-sm text-zinc-500 text-center">
                {data.techStack.length === 0
                    ? "Select the technologies you work with"
                    : `${data.techStack.length} selected`}
            </div>

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                continueDisabled={data.techStack.length === 0}
                role={data.role}
            />
        </StepContainer>
    );
}

// =============================================================================
// STEP 7A: PRICING (Executive)
// =============================================================================

interface Step7APricingProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step7APricing({ data, onUpdate, onContinue, onBack }: Step7APricingProps) {
    const [suggestedPrice, setSuggestedPrice] = useState(data.suggestedPrice || 300);

    // Calculate suggested price based on job title and buying stage
    useEffect(() => {
        if (data.jobTitle) {
            const price = calculateSuggestedPrice(data.jobTitle, data.buyingStage || undefined);
            setSuggestedPrice(price);
            if (!data.selectedPrice || data.selectedPrice === data.suggestedPrice) {
                onUpdate({ suggestedPrice: price, selectedPrice: price });
            } else {
                onUpdate({ suggestedPrice: price });
            }
        }
    }, [data.jobTitle, data.buyingStage]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const price = parseInt(e.target.value, 10);
        onUpdate({ selectedPrice: price });
    };

    const acceptSuggested = () => {
        onUpdate({ selectedPrice: suggestedPrice });
    };

    return (
        <StepContainer
            title="Set your meeting rate"
            subtitle="Based on your seniority, we suggest a starting price"
            icon={<DollarSign className="w-8 h-8 text-white" />}
        >
            {/* Suggested Price Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <div className="text-sm text-emerald-600 font-medium mb-2">AI Suggested Rate</div>
                <div className="text-4xl font-bold text-emerald-600 mb-1">
                    ${suggestedPrice}
                </div>
                <div className="text-sm text-zinc-500">per 30-minute meeting</div>

                {data.selectedPrice !== suggestedPrice && (
                    <button
                        onClick={acceptSuggested}
                        className="mt-3 text-sm text-emerald-600 hover:underline"
                    >
                        Use suggested rate
                    </button>
                )}
            </div>

            {/* Price Slider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Your rate</span>
                    <span className="text-2xl font-bold text-zinc-900">${data.selectedPrice || suggestedPrice}</span>
                </div>

                <input
                    type="range"
                    min={100}
                    max={1500}
                    step={25}
                    value={data.selectedPrice || suggestedPrice}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-xs text-zinc-400">
                    <span>$100</span>
                    <span>$500</span>
                    <span>$1,000</span>
                    <span>$1,500</span>
                </div>
            </div>

            {/* Pricing context */}
            <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-600">
                <p><strong>Pricing tips:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-500">
                    <li>Higher prices attract more serious inquiries</li>
                    <li>You can adjust this anytime from your dashboard</li>
                    <li>Average executive rate on Signal: $350</li>
                </ul>
            </div>

            <StepNavButtons
                onBack={onBack}
                onContinue={onContinue}
                role={data.role}
            />
        </StepContainer>
    );
}
