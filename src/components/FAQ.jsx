import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      question: "Is TrustCheck always accurate?",
      answer: "No. TrustCheck utilizes automated heuristics and pattern-matching to scan for threat markers like urgent wording, mismatched domains, or direct security requests. It does not replace human diligence. It should be treated as an educational risk-indicator tool rather than an absolute assurance of legitimacy."
    },
    {
      question: "Can I use it for WhatsApp messages?",
      answer: "Yes, you can copy the suspicious message text directly from WhatsApp, SMS, Telegram, emails, or chat logs and paste it into the Message Tab of the TrustCheck Scanner for immediate risk evaluation."
    },
    {
      question: "Does TrustCheck guarantee safety?",
      answer: "Absolutely not. TrustCheck is designed to detect known warning signs. A low risk score (e.g. 0-30) simply means no typical danger indicators were found in the scanned content; it does not guarantee that the sender or link is safe. Scammers continuously adapt their strategies. Always verify critical requests independently."
    },
    {
      question: "Is my information stored?",
      answer: "No. All scanner logic runs completely locally within your browser. Scanned messages, links, and uploaded screenshot metadata are evaluated client-side and are never transmitted to, or stored on, any remote databases or servers. Your privacy is fully preserved."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (idx) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-cyber-bg/50 border-t border-cyber-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <HelpCircle className="w-8 h-8 text-cyber-secondary mx-auto text-glow" />
          <h2 className="font-display font-bold text-3xl text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Find answers to commonly asked questions about our risk heuristics, scan support, and privacy policies.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-cyber-primary/45 shadow-[0_0_15px_-5px_rgba(37,99,235,0.15)] bg-slate-900/50' : ''
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-slate-800/30 transition-colors"
                >
                  <span className="font-semibold text-white text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <div className="p-1 bg-cyber-border rounded-lg text-slate-400 group-hover:text-white">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-60 opacity-100 border-t border-cyber-border/40' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-5 text-sm text-slate-400 leading-relaxed bg-cyber-bg/25">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
