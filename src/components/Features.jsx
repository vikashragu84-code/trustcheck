import React from 'react';
import { MessageSquare, Link, Image, ShieldAlert } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: <MessageSquare className="w-8 h-8 text-cyber-secondary" />,
      title: "Message Analysis",
      description: "Inspect SMS, WhatsApp, and emails for coercive vocabulary, fake customer support handles, or credit queries."
    },
    {
      icon: <Link className="w-8 h-8 text-cyber-secondary" />,
      title: "Link Analysis",
      description: "Deconstruct suspicious domain extensions, insecure HTTP schemas, typopressing, or hidden URL shorteners."
    },
    {
      icon: <Image className="w-8 h-8 text-cyber-secondary" />,
      title: "Screenshot Analysis",
      description: "Simulate screen captures scanning to highlight scam alerts, prize notifications, or fake login portals."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-cyber-secondary" />,
      title: "Clear Safety Guidance",
      description: "Get explicit lists of verification checklist protocols, banking support phone checks, and key security hygiene."
    }
  ];

  return (
    <section id="features" className="py-20 bg-cyber-bg/50 border-t border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-extrabold text-cyber-secondary tracking-widest text-glow">
            Comprehensive Detection Heuristics
          </h2>
          <p className="font-display font-bold text-3xl sm:text-4xl text-white">
            Identify Fraud Signals Before They Target You
          </p>
          <p className="text-sm text-slate-400">
            TrustCheck cross-references common threat matrices to flag critical issues, helping you make informed digital communication decisions.
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, idx) => (
            <div 
              key={idx} 
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start space-y-4"
            >
              <div className="p-3 bg-cyber-primary/10 border border-cyber-primary/20 rounded-xl">
                {feat.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-white">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
