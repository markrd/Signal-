import { motion } from 'framer-motion';
import {
    Building2, MapPin, Star, TrendingUp, DollarSign,
    CheckCircle, Sparkles, ArrowRight, Zap, Clock, Shield
} from 'lucide-react';
import { anonymizeCompany } from '../lib/anonymize';

interface ListingCardProps {
    listing: {
        id: string;
        user_id: string;
        title: string;
        description: string;
        price: number;
        status: string;
        tags?: string[];
        profile?: {
            full_name: string;
            company: string;
            job_title?: string;
            avatar_url?: string;
            metadata?: {
                jobTitle?: string;
            };
        };
    };
    onClick?: () => void;
    isConfirmed?: boolean;
}

// Generate mock data for display
function getMockData(listing: ListingCardProps['listing']) {
    const budgets = ['$500K+', '$1M+', '$2.5M+', '$5M+', '$10M+'];
    const intents = [
        'Cloud Migration',
        'Data Pipeline',
        'Security Modernization',
        'AI/ML Integration',
        'DevOps Transformation'
    ];
    const responses = ['< 24h', '< 48h', '< 72h'];

    const hash = listing.id.charCodeAt(0) + (listing.id.charCodeAt(1) || 0);

    return {
        budget: budgets[hash % budgets.length],
        intent: intents[hash % intents.length],
        rating: (4.2 + (hash % 8) / 10).toFixed(1),
        reviewCount: 8 + (hash % 15),
        location: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston'][hash % 5],
        responseTime: responses[hash % responses.length],
        matchScore: 85 + (hash % 14)
    };
}

export function ListingCard({ listing, onClick, isConfirmed = false }: ListingCardProps) {
    const jobTitle = listing.profile?.job_title || listing.profile?.metadata?.jobTitle || listing.title || 'Executive';
    const company = listing.profile?.company || 'Technology Company';
    const anonymizedCompany = anonymizeCompany(company);
    const mockData = getMockData(listing);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            {/* Premium Card Container */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 border border-zinc-100/80">

                {/* Top Accent Bar - Gold for premium feel */}
                <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

                {/* Match Score Badge - Floating */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
                        <Zap className="w-3 h-3" />
                        {mockData.matchScore}% Match
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 pb-5">
                    {/* Header Section */}
                    <div className="flex items-start gap-4 mb-5">
                        {/* Avatar - Larger, more prominent */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-white shadow-lg group-hover:ring-amber-100 transition-all duration-300">
                                <Building2 className="w-8 h-8 text-slate-400 group-hover:text-amber-600 transition-colors duration-300" />
                            </div>
                            {/* Verified Badge */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-xl font-bold text-zinc-900 truncate group-hover:text-amber-700 transition-colors duration-300">
                                {jobTitle}
                            </h3>
                            <p className="text-sm text-zinc-500 truncate mt-0.5">
                                {anonymizedCompany}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-semibold text-zinc-800">{mockData.rating}</span>
                                    <span className="text-xs text-zinc-400">({mockData.reviewCount})</span>
                                </div>
                                <span className="text-zinc-200">|</span>
                                <div className="flex items-center gap-1 text-zinc-500">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-xs">{mockData.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlights - Shop Window Style */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="text-center p-3 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                            <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <p className="text-xs text-zinc-500 mb-0.5">Budget</p>
                            <p className="text-sm font-bold text-zinc-900">{mockData.budget}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                            <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-zinc-500 mb-0.5">Intent Signal</p>
                            <p className="text-sm font-bold text-zinc-900 truncate">{mockData.intent.split(' ')[0]}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs text-zinc-500 mb-0.5">Response</p>
                            <p className="text-sm font-bold text-zinc-900">{mockData.responseTime}</p>
                        </div>
                    </div>

                    {/* Trust Signal */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 rounded-lg border border-amber-100/60 mb-4">
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-800 font-medium">Verified executive • Actively evaluating</span>
                    </div>
                </div>

                {/* Footer - Price & CTA */}
                <div className="px-6 py-4 bg-gradient-to-b from-zinc-50/50 to-zinc-100/80 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                        {/* Price */}
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Meeting Price</p>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-3xl font-bold text-zinc-900">${listing.price}</span>
                                <span className="text-sm text-zinc-400 font-medium">/session</span>
                            </div>
                        </div>

                        {/* CTA */}
                        {isConfirmed ? (
                            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold">
                                <CheckCircle className="w-5 h-5" />
                                Confirmed
                            </div>
                        ) : (
                            <button
                                className="group/btn flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white font-bold rounded-xl shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:shadow-zinc-900/30 hover:from-zinc-800 hover:to-zinc-700 transform hover:scale-[1.02] transition-all duration-300"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick?.();
                                }}
                            >
                                Request Access
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
