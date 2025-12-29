import { useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Lock, DollarSign, Ban, CheckCircle2, Megaphone, Wallet, Target, Filter, PlayCircle, Users, Calendar, Fingerprint, ArrowLeftRight, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { HowItWorks } from './HowItWorks';

interface HomePageProps {
    onGetStarted: () => void;
    onInvestor?: () => void;
    onLogin?: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

const SignalLogo = () => (
    <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl text-white shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-black rounded-xl opacity-50" />
            <svg className="relative z-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
            </svg>
        </div>
        <span className="font-bold tracking-tighter text-zinc-900 text-3xl">Signal</span>
    </div>
);

export function HomePage({ onGetStarted, onInvestor, onLogin }: HomePageProps) {
    const howItWorksRef = useRef<HTMLDivElement>(null);

    const scrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-full bg-white text-zinc-900 overflow-y-auto">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>

                {/* Navigation */}
                <motion.nav variants={itemVariants} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
                    <SignalLogo />
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                            <button onClick={scrollToHowItWorks} className="hover:text-zinc-900 cursor-pointer transition-colors">How it Works</button>
                            <button onClick={onInvestor} className="hover:text-zinc-900 cursor-pointer transition-colors">Investors</button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onLogin}
                                className="text-sm font-bold text-zinc-600 hover:text-zinc-900 px-4 py-2 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="text-sm font-bold px-5 py-2.5 bg-zinc-900 text-white hover:bg-black rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                Sign Up Free
                            </button>
                        </div>
                    </div>
                </motion.nav>

                {/* Hero Section */}
                <div className="relative pt-32 pb-20 md:pt-48 md:pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center gap-12 overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white border border-emerald-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">Marketplace Open • Beta</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 mb-8 leading-[1.05]">
                            Sales teams <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">bid for meetings.</span> <br />
                            Executives <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">get paid to listen.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-zinc-500 max-w-3xl mb-10 leading-relaxed font-light">
                            The Marketplace for <span className="font-semibold text-zinc-900">High-Fidelity</span> Connection.
                            <span className="block mt-2 text-zinc-900 text-lg">
                                Access a network of 14,000+ leaders filtered by <span className="underline decoration-zinc-300 underline-offset-4">verified tech stack</span>, <span className="underline decoration-zinc-300 underline-offset-4">budget</span>, and <span className="underline decoration-zinc-300 underline-offset-4">buying intent</span>.
                            </span>
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button onClick={onGetStarted} className="group flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-white font-bold rounded-full hover:bg-black transition-all text-lg shadow-xl shadow-zinc-200 hover:shadow-2xl hover:-translate-y-0.5 min-w-[200px]">
                                Access the Network
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={scrollToHowItWorks} className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-full hover:bg-zinc-50 transition-all text-lg shadow-sm hover:shadow-md min-w-[200px]">
                                <PlayCircle className="w-5 h-5 text-emerald-500" />
                                See how it works
                            </button>
                        </motion.div>

                        {/* Trust Signals */}
                        <motion.div variants={itemVariants} className="mt-16 pt-10 border-t border-zinc-100 w-full flex flex-col items-center">
                            <p className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Trusted by verified leaders from</p>
                            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-xl font-bold font-sans text-zinc-800 tracking-tighter hover:text-[#635BFF] transition-colors cursor-default">Stripe</span>
                                <span className="text-lg font-black font-sans text-zinc-800 uppercase tracking-widest hover:text-[#29B5E8] transition-colors cursor-default">SNOWFLAKE</span>
                                <span className="text-xl font-bold font-serif text-zinc-800 hover:text-[#0000FF] transition-colors cursor-default">Pfizer</span>
                                <span className="text-xl font-bold font-mono text-zinc-800 hover:text-[#632CA6] transition-colors cursor-default">datadog</span>
                                <span className="text-xl font-extrabold font-sans text-zinc-800 tracking-tight hover:text-[#0ABF53] transition-colors cursor-default">Adyen</span>
                                <span className="text-lg font-bold font-sans text-zinc-800 uppercase tracking-widest hover:text-[#007882] transition-colors cursor-default">MERCK</span>
                            </div>
                        </motion.div>

                        {/* Network Stats */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
                            <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide">Meetings Booked</span>
                                </div>
                                <span className="text-2xl font-bold text-zinc-900 tracking-tight">8,432</span>
                            </div>
                            <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide">Verified Execs</span>
                                </div>
                                <span className="text-2xl font-bold text-zinc-900 tracking-tight">14,200+</span>
                            </div>
                            <div className="flex flex-col items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide">Avg Fee / Meeting</span>
                                </div>
                                <span className="text-2xl font-bold text-zinc-900 tracking-tight">$1,250</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Manifesto Section */}
                <motion.div variants={itemVariants} className="py-24 bg-zinc-900 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-500/5 blur-[120px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">The attention economy is broken.</h2>
                            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                                Big Tech built trillion-dollar empires selling your data. <br />
                                Meanwhile, sales efficiency has hit an all-time low.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Sales Pain Card */}
                            <div className="p-8 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:border-blue-500/30 transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Megaphone className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Cost Per Lead is <span className="text-blue-400">up 220%</span></h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    Cold email response rates have plummeted to 0.1%. Sales leaders are burning cash on tools, data enrichment, and SDRs just to get ignored. The "spray and pray" era is over.
                                </p>
                                <div className="pt-6 border-t border-zinc-700/50">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-4">Avg Cost Per Lead (Lead Only)</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                            <div className="text-[10px] text-zinc-500 font-bold mb-1">TECH</div>
                                            <div className="text-sm font-mono text-white">$450</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                            <div className="text-[10px] text-zinc-500 font-bold mb-1">FINTECH</div>
                                            <div className="text-sm font-mono text-white">$950</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                            <div className="text-[10px] text-zinc-500 font-bold mb-1">PHARMA</div>
                                            <div className="text-sm font-mono text-white">$1,400</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exec Pain Card */}
                            <div className="p-8 rounded-3xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Fingerprint className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">You are the <span className="text-emerald-400">Unpaid Product</span></h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    LinkedIn and ZoomInfo monetize your career history and contact info for billions. You get spam, they get rich. Signal flips the model: you own your data, and you get paid for access.
                                </p>
                                <div className="flex items-center gap-4 pt-6 border-t border-zinc-700/50">
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Your Cut of the Data Sale</div>
                                        <div className="text-xl font-mono text-white">$0.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* How It Works Section */}
                <div ref={howItWorksRef} className="border-t border-zinc-100">
                    <HowItWorks onComplete={onGetStarted} embedded={true} />
                </div>

                {/* Value Prop Comparison */}
                <motion.div variants={itemVariants} className="border-y border-zinc-100 bg-white relative">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 border-x border-zinc-100 bg-white shadow-sm">

                        {/* Sales / Hunter Side */}
                        <div className="p-10 md:p-16 group transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 ring-1 ring-blue-100"><Target className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900">For Sales Leaders</h3>
                                        <p className="text-xs text-blue-600 uppercase tracking-wider font-bold mt-1">Buy Access</p>
                                    </div>
                                </div>
                                <ul className="space-y-8">
                                    <ValuePropItem icon={Ban} color="text-blue-500" title="Stop Prospecting" text="Skip the SDR churn. Reach verified decision makers directly." />
                                    <ValuePropItem icon={CheckCircle2} color="text-blue-500" title="100% Response Guarantee" text="If they don't accept your meeting request, you get a full refund instantly." />
                                    <ValuePropItem icon={Zap} color="text-blue-500" title="Contextual Intelligence" text="Filter by verified budget, active initiatives, and live tech stack." />
                                </ul>
                            </div>
                        </div>

                        {/* Executive / Signal Side */}
                        <div className="p-10 md:p-16 group transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/30 transition-colors duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 ring-1 ring-emerald-100"><ShieldCheck className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900">For Executives</h3>
                                        <p className="text-xs text-emerald-600 uppercase tracking-wider font-bold mt-1">Monetize Attention</p>
                                    </div>
                                </div>
                                <ul className="space-y-8">
                                    <ValuePropItem icon={DollarSign} color="text-emerald-500" title="Monetize Your Inbox" text="Set your price ($300 - $5k). Get paid immediately upon meeting completion." />
                                    <ValuePropItem icon={Filter} color="text-emerald-500" title="Filter the Noise" text="Only see pitches from vendors willing to stake real money on your value." />
                                    <ValuePropItem icon={Lock} color="text-emerald-500" title="Private by Default" text="Your identity is blurred until you accept a bid. Reject without consequence." />
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trust Infrastructure Section */}
                <motion.div variants={itemVariants} className="py-24 bg-zinc-50 relative overflow-hidden border-b border-zinc-200">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Trustless Settlement Engine</h2>
                            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                                We replaced the "Invoice" with code. Funds are programmatically secured in escrow before the meeting starts.
                            </p>
                        </div>

                        {/* Mechanism Flow */}
                        <div className="max-w-5xl mx-auto mb-16">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
                                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -z-10 -translate-y-1/2" />
                                <div className="flex flex-col items-center text-center bg-zinc-50 p-4 relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm z-10">
                                        <Wallet className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900">1. Staking</h3>
                                    <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">Buyer deposits bounty into holding contract.</p>
                                </div>
                                <div className="flex flex-col items-center text-center bg-zinc-50 p-4 relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm z-10">
                                        <Lock className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900">2. Verification</h3>
                                    <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">Meeting occurs. Oracle verifies calendar data.</p>
                                </div>
                                <div className="flex flex-col items-center text-center bg-zinc-50 p-4 relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm z-10">
                                        <ArrowLeftRight className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900">3. Settlement</h3>
                                    <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">Funds released to seller or refunded to buyer.</p>
                                </div>
                            </div>
                        </div>

                        {/* Dual Benefit Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShieldCheck className="w-24 h-24 text-blue-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><RefreshCcw className="w-5 h-5" /></div>
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">For Sales Leaders</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-3">100% Refund Guarantee</h3>
                                    <p className="text-zinc-500 leading-relaxed">
                                        You only pay for <strong>completed</strong> meetings. If the executive cancels, ghosts, or declines your invite, the smart contract automatically executes an immediate refund to your wallet. Zero risk.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Lock className="w-5 h-5" /></div>
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">For Executives</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-3">Guaranteed Payouts</h3>
                                    <p className="text-zinc-500 leading-relaxed">
                                        Never chase an invoice again. The bounty is verified and <strong>locked in escrow</strong> before you even receive the calendar invite. As soon as the meeting ends, funds appear in your account instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.footer variants={itemVariants} className="py-16 bg-white border-t border-zinc-100">
                    <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-md">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                                </svg>
                            </div>
                            <span className="font-bold tracking-tight text-zinc-900 text-lg">SIGNAL NETWORK</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium">
                            <button onClick={onInvestor} className="hover:text-zinc-900 transition-colors">Investors</button>
                            <span>© 2025 Signal Labs. All rights reserved.</span>
                        </div>
                    </div>
                </motion.footer>
            </motion.div>
        </div>
    );
}

const ValuePropItem = ({ icon: Icon, title, text, color = "text-zinc-400" }: { icon: React.ElementType, title: string, text: string, color?: string }) => (
    <li className="flex gap-5">
        <div className="mt-1"><Icon className={cn("w-6 h-6", color)} /></div>
        <div>
            <h4 className="text-lg font-bold text-zinc-900 mb-1">{title}</h4>
            <p className="text-sm text-zinc-500 leading-relaxed">{text}</p>
        </div>
    </li>
);
