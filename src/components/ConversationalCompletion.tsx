import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, Sparkles, User, Bot } from 'lucide-react';
import { chatWithLLM, calculateSuggestedPrice } from '../lib/llm';
import type { ChatMessage, ExtractedData } from '../lib/llm';
import { supabase } from '../lib/supabase';
import type { Role } from './onboarding/primitives';

// =============================================================================
// CONVERSATIONAL PROFILE COMPLETION
// Uses LLM to naturally collect profile data and map to knowledge graph
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

            // Check if we have enough data
            const hasBasicInfo = newData.jobTitle && newData.company;
            const hasFocusInfo = (newData.interests && newData.interests.length > 0) ||
                (newData.context && newData.context.length > 20);

            if (hasBasicInfo && hasFocusInfo) {
                setIsComplete(true);
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
                content: "I had a little trouble understanding that. Could you tell me more about what technologies or initiatives you're focused on?",
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

                // Create listing description from context/interests
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
            // Still try to complete
            onComplete();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900">Complete your profile</p>
                            <p className="text-sm text-zinc-500">
                                {isComplete ? '✨ Ready to save!' : 'Tell me about your focus areas'}
                            </p>
                        </div>
                    </div>

                    {isComplete && (
                        <button
                            onClick={handleComplete}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                       text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30
                                       hover:opacity-90 transition-all disabled:opacity-50"
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
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-2xl mx-auto space-y-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                    ${message.role === 'assistant'
                                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                        : 'bg-zinc-200'
                                    }`}
                                >
                                    {message.role === 'assistant'
                                        ? <Bot className="w-4 h-4 text-white" />
                                        : <User className="w-4 h-4 text-zinc-600" />
                                    }
                                </div>

                                {/* Message bubble */}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3
                                    ${message.role === 'assistant'
                                        ? 'bg-white border border-zinc-100 shadow-sm'
                                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
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
            </main>

            {/* Input */}
            <footer className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your response..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl outline-none 
                                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                       transition-all disabled:bg-zinc-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                       text-white rounded-xl shadow-lg shadow-emerald-500/30
                                       hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Extracted info preview */}
                    {(extractedData.jobTitle || extractedData.company || extractedData.interests?.length) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 flex flex-wrap gap-2"
                        >
                            {extractedData.jobTitle && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                    {extractedData.jobTitle}
                                </span>
                            )}
                            {extractedData.company && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {extractedData.company}
                                </span>
                            )}
                            {extractedData.interests?.map((interest) => (
                                <span key={interest} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    {interest}
                                </span>
                            ))}
                            {extractedData.techStack?.slice(0, 3).map((tech) => (
                                <span key={tech} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                    {tech}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </div>
            </footer>
        </div>
    );
}
