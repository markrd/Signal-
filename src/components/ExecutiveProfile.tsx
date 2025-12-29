import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save, Loader2, DollarSign, Tag, Briefcase, Building2,
    Globe, Linkedin, Mail, CheckCircle, X, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { fetchEntities } from '../lib/entities';
import type { Entity } from '../lib/entities';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    company: string;
    role: string;
    verified: boolean;
    metadata?: {
        jobTitle?: string;
        linkedIn?: string;
        website?: string;
        context?: string;
        initiatives?: string;
        techStack?: string[];
        buyingStage?: string;
    };
}

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    tags: string[];
    status: string;
}

interface ExecutiveProfileProps {
    profile: Profile;
    onUpdate?: () => void;
}

export function ExecutiveProfile({ profile, onUpdate }: ExecutiveProfileProps) {
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [entities, setEntities] = useState<Entity[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(300);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchListing();
        loadEntities();
    }, [profile.id]);

    const loadEntities = async () => {
        try {
            const data = await fetchEntities();
            setEntities(data);
        } catch (err) {
            console.error('Error loading entities:', err);
        }
    };

    const fetchListing = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', profile.id)
                .neq('status', 'deleted')
                .single();

            if (!error && data) {
                setListing(data);
                setTitle(data.title || '');
                setDescription(data.description || '');
                setPrice(data.price || 300);
                setTags(data.tags || []);
            } else {
                // No listing, use profile data
                setTitle(profile.metadata?.jobTitle || '');
                setDescription(profile.metadata?.context || profile.metadata?.initiatives || '');
                setTags(profile.metadata?.techStack || []);
            }
        } catch (err) {
            console.error('Error fetching listing:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);

        try {
            if (listing) {
                // Update existing
                await supabase
                    .from('listings')
                    .update({
                        title,
                        description,
                        price,
                        tags
                    })
                    .eq('id', listing.id);
            } else {
                // Create new
                await supabase
                    .from('listings')
                    .insert({
                        user_id: profile.id,
                        type: 'access',
                        title,
                        description,
                        price,
                        tags,
                        status: 'active'
                    });
            }

            setSuccess(true);
            onUpdate?.();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving:', err);
        } finally {
            setSaving(false);
        }
    };

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const suggestedTags = entities
        .filter(e => e.type === 'TECH_STACK' || e.type === 'INDUSTRY')
        .map(e => e.name)
        .filter(name => !tags.includes(name))
        .slice(0, 6);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">My Profile</h2>
                <p className="text-zinc-500">Manage how you appear to sales leaders</p>
            </div>

            {/* Profile Card Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
                        {profile.full_name?.charAt(0) || 'E'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">{profile.full_name}</span>
                            {profile.verified && (
                                <CheckCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="opacity-80">{profile.metadata?.jobTitle}</div>
                        <div className="text-sm opacity-60">{profile.company}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm opacity-80">
                    <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${price}/meeting
                    </span>
                    <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {tags.length} tags
                    </span>
                </div>
            </motion.div>

            {/* Edit Form */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Listing Title
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., VP of Engineering"
                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">This is what hunters will see first</p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                        About You
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What are you working on? What topics are you interested in discussing?"
                        rows={4}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Price per Meeting
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(Math.max(50, parseInt(e.target.value) || 50))}
                            min={50}
                            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Minimum $50. Hunters can bid higher.</p>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Tags & Expertise
                    </label>

                    {/* Current Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map(tag => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full"
                            >
                                {tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-emerald-900"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Add Tag Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                            placeholder="Add a tag..."
                            className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                        <button
                            onClick={() => addTag(tagInput)}
                            disabled={!tagInput.trim()}
                            className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Suggested Tags */}
                    {suggestedTags.length > 0 && (
                        <div className="mt-3">
                            <span className="text-xs text-zinc-400 mr-2">Suggestions:</span>
                            {suggestedTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => addTag(tag)}
                                    className="inline-block px-2 py-1 text-xs text-zinc-500 bg-zinc-100 rounded-full mr-1 mb-1 hover:bg-zinc-200"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Info (read-only) */}
                <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-bold text-zinc-700 mb-3">
                        Contact Info
                    </label>
                    <div className="space-y-2 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {profile.email}
                        </div>
                        {profile.metadata?.linkedIn && (
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4" />
                                {profile.metadata.linkedIn}
                            </div>
                        )}
                        {profile.metadata?.website && (
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {profile.metadata.website}
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                        success
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-900 text-white hover:bg-black disabled:opacity-50"
                    )}
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
