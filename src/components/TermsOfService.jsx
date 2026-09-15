import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  AlertCircle, 
  UserCheck, 
  KeyRound, 
  User, 
  Slash, 
  Cpu, 
  Activity, 
  Zap, 
  Award, 
  Scale, 
  RefreshCw, 
  Mail, 
  ArrowLeft,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export default function TermsOfService({ onNavigate }) {
  const lastUpdatedDate = "September 15, 2026";

  const sections = [
    {
      id: "what-trustcheck-provides",
      number: "01",
      icon: ShieldCheck,
      title: "1. What TrustCheck Provides",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            <strong className="text-white">TrustCheck</strong> provides an automated analysis platform designed to evaluate suspicious messages, text snippets, email excerpts, and link indicators to generate risk assessments and identify potential threat patterns.
          </p>
          <p>
            By using TrustCheck, you acknowledge that the platform processes submitted input using rule-based heuristics and artificial intelligence models to highlight risk markers and general safety advice.
          </p>
        </div>
      )
    },
    {
      id: "educational-purpose",
      number: "02",
      icon: BookOpen,
      title: "2. Educational Purpose",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            TrustCheck is strictly an <strong className="text-cyber-accent">educational and informational tool</strong> intended to increase user awareness regarding digital scam indicators and social engineering tactics.
          </p>
          <p>
            TrustCheck is <strong className="text-white">not a replacement</strong> for banks, financial institutions, law enforcement agencies, cybersecurity professionals, legal counsel, or other official authorities. It does not provide binding security certifications or legal advice.
          </p>
        </div>
      )
    },
    {
      id: "no-guarantee",
      number: "03",
      icon: AlertCircle,
      title: "3. No Guarantee of Accuracy",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            While TrustCheck strives to deliver helpful risk indicators, <strong className="text-white">TrustCheck cannot and does not guarantee that any message is safe, malicious, fraudulent, or legitimate.</strong>
          </p>
          <p>
            Automated analysis and artificial intelligence models can make mistakes, produce false positives, or fail to identify novel scam techniques. Users must treat scan scores as preliminary guidance rather than absolute proof.
          </p>
        </div>
      )
    },
    {
      id: "user-responsibility",
      number: "04",
      icon: UserCheck,
      title: "4. User Responsibility",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            You are solely responsible for evaluating scan reports and deciding what actions or precautions to take regarding any communication or link.
          </p>
          <p className="p-4 rounded-xl bg-slate-900/80 border border-cyber-border text-slate-300 text-xs sm:text-sm">
            <strong className="text-white block mb-1">Independent Verification Required:</strong>
            Always independently verify suspicious communications directly through official, verified phone numbers, official domain websites, or direct customer support channels before taking financial, legal, or personal actions.
          </p>
        </div>
      )
    },
    {
      id: "sensitive-information",
      number: "05",
      icon: KeyRound,
      title: "5. Sensitive Information Restrictions",
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            To preserve your security and privacy, you must refrain from submitting private secrets or confidential credentials into the scanner.
          </p>
          
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>DO NOT SUBMIT THE FOLLOWING INTO TRUSTCHECK:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-red-200/90 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Account passwords or PINs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Banking credentials or card numbers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                2FA authentication codes / OTPs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                API keys or private cryptographic keys
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "accounts",
      number: "06",
      icon: User,
      title: "6. User Accounts & Security",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            If you create a registered account on TrustCheck, you are responsible for maintaining the confidentiality of your account login credentials.
          </p>
          <p>
            You agree to accept responsibility for all activities and scans conducted under your authenticated account session. If you suspect unauthorized access to your account, you should immediately update your credentials.
          </p>
        </div>
      )
    },
    {
      id: "acceptable-use",
      number: "07",
      icon: Slash,
      title: "7. Acceptable Use Policy",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            You agree to use TrustCheck only for lawful, legitimate, and non-harmful educational purposes. You must not:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-secondary mt-2 shrink-0" />
              <span>Use the service for unlawful, abusive, harassing, or fraudulent activities.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-secondary mt-2 shrink-0" />
              <span>Attempt to reverse-engineer, disrupt, flood, or exploit TrustCheck infrastructure or automated API endpoints.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-secondary mt-2 shrink-0" />
              <span>Use automated bots or scrapers to bypass rate limits or compromise service availability.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "ai-third-party-services",
      number: "08",
      icon: Cpu,
      title: "8. AI & Third-Party Services Integration",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            TrustCheck utilizes automated analysis engines and configured third-party artificial intelligence providers (such as Google Gemini and Groq) to evaluate submitted text and summarize potential risk factors.
          </p>
          <p>
            Third-party AI providers operate under automated probabilistic models. <strong className="text-white">TrustCheck does not represent or claim that AI-generated evaluation results are always accurate, exhaustive, or error-free.</strong>
          </p>
        </div>
      )
    },
    {
      id: "service-availability",
      number: "09",
      icon: Activity,
      title: "9. Service Availability & Modifications",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            TrustCheck strives to maintain reliable service, but continuous, uninterrupted availability is not guaranteed.
          </p>
          <p>
            The service may experience temporary downtime, scheduled maintenance, unexpected network outages, or updates in analysis features. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice.
          </p>
        </div>
      )
    },
    {
      id: "premium-features",
      number: "10",
      icon: Zap,
      title: "10. Premium Features & Subscriptions",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            TrustCheck offers tier structures and feature tiers for educational risk assessments. Premium or upgraded features may be introduced, modified, or updated as the platform evolves.
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyber-border text-slate-300 text-xs sm:text-sm">
            <p className="text-slate-400">
              <strong className="text-white">Note:</strong> Payment processing integrations and live monetary billing features are subject to subscription tier configurations. Availability of features may vary.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "intellectual-property",
      number: "11",
      icon: Award,
      title: "11. Intellectual Property Rights",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            The TrustCheck application, including software code, branding, logos, layout design, visual interfaces, graphics, and original content, is protected by applicable copyright, trademark, and intellectual property laws.
          </p>
          <p>
            Accessing TrustCheck grants you a limited, non-exclusive, non-transferable license to use the service for personal educational purposes. It does not grant you ownership of any underlying software, code, or intellectual property.
          </p>
        </div>
      )
    },
    {
      id: "limitation-of-liability",
      number: "12",
      icon: Scale,
      title: "12. Limitation of Liability",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            To the maximum extent permitted by applicable law, TrustCheck, its developers, and operators shall not be liable for any direct, indirect, incidental, consequential, or financial losses resulting from your reliance, decisions, or actions taken based solely on automated analysis results provided by the tool.
          </p>
          <p>
            The service is provided on an <strong className="text-white">"AS IS"</strong> and <strong className="text-white">"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied.
          </p>
        </div>
      )
    },
    {
      id: "changes-to-terms",
      number: "13",
      icon: RefreshCw,
      title: "13. Changes to These Terms",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            We reserve the right to revise or update these Terms of Service at any time as our application evolves, new features are implemented, or legal requirements change.
          </p>
          <p>
            Updated terms will be posted on this page with a revised <strong className="text-white">"Last updated"</strong> date. Continued use of TrustCheck after changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </div>
      )
    },
    {
      id: "contact-us",
      number: "14",
      icon: Mail,
      title: "14. Contact Information",
      content: (
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            If you have questions, inquiries, or feedback regarding these Terms of Service or TrustCheck's platform guidelines, you may contact the TrustCheck team through the contact methods provided on our website.
          </p>
        </div>
      )
    }
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-2xl mb-10 border border-cyber-border/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyber-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/20 border border-cyber-secondary/40 text-cyber-accent text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-cyber-secondary" />
            <span>TrustCheck Legal Notice</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 border border-cyber-border font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyber-secondary animate-pulse" />
              Last updated: {lastUpdatedDate}
            </span>
            <span>Educational Risk Analysis Platform</span>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed pt-2">
            These Terms of Service govern your access to and use of the TrustCheck suspicious message risk analysis platform.
          </p>
        </div>
      </div>

      {/* Quick Jump Index */}
      <div className="mb-10 p-5 glass-panel rounded-xl border border-cyber-border/60">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
          Quick Navigation
        </h3>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900/70 border border-cyber-border/60 text-slate-300 hover:text-white hover:border-cyber-secondary/50 hover:bg-slate-800 transition-all cursor-pointer"
            >
              {sec.title}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <section 
              key={sec.id} 
              id={sec.id} 
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyber-border/70 hover:border-cyber-border transition-colors scroll-mt-28"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-cyber-primary/10 border border-cyber-secondary/30 text-cyber-secondary shrink-0 mt-0.5">
                  <IconComponent className="w-5 h-5 text-glow" />
                </div>
                <div className="flex-grow">
                  <span className="text-xs font-mono font-semibold text-cyber-secondary tracking-wider block mb-1">
                    SECTION {sec.number}
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                    {sec.title.replace(/^[0-9]+\.\s*/, '')}
                  </h2>
                </div>
              </div>

              <div className="pt-2">
                {sec.content}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-12 glass-panel p-8 rounded-2xl border border-cyber-border text-center space-y-4">
        <h3 className="font-display font-bold text-xl text-white">
          Ready to evaluate a suspicious message?
        </h3>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Scan suspicious texts, emails, and link indicators with automated threat assessment.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={() => onNavigate('scanner')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-cyber-primary hover:bg-blue-500 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            Run Scanner Analysis
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-cyber-border transition-all cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
