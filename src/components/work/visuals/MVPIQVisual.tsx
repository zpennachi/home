"use client";

import { MockupContainer } from "./MockupContainer";
import { motion } from "framer-motion";

export type MVPIQVariant = 'intro' | 'upload' | 'analysis' | 'payment' | 'mobile';

export function MVPIQVisual({ variant = 'analysis' }: { variant?: MVPIQVariant }) {

    // Variant 1: Intro / Dashboard (The "Problem" -> "Solution")
    if (variant === 'intro') {
        return (
            <MockupContainer type="browser" url="app.mvpiq.com/dashboard" className="bg-zinc-50 dark:bg-zinc-900">
                <div className="flex h-full font-sans text-zinc-900 dark:text-zinc-100">
                    <div className="w-16 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 gap-4 bg-background">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg opacity-50" />
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg opacity-50" />
                    </div>
                    <div className="flex-1 p-8 space-y-6 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Recent Uploads</h2>
                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold shadow-lg shadow-indigo-500/20">
                                + New Analysis
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="aspect-video bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm p-3 flex flex-col justify-between group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">QB</div>
                                        <div className="text-[10px] text-zinc-400">2h ago</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-2 w-1/2 bg-zinc-100 dark:bg-zinc-700 rounded-full" />
                                        <div className="h-2 w-3/4 bg-zinc-100 dark:bg-zinc-700 rounded-full" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    // Variant 2: Upload (Drag & Drop)
    if (variant === 'upload') {
        return (
            <MockupContainer type="browser" url="app.mvpiq.com/upload" className="bg-zinc-50 dark:bg-zinc-900">
                <div className="h-full flex items-center justify-center p-8">
                    <motion.div
                        className="w-full h-full max-w-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-3xl flex flex-col items-center justify-center gap-6 text-center"
                        animate={{
                            borderColor: ['rgba(165, 180, 252, 1)', 'rgba(99, 102, 241, 1)', 'rgba(165, 180, 252, 1)'],
                            scale: [1, 1.01, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl flex items-center justify-center text-4xl">
                            📤
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Drop game footage here</h3>
                            <p className="text-xs text-indigo-600/60 dark:text-indigo-300/60 font-mono">MP4, MOV, WEBM SUPPORTED</p>
                        </div>
                        <div className="w-64 h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden mt-4">
                            <motion.div
                                className="h-full bg-indigo-600"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                        </div>
                    </motion.div>
                </div>
            </MockupContainer>
        );
    }

    // Variant 4: Payment (Stripe)
    if (variant === 'payment') {
        return (
            <MockupContainer type="browser" url="checkout.stripe.com/pay/cs_live..." className="bg-[#f7f9fc] dark:bg-[#1a1b26]">
                <div className="h-full flex items-center justify-center">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                                <div className="font-bold text-lg">MVP IQ Pro</div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-3xl font-bold">$29.00</span>
                                    <span className="text-zinc-400 text-sm">per month</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Card Information</label>
                                <div className="h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center px-3 gap-3">
                                    <span className="text-zinc-400 text-xs">💳</span>
                                    <span className="font-mono text-sm">4242 4242 4242 4242</span>
                                </div>
                            </div>
                            <button className="w-full h-10 bg-indigo-600 text-white rounded-md font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                                Pay $29.00
                            </button>
                        </div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    // Variant 5: Mobile (Responsive)
    if (variant === 'mobile') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                <div className="w-[300px] h-[600px] bg-black rounded-[40px] border-[8px] border-zinc-900 shadow-2xl relative overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />

                    {/* App Content */}
                    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col pt-10">
                        <header className="px-6 pb-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Feedback</h3>
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </header>

                        <div className="flex-1 overflow-hidden relative">
                            {/* Mobile Video */}
                            <div className="bg-black aspect-[9/16] w-full relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">▶</div>
                                </div>
                                {/* Comment Overlay */}
                                <motion.div
                                    className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg"
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 1 }}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-indigo-900">Coach Carter</div>
                                            <p className="text-xs text-zinc-600 leading-snug mt-1">Hips are opening too early here. Keep closed.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Default: Analysis (The original visual)
    return (
        <MockupContainer type="browser" url="app.mvpiq.com/analysis/v8291" className="bg-zinc-50 dark:bg-zinc-900">
            <div className="flex h-full text-zinc-800 dark:text-zinc-200">
                {/* Sidebar Navigation - Collapsed on mobile */}
                <div className="w-16 md:w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-background z-10 transition-all duration-500">
                    <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">M</div>
                        <span className="hidden md:block ml-3 font-bold">MVP IQ</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 rounded-md bg-zinc-100 dark:bg-zinc-800/50 w-full animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* App Header */}
                    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-background">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-sm">QB Read Analysis</span>
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">PENDING REVIEW</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-200" />
                    </header>

                    <div className="flex-1 p-6 flex gap-6 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
                        {/* Video Player Area */}
                        <div className="flex-1 rounded-xl bg-black relative shadow-lg overflow-hidden flex items-center justify-center group">
                            {/* Fake Play Button */}
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white cursor-pointer group-hover:scale-110 transition-transform">
                                ▶
                            </div>

                            {/* Overlay UI */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 pb-3 gap-4">
                                <div className="text-white text-xs font-mono">00:14 / 02:30</div>
                                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '45%' }}
                                        transition={{ duration: 10, repeat: Infinity }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Comments Sidebar - hidden on mobile */}
                        <div className="w-80 bg-background rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hidden lg:flex flex-col">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm">
                                Mentor Feedback
                            </div>
                            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                                {/* Comment 1 */}
                                <div className="flex gap-3 text-xs">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0" />
                                    <div className="space-y-1">
                                        <div className="font-bold">Coach Carter</div>
                                        <p className="text-zinc-500">Watch your footwork here. You're stepping too wide.</p>
                                        <div className="text-indigo-600 font-mono text-[10px]">00:12</div>
                                    </div>
                                </div>
                                {/* Comment 2 */}
                                <div className="flex gap-3 text-xs opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0" />
                                    <div className="space-y-1">
                                        <div className="font-bold">Coach Carter</div>
                                        <p className="text-zinc-500">Great release point.</p>
                                        <div className="text-indigo-600 font-mono text-[10px]">00:45</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="h-10 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MockupContainer>
    );
}
