import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, DollarSign, Tag, FileText, Sparkles,
    Loader2, CheckCircle, AlertCircle, X, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { fetchEntities } from '../lib/entities';
import type { Entity } from '../lib/entities';

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

interface CreateListingFormProps {
    profile: Profile;
    onSuccess: () => void;
    onCancel: () => void;
    editMode?: boolean;
    existingListing?: {
        id: string;
        title: string;
        description: string;
        price: number;
        tags: string[];
        type: 'access' | 'pitch';
    };
}

export function CreateListingForm({
    profile,
    onSuccess,
    onCancel,
    editMode = false,
    existingListing
}: CreateListingFormProps) {
    const [title, setTitle] = useState(existingListing?.title || profile.metadata?.jobTitle || '');
    const [description, setDescription] = useState(existingListing?.description || profile.metadata?.context || '');
    const [price, setPrice] = useState(existingListing?.price || profile.metadata?.suggestedPrice || 250);
    const [tags, setTags] = useState<string[]>(existingListing?.tags || [
        ...(profile.metadata?.techStack || []),
        ...(profile.metadata?.interests || [])
    ]);
    const [listingType, setListingType] = useState<'access' | 'pitch'>(existingListing?.type || 'access');
    const [newTag, setNewTag] = useState('');

    const [entities, setEntities] = useState<Entity[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    useEffect(() => {
        fetchEntities().then(setEntities);
    }, []);

    const suggestedTags = entities
        .filter(e => !tags.includes(e.name))
        .slice(0, 8);

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setNewTag('');
        setShowTagSuggestions(false);
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (price < 50) {
            setError('Minimum price is $50');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (editMode && existingListing) {
                // Update existing listing
                const { error: updateError } = await supabase
                    .from('listings')
                    .update({
                        title: title.trim(),
                        description: description.trim(),
                        price,
                        tags,
                        type: listingType
                    })
                    .eq('id', existingListing.id);

                if (updateError) throw updateError;
            } else {
                // Create new listing
                const { error: insertError } = await supabase
                    .from('listings')
                    .insert({
                        user_id: profile.id,
                        title: title.trim(),
                        description: description.trim(),
                        price,
                        tags,
                        type: listingType,
                        status: 'active'
                    });

                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Error saving listing:', err);
            setError('Failed to save listing. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    {editMode ? 'Listing Updated!' : 'Listing Created!'}
                </h3>
                <p className="text-zinc-500">
                    Your listing is now {editMode ? 'updated' : 'live'} on the marketplace.
                </p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h2 className="text-lg font-bold text-zinc-900">
                    {editMode ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <div className="w-16" /> {/* Spacer for centering */}
            </div>

            {/* Auto-generate hint */}
            {!editMode && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                    <Sparkles className="w-4 h-4" />
                    Pre-filled from your profile. Customize as needed.
                </div>
            )}

            {/* Listing Type */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Listing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setListingType('access')}
                        className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            listingType === 'access'
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        <div className="font-bold text-zinc-900">Access</div>
                        <div className="text-xs text-zinc-500">Get paid for meetings</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setListingType('pitch')}
                        className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            listingType === 'pitch'
                                ? "border-blue-500 bg-blue-50"
                                : "border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        <div className="font-bold text-zinc-900">Pitch</div>
                        <div className="text-xs text-zinc-500">Receive vendor pitches</div>
                    </button>
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Title / Role
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., VP of Engineering"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Description / Expertise
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your expertise and what you can help with..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-colors"
                />
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Price per Meeting
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={50}
                        step={25}
                        className="w-full pl-12 pr-4 py-3 text-xl font-bold rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    />
                </div>
                {profile.metadata?.suggestedPrice && (
                    <p className="text-xs text-zinc-400 mt-1">
                        Suggested: ${profile.metadata.suggestedPrice} based on your seniority
                    </p>
                )}
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Skills & Tags
                </label>

                {/* Current Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map(tag => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-full"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="p-0.5 hover:bg-white/20 rounded-full"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>

                {/* Add Tag Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => {
                            setNewTag(e.target.value);
                            setShowTagSuggestions(true);
                        }}
                        onFocus={() => setShowTagSuggestions(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(newTag.trim());
                            }
                        }}
                        placeholder="Add a tag..."
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => addTag(newTag.trim())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-zinc-100 rounded-lg hover:bg-zinc-200"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Tag Suggestions */}
                {showTagSuggestions && suggestedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {suggestedTags.map(entity => (
                            <button
                                key={entity.id}
                                type="button"
                                onClick={() => addTag(entity.name)}
                                className="px-3 py-1 bg-zinc-100 text-zinc-600 text-sm rounded-full hover:bg-zinc-200 transition-colors"
                            >
                                + {entity.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl transition-all",
                    isSubmitting
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editMode ? 'Updating...' : 'Creating...'}
                    </>
                ) : (
                    <>
                        {editMode ? 'Update Listing' : 'Create Listing'}
                    </>
                )}
            </button>
        </form>
    );
}
