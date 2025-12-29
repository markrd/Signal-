import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
    id: string;
    email: string;
    role: 'HUNTER' | 'SIGNAL';
    full_name: string;
    company: string;
    verified: boolean;
    metadata: Record<string, unknown>;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        let isResolved = false;

        // Timeout fallback - if auth check takes too long, proceed without auth
        timeoutId = setTimeout(() => {
            if (!isResolved) {
                console.warn('Auth check timed out, proceeding without auth');
                isResolved = true;
                setLoading(false);
            }
        }, 3000);

        // Get initial session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                if (isResolved) return; // Already timed out
                isResolved = true;
                clearTimeout(timeoutId);

                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setLoading(false);
                }
            })
            .catch((error) => {
                if (isResolved) return;
                isResolved = true;
                clearTimeout(timeoutId);
                console.error('Auth session error:', error);
                setLoading(false);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data as Profile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
