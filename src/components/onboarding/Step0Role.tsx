import { motion } from 'framer-motion';
import { Zap, Target, ShieldCheck, Lock } from 'lucide-react';
import type { Role } from './primitives';

// =============================================================================
// STEP 0: ROLE SELECTOR
// =============================================================================

interface RoleSelectorProps {
    onSelect: (role: Role) => void;
    onBack?: () => void;
}

export function RoleSelector({ onSelect, onBack }: RoleSelectorProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30"
                >
                    <Zap className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-3">Welcome to Signal</h1>
                <p className="text-zinc-500 text-lg">Let's set up your profile in a few quick steps</p>
            </div>

            {/* Role Cards */}
            <div className="space-y-4">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => onSelect('SIGNAL')}
                    className="w-full p-6 bg-white border border-zinc-200 rounded-2xl hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left group relative overflow-hidden shadow-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xl font-bold text-zinc-900 mb-1">I'm an Executive</div>
                            <div className="text-sm text-zinc-500">
                                Monetize your expertise. Get paid for meetings.
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-600 text-xs font-bold rounded">EARN $300-1,500</div>
                                <div className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded">PER MEETING</div>
                            </div>
                        </div>
                    </div>
                </motion.button>

                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => onSelect('HUNTER')}
                    className="w-full p-6 bg-white border border-zinc-200 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left group relative overflow-hidden shadow-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <Target className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xl font-bold text-zinc-900 mb-1">I'm a Sales Leader</div>
                            <div className="text-sm text-zinc-500">
                                Book meetings with verified decision makers.
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs font-bold rounded">68% ACCEPT RATE</div>
                                <div className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded">VERIFIED EXECS</div>
                            </div>
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Trust Badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center gap-6 text-zinc-400 text-xs"
            >
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Identities</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>100% Escrow</span>
                </div>
            </motion.div>

            {/* Back to home */}
            {onBack && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-6"
                >
                    <button
                        onClick={onBack}
                        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        ← Back to home
                    </button>
                </motion.div>
            )}
        </div>
    );
}
