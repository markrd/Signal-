import { useEffect, useState, useMemo } from 'react';
import { Target, Loader2, LogOut, Store, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { FilterBar, DEFAULT_FILTERS } from './FilterBar';
import type { FilterState } from './FilterBar';
import { SearchInput } from './SearchInput';
import { ListingDetailModal } from './ListingDetailModal';
import { ListingCard } from './ListingCard';
import { MyBidsDashboard } from './MyBidsDashboard';

interface Listing {
    id: string;
    user_id: string;
    type: 'access' | 'pitch';
    title: string;
    description: string;
    price: number;
    tags: string[];
    hooks?: string[];
    status: string;
    created_at: string;
    profile?: {
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
        };
    };
}

interface MarketplaceFeedProps {
    onLogout: () => void;
}

type Tab = 'marketplace' | 'my-bids';

export function MarketplaceFeed({ onLogout }: MarketplaceFeedProps) {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('marketplace');
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    profile:profiles(full_name, company, avatar_url, role, verified, metadata)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setListings(data as Listing[]);
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for demo when no real listings exist
    const mockListings: Listing[] = [
        {
            id: '1',
            user_id: '1',
            type: 'access',
            title: 'VP of Engineering',
            description: 'Cloud migration and DevOps transformation expertise. Currently leading a team of 40 engineers rebuilding our infrastructure on Kubernetes.',
            price: 450,
            tags: ['AWS', 'Kubernetes', 'DevOps', 'Cloud Migration'],
            status: 'active',
            created_at: new Date().toISOString(),
            profile: {
                full_name: 'Sarah Chen',
                company: 'Stripe',
                avatar_url: '',
                verified: true,
                metadata: { jobTitle: 'VP of Engineering', context: 'Cloud migration and DevOps transformation expertise.' }
            }
        },
        {
            id: '2',
            user_id: '2',
            type: 'access',
            title: 'CISO',
            description: 'Enterprise security strategy and compliance. Specializing in zero trust architecture and SOC2/HIPAA compliance.',
            price: 750,
            tags: ['Cybersecurity', 'Compliance', 'Zero Trust'],
            status: 'active',
            created_at: new Date().toISOString(),
            profile: {
                full_name: 'Marcus Johnson',
                company: 'Datadog',
                avatar_url: '',
                verified: true,
                metadata: { jobTitle: 'Chief Information Security Officer' }
            }
        },
        {
            id: '3',
            user_id: '3',
            type: 'access',
            title: 'CTO',
            description: 'AI/ML infrastructure and data platform decisions. Building next-gen analytics stack with Snowflake and Databricks.',
            price: 1250,
            tags: ['AI/ML', 'Snowflake', 'Databricks', 'SaaS'],
            status: 'active',
            created_at: new Date().toISOString(),
            profile: {
                full_name: 'Emily Rodriguez',
                company: 'Snowflake',
                avatar_url: '',
                verified: true,
                metadata: { jobTitle: 'Chief Technology Officer' }
            }
        },
        {
            id: '4',
            user_id: '4',
            type: 'access',
            title: 'Director of Platform',
            description: 'FinTech infrastructure and payment systems. Expert in PCI compliance and real-time transaction processing.',
            price: 350,
            tags: ['FinTech', 'AWS', 'Kubernetes'],
            status: 'active',
            created_at: new Date().toISOString(),
            profile: {
                full_name: 'James Park',
                company: 'Plaid',
                avatar_url: '',
                verified: false,
                metadata: { jobTitle: 'Director of Platform Engineering' }
            }
        },
        {
            id: '5',
            user_id: '5',
            type: 'access',
            title: 'VP of Data',
            description: 'Healthcare data analytics and HIPAA-compliant data pipelines. Building ML models for patient outcome prediction.',
            price: 500,
            tags: ['Healthcare', 'AI/ML', 'Google Cloud'],
            status: 'active',
            created_at: new Date().toISOString(),
            profile: {
                full_name: 'Dr. Aisha Patel',
                company: 'Oscar Health',
                avatar_url: '',
                verified: true,
                metadata: { jobTitle: 'VP of Data Science' }
            }
        }
    ];

    const displayListings = listings.length > 0 ? listings : mockListings;

    // Apply filters and search
    const filteredListings = useMemo(() => {
        return displayListings.filter(listing => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    listing.title.toLowerCase().includes(query) ||
                    listing.description.toLowerCase().includes(query) ||
                    listing.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                    listing.profile?.full_name?.toLowerCase().includes(query) ||
                    listing.profile?.company?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Industry filter
            if (filters.industries.length > 0) {
                const hasIndustry = listing.tags?.some(tag =>
                    filters.industries.some(ind => ind.toLowerCase() === tag.toLowerCase())
                );
                if (!hasIndustry) return false;
            }

            // Tech stack filter
            if (filters.techStacks.length > 0) {
                const hasTech = listing.tags?.some(tag =>
                    filters.techStacks.some(tech => tech.toLowerCase() === tag.toLowerCase())
                );
                if (!hasTech) return false;
            }

            // Price range filter
            if (listing.price < filters.priceRange.min || listing.price > filters.priceRange.max) {
                return false;
            }

            // Seniority filter
            if (filters.seniorities.length > 0) {
                const title = (listing.profile?.metadata?.jobTitle || listing.title).toLowerCase();
                const matchesSeniority = filters.seniorities.some(sen => {
                    if (sen === 'CXO') return /\b(ceo|cto|cio|cfo|coo|founder|chief)\b/.test(title);
                    if (sen === 'VP') return /\b(vp|vice president|head of|svp|evp)\b/.test(title);
                    if (sen === 'Director') return /\bdirector\b/.test(title);
                    if (sen === 'Manager') return /\bmanager\b/.test(title);
                    return false;
                });
                if (!matchesSeniority) return false;
            }

            return true;
        });
    }, [displayListings, searchQuery, filters]);

    const handleListingClick = (listing: Listing) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleBidSuccess = () => {
        console.log('Bid placed successfully!');
    };

    // Navigation tabs for Hunters
    const tabs = [
        { id: 'marketplace' as Tab, label: 'Browse Executives', icon: Store },
        { id: 'my-bids' as Tab, label: 'My Bids', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold">Signal</span>
                            <span className="text-xs text-blue-600 font-medium ml-2 px-2 py-0.5 bg-blue-50 rounded-full">
                                Sales Leader
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {profile && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {profile.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="text-sm">
                                    <div className="font-bold text-zinc-900">{profile.full_name}</div>
                                    <div className="text-xs text-zinc-500">{profile.company}</div>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-1 -mb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
                {/* Marketplace Tab */}
                {activeTab === 'marketplace' && (
                    <>
                        {/* Hero Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-zinc-900 mb-3">
                                Discover Your Next Deal
                            </h1>
                            <p className="text-lg text-zinc-500 max-w-2xl">
                                Connect with verified decision-makers ready for your solution.
                                Every executive is vetted and actively evaluating.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            className="mb-4"
                        />

                        {/* Filter Bar */}
                        <FilterBar
                            filters={filters}
                            onFiltersChange={setFilters}
                            resultCount={filteredListings.length}
                        />

                        {/* Results Summary */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-zinc-500">
                                Showing <span className="font-bold text-zinc-900">{filteredListings.length}</span> executives matching your criteria
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Live listings
                                </span>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                            </div>
                        ) : filteredListings.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">No executives found</h3>
                                <p className="text-zinc-500">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onClick={() => handleListingClick(listing)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* My Bids Tab */}
                {activeTab === 'my-bids' && user && (
                    <MyBidsDashboard userId={user.id} />
                )}
            </main>

            {/* Listing Detail Modal */}
            <ListingDetailModal
                listing={selectedListing}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                canBid={true}
                userId={user?.id}
                onBidSuccess={handleBidSuccess}
            />
        </div>
    );
}
