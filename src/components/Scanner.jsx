import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  LockKeyhole,
  X,
  ScanSearch
} from 'lucide-react';

import {
  analyzeMessage,
  analyzeLink,
  analyzeScreenshot,
  SCREENSHOT_SCENARIOS
} from '../utils/scannerLogic';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { saveScanRecord } from '../lib/scanHistory';
import { incrementGuestScanCount } from '../utils/planHelpers';

export default function Scanner({ onScanComplete }) {
  const { user } = useAuth();
  const { checkAndEnforceScanLimit, refreshScanCount } = useSubscription();
  const [activeTab, setActiveTab] = useState('message');
  const [inputText, setInputText] = useState('');
  const [inputLink, setInputLink] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    'Reading submitted content...',
    'Detecting suspicious language & URL patterns...',
    'Evaluating social engineering signals...',
    'Running multi-model threat heuristic scan...',
    'Compiling your TrustCheck risk assessment...'
  ];

  useEffect(() => {
    if (!isScanning) {
      setScanStep(0);
      return;
    }

    const interval = setInterval(() => {
      setScanStep((prev) => Math.min(prev + 1, scanSteps.length - 1));
    }, 1200);

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;

      setUploadedFile({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type
      });

      setSelectedPreset(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;

      setUploadedFile({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type
      });

      setSelectedPreset(null);
    }
  };

  const selectPreset = (preset) => {
    setSelectedPreset(preset);
    setUploadedFile(null);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearScreenshot = () => {
    setUploadedFile(null);
    setSelectedPreset(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchTab = (tab) => {
    if (isScanning) return;
    setActiveTab(tab);
  };

  const mapAPIResultToFrontend = (data) => {
    let score = Number(data.riskScore);

    if (!Number.isFinite(score)) {
      score = 50;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let mappedLevel = 'caution';
    const rawLevel = String(data.riskLevel || '').toLowerCase();

    if (rawLevel.includes('high') || rawLevel.includes('critical')) {
      mappedLevel = 'high';
    } else if (rawLevel.includes('low')) {
      mappedLevel = 'low';
    } else {
      if (score >= 70) {
        mappedLevel = 'high';
      } else if (score >= 35) {
        mappedLevel = 'caution';
      } else {
        mappedLevel = 'low';
      }
    }

    const warningSigns = Array.isArray(data.warningSigns)
      ? data.warningSigns
          .map((item) => {
            if (typeof item === 'string') {
              return {
                title: 'Suspicious Indicator',
                description: item
              };
            }

            if (item && typeof item === 'object') {
              return {
                title:
                  typeof item.title === 'string'
                    ? item.title
                    : 'Suspicious Indicator',
                description:
                  typeof item.description === 'string'
                    ? item.description
                    : 'A suspicious pattern was identified.'
              };
            }

            return {
              title: 'Suspicious Indicator',
              description: 'A suspicious pattern was identified.'
            };
          })
      : [];

    const nextSteps = Array.isArray(data.recommendedActions)
      ? data.recommendedActions
          .map((item) => (typeof item === 'string' ? item : String(item)))
          .filter(Boolean)
      : Array.isArray(data.nextSteps)
      ? data.nextSteps
          .map((item) => (typeof item === 'string' ? item : String(item)))
          .filter(Boolean)
      : [
          'Do not share passwords, OTPs, PINs, or credentials.',
          'Verify claims independently through official organization websites.'
        ];

    return {
      score,
      level: mappedLevel,
      summary:
        typeof data.summary === 'string'
          ? data.summary
          : 'Assessment completed.',
      warningSigns,
      nextSteps,
      isDemo: Boolean(data.useDemo),
      source: data.source || (data.useDemo ? 'local' : 'gemini')
    };
  };

  const handleAnalyze = async () => {
    if (isScanning) return;

    // Check monthly scan entitlement limits
    if (!checkAndEnforceScanLimit()) {
      return;
    }

    let textToAnalyze = '';
    let clientFallbackFn = null;
    let imagePayload = null;

    if (activeTab === 'message') {
      if (!inputText.trim()) return;

      textToAnalyze = inputText.trim();
      clientFallbackFn = () => analyzeMessage(textToAnalyze);
    } else if (activeTab === 'link') {
      if (!inputLink.trim()) return;

      textToAnalyze = inputLink.trim();
      clientFallbackFn = () => analyzeLink(textToAnalyze);
    } else if (activeTab === 'screenshot') {
      if (selectedPreset) {
        textToAnalyze = selectedPreset.text;
        clientFallbackFn = () => analyzeScreenshot(selectedPreset.name);
      } else if (uploadedFile) {
        textToAnalyze = `Uploaded image screenshot file: ${uploadedFile.name}`;
        clientFallbackFn = () => analyzeScreenshot(uploadedFile.name);

        if (uploadedFile.file) {
          try {
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const res = reader.result;
                if (typeof res === 'string') {
                  const b64 = res.includes(',') ? res.split(',')[1] : res;
                  resolve(b64);
                } else {
                  reject(new Error('FileReader result is not a string'));
                }
              };
              reader.onerror = (err) => reject(err);
              reader.readAsDataURL(uploadedFile.file);
            });

            imagePayload = {
              mimeType: uploadedFile.type || uploadedFile.file.type,
              data: base64Data
            };
          } catch (fileErr) {
            console.warn('[TrustCheck UI] Base64 conversion failed:', fileErr);
          }
        }
      } else {
        return;
      }
    }

    setIsScanning(true);
    setScanStep(0);

    let scanResult = null;
    let apiData = null;

    try {
      console.log(
        '[TrustCheck UI] Requesting backend risk analysis...'
      );

      const requestBody = {
        message: textToAnalyze
      };

      if (imagePayload) {
        requestBody.image = imagePayload;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      apiData = await response.json();

      console.log(
        '[TrustCheck UI] Received API response:',
        apiData
      );

      scanResult = mapAPIResultToFrontend(apiData);
    } catch (err) {
      console.warn(
        '[TrustCheck UI] Network or API failure. Using client fallback:',
        err
      );

      const fallbackData = clientFallbackFn
        ? clientFallbackFn()
        : analyzeMessage(textToAnalyze);

      apiData = {
        ...fallbackData,
        useDemo: true,
        source: 'local'
      };

      scanResult = mapAPIResultToFrontend(apiData);
    } finally {
      setIsScanning(false);
    }

    if (scanResult) {
      if (user?.id) {
        await saveScanRecord({
          userId: user.id,
          messageText: textToAnalyze,
          riskScore: apiData?.riskScore ?? scanResult.score,
          riskLevel:
            apiData?.riskLevel ||
            (scanResult.level === 'high'
              ? 'High risk indicators'
              : scanResult.level === 'low'
              ? 'Low apparent risk'
              : 'Caution'),
          summary: apiData?.summary || scanResult.summary,
          warningSigns:
            apiData?.warningSigns || scanResult.warningSigns,
          recommendedActions:
            apiData?.recommendedActions ||
            apiData?.nextSteps ||
            scanResult.nextSteps,
          source:
            apiData?.source ||
            scanResult.source ||
            'gemini'
        });
      } else {
        incrementGuestScanCount();
      }

      await refreshScanCount();

      onScanComplete(scanResult);
    }
  };

  const isButtonDisabled = () => {
    if (activeTab === 'message') {
      return !inputText.trim();
    }

    if (activeTab === 'link') {
      return !inputLink.trim();
    }

    if (activeTab === 'screenshot') {
      return !uploadedFile && !selectedPreset;
    }

    return true;
  };

  const getTabClass = (tab) => `
    flex-1 flex items-center justify-center gap-2
    py-3.5 px-3 rounded-xl
    font-semibold text-xs sm:text-sm
    transition-all duration-300 border cursor-pointer
    ${
      activeTab === tab
        ? 'bg-cyber-primary/15 border-cyber-primary/50 text-white shadow-[0_0_18px_-6px_rgba(37,99,235,0.65)]'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
    }
  `;

  return (
    <div className="max-w-3xl mx-auto w-full relative z-10">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyber-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyber-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-panel rounded-3xl shadow-2xl relative overflow-hidden border border-cyber-border">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-80" />

        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-7">
            <div className="flex items-start gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-cyber-primary/15 border border-cyber-primary/30 flex items-center justify-center shadow-[0_0_20px_-8px_rgba(37,99,235,0.8)]">
                  <ShieldAlert className="w-5 h-5 text-cyber-secondary" />
                </div>

                <span className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    TrustCheck Scanner
                  </h2>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-[9px] font-bold uppercase tracking-wider text-cyber-accent">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Multi-Model Engine
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Analyze suspicious messages, links, and screenshots for scam warning signs.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              <ScanSearch className="w-3.5 h-3.5" />
              Secure Analysis
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-7">
            <div className="rounded-xl bg-slate-950/35 border border-cyber-border/70 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
                  Risk scoring
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/35 border border-cyber-border/70 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-cyber-secondary" />
                <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
                  Scam signals
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/35 border border-cyber-border/70 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <LockKeyhole className="w-3.5 h-3.5 text-cyber-accent" />
                <span className="text-[10px] sm:text-xs text-slate-300 font-medium">
                  Safety first
                </span>
              </div>
            </div>
          </div>

          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-8 z-30 animate-fadeIn">
              <div className="relative w-28 h-28 mb-6">
                <div className="absolute inset-0 rounded-full border border-cyber-primary/20" />
                <div className="absolute inset-2 rounded-full border border-cyber-primary/40" />
                <div className="absolute inset-0 rounded-full border border-transparent border-t-cyber-secondary animate-radar-sweep shadow-[0_0_20px_rgba(59,130,246,0.45)]" />
                <div className="absolute inset-[46%] rounded-full bg-cyber-secondary animate-ping" />
                <div className="absolute inset-[48%] rounded-full bg-cyber-secondary shadow-[0_0_15px_3px_rgba(59,130,246,0.8)]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-white/90" />
                </div>
              </div>

              <div className="text-center max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-secondary animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-accent">
                    Analyzing Threat Factors
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                  Running Risk Heuristics
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 min-h-[20px]">
                  {scanSteps[scanStep]}
                </p>

                <div className="w-56 h-1.5 bg-cyber-border rounded-full overflow-hidden mx-auto mt-5">
                  <div
                    className="h-full bg-cyber-secondary transition-all duration-500 ease-out"
                    style={{
                      width: `${((scanStep + 1) / scanSteps.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-950/35 border border-cyber-border/70 rounded-2xl p-1.5 mb-6 flex gap-1">
            <button
              type="button"
              onClick={() => switchTab('message')}
              className={getTabClass('message')}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('link')}
              className={getTabClass('link')}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Website Link</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('screenshot')}
              className={getTabClass('screenshot')}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Screenshot</span>
            </button>
          </div>

          <div className="mb-6">
            {activeTab === 'message' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Paste suspicious text
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      SMS, WhatsApp, email or social media messages
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-600">
                    TEXT
                  </span>
                </div>

                <div className="relative">
                  <label htmlFor="message-input" className="sr-only">
                    Suspicious message text
                  </label>

                  <textarea
                    id="message-input"
                    rows="6"
                    maxLength={5000}
                    className="w-full bg-slate-950/45 border border-cyber-border rounded-2xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary/20 transition-all font-sans leading-relaxed text-sm sm:text-base resize-none"
                    placeholder="Example: 'URGENT! Your bank account will be blocked today. Send your OTP immediately...'"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />

                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                      aria-label="Clear message"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>
                    {inputText.length.toLocaleString()} / 5,000 characters
                  </span>

                  {inputText.trim() && (
                    <span className="text-emerald-400/90 font-sans font-medium">
                      Ready for analysis
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'link' && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Check a suspicious website
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the URL you received in a message or email
                  </p>
                </div>

                <div className="relative">
                  <label htmlFor="link-input" className="sr-only">
                    Suspicious link URL
                  </label>

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-5 h-5" />
                  </div>

                  <input
                    id="link-input"
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    className="w-full bg-slate-950/45 border border-cyber-border rounded-2xl pl-12 pr-12 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary/20 transition-all text-sm sm:text-base font-mono"
                    placeholder="https://example.com/verify-account"
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                  />

                  {inputLink && (
                    <button
                      type="button"
                      onClick={() => setInputLink('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                      aria-label="Clear link"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5 text-cyber-warning" />
                  <span>
                    Never enter login passwords or bank PINs on unverified
                    sites.
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'screenshot' && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Analyze a suspicious screenshot
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a screenshot file or choose a preset demo scenario
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Demo preset scenarios
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SCREENSHOT_SCENARIOS.map((preset) => (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedPreset?.id === preset.id
                            ? 'bg-cyber-primary/10 border-cyber-primary/60 text-white shadow-[0_0_18px_-10px_rgba(37,99,235,0.8)]'
                            : 'bg-slate-950/35 border-cyber-border text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-semibold">
                            {preset.name}
                          </span>

                          {selectedPreset?.id === preset.id && (
                            <CheckCircle2 className="w-4 h-4 text-cyber-secondary flex-shrink-0" />
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {preset.fileName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? 'border-cyber-primary bg-cyber-primary/10 scale-[1.01]'
                      : 'border-cyber-border bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                  />

                  <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center mb-2.5 text-cyber-secondary">
                    <Upload className="w-5 h-5" />
                  </div>

                  <p className="text-sm font-semibold text-slate-200">
                    Drop your screenshot image here
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    or{' '}
                    <span className="text-cyber-secondary underline underline-offset-2">
                      browse files
                    </span>
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-600 font-mono">
                    <span>PNG</span> • <span>JPG</span> • <span>WEBP</span> •{' '}
                    <span>MAX 10MB</span>
                  </div>
                </div>

                {(uploadedFile || selectedPreset) && (
                  <div className="flex items-center justify-between gap-3 bg-slate-950/45 border border-cyber-border rounded-xl p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {selectedPreset
                            ? selectedPreset.name
                            : uploadedFile.name}
                        </p>

                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {selectedPreset
                            ? 'DEMO PRESET'
                            : uploadedFile.size}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearScreenshot}
                      className="text-[10px] font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 bg-slate-950/50 border border-cyber-border/70 rounded-xl p-3.5 sm:p-4 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyber-warning/10 border border-cyber-warning/15 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-cyber-warning" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-200">
                Educational Safety Aid
              </p>

              <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed mt-0.5">
                TrustCheck evaluates scam indicators for educational
                purposes. Never enter real passwords or banking PINs in
                unverified forms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isButtonDisabled() || isScanning}
            className={`group w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
              isButtonDisabled() || isScanning
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-cyber-border/40'
                : 'bg-cyber-primary hover:bg-blue-500 text-white shadow-[0_0_24px_-5px_rgba(37,99,235,0.55)] hover:shadow-[0_0_35px_-3px_rgba(37,99,235,0.75)] hover:-translate-y-0.5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />

            <span>
              {isScanning
                ? 'Analyzing Threat Signals...'
                : 'Analyze Scam Warning Signs'}
            </span>

            {!isScanning && (
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}