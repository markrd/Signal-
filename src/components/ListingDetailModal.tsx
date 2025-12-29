import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, DollarSign, Zap, CheckCircle, Briefcase,
    ArrowRight, Sparkles, Star, MapPin, Building2,
    Clock, TrendingUp, Cpu, Target, Calendar, Shield,
    BarChart3, Users, Lightbulb, MessageCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { anonymizeCompany, getAnonymousId } from '../lib/anonymize';
import { BidForm } from './BidForm';

interface Profile {
    full_name: string;
    company: string;
    avatar_url: string;
    role?: string;
    verified?: boolean;
    metadata?: {
        jobTitle?: string;
        linkedIn?: string;
        context?: string;
        buyingStage?: string;
        location?: string;
        techStack?: string[];
        buyingIntent?: string[];
        budgetAuthority?: string;
        meetingPrefs?: string[];
    };
}

interface Listing {
    id: string;
    user_id: string;
    type: 'access' | 'pitch';
    title: string;
    description: string;
    price: number;
    tags: string[];
    status: string;
    created_at: string;
    profile?: Profile;
}

interface ListingDetailModalProps {
    listing: Listing | null;
    isOpen: boolean;
    onClose: () => void;
    canBid: boolean;
    userId?: string;
    onBidSuccess?: () => void;
}

// Generate comprehensive mock data for rich profile display
function getEnrichedData(listing: Listing) {
    const hash = listing.id.charCodeAt(0) + (listing.id.charCodeAt(1) || 0);

    const techStacks = [
        ['AWS', 'Kubernetes', 'Terraform', 'Python'],
        ['Google Cloud', 'BigQuery', 'Looker', 'dbt'],
        ['Azure', 'Databricks', 'Spark', 'Scala'],
        ['Snowflake', 'Fivetran', 'Tableau', 'SQL'],
        ['MongoDB', 'Node.js', 'React', 'GraphQL']
    ];

    const buyingIntents = [
        'Cloud Migration',
        'Data Pipeline Modernization',
        'Security Posture Improvement',
        'Cost Optimization',
        'AI/ML Infrastructure'
    ];

    const buyingStages = ['Researching', 'Evaluating', 'Decision Ready', 'Actively Buying'];

    const meetingPrefs = [
        ['Zoom', '30 min', 'Morning'],
        ['Google Meet', '45 min', 'Afternoon'],
        ['Teams', '30 min', 'Any time'],
        ['Zoom', '60 min', 'Evening']
    ];

    const responseRates = ['< 24 hours', '< 48 hours', '< 72 hours'];

    const budgets = ['$100K - $500K', '$500K - $1M', '$1M - $2.5M', '$2.5M - $5M', '$5M+'];

    const aiInsights = [
        'Recently increased cloud infrastructure budget by 40%',
        'Currently evaluating 3 vendors in this space',
        'Known for fast decision-making cycles',
        'Prefers technical deep-dives in first meetings',
        'Has budget authority for immediate purchases'
    ];

    return {
        techStack: techStacks[hash % techStacks.length],
        buyingIntent: buyingIntents[hash % buyingIntents.length],
        buyingStage: buyingStages[hash % buyingStages.length],
        meetingPrefs: meetingPrefs[hash % meetingPrefs.length],
        responseRate: responseRates[hash % responseRates.length],
        budget: budgets[hash % budgets.length],
        rating: (4.2 + (hash % 8) / 10).toFixed(1),
        reviewCount: 12 + (hash % 20),
        matchScore: 85 + (hash % 14),
        meetingsCompleted: 8 + (hash % 15),
        aiInsight: aiInsights[hash % aiInsights.length],
        location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][hash % 5],
        timezone: ['PST', 'EST', 'CST', 'PST', 'EST'][hash % 5],
        activeHours: ['9am - 5pm', '8am - 6pm', '10am - 7pm'][hash % 3]
    };
}

export function ListingDetailModal({
    listing,
    isOpen,
    onClose,
    canBid,
    userId,
    onBidSuccess
}: ListingDetailModalProps) {
    const [showBidForm, setShowBidForm] = useState(false);

    if (!listing) return null;

    const profile = listing.profile;
    const isVerified = profile?.verified;
    const jobTitle = profile?.metadata?.jobTitle || listing.title;
    const context = profile?.metadata?.context || listing.description;

    // Anonymize the data
    const anonymizedCompany = anonymizeCompany(profile?.company || 'Company');
    const anonymousId = getAnonymousId(listing.user_id);

    // Get enriched mock data
    const data = getEnrichedData(listing);

    // Determine seniority from title
    const getSeniorityBadge = (title: string) => {
        const lower = title.toLowerCase();
        if (/\b(ceo|cto|cio|cfo|coo|founder|chief)\b/.test(lower)) {
            return { label: 'CXO', color: 'bg-amber-500' };
        }
        if (/\b(vp|vice president|head of|svp|evp)\b/.test(lower)) {
            return { label: 'VP', color: 'bg-purple-500' };
        }
        if (/\bdirector\b/.test(lower)) {
            return { label: 'Director', color: 'bg-blue-500' };
        }
        return { label: 'Manager', color: 'bg-zinc-500' };
    };

    const seniority = getSeniorityBadge(jobTitle);

    const handleBidSuccess = () => {
        setShowBidForm(false);
        onBidSuccess?.();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal - Centered */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-[8vh] md:-translate-x-1/2 md:w-full md:max-w-2xl md:max-h-[84vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-zinc-900">Executive Profile</h2>
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    <Zap className="w-3 h-3" />
                                    {data.matchScore}% Match
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {!showBidForm ? (
                                <div className="p-6">
                                    {/* Profile Header */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-18 h-18 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white">
                                                <Building2 className="w-9 h-9 text-slate-400" />
                                            </div>
                                            {isVerified && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-xl font-bold text-zinc-900">
                                                    {jobTitle}
                                                </h3>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-bold text-white",
                                                    seniority.color
                                                )}>
                                                    {seniority.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{anonymizedCompany}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                <div className="flex items-center gap-1 text-zinc-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {data.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="font-semibold text-zinc-800">{data.rating}</span>
                                                    <span className="text-zinc-400">({data.reviewCount})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats Row */}
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        <div className="text-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                            <p className="text-[10px] text-zinc-400 uppercase">Budget</p>
                                            <p className="text-xs font-bold text-zinc-900 mt-0.5">{data.budget.split(' - ')[0]}</p>
                                        </div>
                                        <div className="text-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                            <p className="text-[10px] text-zinc-400 uppercase">Response</p>
                                            <p className="text-xs font-bold text-zinc-900 mt-0.5">{data.responseRate}</p>
                                        </div>
                                        <div className="text-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                            <p className="text-[10px] text-zinc-400 uppercase">Meetings</p>
                                            <p className="text-xs font-bold text-zinc-900 mt-0.5">{data.meetingsCompleted}</p>
                                        </div>
                                        <div className="text-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <BarChart3 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                            <p className="text-[10px] text-zinc-400 uppercase">Stage</p>
                                            <p className="text-xs font-bold text-zinc-900 mt-0.5">{data.buyingStage.split(' ')[0]}</p>
                                        </div>
                                    </div>

                                    {/* AI Insight Banner */}
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100/50 mb-6">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Lightbulb className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1">AI Intelligence</p>
                                                <p className="text-sm text-purple-900">{data.aiInsight}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* About & Expertise */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <MessageCircle className="w-4 h-4" />
                                            About & Expertise
                                        </h4>
                                        <p className="text-zinc-600 leading-relaxed text-sm">
                                            {context}
                                        </p>
                                    </div>

                                    {/* Buying Intent */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <Target className="w-4 h-4" />
                                            Active Buying Intent
                                        </h4>
                                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                                            <span className="font-semibold text-emerald-800">{data.buyingIntent}</span>
                                            <span className="ml-auto px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                                                {data.buyingStage}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tech Stack */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <Cpu className="w-4 h-4" />
                                            Tech Stack
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data.techStack.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills & Tags */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <Sparkles className="w-4 h-4" />
                                            Focus Areas
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {listing.tags?.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meeting Preferences */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            Meeting Preferences
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-3 bg-zinc-50 rounded-lg">
                                                <p className="text-[10px] text-zinc-400 uppercase">Platform</p>
                                                <p className="text-sm font-semibold text-zinc-800 mt-0.5">{data.meetingPrefs[0]}</p>
                                            </div>
                                            <div className="text-center p-3 bg-zinc-50 rounded-lg">
                                                <p className="text-[10px] text-zinc-400 uppercase">Duration</p>
                                                <p className="text-sm font-semibold text-zinc-800 mt-0.5">{data.meetingPrefs[1]}</p>
                                            </div>
                                            <div className="text-center p-3 bg-zinc-50 rounded-lg">
                                                <p className="text-[10px] text-zinc-400 uppercase">Preferred</p>
                                                <p className="text-sm font-semibold text-zinc-800 mt-0.5">{data.meetingPrefs[2]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                            <Clock className="w-4 h-4" />
                                            Availability
                                        </h4>
                                        <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">Timezone:</span>
                                                <span className="text-sm font-semibold text-zinc-800">{data.timezone}</span>
                                            </div>
                                            <div className="w-px h-4 bg-zinc-200" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">Active:</span>
                                                <span className="text-sm font-semibold text-zinc-800">{data.activeHours}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reference ID */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg mb-4">
                                        <span className="text-xs text-zinc-500">Reference ID:</span>
                                        <span className="text-xs font-mono font-bold text-zinc-700">{anonymousId}</span>
                                    </div>

                                    {/* Identity Protected Notice */}
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Identity Protected</p>
                                                <p className="text-xs text-amber-700/80 mt-1">
                                                    Executive identity and company name will be revealed only after your bid is accepted.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <BidForm
                                    listing={listing}
                                    anonymizedTitle={jobTitle}
                                    anonymizedCompany={anonymizedCompany}
                                    userId={userId!}
                                    onSuccess={handleBidSuccess}
                                    onCancel={() => setShowBidForm(false)}
                                />
                            )}
                        </div>

                        {/* Footer CTA */}
                        {!showBidForm && (
                            <div className="p-5 border-t border-zinc-100 bg-gradient-to-r from-zinc-50 to-white">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-zinc-400 uppercase tracking-wide">Meeting Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-zinc-900">${listing.price}</span>
                                            <span className="text-sm text-zinc-400">/session</span>
                                        </div>
                                    </div>
                                    {canBid && (
                                        <button
                                            onClick={() => setShowBidForm(true)}
                                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white font-bold rounded-xl hover:from-zinc-800 hover:to-zinc-700 shadow-lg shadow-zinc-900/20 transition-all"
                                        >
                                            Request Access
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                {!canBid && (
                                    <div className="text-center text-zinc-500 text-sm">
                                        Only Sales Leaders (Hunters) can request access to executives.
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
