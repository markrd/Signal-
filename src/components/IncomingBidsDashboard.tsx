import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, DollarSign,
    Loader2, MessageSquare, Building2, User, Check, X,
    ChevronDown
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
    };
    bidder?: {
        full_name: string;
        company: string;
        email: string;
        metadata?: {
            jobTitle?: string;
        };
    };
}

interface IncomingBidsDashboardProps {
    userId: string;
}

export function IncomingBidsDashboard({ userId }: IncomingBidsDashboardProps) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedBid, setExpandedBid] = useState<string | null>(null);

    useEffect(() => {
        fetchBids();
    }, [userId]);

    const fetchBids = async () => {
        try {
            const { data, error } = await supabase
                .from('bids')
                .select(`
                    *,
                    listing:listings(title, price),
                    bidder:profiles!bids_bidder_id_fkey(full_name, company, email, metadata)
                `)
                .eq('owner_id', userId)
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

    const handleBidAction = async (bidId: string, action: 'accepted' | 'rejected') => {
        setProcessingId(bidId);

        try {
            const { error } = await supabase
                .from('bids')
                .update({ status: action })
                .eq('id', bidId);

            if (!error) {
                setBids(bids.map(b =>
                    b.id === bidId ? { ...b, status: action } : b
                ));

                // If accepted, create a meeting record
                if (action === 'accepted') {
                    const bid = bids.find(b => b.id === bidId);
                    if (bid) {
                        await supabase.from('meetings').insert({
                            bid_id: bidId,
                            host_id: userId,
                            guest_id: bid.bidder_id,
                            status: 'pending'
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error updating bid:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredBids = filter === 'all'
        ? bids
        : bids.filter(b => b.status === filter);

    const pendingCount = bids.filter(b => b.status === 'pending').length;
    const potentialEarnings = bids
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => sum + b.amount, 0);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">Incoming Bids</h2>
                <p className="text-zinc-500">Review and respond to requests from sales leaders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
                    <div className="text-sm opacity-80 mb-1">Pending Requests</div>
                    <div className="text-3xl font-bold">{pendingCount}</div>
                    <div className="text-sm opacity-80 mt-2">
                        {pendingCount > 0 ? 'Waiting for your response' : 'All caught up!'}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="text-sm opacity-80 mb-1">Potential Earnings</div>
                    <div className="text-3xl font-bold">${potentialEarnings}</div>
                    <div className="text-sm opacity-80 mt-2">
                        From pending bids
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200">
                {(['pending', 'accepted', 'rejected', 'all'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                            filter === status
                                ? "border-zinc-900 text-zinc-900"
                                : "border-transparent text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === 'pending' && pendingCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
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
                        {filter === 'pending' ? 'No pending bids' : `No ${filter} bids`}
                    </h3>
                    <p className="text-zinc-500">
                        {filter === 'pending'
                            ? 'New requests will appear here.'
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
                            className={cn(
                                "bg-white rounded-xl border overflow-hidden transition-all",
                                bid.status === 'pending'
                                    ? "border-amber-200 shadow-amber-100 shadow-sm"
                                    : "border-zinc-200"
                            )}
                        >
                            {/* Main Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {bid.bidder?.full_name?.charAt(0) || 'H'}
                                        </div>

                                        <div>
                                            {/* Bidder Info */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-zinc-900">
                                                    {bid.bidder?.full_name || 'Sales Leader'}
                                                </span>
                                                {bid.status === 'pending' && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            {/* Company & Role */}
                                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {bid.bidder?.metadata?.jobTitle || 'Sales Leader'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {bid.bidder?.company || 'Company'}
                                                </span>
                                            </div>

                                            {/* For which listing */}
                                            <div className="text-xs text-zinc-400 mt-1">
                                                For: {bid.listing?.title}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side - Bid amount */}
                                    <div className="text-right">
                                        <div className={cn(
                                            "flex items-center gap-1 text-xl font-bold",
                                            bid.amount > (bid.listing?.price || 0)
                                                ? "text-emerald-500"
                                                : "text-zinc-900"
                                        )}>
                                            <DollarSign className="w-5 h-5" />
                                            {bid.amount}
                                        </div>
                                        {bid.amount > (bid.listing?.price || 0) && (
                                            <div className="text-xs text-emerald-500">
                                                +${bid.amount - (bid.listing?.price || 0)} above asking
                                            </div>
                                        )}
                                        <div className="text-xs text-zinc-400 mt-1">
                                            {formatDate(bid.created_at)}
                                        </div>
                                    </div>
                                </div>

                                {/* Expand/Message Section */}
                                {bid.message && (
                                    <button
                                        onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                                        className="flex items-center gap-2 mt-3 text-sm text-zinc-500 hover:text-zinc-700"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        View message
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform",
                                            expandedBid === bid.id && "rotate-180"
                                        )} />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {expandedBid === bid.id && bid.message && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-sm text-zinc-600 bg-zinc-50 rounded-lg p-4 mt-3">
                                                "{bid.message}"
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Buttons for Pending */}
                            {bid.status === 'pending' && (
                                <div className="flex border-t border-zinc-100">
                                    <button
                                        onClick={() => handleBidAction(bid.id, 'rejected')}
                                        disabled={processingId === bid.id}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-red-500 transition-colors border-r border-zinc-100"
                                    >
                                        {processingId === bid.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleBidAction(bid.id, 'accepted')}
                                        disabled={processingId === bid.id}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-emerald-600 hover:bg-emerald-50 font-medium transition-colors"
                                    >
                                        {processingId === bid.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        Accept — ${bid.amount}
                                    </button>
                                </div>
                            )}

                            {/* Status for non-pending */}
                            {bid.status !== 'pending' && (
                                <div className={cn(
                                    "px-5 py-3 flex items-center justify-between border-t",
                                    bid.status === 'accepted'
                                        ? "bg-emerald-50 border-emerald-100"
                                        : "bg-zinc-50 border-zinc-100"
                                )}>
                                    <span className={cn(
                                        "flex items-center gap-2 text-sm font-medium",
                                        bid.status === 'accepted' ? "text-emerald-600" : "text-zinc-500"
                                    )}>
                                        {bid.status === 'accepted' ? (
                                            <><CheckCircle className="w-4 h-4" /> Accepted</>
                                        ) : (
                                            <><XCircle className="w-4 h-4" /> Declined</>
                                        )}
                                    </span>
                                    {bid.status === 'accepted' && (
                                        <button className="px-4 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                                            Schedule Meeting
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
