import { useState } from 'react';
import { Linkedin, Loader2, Edit3, CheckCircle, Shield } from 'lucide-react';
import { StepContainer, StepNavButtons, InputField } from './primitives';
import type { OnboardingData } from './primitives';
import { supabase } from '../../lib/supabase';

// =============================================================================
// STEP 1: LINKEDIN OAUTH
// =============================================================================

interface Step1LinkedInProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function Step1LinkedIn({ data, onUpdate, onContinue, onBack }: Step1LinkedInProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLinkedInOAuth = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            // Store role and current data in localStorage before redirect
            // (OAuth will lose component state)
            localStorage.setItem('signal_onboarding_role', data.role || '');
            localStorage.setItem('signal_onboarding_data', JSON.stringify(data));

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'linkedin_oidc',
                options: {
                    redirectTo: `${window.location.origin}?oauth=linkedin`,
                    scopes: 'openid profile email',
                }
            });

            if (oauthError) {
                throw oauthError;
            }
            // User will be redirected to LinkedIn
        } catch (err: any) {
            console.error('LinkedIn OAuth error:', err);
            setError(err.message || 'Failed to connect to LinkedIn. Please try again.');
            setIsConnecting(false);
        }
    };

    const handleSkipToManual = () => {
        onUpdate({ linkedInUrl: '' });
        onContinue();
    };

    return (
        <StepContainer
            title="Verify your identity"
            subtitle="Connect LinkedIn for a verified profile badge"
            icon={<Shield className="w-8 h-8 text-white" />}
        >
            <div className="space-y-6">
                {/* Benefits list */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-zinc-900">Verified Profile Badge</p>
                            <p className="text-sm text-zinc-600">Stand out with a trusted identity</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-zinc-900">Auto-fill Your Info</p>
                            <p className="text-sm text-zinc-600">Name and email imported automatically</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-zinc-900">Higher Response Rates</p>
                            <p className="text-sm text-zinc-600">Executives trust verified profiles</p>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* OAuth button */}
                <button
                    onClick={handleLinkedInOAuth}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 
                               bg-[#0A66C2] text-white rounded-xl font-bold text-lg
                               shadow-lg shadow-blue-500/30
                               hover:bg-[#004182] transition-all disabled:opacity-50"
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <Linkedin className="w-5 h-5" />
                            <span>Continue with LinkedIn</span>
                        </>
                    )}
                </button>

                {/* Skip option */}
                <button
                    onClick={handleSkipToManual}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 
                               text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Skip and fill in manually</span>
                </button>

                {/* Back to role selection */}
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
