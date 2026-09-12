import React from 'react';
import { Copy, Eye, HelpCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Copy className="w-6 h-6 text-cyber-secondary" />,
      title: "Paste or Upload",
      description: "Copy-paste any suspicious SMS message, enter web links, or drop a screenshot file into our scanner dashboard."
    },
    {
      number: "02",
      icon: <Eye className="w-6 h-6 text-cyber-secondary" />,
      title: "AI Analyzes Warning Signs",
      description: "Our local scan heuristic engines scan the input contents immediately for common fraud indicators and threats."
    },
    {
      number: "03",
      icon: <HelpCircle className="w-6 h-6 text-cyber-secondary" />,
      title: "Understand Next Steps",
      description: "Get a clear assessment report detailing what warnings were triggered, why they represent risks, and how to verify."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Subtle lines or background layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-extrabold text-cyber-secondary tracking-widest text-glow">
            Three Steps to Security
          </h2>
          <p className="font-display font-bold text-3xl sm:text-4xl text-white">
            How TrustCheck Protects You
          </p>
          <p className="text-sm text-slate-400">
            Scanning suspicious alerts takes only a few seconds. Learn to recognize deception before you interact.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-cyber-border to-transparent -z-10" />

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-4 px-4 group">
              {/* Number and Icon Container */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyber-card border border-cyber-border flex items-center justify-center shadow-lg group-hover:border-cyber-primary transition-all duration-300 relative z-10">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 text-xs font-bold font-mono text-cyber-primary bg-cyber-bg border border-cyber-border rounded-full px-2 py-0.5 z-20">
                  {step.number}
                </div>
                <div className="absolute inset-0 bg-cyber-primary/10 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Text */}
              <h3 className="font-display font-semibold text-lg text-white">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
