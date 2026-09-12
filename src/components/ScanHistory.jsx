import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  X,
  ChevronRight,
  FileText,
  CheckCircle2,
  LockKeyhole,
  LogIn,
  ScanSearch
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserScans } from '../lib/scanHistory';

export default function ScanHistory({ onNavigate }) {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [scans, setScans] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const fetchScans = async () => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setError(null);

    const { data, error: fetchErr } = await getUserScans(user.id);

    if (fetchErr) {
      setError(fetchErr.message || 'Failed to load scan history from database.');
    } else {
      setScans(data || []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchScans();
  }, [user]);

  // Normalization helpers for risk levels & fields
  const getRiskCategory = (level, score) => {
    const l = String(level || '').toLowerCase();
    if (l.includes('high') || l.includes('critical') || l === 'high') return 'high';
    if (l.includes('low') || l === 'low') return 'low';
    if (l.includes('caution') || l.includes('moderate') || l === 'caution') return 'caution';

    const s = Number(score) || 0;
    if (s >= 70) return 'high';
    if (s >= 35) return 'caution';
    return 'low';
  };

  const riskThemes = {
    low: {
      color: 'text-cyber-success',
      border: 'border-cyber-success/30',
      bg: 'bg-cyber-success/10',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      title: 'Low Apparent Risk',
      icon: ShieldCheck
    },
    caution: {
      color: 'text-cyber-warning',
      border: 'border-cyber-warning/30',
      bg: 'bg-cyber-warning/10',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      title: 'Caution Advised',
      icon: AlertTriangle
    },
    high: {
      color: 'text-cyber-danger',
      border: 'border-cyber-danger/30',
      bg: 'bg-cyber-danger/10',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      title: 'High Risk Indicators',
      icon: ShieldAlert
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown Date';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return String(isoString);
    }
  };

  const normalizeWarningSigns = (raw) => {
    let list = raw;
    if (typeof raw === 'string') {
      try { list = JSON.parse(raw); } catch { list = []; }
    }
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (typeof item === 'string') return { title: 'Suspicious Indicator', description: item };
      if (item && typeof item === 'object') {
        return {
          title: typeof item.title === 'string' ? item.title : 'Suspicious Indicator',
          description: typeof item.description === 'string' ? item.description : 'A suspicious pattern was identified.'
        };
      }
      return { title: 'Suspicious Indicator', description: 'A suspicious pattern was identified.' };
    });
  };

  const normalizeActions = (raw) => {
    let list = raw;
    if (typeof raw === 'string') {
      try { list = JSON.parse(raw); } catch { list = []; }
    }
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item.action || item.description || item.text || String(item);
      }
      return String(item);
    }).filter(Boolean);
  };

  // Client side search and risk level filtering
  const filteredScans = scans.filter((scan) => {
    const category = getRiskCategory(scan.risk_level, scan.risk_score);
    if (riskFilter !== 'all' && category !== riskFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const messageMatch = String(scan.message_text || '').toLowerCase().includes(query);
    const summaryMatch = String(scan.summary || '').toLowerCase().includes(query);
    return messageMatch || summaryMatch;
  });

  // ========================================================
  // UNAUTHENTICATED STATE
  // ========================================================
  if (!authLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto w-full relative z-10 animate-fadeIn">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-cyber-border shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-cyber-primary/15 border border-cyber-primary/30 flex items-center justify-center mx-auto mb-6 text-cyber-secondary shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)]">
            <LockKeyhole className="w-8 h-8 text-cyber-secondary" />
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-3">
            Authentication Required
          </h3>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
            Please sign in to access your saved TrustCheck scan history and review past threat assessments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-cyber-primary hover:bg-blue-500 text-white shadow-[0_0_20px_-3px_rgba(37,99,235,0.55)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-slate-900 border border-cyber-border hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Back to Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative z-10 space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-cyber-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyber-secondary">
              Personal Scan Archive
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            My Scan History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review and inspect your saved AI scam risk evaluations.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchScans}
              disabled={loadingHistory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyber-border hover:border-cyber-secondary/50 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
              title="Refresh history"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyber-secondary ${loadingHistory ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-primary hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTER BAR */}
      {user && !loadingHistory && scans.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-cyber-border flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter history by keyword or message snippet..."
              className="w-full bg-slate-950/50 border border-cyber-border/70 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-primary transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'high', 'caution', 'low'].map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setRiskFilter(filterKey)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  riskFilter === filterKey
                    ? 'bg-cyber-primary/20 border border-cyber-primary/60 text-white shadow-[0_0_12px_-4px_rgba(37,99,235,0.6)]'
                    : 'bg-slate-950/30 border border-cyber-border text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          LOADING STATE
         ======================================================== */}
      {loadingHistory && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel rounded-2xl p-6 border border-cyber-border/60 animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 bg-slate-800 rounded-lg" />
                <div className="h-4 w-28 bg-slate-800 rounded-lg" />
              </div>
              <div className="h-4 w-3/4 bg-slate-800/80 rounded" />
              <div className="h-12 w-full bg-slate-950/50 border border-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          ERROR STATE
         ======================================================== */}
      {!loadingHistory && error && (
        <div className="glass-panel rounded-3xl p-8 border border-cyber-danger/30 bg-cyber-danger/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyber-danger/10 border border-cyber-danger/20 flex items-center justify-center mx-auto text-cyber-danger">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Unable to Load Scan History</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchScans}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-cyber-primary hover:bg-blue-500 text-white text-xs shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* ========================================================
          EMPTY STATE
         ======================================================== */}
      {!loadingHistory && !error && scans.length === 0 && (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-cyber-border">
          <div className="w-16 h-16 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center mx-auto mb-4 text-cyber-secondary">
            <Clock className="w-8 h-8 text-cyber-secondary opacity-80" />
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
            No Saved Scans Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            You haven't completed any saved scans while logged in yet. Analyze suspicious messages to store risk evaluations here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-cyber-primary hover:bg-blue-500 text-white text-sm shadow-[0_0_20px_-3px_rgba(37,99,235,0.5)] transition-all cursor-pointer"
          >
            <ScanSearch className="w-4 h-4" />
            <span>Run Your First Scan</span>
          </button>
        </div>
      )}

      {/* NO FILTER MATCHES STATE */}
      {!loadingHistory && !error && scans.length > 0 && filteredScans.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 text-center border border-cyber-border">
          <p className="text-sm font-semibold text-slate-300">No scans match your search filter</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or changing the risk level filter.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setRiskFilter('all'); }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-cyber-secondary bg-cyber-primary/10 border border-cyber-primary/20 hover:bg-cyber-primary/20 transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ========================================================
          SCAN HISTORY CARDS LIST
         ======================================================== */}
      {!loadingHistory && !error && filteredScans.length > 0 && (
        <div className="space-y-4">
          {filteredScans.map((scan) => {
            const category = getRiskCategory(scan.risk_level, scan.risk_score);
            const theme = riskThemes[category] || riskThemes.caution;
            const RiskIcon = theme.icon;
            const messageText = String(scan.message_text || '');
            const truncatedMessage = messageText.length > 140
              ? messageText.slice(0, 140) + '...'
              : messageText;

            return (
              <div
                key={scan.id || scan.created_at}
                className={`glass-panel rounded-2xl p-5 sm:p-6 border ${theme.border} hover:bg-slate-900/60 transition-all duration-300 shadow-lg group relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-cyber-border/50 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                      <RiskIcon className="w-3.5 h-3.5" />
                      <span>{scan.risk_level || theme.title}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/50 border border-cyber-border text-[10px] font-mono text-slate-400 uppercase">
                      Source: {scan.source || 'gemini'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(scan.created_at)}</span>
                  </div>
                </div>

                {/* Message preview */}
                <div className="mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Submitted Content Preview
                  </div>
                  <div className="bg-slate-950/45 border border-cyber-border/70 rounded-xl p-3 text-xs sm:text-sm text-slate-200 font-sans italic leading-relaxed">
                    "{truncatedMessage}"
                  </div>
                </div>

                {/* Summary & Score Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">
                      Assessment Summary
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      {scan.summary || 'Risk evaluation complete.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block">SCORE</span>
                      <span className={`text-sm font-extrabold font-mono ${theme.color}`}>
                        {scan.risk_score}/100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedScan(scan)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-primary/10 hover:bg-cyber-primary/20 border border-cyber-primary/30 text-cyber-secondary text-xs font-semibold transition-all cursor-pointer group-hover:border-cyber-secondary/50"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          SCAN DETAIL INSPECT MODAL
         ======================================================== */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-cyber-border shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-cyber-border/80 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyber-primary/15 border border-cyber-primary/30 flex items-center justify-center text-cyber-secondary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Scan Assessment Details</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {formatDate(selectedScan.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                aria-label="Close detail modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
              {/* Risk Level & Score Badge */}
              {(() => {
                const category = getRiskCategory(selectedScan.risk_level, selectedScan.risk_score);
                const theme = riskThemes[category] || riskThemes.caution;
                const RiskIcon = theme.icon;

                return (
                  <div className={`p-5 rounded-2xl border ${theme.border} ${theme.bg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.badgeBg}`}>
                        <RiskIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`font-bold text-base ${theme.color}`}>
                          {selectedScan.risk_level || theme.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          Analysis Source: <span className="font-mono text-slate-300">{selectedScan.source || 'gemini'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Risk Score</div>
                      <div className={`text-3xl font-extrabold font-mono ${theme.color}`}>
                        {selectedScan.risk_score}<span className="text-xs text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Full Original Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Submitted Content
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {String(selectedScan.message_text || '').length} CHARS
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-cyber-border rounded-2xl p-4 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedScan.message_text || 'No message content saved.'}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Evaluation Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/30 border border-cyber-border/60 rounded-2xl p-4">
                  {selectedScan.summary || 'No summary recorded.'}
                </p>
              </div>

              {/* Warning Signs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Identified Warning Signs
                  </h4>
                  <span className="text-[10px] font-mono text-cyber-danger">
                    {normalizeWarningSigns(selectedScan.warning_signs).length} SIGNS
                  </span>
                </div>

                {normalizeWarningSigns(selectedScan.warning_signs).length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-950/30 p-3.5 rounded-xl border border-cyber-border/40">
                    No major threat warning signs were identified.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {normalizeWarningSigns(selectedScan.warning_signs).map((sign, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/40 border border-cyber-border/60 text-xs"
                      >
                        <div className="w-6 h-6 rounded-lg bg-cyber-danger/10 border border-cyber-danger/20 flex items-center justify-center font-mono text-cyber-danger text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{sign.title}</div>
                          <div className="text-slate-400 mt-0.5 leading-relaxed">{sign.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Recommended Actions
                </h4>

                {normalizeActions(selectedScan.recommended_actions).length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-950/30 p-3.5 rounded-xl border border-cyber-border/40">
                    Standard online safety precautions apply.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {normalizeActions(selectedScan.recommended_actions).map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-cyber-border/60 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-cyber-secondary flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cyber-border/80 bg-slate-950/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
              >
                Close Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
