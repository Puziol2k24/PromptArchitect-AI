
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePerplexityPrompt } from '../services/geminiService';
import { PerplexityResponse } from '../types';
import { GlobeIcon, RefreshIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

const LANGUAGES = [
  "English",
  "Polish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese"
];

const PerplexityArchitect: React.FC = () => {
  const [query, setQuery] = useState('');
  const [focusMode, setFocusMode] = useState<'ALL' | 'ACADEMIC' | 'WRITING' | 'YOUTUBE' | 'REDDIT'>('ALL');
  const [responseFormat, setResponseFormat] = useState<'CONCISE' | 'DETAILED' | 'TABLE' | 'COMPARISON'>('DETAILED');
  const [audience, setAudience] = useState('General');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerplexityResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await generatePerplexityPrompt({
        query,
        focusMode,
        responseFormat,
        audience,
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Perp gen cancelled");
      } else {
        console.error("Failed", error);
        alert("Failed to generate Perplexity prompt.");
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

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {!result && (
          <>
            <div className="inline-flex items-center space-x-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-3 py-1 rounded-full mb-4">
              <GlobeIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 tracking-wide uppercase">Deep Research & Search</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Perplexity <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Architect</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Construct powerful search prompts that force Perplexity to find specific data, cite academic sources, and filter out noise.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className={`transition-all duration-500 ${result ? '' : 'lg:col-span-2 lg:max-w-3xl lg:mx-auto w-full'}`}>
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Focus Mode</label>
                  <select 
                    value={focusMode}
                    onChange={(e) => setFocusMode(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                  >
                    <option value="ALL">🌐 All (Web)</option>
                    <option value="ACADEMIC">🎓 Academic (Papers)</option>
                    <option value="WRITING">✍️ Writing (Generation)</option>
                    <option value="YOUTUBE">📹 YouTube</option>
                    <option value="REDDIT">💬 Reddit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Format</label>
                  <select 
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                  >
                    <option value="DETAILED">Detailed Report</option>
                    <option value="CONCISE">Concise / Brief</option>
                    <option value="TABLE">Data Table</option>
                    <option value="COMPARISON">Comparative Analysis</option>
                  </select>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Audience</label>
                   <input 
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Expert, 5-year old"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                   <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                </div>
              </div>

              {/* Query */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Research Topic / Question</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you researching? e.g. 'Latest breakthroughs in solid state batteries vs lithium ion'"
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                  disabled={loading || !query}
                  className={`
                    flex-1 group relative inline-flex items-center justify-center px-8 py-4 
                    text-base font-bold text-white transition-all duration-200 
                    bg-cyan-600 rounded-xl hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  `}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Constructing Search Logic...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <GlobeIcon className="w-5 h-5" />
                      <span>Generate Perplexity Prompt</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-cyan-50 dark:bg-cyan-900/10 blur-3xl opacity-50 pointer-events-none"></div>
          </form>
        </div>

        {/* ... results area ... */}
      </div>
    </div>
  );
};

export default PerplexityArchitect;
