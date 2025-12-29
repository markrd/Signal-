import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, Sparkles, User, Bot, Building2, Briefcase, Target, Cpu, MapPin, ArrowLeft, X } from 'lucide-react';
import { chatWithLLM, calculateSuggestedPrice } from '../lib/llm';
import type { ChatMessage, ExtractedData } from '../lib/llm';
import { supabase } from '../lib/supabase';
import type { Role } from './onboarding/primitives';

// =============================================================================
// CONVERSATIONAL PROFILE COMPLETION
// Uses LLM to naturally collect profile data with live profile card
// =============================================================================

interface ConversationalCompletionProps {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: Role;
    onComplete: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// =============================================================================
// LIVE PROFILE CARD COMPONENT
// =============================================================================

interface ProfileCardProps {
    data: ExtractedData;
    userName: string;
    userRole: Role;
    isComplete: boolean;
}

function LiveProfileCard({ data, userName, userRole, isComplete }: ProfileCardProps) {
    // Calculate completion percentage
    const fields = [
        !!data.fullName || !!userName,
        !!data.jobTitle,
        !!data.company,
        !!data.industries?.length,
        !!(data.interests?.length || data.context),
        !!data.techStack?.length,
    ];
    const completedFields = fields.filter(Boolean).length;
    const completionPercent = Math.round((completedFields / fields.length) * 100);

    return (
        <motion.div
            className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            {/* Header with gradient */}
            <div className={`h-20 relative ${userRole === 'SIGNAL'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                {/* Completion ring */}
                <div className="absolute -bottom-8 left-6">
                    <div className="relative">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="white" className="shadow-lg" />
                            <circle
                                cx="18" cy="18" r="14"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                            />
                            <motion.circle
                                cx="18" cy="18" r="14"
                                fill="none"
                                stroke={userRole === 'SIGNAL' ? '#10b981' : '#3b82f6'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray={`${completionPercent * 0.88} 88`}
                                initial={{ strokeDasharray: '0 88' }}
                                animate={{ strokeDasharray: `${completionPercent * 0.88} 88` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-700">{completionPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile content */}
            <div className="pt-12 pb-6 px-6">
                {/* Name & Title */}
                <div className="mb-4">
                    <AnimatePresence mode="wait">
                        <motion.h3
                            key={data.fullName || userName}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-lg font-bold text-zinc-900"
                        >
                            {data.fullName || userName}
                        </motion.h3>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {data.jobTitle ? (
                            <motion.p
                                key={data.jobTitle}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-zinc-600 flex items-center gap-1"
                            >
                                <Briefcase className="w-3 h-3" />
                                {data.jobTitle}
                            </motion.p>
                        ) : (
                            <motion.p className="text-sm text-zinc-400 italic">
                                Job title...
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Company & Industry */}
                <div className="space-y-2 mb-4">
                    <AnimatePresence mode="wait">
                        {data.company ? (
                            <motion.div
                                key={data.company}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Building2 className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-700">{data.company}</span>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Building2 className="w-4 h-4" />
                                <span className="italic">Company...</span>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {data.industries?.length ? (
                            <motion.div
                                key={data.industries[0]}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-sm"
                            >
                                <MapPin className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-700">{data.industries[0]}</span>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <MapPin className="w-4 h-4" />
                                <span className="italic">Industry...</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100 my-4" />

                {/* Focus Areas */}
                <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase mb-2">
                        <Target className="w-3 h-3" />
                        Focus Areas
                    </div>
                    <AnimatePresence mode="popLayout">
                        {data.interests?.length ? (
                            <motion.div className="flex flex-wrap gap-1">
                                {data.interests.map((interest, i) => (
                                    <motion.span
                                        key={interest}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${userRole === 'SIGNAL'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {interest}
                                    </motion.span>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="text-xs text-zinc-300 italic">Tell me what you're focused on...</p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase mb-2">
                        <Cpu className="w-3 h-3" />
                        Tech Stack
                    </div>
                    <AnimatePresence mode="popLayout">
                        {data.techStack?.length ? (
                            <motion.div className="flex flex-wrap gap-1">
                                {data.techStack.map((tech, i) => (
                                    <motion.span
                                        key={tech}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                                    >
                                        {tech}
                                    </motion.span>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="text-xs text-zinc-300 italic">Technologies you use...</p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Context preview */}
                {data.context && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-3 bg-zinc-50 rounded-lg"
                    >
                        <p className="text-xs text-zinc-600 line-clamp-3">
                            "{data.context}"
                        </p>
                    </motion.div>
                )}

                {/* Complete button (visible when ready) */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center"
                    >
                        <div className="flex items-center justify-center gap-1 text-sm text-emerald-600 font-medium">
                            <Sparkles className="w-4 h-4" />
                            Profile ready!
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ConversationalCompletion({
    userId,
    userEmail,
    userName,
    userRole,
    onComplete
}: ConversationalCompletionProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData>({
        fullName: userName,
        email: userEmail,
    });
    const [isComplete, setIsComplete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial greeting - broad and curious
    useEffect(() => {
        const greeting: Message = {
            id: 'greeting',
            role: 'assistant',
            content: userRole === 'SIGNAL'
                ? `Hey ${userName.split(' ')[0]}! 👋 Great to have you on Signal.\n\nI'd love to learn a bit about you and what you're working on. **What's your role, and what are the big priorities keeping you busy right now?**`
                : `Hey ${userName.split(' ')[0]}! 👋 Welcome to Signal.\n\nTo connect you with the right executives, I'd love to understand your world a bit better. **Tell me about what you do and who you're typically trying to reach.**`,
            timestamp: new Date(),
        };
        setMessages([greeting]);
    }, [userName, userRole]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input after assistant responds
    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build chat history for LLM
            const chatHistory: ChatMessage[] = messages
                .filter(m => m.id !== 'greeting')
                .map(m => ({ role: m.role, content: m.content }));
            chatHistory.push({ role: 'user', content: userMessage.content });

            // Call LLM
            const response = await chatWithLLM(userRole, chatHistory, extractedData);

            // Update extracted data
            const newData = { ...extractedData, ...response.extracted };
            setExtractedData(newData);

            // Check if we have enough data (more lenient)
            const hasBasicInfo = newData.jobTitle || newData.company;
            const hasFocusInfo = (newData.interests && newData.interests.length > 0) ||
                (newData.context && newData.context.length > 10) ||
                (newData.productOffering) ||
                (newData.targetIndustry);

            // For HUNTER, just need basic info OR any context
            // For SIGNAL, need basic + focus
            if (userRole === 'HUNTER') {
                if (hasBasicInfo || hasFocusInfo) {
                    setIsComplete(true);
                }
            } else {
                if (hasBasicInfo && hasFocusInfo) {
                    setIsComplete(true);
                }
            }

            // Add assistant response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I had a little trouble with that. Could you tell me a bit more about what you're working on?",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        setIsSaving(true);

        try {
            // Update profile with extracted data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: extractedData.fullName || userName,
                    company: extractedData.company || '',
                    metadata: {
                        jobTitle: extractedData.jobTitle,
                        industry: extractedData.industries?.[0] || extractedData.companyIndustry,
                        interests: extractedData.interests || [],
                        techStack: extractedData.techStack || [],
                        customTopics: extractedData.customTopics || [],
                        context: extractedData.context || '',
                        buyingStage: extractedData.buyingStage,
                        profileCompleted: true,
                        completedAt: new Date().toISOString(),
                        completedVia: 'conversational',
                    }
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            // If executive, create/update listing
            if (userRole === 'SIGNAL' && extractedData.jobTitle) {
                const suggestedPrice = calculateSuggestedPrice(
                    extractedData.jobTitle,
                    extractedData.buyingStage
                );

                const description = extractedData.context ||
                    extractedData.interests?.join(', ') ||
                    'Available for meetings';

                await supabase.from('listings').upsert({
                    user_id: userId,
                    type: 'access',
                    title: extractedData.jobTitle,
                    description: description,
                    price: suggestedPrice,
                    tags: [
                        ...(extractedData.interests || []),
                        ...(extractedData.techStack || []),
                        ...(extractedData.customTopics || [])
                    ].slice(0, 10),
                    status: 'active',
                }, { onConflict: 'user_id' });
            }

            onComplete();
        } catch (error) {
            console.error('Save error:', error);
            onComplete();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Allow user to manually mark as done
    const handleMarkDone = () => {
        setIsComplete(true);
    };

    // Check if we have any data at all (to show "I'm done" button)
    const hasAnyData = extractedData.jobTitle || extractedData.company ||
        extractedData.context || extractedData.productOffering ||
        (extractedData.interests && extractedData.interests.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Back/Close button - always visible */}
                        <button
                            onClick={onComplete}
                            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRole === 'SIGNAL'
                            ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                            }`}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900">Build your profile</p>
                            <p className="text-sm text-zinc-500">
                                {isComplete ? '✨ Looking good!' : 'Tell me about yourself'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* "I'm done" button - shows after any data captured */}
                        {!isComplete && hasAnyData && (
                            <button
                                onClick={handleMarkDone}
                                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                I'm done
                            </button>
                        )}

                        {/* Complete button - shows when ready */}
                        {isComplete && (
                            <button
                                onClick={handleComplete}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-lg
                                           transition-all disabled:opacity-50 ${userRole === 'SIGNAL'
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Complete Profile
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content - two column layout */}
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat column */}
                    <div className="lg:col-span-2 flex flex-col h-[calc(100vh-180px)]">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                            <AnimatePresence mode="popLayout">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                            ${message.role === 'assistant'
                                                ? userRole === 'SIGNAL'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                                : 'bg-zinc-200'
                                            }`}
                                        >
                                            {message.role === 'assistant'
                                                ? <Bot className="w-4 h-4 text-white" />
                                                : <User className="w-4 h-4 text-zinc-600" />
                                            }
                                        </div>

                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3
                                            ${message.role === 'assistant'
                                                ? 'bg-white border border-zinc-100 shadow-sm'
                                                : userRole === 'SIGNAL'
                                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userRole === 'SIGNAL'
                                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                        }`}>
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white border border-zinc-100 rounded-2xl px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="sticky bottom-0 bg-gradient-to-br from-zinc-50 to-white pt-4">
                            <div className="flex gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your response..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none 
                                               focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                               transition-all disabled:bg-zinc-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`px-4 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 ${userRole === 'SIGNAL'
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile card column */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <LiveProfileCard
                                data={extractedData}
                                userName={userName}
                                userRole={userRole}
                                isComplete={isComplete}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
