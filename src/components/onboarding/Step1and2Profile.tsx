import { useState } from 'react';
import { Linkedin, Loader2, Sparkles, Edit3 } from 'lucide-react';
import { StepContainer, StepNavButtons, InputField } from './primitives';
import type { OnboardingData } from './primitives';
import { enrichFromLinkedIn } from '../../lib/llm';

// =============================================================================
// STEP 1: LINKEDIN INPUT
// =============================================================================

interface Step1LinkedInProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step1LinkedIn({ data, onUpdate, onContinue, onBack }: Step1LinkedInProps) {
    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichError, setEnrichError] = useState<string | null>(null);

    const handleEnrich = async () => {
        if (!data.linkedInUrl.trim()) {
            // Skip enrichment, go to manual entry
            onContinue();
            return;
        }

        setIsEnriching(true);
        setEnrichError(null);

        try {
            const enriched = await enrichFromLinkedIn(data.linkedInUrl);

            onUpdate({
                fullName: enriched.fullName || data.fullName,
                jobTitle: enriched.jobTitle || data.jobTitle,
                company: enriched.company || data.company,
                industry: enriched.companyIndustry || data.industry,
                interests: enriched.skills?.slice(0, 5) || data.interests,
            });

            onContinue();
        } catch (err: any) {
            console.error('LinkedIn enrichment failed:', err);
            setEnrichError('Could not fetch profile. You can fill in manually.');
            // Still continue to next step for manual entry
            setTimeout(() => onContinue(), 1500);
        } finally {
            setIsEnriching(false);
        }
    };

    const handleSkipToManual = () => {
        onUpdate({ linkedInUrl: '' });
        onContinue();
    };

    return (
        <StepContainer
            title="Let's find you"
            subtitle="Share your LinkedIn and we'll auto-fill your profile"
            icon={<Linkedin className="w-8 h-8 text-white" />}
        >
            <div className="space-y-6">
                {/* LinkedIn URL Input */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Linkedin className="w-5 h-5" />
                    </div>
                    <input
                        type="url"
                        value={data.linkedInUrl}
                        onChange={(e) => onUpdate({ linkedInUrl: e.target.value })}
                        placeholder="linkedin.com/in/yourprofile"
                        className="w-full pl-12 pr-4 py-4 border-2 border-zinc-200 rounded-xl text-zinc-900 outline-none focus:border-emerald-500 transition-all text-lg"
                        autoFocus
                    />
                </div>

                {/* AI enrichment hint */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 px-4 py-3 rounded-xl">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>AI will extract your name, title, company, and skills</span>
                </div>

                {/* Error message */}
                {enrichError && (
                    <div className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                        {enrichError}
                    </div>
                )}

                {/* Action buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleEnrich}
                        disabled={isEnriching}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {isEnriching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Scanning profile...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>{data.linkedInUrl.trim() ? 'Scan & Continue' : 'Skip for now'}</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleSkipToManual}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Fill in manually instead</span>
                    </button>
                </div>

                {/* Back button */}
                <div className="pt-4 border-t border-zinc-100">
                    <button
                        onClick={onBack}
                        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        ← Change role
                    </button>
                </div>
            </div>
        </StepContainer>
    );
}

// =============================================================================
// STEP 2: PROFILE CONFIRM
// =============================================================================

interface Step2ProfileProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step2Profile({ data, onUpdate, onContinue, onBack }: Step2ProfileProps) {
    const isValid = data.fullName.trim() && data.jobTitle.trim() && data.company.trim();

    return (
        <StepContainer
            title={data.linkedInUrl ? "Confirm your details" : "Tell us about yourself"}
            subtitle={data.linkedInUrl ? "We found this info — edit anything that's off" : "Fill in your professional details"}
        >
            <div className="space-y-4">
                <InputField
                    label="Full Name"
                    value={data.fullName}
                    onChange={(v) => onUpdate({ fullName: v })}
                    placeholder="Sarah Chen"
                    autoFocus={!data.fullName}
                />

                <InputField
                    label="Job Title"
                    value={data.jobTitle}
                    onChange={(v) => onUpdate({ jobTitle: v })}
                    placeholder="VP of Engineering"
                />

                <InputField
                    label="Company"
                    value={data.company}
                    onChange={(v) => onUpdate({ company: v })}
                    placeholder="TechCorp Inc"
                />

                <InputField
                    label="Industry"
                    value={data.industry}
                    onChange={(v) => onUpdate({ industry: v })}
                    placeholder="B2B SaaS"
                    hint="This helps us match you with relevant connections"
                />
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
