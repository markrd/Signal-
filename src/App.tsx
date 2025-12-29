import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginModal } from './components/LoginModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InvestorPage } from './components/InvestorPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { supabase } from './lib/supabase';
import './index.css';

type View = 'home' | 'onboarding' | 'marketplace' | 'executive' | 'investor';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [oauthCompleting, setOauthCompleting] = useState(false);

  // Handle OAuth callback from LinkedIn
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.get('oauth') === 'linkedin' && user) {
        setOauthCompleting(true);

        try {
          // Get saved onboarding data from before OAuth redirect
          const savedRole = localStorage.getItem('signal_onboarding_role');
          const savedDataStr = localStorage.getItem('signal_onboarding_data');
          const savedData = savedDataStr ? JSON.parse(savedDataStr) : {};

          // Extract profile data from OAuth user metadata
          const { user_metadata } = user;
          const fullName = user_metadata?.full_name || user_metadata?.name || '';
          const avatarUrl = user_metadata?.picture || '';

          // Create profile with verified status
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            role: savedRole || savedData.role || 'HUNTER',
            full_name: fullName,
            company: savedData.company || '',
            verified: true,
            metadata: {
              ...savedData.metadata,
              linkedInVerified: true,
              avatarUrl: avatarUrl,
            },
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Clear localStorage and URL params
          localStorage.removeItem('signal_onboarding_role');
          localStorage.removeItem('signal_onboarding_data');
          window.history.replaceState({}, '', window.location.pathname);

        } catch (err) {
          console.error('OAuth completion error:', err);
        } finally {
          setOauthCompleting(false);
        }
      }
    };

    handleOAuthCallback();
  }, [user]);

  // Redirect based on user role
  useEffect(() => {
    if (user && profile && (view === 'home' || view === 'marketplace' || view === 'executive')) {
      // Route based on role
      if (profile.role === 'SIGNAL') {
        setView('executive');
      } else {
        setView('marketplace');
      }
    }
  }, [user, profile, view]);

  const handleLogout = async () => {
    await signOut();
    setView('home');
  };

  const handleLoginSuccess = () => {
    // User is now logged in, useEffect will handle redirecting
    setShowLoginModal(false);
  };

  if (loading || oauthCompleting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-zinc-400 font-bold">
            {oauthCompleting ? 'Completing LinkedIn verification...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'home' && !user && (
        <HomePage
          onGetStarted={() => setView('onboarding')}
          onInvestor={() => setView('investor')}
          onLogin={() => setShowLoginModal(true)}
        />
      )}
      {view === 'onboarding' && !user && (
        <OnboardingWizard
          onComplete={() => {
            // Will be redirected based on role after auth completes
            setView('home');
          }}
          onBack={() => setView('home')}
        />
      )}
      {view === 'investor' && (
        <InvestorPage onBack={() => setView('home')} />
      )}
      {/* Hunter view - Marketplace */}
      {view === 'marketplace' && user && profile?.role === 'HUNTER' && (
        <MarketplaceFeed onLogout={handleLogout} />
      )}
      {/* Executive view - Dashboard */}
      {view === 'executive' && user && profile?.role === 'SIGNAL' && (
        <ExecutiveDashboard onLogout={handleLogout} />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignUp={() => {
          setShowLoginModal(false);
          setView('onboarding');
        }}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
