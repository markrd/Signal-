import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Users,
    ShieldCheck,
    BarChart3,
    Lock,
    Gem,
    Coins,
    Rocket,
    CheckCircle2,
    DollarSign,
    Target,
    Activity,
    Database,
    Zap,
    Cookie,
    EyeOff,
    FileBarChart,
    AlertTriangle,
    Siren,
    Scale,
    Mail,
    MousePointerClick
} from 'lucide-react';
import { cn } from '../lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// --- MOCK METRICS ---
const METRICS = [
    { label: 'Weekly GMV', value: '$482k', growth: '+18%', icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Verified Executives', value: '14,200', growth: '+124/day', icon: Users, color: 'text-blue-600' },
    { label: 'Bid Accept Rate', value: '68%', sub: 'vs 0.4% email', icon: Activity, color: 'text-purple-600' },
    { label: 'Avg Contract Value', value: '$1,250', growth: 'per meeting', icon: Target, color: 'text-orange-600' }
];

interface InvestorPageProps {
    onBack?: () => void;
}

export function InvestorPage({ onBack }: InvestorPageProps) {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubmitted(true);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20 pt-24 overflow-y-auto">
            {/* Navigation / Back */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-zinc-900/90 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
                </button>
            </nav>

            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-24"
                >
                    {/* Header / Hook */}
                    <section className="text-center max-w-3xl mx-auto">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Series A Memo</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 mb-6 leading-[0.95]">
                            The Clearinghouse for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Attention Economy</span>.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl text-zinc-500 leading-relaxed">
                            We are building the economic layer for professional communication. <br />
                            Replacing "spam" with "markets".
                        </motion.p>

                        {/* Email Capture */}
                        <motion.div variants={itemVariants} className="mt-8">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        placeholder="accredited.investor@fund.com"
                                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <button className="bg-zinc-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg">
                                        Request Deck <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md mx-auto">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-bold">Request Sent</div>
                                        <div className="text-sm opacity-80">Our IR team will contact you shortly.</div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </section>

                    {/* Key Metrics Grid */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {METRICS.map((m, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("p-2 rounded-lg bg-zinc-50", m.color)}>
                                            <m.icon className="w-5 h-5" />
                                        </div>
                                        {m.growth && <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{m.growth}</div>}
                                    </div>
                                    <div className="text-3xl font-bold text-zinc-900 tracking-tight mb-1">{m.value}</div>
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{m.label}</div>
                                    {m.sub && <div className="text-xs text-zinc-400 mt-1">{m.sub}</div>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* The Thesis */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">The "Zero Marginal Cost" Problem</h2>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Generative AI has driven the cost of sending an email to zero. The result is infinite noise.
                                Decision makers are retreating into closed networks, making them inaccessible.
                            </p>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Signal re-introduces <span className="text-zinc-900 font-bold">Costly Signaling</span>.
                                By attaching a financial stake to a meeting request, sales teams prove conviction, and executives monetize their scarcity.
                            </p>

                            <div className="pt-4 flex gap-4">
                                <div className="pl-4 border-l-2 border-zinc-200">
                                    <div className="text-2xl font-bold text-zinc-900">0.1%</div>
                                    <div className="text-sm text-zinc-400">Cold Email Reply Rate</div>
                                </div>
                                <div className="pl-4 border-l-2 border-blue-500">
                                    <div className="text-2xl font-bold text-blue-600">68%</div>
                                    <div className="text-sm text-zinc-400">Signal Acceptance Rate</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Abstract */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl shadow-zinc-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 -z-10" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-200" />
                                        <div className="w-32 h-2 bg-zinc-200 rounded" />
                                    </div>
                                    <div className="text-xs font-bold text-zinc-400">SPAM</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-200" />
                                        <div className="w-24 h-2 bg-zinc-200 rounded" />
                                    </div>
                                    <div className="text-xs font-bold text-zinc-400">IGNORED</div>
                                </div>

                                {/* The Signal */}
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                                    className="flex items-center justify-between p-5 bg-white rounded-xl border border-blue-200 shadow-lg shadow-blue-100 relative z-10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900">Priority Bid</div>
                                            <div className="text-xs text-blue-600 font-medium">Staked: $500.00</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACCEPTED</div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Why Now */}
                    <section className="py-12 border-t border-zinc-200">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Now: The Perfect Storm</h2>
                            <p className="text-zinc-500 max-w-2xl">
                                Three macro-structural shifts are converging to make the Signal model inevitable in 2025.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <TrendCard
                                icon={Siren}
                                title="AI Abundance"
                                stat="100x Volume"
                                desc="Generative AI has driven the marginal cost of outreach to zero. Inboxes are unusable. Attention is now the scarcest asset in the enterprise."
                                color="blue"
                            />
                            <TrendCard
                                icon={Scale}
                                title="Regulatory Wall"
                                stat="Cookie Death"
                                desc="GDPR, CCPA, and Chrome's 2025 cookie deprecation are blinding legacy brokers (ZoomInfo). The only legal future is consensual, zero-party data."
                                color="red"
                            />
                            <TrendCard
                                icon={ShieldCheck}
                                title="Trust Collapse"
                                stat="Deepfake Era"
                                desc="AI voice cloning and automated phishing have destroyed trust in digital comms. Cryptographic verification (zkTLS) is no longer optional."
                                color="emerald"
                            />
                        </div>
                    </section>

                    {/* Intent/Cookie vs Signal */}
                    <section className="py-12 border-t border-zinc-200">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">The Death of Probabilistic Targeting</h2>
                            <p className="text-zinc-500 max-w-2xl mx-auto">
                                The cookie is dead. IP matching is decaying. The "Intent Data" industry is selling probability, not truth.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: The Legacy Problem */}
                            <div className="p-8 rounded-3xl bg-zinc-100 border border-zinc-200 relative overflow-hidden group">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-red-100 text-red-600 rounded-lg">
                                        <Cookie className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-red-600 uppercase tracking-wider">The Legacy Stack</span>
                                </div>

                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Probabilistic "Guessing"</h3>
                                <p className="text-zinc-500 mb-8 leading-relaxed">
                                    Incumbents (ZoomInfo, 6sense) rely on third-party cookies and IP address matching to "guess" intent. As browsers block cookies and privacy laws tighten, this signal is degrading rapidly.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span>IP Matching <span className="text-zinc-900 font-bold">~40% Accuracy</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                        <EyeOff className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span>Cookies Blocked by Default (Chrome '25)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                        <FileBarChart className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span>"Surging Interest" ≠ Buying Intent</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: The Signal Solution */}
                            <div className="p-8 rounded-3xl bg-white border border-blue-200 shadow-xl shadow-blue-100/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">The Signal Model</span>
                                </div>

                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Deterministic Truth</h3>
                                <p className="text-zinc-500 mb-8 leading-relaxed">
                                    We don't guess. Executives on Signal <strong>explicitly declare</strong> their tech stack, budget, and active initiatives to get paid. This is zero-party data, verified by zkTLS, and staked with capital.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Verified Identity <span className="text-emerald-600 font-bold">100% Accuracy</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                                        <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Declared Budget & Timeline</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                                        <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Financial Stake = True Intent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* The Efficiency Gap */}
                    <section className="py-12 border-t border-zinc-200">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">The Efficiency Gap</h2>
                            <p className="text-zinc-500 max-w-2xl mx-auto">
                                The "Spray and Pray" era is over. Signal restores unit economics to B2B sales by replacing volume with conviction.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl border border-zinc-200 p-8 md:p-12 shadow-sm">
                            <div className="space-y-10">
                                {/* Channel 1 */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Mail className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-zinc-900">Cold Email & Outreach</div>
                                                <div className="text-xs text-zinc-400">High Volume, Low Trust</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-zinc-300">0.1%</div>
                                            <div className="text-xs text-zinc-400 uppercase font-bold">Reply Rate</div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-300 w-[1%]" />
                                    </div>
                                </div>

                                {/* Channel 2 */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><MousePointerClick className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-zinc-900">Programmatic Display</div>
                                                <div className="text-xs text-zinc-400">Banner Blindness</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-zinc-300">0.4%</div>
                                            <div className="text-xs text-zinc-400 uppercase font-bold">CTR</div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-300 w-[4%]" />
                                    </div>
                                </div>

                                {/* Channel 3 (Signal) */}
                                <div className="relative">
                                    <div className="absolute -left-4 -right-4 -top-4 -bottom-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 -z-10" />
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Zap className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-zinc-900">Signal Priority Bid</div>
                                                <div className="text-xs text-emerald-600 font-bold">Verified High Intent</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-bold text-emerald-600 tracking-tight">68.0%</div>
                                            <div className="text-xs text-emerald-600/70 uppercase font-bold">Accept Rate</div>
                                        </div>
                                    </div>
                                    <div className="h-6 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '68%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-emerald-500 relative"
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px]" />
                                        </motion.div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>680x More Effective than Cold Outreach</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Structural Advantages */}
                    <section className="py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Zap className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Self-Correcting Data</h3>
                                <p className="text-zinc-500 leading-relaxed mb-8">
                                    Legacy databases decay at 30% per year because they rely on static scrapes.
                                    Signal data is <strong>alive</strong>. Executives must verify their active role and stack to withdraw earnings.
                                    If the data is wrong, they don't get paid.
                                </p>
                                <div className="flex items-center gap-4 text-sm font-bold">
                                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
                                        <TrendingDown className="w-4 h-4" /> Legacy: 60% Accuracy
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4" /> Signal: 100% Verified
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Regulatory Immunity</h3>
                                <p className="text-zinc-500 leading-relaxed mb-8">
                                    Scraping personal data is facing an existential regulatory threat (GDPR, CCPA).
                                    Signal is built on <strong>Zero-Party Data</strong>. Users explicitly consent to share their profile to receive bids.
                                    This creates a permanent legal moat that scrapers cannot cross.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                                    <Lock className="w-4 h-4" /> GDPR & CCPA Immune
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* The Data Moat */}
                    <section className="py-12 border-y border-zinc-200">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">The Data Moat</h2>
                            <p className="text-zinc-500">We don't scrape data. Users provide it to get paid.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={ShieldCheck}
                                title="Verified Identity"
                                desc="zkTLS proofs allow us to verify employment history, budget authority, and software usage without accessing the user's login credentials."
                            />
                            <FeatureCard
                                icon={Database}
                                title="First-Party Intent"
                                desc="Executives explicitly list their active initiatives (e.g., 'Replacing CRM') to attract relevant bidders. No guesswork."
                            />
                            <FeatureCard
                                icon={Lock}
                                title="Privacy-Preserving"
                                desc="Profiles are public, but identities are private until a bid is accepted. This encourages high-profile users to join."
                            />
                        </div>
                    </section>

                    {/* Roadmap / Master Plan */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8">Master Plan</h2>
                        <div className="space-y-4">
                            <RoadmapItem
                                phase="Phase 1 (Current)"
                                title="The Marketplace"
                                desc="Liquidity bootstrapping. Manual matching of Buyers and Sellers. Centralized escrow."
                                active
                            />
                            <RoadmapItem
                                phase="Phase 2 (2025)"
                                title="The API Layer"
                                desc="Allowing any CRM (Salesforce, HubSpot) to bid for attention programmatically via Signal API."
                            />
                            <RoadmapItem
                                phase="Phase 3 (2026)"
                                title="The Protocol"
                                desc="Decentralized identity and reputation scoring. Settlement on-chain. The global standard for professional contact."
                            />
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="flex justify-center pt-12 pb-20">
                        <button onClick={() => window.open('mailto:founders@signal.network')} className="bg-zinc-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black transition-all flex items-center gap-2 shadow-xl">
                            Request Data Room <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}

// Helper Components
const TrendCard = ({ icon: Icon, title, stat, desc, color }: { icon: any, title: string, stat: string, desc: string, color: 'blue' | 'red' | 'emerald' }) => {
    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        red: { bg: 'bg-red-50', text: 'text-red-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' }
    }[color];

    return (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl", colorClasses.bg, colorClasses.text)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={cn("px-2 py-1 rounded text-xs font-bold uppercase", colorClasses.bg, colorClasses.text)}>
                    {stat}
                </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">{desc}</p>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200/50">
        <Icon className="w-8 h-8 text-zinc-900 mb-4" />
        <h3 className="font-bold text-zinc-900 mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
);

const RoadmapItem = ({ phase, title, desc, active }: { phase: string, title: string, desc: string, active?: boolean }) => (
    <div className={cn(
        "p-6 rounded-xl border flex gap-6 items-center",
        active ? "bg-white border-zinc-300 shadow-md" : "bg-transparent border-zinc-200 opacity-60"
    )}>
        <div className="w-32 shrink-0">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{phase}</div>
            {active && <div className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">LIVE</div>}
        </div>
        <div>
            <h3 className="font-bold text-zinc-900 text-lg">{title}</h3>
            <p className="text-zinc-500">{desc}</p>
        </div>
    </div>
);
