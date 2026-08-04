import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blue-300 font-semibold uppercase tracking-[0.3em] text-sm">Developer Analytics</p>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
              Measure your coding momentum in one place.
            </h1>
            <p className="text-slate-300 mt-6 text-lg leading-8">
              Track commits, monitor streaks, understand your peak coding hours, and keep your team aligned with clear productivity insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold">
                Get Started
              </Link>
              <Link to="/dashboard" className="border border-white/20 hover:bg-white/10 px-6 py-3 rounded-lg font-semibold">
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold">What you get</h2>
            <ul className="mt-6 space-y-4 text-slate-200">
              <li>• Personal productivity overview with real commit metrics</li>
              <li>• Team analytics and collaboration insights</li>
              <li>• Peak-hour and streak tracking for better habits</li>
              <li>• Simple GitHub login experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

