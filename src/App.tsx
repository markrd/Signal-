import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginModal } from './components/LoginModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InvestorPage } from './components/InvestorPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import './index.css';

type View = 'home' | 'onboarding' | 'marketplace' | 'executive' | 'investor';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 font-bold">Loading...</div>
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
