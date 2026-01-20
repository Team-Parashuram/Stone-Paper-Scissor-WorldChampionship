'use client';

import Link from 'next/link';
import { Footer } from '@/components';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-200/50 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation */}
        <div className="flex items-center text-sm font-medium text-slate-500 mb-10">
          <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </span>
            Back to Arena
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
             <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Official Regulations
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            The framework for fair competition, ranking calculations, and conduct in the ThrowDown Championship.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main Rules */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Gameplay */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm">1</span>
                        <h2 className="text-xl font-bold text-slate-900">Core Gameplay</h2>
                    </div>
                    
                    <div className="prose prose-slate max-w-none">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                <span className="block font-black text-slate-700 mb-1">Stone</span>
                                <span className="text-xs text-slate-500">Crushes Scissors</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                <span className="block font-black text-slate-700 mb-1">Paper</span>
                                <span className="text-xs text-slate-500">Covers Stone</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                <span className="block font-black text-slate-700 mb-1">Scissors</span>
                                <span className="text-xs text-slate-500">Cuts Paper</span>
                            </div>
                        </div>
                        <ul className="space-y-3 text-slate-600">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>Official matches consist of multiple rounds played to a set score.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>Players must throw simultaneously on the count. Delays result in a void round.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>If both players choose the same shape, it is a draw and no points are awarded.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 2. ELO System */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm">2</span>
                        <h2 className="text-xl font-bold text-slate-900">The ELO Algorithm</h2>
                    </div>

                    <p className="text-slate-600 mb-6">
                        We use a modified Chess ELO system. All fighters begin with a base rating of <strong className="text-indigo-600">1000</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                K-Factor (Volatility)
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex justify-between">
                                    <span>Novice (0-9 games)</span>
                                    <span className="font-mono font-bold text-slate-900">K=40</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Intermediate (10-29)</span>
                                    <span className="font-mono font-bold text-slate-900">K=32</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Pro (30+ games)</span>
                                    <span className="font-mono font-bold text-slate-900">K=16</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Impact Logic
                            </h3>
                            <div className="space-y-2 text-sm text-slate-600">
                                <p>Beating a higher-rated opponent yields significantly more points.</p>
                                <p className="text-slate-400 text-xs mt-2 border-t border-slate-200 pt-2">
                                    *Dominant wins (e.g., 10-0) multiply the ELO gain. Close matches yield standard gains.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Conduct */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm">3</span>
                        <h2 className="text-xl font-bold text-slate-900">Fair Play & Integrity</h2>
                    </div>
                    <ul className="space-y-4 text-slate-600">
                        <li className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 flex-shrink-0"></div>
                            <p><strong>Immutable History:</strong> Once a match is recorded by an official, it is permanent. While admins can correct errors, the log remains visible for transparency.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 flex-shrink-0"></div>
                            <p><strong>Simultaneous Throws:</strong> Any attempt to delay a throw to react to an opponent results in immediate disqualification from the round.</p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 flex-shrink-0"></div>
                            <p><strong>Admin Authority:</strong> In the event of a dispute regarding a throw or timing, the Match Administrator's decision is final.</p>
                        </li>
                    </ul>
                </section>

            </div>

            {/* RIGHT COLUMN: Sidebar info */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Rankings Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        <h3 className="text-lg font-bold">Global Rankings</h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        Rankings update in real-time. The top 3 fighters receive special badge recognition on their profiles.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                            <div className="w-6 h-6 rounded bg-yellow-400 text-yellow-900 flex items-center justify-center text-xs font-bold">#1</div>
                            <span className="text-sm font-medium">Gold Badge</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                            <div className="w-6 h-6 rounded bg-slate-300 text-slate-800 flex items-center justify-center text-xs font-bold">#2</div>
                            <span className="text-sm font-medium">Silver Badge</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                            <div className="w-6 h-6 rounded bg-orange-300 text-orange-900 flex items-center justify-center text-xs font-bold">#3</div>
                            <span className="text-sm font-medium">Bronze Badge</span>
                        </div>
                    </div>
                    <Link href="/leaderboard" className="mt-6 block w-full py-3 bg-white text-slate-900 text-center text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                        Check Standings
                    </Link>
                </div>

                {/* Admin Note */}
                <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                    <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        For Administrators
                    </h3>
                    <p className="text-sm text-indigo-700/80 mb-4 leading-relaxed">
                        Only authorized personnel can record matches. ELO calculations are automated upon submission.
                    </p>
                    <ul className="text-xs text-indigo-600 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                            Create & Manage Fighter Profiles
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                            Resolve Match Disputes
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                            Super Admins can revert matches
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}