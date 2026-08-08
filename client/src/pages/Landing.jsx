import React from 'react';
import { Link } from 'react-router-dom';
import '../dashboardTheme.css'; // Fixed: changed from './' to '../'

function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen font-body text-[var(--text)]">
      <AuroraBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 font-mono-ui text-[11.5px] tracking-widest uppercase text-[var(--teal)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shadow-[0_0_10px_#2dd4bf] animate-pulse" />
              Developer Analytics
            </div>
            <h1 className="font-display font-medium text-4xl md:text-6xl mt-5 leading-[1.08]">
              Measure your coding <span className="gradient-text-cool italic">momentum</span> in one place.
            </h1>
            <p className="text-muted-aurora mt-6 text-lg leading-8 max-w-xl">
              Track commits, monitor streaks, understand your peak coding hours, and keep your team aligned with clear productivity insights.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="gradient-btn px-6 py-3 rounded-full font-semibold text-[15px]"
              >
                Get Started
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-full font-semibold text-[15px] border border-[var(--border)] hover:border-[var(--border-hi)] hover:bg-white/[0.04] transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="glass rounded-[18px] p-8">
            <h2 className="font-display text-2xl font-medium">What you get</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] mt-2 flex-shrink-0 shadow-[0_0_8px_#2dd4bf]" />
                Personal productivity overview with real commit metrics
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] mt-2 flex-shrink-0 shadow-[0_0_8px_#a78bfa]" />
                Team analytics and collaboration insights
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-2 flex-shrink-0 shadow-[0_0_8px_#fbbf67]" />
                Peak-hour and streak tracking for better habits
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)] mt-2 flex-shrink-0 shadow-[0_0_8px_#fb7185]" />
                Simple GitHub login experience
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}