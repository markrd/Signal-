import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, Video, MapPin, User, Building2,
    Loader2, CheckCircle, ExternalLink, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Meeting {
    id: string;
    bid_id: string;
    host_id: string;
    guest_id: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    scheduled_at: string | null;
    meeting_link: string | null;
    notes: string | null;
    created_at: string;
    bid?: {
        amount: number;
        message: string;
    };
    guest?: {
        full_name: string;
        company: string;
        email: string;
        metadata?: {
            jobTitle?: string;
        };
    };
}

interface MyMeetingsDashboardProps {
    userId: string;
}

export function MyMeetingsDashboard({ userId }: MyMeetingsDashboardProps) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('pending');

    useEffect(() => {
        fetchMeetings();
    }, [userId]);

    const fetchMeetings = async () => {
        try {
            const { data, error } = await supabase
                .from('meetings')
                .select(`
                    *,
                    bid:bids(amount, message),
                    guest:profiles!meetings_guest_id_fkey(full_name, company, email, metadata)
                `)
                .eq('host_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMeetings(data as Meeting[]);
            }
        } catch (err) {
            console.error('Error fetching meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMeetings = filter === 'all'
        ? meetings
        : meetings.filter(m => m.status === filter);

    const pendingCount = meetings.filter(m => m.status === 'pending').length;
    const scheduledCount = meetings.filter(m => m.status === 'scheduled').length;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not scheduled';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        Needs Scheduling
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        <Calendar className="w-3 h-3" />
                        Scheduled
                    </span>
                );
            case 'completed':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">My Meetings</h2>
                <p className="text-zinc-500">Manage your scheduled conversations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Need Scheduling</div>
                    <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Upcoming</div>
                    <div className="text-2xl font-bold text-blue-500">{scheduledCount}</div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm text-zinc-500 mb-1">Completed</div>
                    <div className="text-2xl font-bold text-emerald-500">
                        {meetings.filter(m => m.status === 'completed').length}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200">
                {(['pending', 'scheduled', 'completed', 'all'] as const).map(status => (
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
                        {status === 'pending' ? 'Needs Scheduling' : status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === 'pending' && pendingCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Meetings List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                        {filter === 'all' ? 'No meetings yet' : `No ${filter} meetings`}
                    </h3>
                    <p className="text-zinc-500">
                        {filter === 'pending'
                            ? 'Accept offers to create meetings.'
                            : `You don't have any ${filter} meetings.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMeetings.map((meeting, i) => (
                        <motion.div
                            key={meeting.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl border border-zinc-200 p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                        {meeting.guest?.full_name?.charAt(0) || 'G'}
                                    </div>

                                    <div>
                                        {/* Guest Info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-zinc-900">
                                                {meeting.guest?.full_name || 'Guest'}
                                            </span>
                                            {getStatusBadge(meeting.status)}
                                        </div>

                                        {/* Company & Role */}
                                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {meeting.guest?.metadata?.jobTitle || 'Sales Leader'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {meeting.guest?.company || 'Company'}
                                            </span>
                                        </div>

                                        {/* Scheduled Time */}
                                        {meeting.scheduled_at && (
                                            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(meeting.scheduled_at)}
                                            </div>
                                        )}

                                        {/* Meeting Link */}
                                        {meeting.meeting_link && (
                                            <a
                                                href={meeting.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Meeting
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side - Amount Earned */}
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-500">
                                        ${meeting.bid?.amount || 0}
                                    </div>
                                    <div className="text-xs text-zinc-400">Payment</div>
                                </div>
                            </div>

                            {/* Actions for pending meetings */}
                            {meeting.status === 'pending' && (
                                <div className="mt-4 pt-4 border-t border-zinc-100">
                                    <button className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
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
