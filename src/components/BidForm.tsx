import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, AlertCircle, Loader2, CheckCircle,
    ArrowLeft, Building2, Sparkles, Shield, Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Listing {
    id: string;
    user_id: string;
    price: number;
    title: string;
    description: string;
    tags?: string[];
    profile?: {
        full_name: string;
        company: string;
    };
}

interface BidFormProps {
    listing: Listing;
    anonymizedTitle: string;
    anonymizedCompany: string;
    userId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

type Step = 'form' | 'confirm' | 'success';

// Generate AI-assisted message based on listing context
function generateAIMessage(listing: Listing, anonymizedTitle: string): string {
    const topics = listing.tags?.slice(0, 2).join(' and ') || 'your expertise';
    const title = anonymizedTitle.toLowerCase();

    const templates = [
        `Hi, I'd love to connect about ${topics}. Our team is currently evaluating solutions in this space and I believe your experience would be invaluable. Would greatly appreciate 30 minutes of your time to discuss potential synergies.`,
        `Hello! I'm reaching out because your background in ${topics} aligns perfectly with a project we're working on. I'm confident a brief conversation would be mutually beneficial. Looking forward to connecting.`,
        `Great to find someone with your expertise in ${topics}. We're in the early stages of a procurement cycle and I'd value your perspective on best practices and potential pitfalls. Happy to work around your schedule.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

// Generate suggested time slots
function getSuggestedTimes(): { label: string; isHighMatch: boolean }[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 5);

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    };

    return [
        { label: `Tomorrow • 10:00 AM`, isHighMatch: true },
        { label: `Tomorrow • 2:30 PM`, isHighMatch: false },
        { label: `${formatDate(dayAfter)} • 11:00 AM`, isHighMatch: false }
    ];
}

export function BidForm({ listing, anonymizedTitle, anonymizedCompany, userId, onSuccess, onCancel }: BidFormProps) {
    const [step, setStep] = useState<Step>('form');
    const [amount, setAmount] = useState(listing.price);
    const [message, setMessage] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const minPrice = listing.price;
    const isValidAmount = amount >= minPrice;
    const suggestedTimes = getSuggestedTimes();

    const handleAutoWriteInvite = async () => {
        setIsGeneratingMessage(true);
        // Simulate AI typing effect
        await new Promise(resolve => setTimeout(resolve, 800));
        const generatedMessage = generateAIMessage(listing, anonymizedTitle);
        setMessage(generatedMessage);
        setIsGeneratingMessage(false);
    };

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidAmount) {
            setError(`Minimum bid amount is $${minPrice}`);
            return;
        }
        setError(null);
        setStep('confirm');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('bids')
                .insert({
                    listing_id: listing.id,
                    bidder_id: userId,
                    owner_id: listing.user_id,
                    amount: amount,
                    message: message.trim() || null,
                    preferred_time: suggestedTimes[selectedTimeSlot].label,
                    status: 'pending'
                });

            if (insertError) {
                throw insertError;
            }

            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.error('Error placing bid:', err);
            setError('Failed to place bid. Please try again.');
            setStep('form');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success State
    if (step === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Request Sent!</h3>
                <p className="text-zinc-500 mb-4">
                    The {anonymizedTitle} at {anonymizedCompany} will be notified of your request.
                </p>
                <p className="text-sm text-zinc-400">
                    You'll receive a notification when they respond.
                </p>
            </motion.div>
        );
    }

    // Confirmation Step
    if (step === 'confirm') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-8"
            >
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Edit bid
                </button>

                {/* Confirmation Header - POSITIVE */}
                <div className="text-center py-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-3">You're Almost There!</h3>
                    <p className="text-zinc-500 text-base">
                        Review your request and get connected
                    </p>
                </div>

                {/* Bid Summary Card */}
                <div className="bg-gradient-to-br from-zinc-50 to-slate-50 rounded-2xl p-8 border border-zinc-200">
                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-zinc-200">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center shadow-sm">
                            <Building2 className="w-7 h-7 text-slate-500" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-zinc-900">{anonymizedTitle}</div>
                            <div className="text-sm text-zinc-500 mt-0.5">{anonymizedCompany}</div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Your Bid</span>
                            <span className="text-3xl font-bold text-emerald-600">${amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-base">
                            <span className="text-zinc-400">Preferred Time</span>
                            <span className="text-zinc-700 font-medium">{suggestedTimes[selectedTimeSlot].label}</span>
                        </div>
                        {message && (
                            <div className="pt-5 border-t border-zinc-200">
                                <div className="text-xs text-zinc-400 mb-2">Your message</div>
                                <p className="text-sm text-zinc-700 italic line-clamp-3 leading-relaxed">"{message}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trust Signal - POSITIVE */}
                <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">100% Protected</p>
                        <p className="text-xs text-emerald-700/80 mt-1">
                            Full refund if the meeting doesn't happen
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={() => setStep('form')}
                        className="flex-1 px-6 py-5 border-2 border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-50 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                Send Request
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    }

    // Form Step
    return (
        <form onSubmit={handleConfirm} className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-zinc-900">Place Priority Bid</h3>
                <p className="text-zinc-500 mt-2">
                    Stake funds to guarantee a meeting request.
                </p>
            </div>

            {/* Executive Card */}
            <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-zinc-50 to-slate-50 rounded-2xl border border-zinc-200">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center shadow-sm">
                    <Building2 className="w-7 h-7 text-slate-500" />
                </div>
                <div className="flex-1">
                    <div className="text-lg font-bold text-zinc-900">{anonymizedTitle}</div>
                    <div className="text-sm text-zinc-500 mt-0.5">{anonymizedCompany}</div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl text-emerald-600 font-bold">
                        <DollarSign className="w-5 h-5" />
                        <span>${listing.price}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">per meeting</div>
                </div>
            </div>

            {/* Invite Message Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                        Invite Message
                    </label>
                    <button
                        type="button"
                        onClick={handleAutoWriteInvite}
                        disabled={isGeneratingMessage}
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" />
                        {isGeneratingMessage ? 'Writing...' : 'Auto-Write Invite'}
                    </button>
                </div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personalized note to your meeting request..."
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-colors text-base leading-relaxed"
                />
            </div>

            {/* Suggested Times */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                        Suggested Times
                    </label>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        Live Calendar Sync
                    </button>
                </div>
                <div className="space-y-3">
                    {suggestedTimes.map((slot, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedTimeSlot(index)}
                            className={cn(
                                "w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all",
                                selectedTimeSlot === index
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                    selectedTimeSlot === index
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-zinc-300"
                                )}>
                                    {selectedTimeSlot === index && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    )}
                                </div>
                                <span className="font-semibold text-zinc-900">{slot.label}</span>
                            </div>
                            {slot.isHighMatch && (
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                                    <Sparkles className="w-4 h-4" />
                                    High Match
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Escrow Protection Notice */}
            <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-emerald-800">100% Protected</p>
                    <p className="text-xs text-emerald-700/80 mt-1">
                        Full refund guaranteed if the meeting doesn't happen.
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!isValidAmount}
                className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-5 font-bold rounded-2xl transition-all text-lg",
                    isValidAmount
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                )}
            >
                Continue — ${amount}
            </button>

            {/* Back Link */}
            <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-zinc-500 hover:text-zinc-700 transition-colors font-medium"
            >
                ← Back to profile
            </button>
        </form>
    );
}
