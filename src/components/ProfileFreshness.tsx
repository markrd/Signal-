import { motion } from 'framer-motion';
import { RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// =============================================================================
// PROFILE FRESHNESS COMPONENT
// Shows how long since profile was last updated, encourages regular updates
// =============================================================================

interface ProfileFreshnessProps {
    lastUpdated: string | null | undefined;
    onUpdateClick: () => void;
    compact?: boolean;
}

export function ProfileFreshness({ lastUpdated, onUpdateClick, compact = false }: ProfileFreshnessProps) {
    // Calculate days since last update
    const getDaysSinceUpdate = (): number => {
        if (!lastUpdated) return 999; // Never updated
        const updated = new Date(lastUpdated);
        const now = new Date();
        const diffMs = now.getTime() - updated.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    };

    const daysSinceUpdate = getDaysSinceUpdate();

    // Determine freshness status
    const getFreshnessStatus = () => {
        if (daysSinceUpdate <= 30) return 'fresh';      // Up to 1 month
        if (daysSinceUpdate <= 90) return 'aging';      // 1-3 months
        return 'stale';                                  // 3+ months
    };

    const status = getFreshnessStatus();

    const statusConfig = {
        fresh: {
            label: 'Fresh',
            description: 'Profile recently updated',
            color: 'emerald',
            bgGradient: 'from-emerald-500 to-teal-500',
            icon: CheckCircle,
        },
        aging: {
            label: 'Getting stale',
            description: `Updated ${daysSinceUpdate} days ago`,
            color: 'amber',
            bgGradient: 'from-amber-500 to-orange-500',
            icon: Clock,
        },
        stale: {
            label: 'Needs update',
            description: daysSinceUpdate === 999 ? 'Never updated' : `Updated ${daysSinceUpdate} days ago`,
            color: 'red',
            bgGradient: 'from-red-500 to-pink-500',
            icon: AlertCircle,
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    // Compact version for header/toolbar
    if (compact) {
        return (
            <button
                onClick={onUpdateClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${status === 'fresh'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : status === 'aging'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                    }`}
            >
                <Icon className="w-3.5 h-3.5" />
                <span>{status === 'fresh' ? 'Up to date' : `${daysSinceUpdate}d old`}</span>
            </button>
        );
    }

    // Full card version for dashboard
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
        >
            {/* Header with status gradient */}
            <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-white">
                            <div className="font-bold">Profile Freshness</div>
                            <div className="text-sm opacity-80">{config.description}</div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-3xl font-bold text-zinc-900">
                            {daysSinceUpdate === 999 ? '?' : daysSinceUpdate}
                        </div>
                        <div className="text-sm text-zinc-500">days since update</div>
                    </div>

                    {/* Freshness meter */}
                    <div className="flex-1 mx-6">
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(5, 100 - (daysSinceUpdate * 2))}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-full rounded-full ${status === 'fresh'
                                    ? 'bg-emerald-500'
                                    : status === 'aging'
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                    }`}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-zinc-400">
                            <span>Fresh</span>
                            <span>Stale</span>
                        </div>
                    </div>
                </div>

                {/* Why it matters */}
                <div className="bg-zinc-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-zinc-600">
                        <strong className="text-zinc-900">Why keep your profile fresh?</strong>
                        <br />
                        Vendors bid based on your current priorities. Stale profiles get irrelevant offers.
                    </p>
                </div>

                {/* Update button */}
                <button
                    onClick={onUpdateClick}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                        ${status === 'stale'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 hover:opacity-90'
                            : status === 'aging'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:opacity-90'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    {status === 'stale' ? 'Update Now' : status === 'aging' ? 'Refresh Profile' : 'Review Profile'}
                </button>
            </div>
        </motion.div>
    );
}
