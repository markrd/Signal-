import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Calendar, Inbox, User, LogOut, DollarSign,
    TrendingUp, Clock, CheckCircle, Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { IncomingBidsDashboard } from './IncomingBidsDashboard';
import { MyMeetingsDashboard } from './MyMeetingsDashboard';
import { ExecutiveProfile } from './ExecutiveProfile';

type Tab = 'overview' | 'offers' | 'meetings' | 'profile';

interface DashboardStats {
    pendingOffers: number;
    acceptedThisMonth: number;
    upcomingMeetings: number;
    totalEarnings: number;
}

interface ExecutiveDashboardProps {
    onLogout: () => void;
}

export function ExecutiveDashboard({ onLogout }: ExecutiveDashboardProps) {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<DashboardStats>({
        pendingOffers: 0,
        acceptedThisMonth: 0,
        upcomingMeetings: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchStats();
        }
    }, [user?.id]);

    const fetchStats = async () => {
        try {
            // Get pending bids
            const { count: pendingCount } = await supabase
                .from('bids')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', user?.id)
                .eq('status', 'pending');

            // Get accepted bids this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data: acceptedBids } = await supabase
                .from('bids')
                .select('amount')
                .eq('owner_id', user?.id)
                .eq('status', 'accepted')
                .gte('created_at', startOfMonth.toISOString());

            // Get upcoming meetings
            const { count: meetingsCount } = await supabase
                .from('meetings')
                .select('*', { count: 'exact', head: true })
                .eq('host_id', user?.id)
                .eq('status', 'pending');

            setStats({
                pendingOffers: pendingCount || 0,
                acceptedThisMonth: acceptedBids?.length || 0,
                upcomingMeetings: meetingsCount || 0,
                totalEarnings: acceptedBids?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview' as Tab, label: 'Overview', icon: TrendingUp },
        { id: 'offers' as Tab, label: 'Incoming Offers', icon: Inbox, badge: stats.pendingOffers },
        { id: 'meetings' as Tab, label: 'My Meetings', icon: Calendar, badge: stats.upcomingMeetings },
        { id: 'profile' as Tab, label: 'My Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold">Signal</span>
                            <span className="text-xs text-emerald-600 font-medium ml-2 px-2 py-0.5 bg-emerald-50 rounded-full">
                                Executive
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {profile && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {profile.full_name?.charAt(0) || 'E'}
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
                                        ? "border-emerald-500 text-emerald-600"
                                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge && tab.badge > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Welcome Section */}
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                                Welcome back, {profile?.full_name?.split(' ')[0]}
                            </h1>
                            <p className="text-zinc-500">Here's what's happening with your profile</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Inbox className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stats.pendingOffers}</div>
                                <div className="text-sm opacity-80">Pending Offers</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">${stats.totalEarnings}</div>
                                <div className="text-sm opacity-80">Earnings This Month</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stats.upcomingMeetings}</div>
                                <div className="text-sm opacity-80">Upcoming Meetings</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stats.acceptedThisMonth}</div>
                                <div className="text-sm opacity-80">Accepted This Month</div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Pending Offers Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-2xl border border-zinc-200 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-zinc-900">Recent Offers</h3>
                                    <button
                                        onClick={() => setActiveTab('offers')}
                                        className="text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        View all →
                                    </button>
                                </div>
                                {stats.pendingOffers > 0 ? (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                                            <Inbox className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-900">
                                                {stats.pendingOffers} offer{stats.pendingOffers > 1 ? 's' : ''} waiting
                                            </div>
                                            <div className="text-sm text-zinc-500">
                                                Respond to maximize earnings
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-400">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No pending offers</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Upcoming Meetings Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white rounded-2xl border border-zinc-200 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-zinc-900">Upcoming Meetings</h3>
                                    <button
                                        onClick={() => setActiveTab('meetings')}
                                        className="text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        View all →
                                    </button>
                                </div>
                                {stats.upcomingMeetings > 0 ? (
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-900">
                                                {stats.upcomingMeetings} meeting{stats.upcomingMeetings > 1 ? 's' : ''} scheduled
                                            </div>
                                            <div className="text-sm text-zinc-500">
                                                Check your calendar
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-400">
                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No upcoming meetings</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Incoming Offers Tab */}
                {activeTab === 'offers' && user && (
                    <IncomingBidsDashboard userId={user.id} />
                )}

                {/* My Meetings Tab */}
                {activeTab === 'meetings' && user && (
                    <MyMeetingsDashboard userId={user.id} />
                )}

                {/* My Profile Tab */}
                {activeTab === 'profile' && profile && (
                    <ExecutiveProfile profile={profile} onUpdate={fetchStats} />
                )}
            </main>
        </div>
    );
}
