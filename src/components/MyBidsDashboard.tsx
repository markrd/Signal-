import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Clock, CheckCircle, XCircle, DollarSign,
    Loader2, MessageSquare, Building2, User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Bid {
    id: string;
    listing_id: string;
    bidder_id: string;
    owner_id: string;
    amount: number;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    listing?: {
        title: string;
        price: number;
        profile?: {
            full_name: string;
            company: string;
        };
    };
}

interface MyBidsDashboardProps {
    userId: string;
}

export function MyBidsDashboard({ userId }: MyBidsDashboardProps) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    useEffect(() => {
        fetchBids();
    }, [userId]);

    const fetchBids = async () => {
        try {
            const { data, error } = await supabase
                .from('bids')
                .select(`
                    *,
                    listing:listings(
                        title,
                        price,
                        profile:profiles(full_name, company)
                    )
                `)
                .eq('bidder_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setBids(data as Bid[]);
            }
        } catch (err) {
            console.error('Error fetching bids:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBids = filter === 'all'
        ? bids
        : bids.filter(b => b.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-amber-500" />;
            case 'accepted':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'accepted':
                return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'rejected':
                return 'bg-red-50 text-red-600 border-red-200';
            default:
                return 'bg-zinc-50 text-zinc-600 border-zinc-200';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">My Bids</h2>
                <p className="text-zinc-500">Track your requests to connect with executives</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        filter === 'all' ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                    )}
                >
                    <div className="text-sm text-zinc-500 mb-1">All Bids</div>
                    <div className="text-2xl font-bold text-zinc-900">{bids.length}</div>
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        filter === 'pending' ? "border-amber-500 bg-amber-50" : "border-zinc-200 bg-white"
                    )}
                >
                    <div className="text-sm text-zinc-500 mb-1">Pending</div>
                    <div className="text-2xl font-bold text-amber-500">
                        {bids.filter(b => b.status === 'pending').length}
                    </div>
                </button>
                <button
                    onClick={() => setFilter('accepted')}
                    className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        filter === 'accepted' ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white"
                    )}
                >
                    <div className="text-sm text-zinc-500 mb-1">Accepted</div>
                    <div className="text-2xl font-bold text-emerald-500">
                        {bids.filter(b => b.status === 'accepted').length}
                    </div>
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        filter === 'rejected' ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                    )}
                >
                    <div className="text-sm text-zinc-500 mb-1">Rejected</div>
                    <div className="text-2xl font-bold text-red-500">
                        {bids.filter(b => b.status === 'rejected').length}
                    </div>
                </button>
            </div>

            {/* Bids List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            ) : filteredBids.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                        {filter === 'all' ? 'No bids yet' : `No ${filter} bids`}
                    </h3>
                    <p className="text-zinc-500">
                        {filter === 'all'
                            ? 'Browse the marketplace and request access to executives.'
                            : `You don't have any ${filter} bids.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBids.map((bid, i) => (
                        <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl border border-zinc-200 p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                        {bid.listing?.profile?.full_name?.charAt(0) || 'E'}
                                    </div>

                                    <div>
                                        {/* Executive Info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-zinc-900">
                                                {bid.listing?.profile?.full_name || 'Executive'}
                                            </span>
                                            <span className={cn(
                                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                                                getStatusColor(bid.status)
                                            )}>
                                                {getStatusIcon(bid.status)}
                                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Company & Title */}
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {bid.listing?.title}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {bid.listing?.profile?.company}
                                            </span>
                                        </div>

                                        {/* Message */}
                                        {bid.message && (
                                            <p className="text-sm text-zinc-500 bg-zinc-50 rounded-lg p-3 mt-2">
                                                "{bid.message}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right side */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-lg font-bold text-zinc-900">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        {bid.amount}
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-1">
                                        {formatDate(bid.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Action for accepted bids */}
                            {bid.status === 'accepted' && (
                                <div className="mt-4 pt-4 border-t border-zinc-100">
                                    <button className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors">
                                        Schedule Meeting
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
