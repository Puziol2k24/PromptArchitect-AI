
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runSentinelAudit } from '../services/geminiService';
import { SentinelResponse } from '../types';
import { BeakerIcon, BugIcon, CopyIcon, CheckIcon, RefreshIcon } from './Icons';

const LANGUAGES = [
  "English",
  "Polish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Ukrainian"
];

const PromptSentinel: React.FC = () => {
  const [promptOrLogic, setPromptOrLogic] = useState('');
  const [focusArea, setFocusArea] = useState<'robustness' | 'security' | 'logic' | 'formatting'>('security');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentinelResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptOrLogic.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await runSentinelAudit({
        promptOrLogic,
        focusArea,
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Audit cancelled");
      } else {
        console.error("Audit failed", error);
        alert("Failed to run security audit.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyInput = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Happy Path': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Adversarial/Injection': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'Edge Case': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {!result && (
          <>
            <div className="inline-flex items-center space-x-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 px-3 py-1 rounded-full mb-4">
              <BeakerIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 tracking-wide uppercase">AI Red Teaming & Security Audit</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Prompt <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-600">Sentinel</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Bulletproof your AI logic. Generate adversarial injections, jailbreak attempts, and logic traps to find vulnerabilities before users do.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Input Form */}
        <div className={`transition-all duration-500 ${result ? '' : 'max-w-3xl mx-auto w-full'}`}>
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Audit Focus</label>
                  <select 
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                  >
                    <option value="security">Adversarial Injections (Jailbreaks)</option>
                    <option value="robustness">Edge Case Robustness</option>
                    <option value="logic">Logical Integrity Audit</option>
                    <option value="formatting">Syntax & Output Validation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Audit Lang</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Prompt or Logic to Audit</label>
                <textarea
                  value={promptOrLogic}
                  onChange={(e) => setPromptOrLogic(e.target.value)}
                  placeholder="Paste your system prompt or a description of your AI agent's logic. e.g. 'A medical assistant that provides diagnostic advice but must never prescribe medication.'"
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center space-x-4">
                {loading && (
                   <button
                     type="button"
                     onClick={handleCancel}
                     className="px-8 py-4 text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors"
                   >
                     Cancel
                   </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !promptOrLogic}
                  className={`
                    flex-1 group relative inline-flex items-center justify-center px-8 py-4 
                    text-base font-bold text-white transition-all duration-200 
                    bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  `}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Analyzing Security...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <BugIcon className="w-5 h-5" />
                      <span>Run Security Audit</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-rose-50 dark:bg-rose-900/10 blur-3xl opacity-50 pointer-events-none"></div>
          </form>
        </div>

        {/* Loading Skeleton */}
        {loading && !result && (
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800 mx-auto w-full max-w-2xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col space-y-4 h-64">
                   <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                      <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                      <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                   </div>
                   <div className="space-y-2 flex-1">
                      <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-16 bg-slate-50 dark:bg-slate-950 rounded-lg w-full"></div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {result && !loading && (
          <div className="animate-fade-in-up space-y-6">
            
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-5 text-center">
              <p className="text-rose-800 dark:text-rose-300 font-medium">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getTypeStyle(scenario.type)}`}>
                      {scenario.type}
                    </span>
                    <button 
                      onClick={() => handleCopyInput(scenario.input, idx)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy Attack Vector"
                    >
                      {copiedIndex === idx ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Adversarial Input</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                        {scenario.input}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                       <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Target Behavior</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                         {scenario.expectedBehavior}
                       </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                        <span className="font-semibold not-italic text-slate-600 dark:text-slate-400">Threat Logic:</span> {scenario.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptSentinel;
