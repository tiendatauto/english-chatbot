"use client";

import InfoDialog from "@/components/InfoDialog";
import Navbar from "@/components/Navbar";
import { useCheckOnboard } from "@/hooks/useCheckOnboard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { features } from "./constant";

export default function Dashboard() {
  const router = useRouter();
  const [showInfoDialog, setShowInfoDialog] = useState(true);
  useCheckOnboard();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50/95 via-purple-50/98 to-slate-100/95 dark:from-slate-950/95 dark:via-purple-900/40 dark:to-slate-950/95 transition-all duration-1000">
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-[160px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-[160px] animate-pulse-slow delay-1000"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))]"></div>
      <Navbar />

      {/* Info Dialog */}
      <InfoDialog
        isOpen={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
      />

      {/* Main content with padding-top to account for fixed navbar */}
      <div className="container mx-auto px-8 min-h-screen pt-20 flex items-center justify-center py-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.href}
                onClick={() => router.push(feature.href)}
                className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl p-8 shadow-lg transition-all hover:shadow-2xl dark:bg-slate-900/50 hover:-translate-y-2 duration-300 border border-white/20 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-800/50 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100"
              >
                <div className="relative z-10">
                  <div
                    className={`mb-6 inline-flex items-center justify-center rounded-2xl p-4 bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mb-3 text-md font-medium bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent dark:from-slate-400 dark:to-slate-300">
                    {feature.englishTitle}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effects */}
                <div
                  className={`absolute inset-0 z-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:group-hover:opacity-20 pointer-events-none ${feature.gradient}`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 transition-all duration-300 group-hover:opacity-100 ${feature.gradient}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
