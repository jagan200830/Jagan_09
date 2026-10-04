import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from 'lucide-react';
import { store } from '../data/store';
import { AIAnalysisResult, ServiceItem, ServiceProfessional } from '../types';
import { getProDistance } from '../utils/distanceTracker';
import { TradeAvatar } from './TradeAvatar';

interface GigAssistAIProps {
  onSelectProToBook: (pro: ServiceProfessional, service?: ServiceItem, notes?: string, isEmergency?: boolean) => void;
  onOpenChat: (proId: string) => void;
}

const PRESET_PROMPTS = [
  'My kitchen pipe is broken and water is leaking onto the floor.',
  'My AC is running but not cooling the room at all.',
  'My laptop will not turn on after a sudden power surge.',
  'My automatic washing machine is making a loud banging noise during spin cycle.',
  'Short circuit sparking in living room switchboard and MCB keeps tripping.',
  'I am renovating my house and need coordinated electrical, plumbing and carpentry work.',
];

export const GigAssistAI: React.FC<GigAssistAIProps> = ({ onSelectProToBook, onOpenChat }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allPros = store.getApprovedProfessionals();
  const allServices = store.services;

  const handleDiagnose = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemText: text }),
      });

      if (!response.ok) {
        throw new Error('Diagnosis server returned error');
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      console.error('Diagnosis failed, using fallback:', err);
      // Fallback local diagnosis
      const lower = text.toLowerCase();
      let category = 'Plumbing';
      let service = 'Emergency Pipe Leak & Tap Repair';
      let urgency: 'Emergency (Immediate)' | 'High' | 'Standard' = 'Standard';
      let price = '₹349 - ₹550';
      let problem = 'Pipe / tap leakage diagnostic';
      let safety = 'Turn off main supply valve immediately.';
      let explanation = 'Water leakage requires inspection of the valve cartridge and pipe joints to avoid floor seepage.';

      if (lower.includes('ac') || lower.includes('cool')) {
        category = 'AC & Cooling';
        service = 'AC Gas Refill & Leak Weld';
        urgency = 'High';
        price = '₹599 - ₹1,499';
        problem = 'AC cooling failure / potential coil blockage';
        safety = 'Turn off unit to prevent compressor overheating.';
        explanation = 'Cooling issues commonly occur when refrigerant pressure drops or outdoor condenser fins are choked.';
      } else if (lower.includes('electric') || lower.includes('spark') || lower.includes('short') || lower.includes('mcb')) {
        category = 'Electrical';
        service = 'Short Circuit & MCB Tripping Diagnostic';
        urgency = 'Emergency (Immediate)';
        price = '₹399 - ₹650';
        problem = 'Electrical short circuit / breaker overload';
        safety = 'Turn off main MCB breaker immediately and do not touch wall switchboards.';
        explanation = 'Sparks and breaker trips indicate an insulation fault, loose neutral, or overloaded loop.';
      } else if (lower.includes('laptop') || lower.includes('boot') || lower.includes('computer')) {
        category = 'Computer & Tech';
        service = 'Laptop Not Turning On & Motherboard Diagnosis';
        urgency = 'High';
        price = '₹499 - ₹1,200';
        problem = 'Laptop power-on sequence or motherboard failure';
        safety = 'Disconnect the charger and do not plug in unauthorized adapters.';
        explanation = 'No-power symptoms often stem from a shorted primary rail capacitor or depleted CMOS power IC.';
      } else if (lower.includes('wash') || lower.includes('machine') || lower.includes('noise')) {
        category = 'Appliance Repair';
        service = 'Automatic Washing Machine Drum & Motor Repair';
        urgency = 'Standard';
        price = '₹449 - ₹899';
        problem = 'Washing machine drum vibration / motor bearing wear';
        safety = 'Unplug the power plug and avoid running additional spin cycles.';
        explanation = 'Loud banging during spin cycles indicates worn shock absorbers, loose counterweights, or drum bearings.';
      }

      setAnalysis({
        problemIdentified: problem,
        recommendedCategory: category,
        recommendedService: service,
        estimatedPriceRange: price,
        urgencyLevel: urgency,
        explanation,
        safetyAdvice: safety,
        suggestedProIds: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter matching verified pros for this category
  const matchingPros = analysis
    ? allPros.filter(
        (p) =>
          p.category.toLowerCase().includes(analysis.recommendedCategory.toLowerCase()) ||
          analysis.recommendedCategory.toLowerCase().includes(p.category.toLowerCase())
      )
    : [];

  const matchedService = analysis
    ? allServices.find(
        (s) =>
          s.name.toLowerCase().includes(analysis.recommendedService.toLowerCase()) ||
          analysis.recommendedService.toLowerCase().includes(s.name.toLowerCase())
      ) || allServices[0]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* Title Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Diagnostic Intelligence
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          GigAssist <span className="gradient-emerald-text">AI</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Describe any household or technical breakdown in natural language. Our AI diagnoses the root issue, estimates
          fair cooperative pricing, warns of safety hazards, and surfaces verified nearby worker-owners.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          What problem are you experiencing?
        </label>
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. My kitchen pipe is broken and water is leaking onto the wooden cabinet floor..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
        </div>

        {/* Preset Prompt Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Try these common scenarios:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(prompt);
                  handleDiagnose(prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-left"
              >
                "{prompt.length > 50 ? prompt.slice(0, 48) + '...' : prompt}"
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => handleDiagnose()}
            disabled={loading || !inputText.trim()}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Analyzing problem...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Diagnose with GigAssist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Diagnostic Result Card */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Diagnosis Report</span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {analysis.problemIdentified}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    analysis.urgencyLevel.includes('Emergency')
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      : analysis.urgencyLevel === 'High'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {analysis.urgencyLevel}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-slate-200 border border-slate-700">
                  Est: {analysis.estimatedPriceRange}
                </span>
              </div>
            </div>

            {/* Structured Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Category</span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  {analysis.recommendedCategory}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Service</span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  {analysis.recommendedService}
                </p>
              </div>
            </div>

            {/* Explanation & Safety */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-200 mb-1">Technical Assessment</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{analysis.explanation}</p>
              </div>

              {analysis.safetyAdvice && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Immediate Safety Advice</h4>
                    <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">{analysis.safetyAdvice}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suitable Service Professionals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Recommended Verified Professionals</h3>
                <p className="text-xs text-slate-400">
                  Ready to dispatch · No booking is made without your explicit confirmation
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                {matchingPros.length} worker{matchingPros.length !== 1 ? 's' : ''} available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(matchingPros.length > 0 ? matchingPros : allPros.slice(0, 2)).map((pro) => (
                <div
                  key={pro.id}
                  className="p-5 rounded-2xl glass-card border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <TradeAvatar
                      name={pro.name}
                      category={pro.category}
                      size="lg"
                      className="ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate">{pro.name}</h4>
                        {pro.verificationStatus === 'verified' && (
                          <span title="Verified Professional">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {pro.category} · {pro.experienceYears} yrs experience
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {pro.rating}
                        </span>
                        <span>·</span>
                        <span>{pro.completedJobs} jobs</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">
                          {getProDistance(pro, store.currentUser.location).displayTransit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic">"{pro.bio}"</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting from</span>
                      <span className="text-sm font-bold text-white font-mono">₹{pro.startingPrice}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChat(pro.id)}
                        className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Chat before booking"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onSelectProToBook(
                            pro,
                            matchedService || undefined,
                            `GigAssist AI Problem Diagnosis: ${analysis.problemIdentified}`,
                            analysis.urgencyLevel.includes('Emergency')
                          )
                        }
                        className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                      >
                        Review & Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
