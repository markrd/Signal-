import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight, Lock, User, Zap, Target, Database, Activity, Check, Cpu, Wallet, Calendar, DollarSign } from 'lucide-react';
import { cn, wait } from '../lib/utils';

type UserType = 'HUNTER' | 'SIGNAL';

interface HowItWorksProps {
    onComplete: () => void;
    embedded?: boolean;
}

const SIGNAL_STEPS = [
    {
        id: 0,
        title: "Your Profile Works For You",
        subtitle: "AI-powered identity verification",
        desc: "Connect your LinkedIn and email. Our AI instantly verifies your executive status, extracts your buying context, and creates a searchable Signal—no forms, no manual entry.",
        benefits: ["Instant C-suite verification", "Auto-extracted tech stack & budget", "Zero data entry required"]
    },
    {
        id: 1,
        title: "Stay Anonymous Until Paid",
        subtitle: "You control the reveal",
        desc: "Vendors see your role, company size, and buying intent—but never your name. They must stake real money to unlock your identity and send a pitch. No payment? No spam.",
        benefits: ["Identity protected by default", "Money-backed requests only", "100% spam elimination"]
    },
    {
        id: 2,
        title: "Get Paid Instantly",
        subtitle: "Escrow-protected payouts",
        desc: "When you accept a meeting, funds are already locked. Complete the call, and payment hits your account automatically. No invoices. No chasing. No delays.",
        benefits: ["Funds secured before you accept", "Instant post-meeting payout", "Never chase a payment again"]
    }
];

const HUNTER_STEPS = [
    {
        id: 0,
        title: "Find the Exact Buyer",
        subtitle: "Search by what actually matters",
        desc: "Stop guessing. Filter decision-makers by verified tech stack, confirmed budget, and active initiatives. Find the CTO evaluating data platforms with $2M+ to spend—in seconds.",
        benefits: ["Real-time tech stack data", "Verified budget ranges", "Active buying signals"]
    },
    {
        id: 1,
        title: "Stake to Stand Out",
        subtitle: "Money talks, spam walks",
        desc: "Cold emails get ignored. Money-backed requests get attention. Deposit your meeting offer into escrow—if they accept, you get the meeting. If not, you get an instant refund.",
        benefits: ["Guaranteed inbox placement", "Direct calendar access", "Zero-risk bidding"]
    },
    {
        id: 2,
        title: "Pay Only For Results",
        subtitle: "100% refund if no meeting",
        desc: "Your funds stay in smart contract escrow. If the exec declines, cancels, or ghosts—automatic refund. You only pay when the meeting actually happens.",
        benefits: ["Code-enforced refunds", "No sunk costs ever", "Meeting or money back"]
    }
];

const MOCK_MATCHES = [
    { role: "Chief Technology Officer", company: "Series D Fintech", signals: ["Cloud Migration", "Data Platform"], budget: "$2M+", score: 98, verified: true },
    { role: "VP of Engineering", company: "Enterprise Healthcare", signals: ["Security", "Compliance"], budget: "$5M+", score: 95, verified: true },
    { role: "Head of Data", company: "E-commerce Leader", signals: ["Analytics", "ML Pipeline"], budget: "$800k+", score: 92, verified: true }
];

export function HowItWorks({ onComplete, embedded = false }: HowItWorksProps) {
    const [mode, setMode] = useState<UserType>('HUNTER');
    const [currentStep, setCurrentStep] = useState(0);
    const [demoState, setDemoState] = useState(0);

    const steps = mode === 'HUNTER' ? HUNTER_STEPS : SIGNAL_STEPS;
    const activeTheme = mode === 'HUNTER' ? 'blue' : 'emerald';
    const activeColor = mode === 'HUNTER' ? 'text-blue-600' : 'text-emerald-600';
    const activeBg = mode === 'HUNTER' ? 'bg-blue-600' : 'bg-emerald-600';
    const activeBorder = mode === 'HUNTER' ? 'border-blue-500' : 'border-emerald-500';
    const activeLightBg = mode === 'HUNTER' ? 'bg-blue-50' : 'bg-emerald-50';

    useEffect(() => { setCurrentStep(0); setDemoState(0); }, [mode]);

    useEffect(() => {
        let mounted = true;
        setDemoState(0);
        const runAnimation = async () => {
            await wait(400); if (!mounted) return; setDemoState(1);
            await wait(800); if (!mounted) return; setDemoState(2);
            await wait(1200); if (!mounted) return; setDemoState(3);
        };
        runAnimation();
        return () => { mounted = false; };
    }, [currentStep, mode]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) { setCurrentStep(c => c + 1); }
        else { onComplete(); }
    };

    return (
        <div className={cn("bg-white", embedded ? "py-20" : "min-h-screen py-24")}>
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                        Two sides of the same marketplace—one seamless workflow
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 shadow-sm">
                        <button
                            onClick={() => setMode('HUNTER')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                mode === 'HUNTER'
                                    ? "bg-white text-blue-600 shadow-md ring-1 ring-blue-100"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <Target className="w-4 h-4" />
                            I'm a Sales Leader
                        </button>
                        <button
                            onClick={() => setMode('SIGNAL')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                mode === 'SIGNAL'
                                    ? "bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <Zap className="w-4 h-4" />
                            I'm an Executive
                        </button>
                    </div>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div
                    className="gap-12"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        alignItems: 'center'
                    }}
                >

                    {/* Left Column: Text Content */}
                    <div className="space-y-6">

                        {/* Step Indicators */}
                        <div className="flex items-center gap-4">
                            {[0, 1, 2].map((step) => (
                                <button
                                    key={step}
                                    onClick={() => setCurrentStep(step)}
                                    className={cn(
                                        "flex-1 h-2 rounded-full transition-all duration-300",
                                        currentStep === step
                                            ? (mode === 'HUNTER' ? 'bg-blue-500' : 'bg-emerald-500')
                                            : currentStep > step
                                                ? (mode === 'HUNTER' ? 'bg-blue-200' : 'bg-emerald-200')
                                                : 'bg-zinc-200'
                                    )}
                                />
                            ))}
                        </div>

                        {/* Step Number */}
                        <div className={cn("flex items-center gap-3", activeColor)}>
                            <span className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg text-white shadow-lg",
                                activeBg
                            )}>
                                {currentStep + 1}
                            </span>
                            <span className="text-zinc-400 font-mono text-sm">of 3</span>
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${mode}-${currentStep}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
                                        {steps[currentStep].title}
                                    </h3>
                                    <p className={cn("text-xl font-medium", activeColor)}>
                                        {steps[currentStep].subtitle}
                                    </p>
                                </div>

                                <p className="text-lg text-zinc-600 leading-relaxed">
                                    {steps[currentStep].desc}
                                </p>

                                <ul className="space-y-3">
                                    {steps[currentStep].benefits.map((benefit, i) => (
                                        <motion.li
                                            key={benefit}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.1) }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", activeLightBg)}>
                                                <CheckCircle2 className={cn("w-4 h-4", activeColor)} />
                                            </div>
                                            <span className="text-zinc-700 font-medium">{benefit}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex items-center gap-4 pt-4">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(c => c - 1)}
                                    className="px-6 py-3 rounded-full text-zinc-500 hover:text-zinc-900 font-bold transition-colors bg-zinc-100 hover:bg-zinc-200"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={cn(
                                    "group px-8 py-4 rounded-full text-white font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                                    activeBg,
                                    mode === 'HUNTER' ? "hover:bg-blue-700" : "hover:bg-emerald-700"
                                )}
                            >
                                {currentStep === 2 ? (embedded ? 'Join the Network' : 'Get Started') : 'Next'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Interactive Demo */}
                    <div className="flex items-center justify-center">
                        <div className={cn(
                            "relative w-full h-[520px] rounded-3xl border-2 overflow-hidden flex items-center justify-center p-6 transition-colors duration-500",
                            mode === 'HUNTER' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'
                        )}>

                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />

                            {/* Ambient Glow */}
                            <div className={cn(
                                "absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-60 transition-colors duration-1000",
                                mode === 'HUNTER' ? "bg-blue-200" : "bg-emerald-200"
                            )} />

                            <AnimatePresence mode="wait">

                                {/* HUNTER DEMOS */}
                                {mode === 'HUNTER' && currentStep === 0 && (
                                    <motion.div key="h0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md relative z-10">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                                            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                <div className="flex items-center gap-2 text-sm font-bold">
                                                    <Target className="w-4 h-4" />
                                                    Executive Search
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">CTO</span>
                                                    {demoState >= 1 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 flex items-center gap-1"><Database className="w-3 h-3" /> Data Platform</motion.span>}
                                                    {demoState >= 2 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">$1M+ Budget</motion.span>}
                                                </div>
                                                <div className="space-y-3">
                                                    {demoState >= 3 ? MOCK_MATCHES.map((m, i) => (
                                                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">{m.role.charAt(0)}</div>
                                                                    <div>
                                                                        <div className="font-bold text-zinc-900 text-sm">{m.role}</div>
                                                                        <div className="text-xs text-zinc-500">{m.company}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{m.score}%</div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {m.signals.map(s => <span key={s} className="text-[10px] px-2 py-0.5 bg-white border border-zinc-200 rounded text-zinc-600">{s}</span>)}
                                                                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 font-bold">{m.budget}</span>
                                                            </div>
                                                        </motion.div>
                                                    )) : <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {mode === 'HUNTER' && currentStep === 1 && (
                                    <motion.div key="h1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm relative z-10">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                                            <div className="p-4 bg-zinc-50 border-b border-zinc-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">C</div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900">CTO @ Series D Fintech</div>
                                                        <div className="text-xs text-zinc-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Executive</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-5">
                                                <div>
                                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Your Meeting Offer</label>
                                                    <div className={cn("flex items-center gap-2 p-4 rounded-xl border-2 transition-all", demoState >= 2 ? "border-blue-500 bg-blue-50" : "border-zinc-200 bg-zinc-50")}>
                                                        <DollarSign className="w-5 h-5 text-zinc-400" />
                                                        <span className="text-3xl font-bold text-zinc-900 font-mono">{demoState >= 2 ? "500" : "0"}</span>
                                                        <span className="text-sm text-zinc-400">.00 USDC</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                                                    <span className="text-xs text-blue-700">Funds held in escrow • Full refund if declined</span>
                                                </div>
                                                <button className={cn("w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2", demoState >= 3 ? "bg-blue-600 text-white shadow-lg" : "bg-zinc-100 text-zinc-400")}>
                                                    {demoState >= 3 ? <><CheckCircle2 className="w-5 h-5" /> Request Sent!</> : <><Lock className="w-5 h-5" /> Stake to Request</>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {mode === 'HUNTER' && currentStep === 2 && (
                                    <motion.div key="h2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md relative z-10">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                                            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between">
                                                <span className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Escrow Status</span>
                                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Contract #8291</span>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {[
                                                    { state: 1, icon: Wallet, label: "Funds Deposited", detail: "$500 USDC locked", color: "blue" },
                                                    { state: 2, icon: Calendar, label: "Meeting Completed", detail: "30 min call verified", color: "purple" },
                                                    { state: 3, icon: CheckCircle2, label: "Payment Released", detail: "Funds sent to exec", color: "emerald" }
                                                ].map((item, i) => {
                                                    const active = demoState >= item.state;
                                                    return (
                                                        <div key={i} className="flex items-center gap-4">
                                                            <motion.div animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0.4 }} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", active ? `bg-${item.color}-100` : "bg-zinc-100")}>
                                                                <item.icon className={cn("w-6 h-6", active ? `text-${item.color}-600` : "text-zinc-400")} />
                                                            </motion.div>
                                                            <div className="flex-1">
                                                                <div className={cn("font-bold transition-colors", active ? "text-zinc-900" : "text-zinc-400")}>{item.label}</div>
                                                                <div className={cn("text-sm transition-colors", active ? "text-zinc-500" : "text-zinc-300")}>{item.detail}</div>
                                                            </div>
                                                            {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></motion.div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SIGNAL DEMOS */}
                                {mode === 'SIGNAL' && currentStep === 0 && (
                                    <motion.div key="s0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md relative z-10">
                                        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden font-mono">
                                            <div className="p-3 bg-zinc-800 border-b border-zinc-700 flex items-center gap-2">
                                                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-amber-500" /><div className="w-3 h-3 rounded-full bg-emerald-500" /></div>
                                                <span className="text-xs text-zinc-500 ml-2">signal_agent.sh</span>
                                            </div>
                                            <div className="p-5 text-sm leading-relaxed text-zinc-300 min-h-[280px]">
                                                <div className="text-zinc-500 mb-2">$ signal verify --profile</div>
                                                {demoState >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 mb-2">✓ LinkedIn connected</motion.div>}
                                                {demoState >= 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                                                    <div className="text-zinc-500">Scanning professional graph...</div>
                                                    <div className="text-white">→ Role: <span className="text-emerald-400">Chief Technology Officer</span></div>
                                                    <div className="text-white">→ Company: <span className="text-emerald-400">Fintech Corp (Series D)</span></div>
                                                </motion.div>}
                                                {demoState >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                                    <div className="text-emerald-400 mb-2">Signal Created ✓</div>
                                                    <div className="text-xs text-zinc-500">
                                                        <div>{"{"}</div>
                                                        <div className="pl-4">verified: <span className="text-emerald-400">true</span>,</div>
                                                        <div className="pl-4">techStack: <span className="text-amber-400">["AWS", "Snowflake"]</span>,</div>
                                                        <div className="pl-4">budget: <span className="text-amber-400">"$2M+"</span></div>
                                                        <div>{"}"}</div>
                                                    </div>
                                                </motion.div>}
                                                <div className="mt-4 w-2 h-4 bg-emerald-500 animate-pulse inline-block" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {mode === 'SIGNAL' && currentStep === 1 && (
                                    <motion.div key="s1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm relative z-10">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                                            <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><Shield className="w-4 h-4" /> Privacy Shield</div>
                                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded-full border border-emerald-200 text-emerald-600">ID: ANON-8291</span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-14 h-14 rounded-full bg-zinc-200 blur-[3px]" />
                                                    <div className="space-y-2 flex-1"><div className="h-4 bg-zinc-200 rounded w-3/4 blur-[2px]" /><div className="h-3 bg-zinc-100 rounded w-1/2 blur-[2px]" /></div>
                                                </div>
                                                <div className="text-xs text-zinc-400 mb-4 p-3 bg-zinc-50 rounded-lg">Your identity is hidden until you accept a paid request</div>
                                                {demoState >= 2 && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-bold text-emerald-700 uppercase">Inbound Offer</span>
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-zinc-900 mb-2">$500 <span className="text-sm font-normal text-zinc-500">USDC</span></div>
                                                    <div className="text-xs text-zinc-600 mb-4">"Cloud infrastructure optimization discussion"</div>
                                                    <button className={cn("w-full py-3 rounded-lg font-bold text-sm transition-all", demoState >= 3 ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400")}>{demoState >= 3 ? "✓ Accepted" : "Reveal & Accept"}</button>
                                                </motion.div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {mode === 'SIGNAL' && currentStep === 2 && (
                                    <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md relative z-10">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                                            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between">
                                                <span className="font-bold flex items-center gap-2"><DollarSign className="w-4 h-4" /> Payout Status</span>
                                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Meeting #4821</span>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {[
                                                    { state: 1, icon: Lock, label: "Funds Secured", detail: "$500 in escrow", color: "emerald" },
                                                    { state: 2, icon: Calendar, label: "Meeting Complete", detail: "30 min verified", color: "purple" },
                                                    { state: 3, icon: DollarSign, label: "Paid!", detail: "$500 → Your wallet", color: "emerald" }
                                                ].map((item, i) => {
                                                    const active = demoState >= item.state;
                                                    return (
                                                        <div key={i} className="flex items-center gap-4">
                                                            <motion.div animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0.4 }} className={cn("w-12 h-12 rounded-xl flex items-center justify-center", active ? "bg-emerald-100" : "bg-zinc-100")}>
                                                                <item.icon className={cn("w-6 h-6", active ? "text-emerald-600" : "text-zinc-400")} />
                                                            </motion.div>
                                                            <div className="flex-1">
                                                                <div className={cn("font-bold", active ? "text-zinc-900" : "text-zinc-400")}>{item.label}</div>
                                                                <div className={cn("text-sm", active ? "text-zinc-500" : "text-zinc-300")}>{item.detail}</div>
                                                            </div>
                                                            {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></motion.div>}
                                                        </div>
                                                    );
                                                })}
                                                {demoState >= 3 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                                                    <div className="text-3xl font-bold text-emerald-600 mb-1">$500.00</div>
                                                    <div className="text-sm text-emerald-700">Deposited to your wallet</div>
                                                </motion.div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
