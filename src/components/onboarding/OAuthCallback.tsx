import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OAuthCallbackProps {
    onComplete: (data: OAuthProfileData) => void;
    onError: (error: string) => void;
}

export interface OAuthProfileData {
    fullName: string;
    email: string;
    avatarUrl: string;
    linkedInId: string;
    verified: boolean;
}

export function OAuthCallback({ onComplete, onError }: OAuthCallbackProps) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Completing LinkedIn verification...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get session from OAuth callback
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (!session?.user) {
                    throw new Error('No session found. Please try again.');
                }

                // Extract profile data from OAuth metadata
                const { user_metadata } = session.user;

                const profileData: OAuthProfileData = {
                    fullName: user_metadata?.full_name || user_metadata?.name || '',
                    email: session.user.email || '',
                    avatarUrl: user_metadata?.picture || user_metadata?.avatar_url || '',
                    linkedInId: user_metadata?.sub || user_metadata?.provider_id || '',
                    verified: true,
                };

                setStatus('success');
                setMessage('LinkedIn connected successfully!');

                // Small delay for UX, then complete
                setTimeout(() => {
                    onComplete(profileData);
                }, 1000);

            } catch (err: any) {
                console.error('OAuth callback error:', err);
                setStatus('error');
                setMessage(err.message || 'Failed to complete LinkedIn verification');
                onError(err.message);
            }
        };

        handleCallback();
    }, [onComplete, onError]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[300px] p-8"
        >
            {status === 'loading' && (
                <>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-600 font-medium">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-emerald-600 font-medium">{message}</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-medium">{message}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 underline"
                    >
                        Return to home
                    </button>
                </>
            )}
        </motion.div>
    );
}
