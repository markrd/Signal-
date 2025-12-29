import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, DollarSign,
    Loader2, MoreVertical, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { CreateListingForm } from './CreateListingForm';

interface Listing {
    id: string;
    user_id: string;
    type: 'access' | 'pitch';
    title: string;
    description: string;
    price: number;
    tags: string[];
    status: 'active' | 'paused' | 'deleted';
    created_at: string;
    bid_count?: number;
}

interface Profile {
    id: string;
    full_name: string;
    company: string;
    metadata?: {
        jobTitle?: string;
        context?: string;
        techStack?: string[];
        interests?: string[];
        suggestedPrice?: number;
    };
}

interface MyListingsDashboardProps {
    profile: Profile;
    onBack: () => void;
}

export function MyListingsDashboard({ profile, onBack }: MyListingsDashboardProps) {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchListings();
    }, [profile.id]);

    const fetchListings = async () => {
        try {
            // Fetch listings with bid count
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    bids:bids(count)
                `)
                .eq('user_id', profile.id)
                .neq('status', 'deleted')
                .order('created_at', { ascending: false });

            if (!error && data) {
                const listingsWithCounts = data.map(l => ({
                    ...l,
                    bid_count: l.bids?.[0]?.count || 0
                }));
                setListings(listingsWithCounts);
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (listing: Listing) => {
        const newStatus = listing.status === 'active' ? 'paused' : 'active';

        const { error } = await supabase
            .from('listings')
            .update({ status: newStatus })
            .eq('id', listing.id);

        if (!error) {
            setListings(listings.map(l =>
                l.id === listing.id ? { ...l, status: newStatus } : l
            ));
        }
        setActiveMenu(null);
    };

    const deleteListing = async (id: string) => {
        setDeletingId(id);

        const { error } = await supabase
            .from('listings')
            .update({ status: 'deleted' })
            .eq('id', id);

        if (!error) {
            setListings(listings.filter(l => l.id !== id));
        }
        setDeletingId(null);
        setActiveMenu(null);
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        setEditingListing(null);
        fetchListings();
    };

    // Show create/edit form
    if (showCreateForm || editingListing) {
        return (
            <div className="max-w-2xl mx-auto">
                <CreateListingForm
                    profile={profile}
                    onSuccess={handleCreateSuccess}
                    onCancel={() => {
                        setShowCreateForm(false);
                        setEditingListing(null);
                    }}
                    editMode={!!editingListing}
                    existingListing={editingListing || undefined}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">My Listings</h2>
                    <p className="text-zinc-500">Manage your availability on the marketplace</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Listing
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Active Listings</div>
                    <div className="text-2xl font-bold text-zinc-900">
                        {listings.filter(l => l.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Total Bids</div>
                    <div className="text-2xl font-bold text-emerald-500">
                        {listings.reduce((sum, l) => sum + (l.bid_count || 0), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Avg Price</div>
                    <div className="text-2xl font-bold text-zinc-900">
                        ${listings.length > 0
                            ? Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)
                            : 0
                        }
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            ) : listings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-2xl border border-zinc-200"
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">No listings yet</h3>
                    <p className="text-zinc-500 mb-6">
                        Create your first listing to start receiving bids from sales leaders.
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        Create Your First Listing
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing, i) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "bg-white rounded-xl border p-6 transition-all",
                                listing.status === 'paused'
                                    ? "border-zinc-300 opacity-60"
                                    : "border-zinc-200"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Title & Status */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-zinc-900">
                                            {listing.title}
                                        </h3>
                                        <span className={cn(
                                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                            listing.status === 'active'
                                                ? "bg-emerald-100 text-emerald-600"
                                                : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {listing.status === 'active' ? (
                                                <><CheckCircle className="w-3 h-3" /> Active</>
                                            ) : (
                                                <><Clock className="w-3 h-3" /> Paused</>
                                            )}
                                        </span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                            listing.type === 'access'
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-blue-50 text-blue-600"
                                        )}>
                                            {listing.type}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                                        {listing.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {listing.tags?.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {(listing.tags?.length || 0) > 4 && (
                                            <span className="px-2 py-1 bg-zinc-100 text-zinc-400 text-xs font-medium rounded-full">
                                                +{listing.tags!.length - 4}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                            <span className="font-bold text-zinc-900">${listing.price}</span>
                                            <span className="text-zinc-400">/meeting</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-zinc-900">{listing.bid_count || 0}</span>
                                            <span className="text-zinc-400">bids</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === listing.id ? null : listing.id)}
                                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5 text-zinc-400" />
                                    </button>

                                    <AnimatePresence>
                                        {activeMenu === listing.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-zinc-200 shadow-lg z-10 overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setEditingListing(listing);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit Listing
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(listing)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
                                                >
                                                    {listing.status === 'active' ? (
                                                        <><EyeOff className="w-4 h-4" /> Pause Listing</>
                                                    ) : (
                                                        <><Eye className="w-4 h-4" /> Activate Listing</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteListing(listing.id)}
                                                    disabled={deletingId === listing.id}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    {deletingId === listing.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Delete Listing
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
