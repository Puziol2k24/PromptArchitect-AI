
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDevAgentPrompt, detectTechStack } from '../services/geminiService';
import { DevAgentResponse } from '../types';
import { TerminalIcon, RefreshIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

const LANGUAGES = [
  "English", "Polish", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese", "Korean", "Russian", "Ukrainian"
];

const DevAgentScripter: React.FC = () => {
  const [taskType, setTaskType] = useState<'BUG_FIX' | 'FEATURE' | 'REFACTOR' | 'TESTS'>('FEATURE');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [detectingStack, setDetectingStack] = useState(false);
  const [result, setResult] = useState<DevAgentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !techStack.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await generateDevAgentPrompt({
        taskType, techStack, description, context, language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Request cancelled by user");
      } else {
        console.error("Failed", error);
        alert("Failed to generate prompt.");
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
      navigator.clipboard.writeText(result.agentPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDetectStack = async () => {
    if (!context && !description) return;
    setDetectingStack(true);
    try {
      const stack = await detectTechStack(context, description);
      if (stack) setTechStack(stack);
    } catch (error) {
      console.error("Failed to detect stack", error);
    } finally {
      setDetectingStack(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-3 py-1 rounded-full mb-4">
              <TerminalIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">For Cursor, Copilot & Windsurf</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              DevAgent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Scripter</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Generate precise instruction sets for AI coding agents to fix bugs, build features, or refactor code without hallucinations.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          layout
          className={`transition-all duration-500 ${result ? '' : 'lg:col-span-2 lg:max-w-3xl lg:mx-auto w-full'}`}
        >
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-8 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Type</label>
                  <select 
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="FEATURE">New Feature</option>
                    <option value="BUG_FIX">Bug Fix</option>
                    <option value="REFACTOR">Refactor / Cleanup</option>
                    <option value="TESTS">Write Tests</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lang</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tech Stack</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="e.g. Next.js"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-28 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleDetectStack}
                      disabled={detectingStack || (!context && !description)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {detectingStack ? 'Scanning...' : 'Detect'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goal / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want the agent to do?"
                  className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Context (Code/Logs)</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste relevant code here..."
                  className="w-full h-32 font-mono text-xs bg-slate-900 border border-slate-800 rounded-xl p-4 text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                {loading && (
                   <button
                     type="button"
                     onClick={handleCancel}
                     className="px-6 py-4 text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors"
                   >
                     Cancel
                   </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !description || !techStack}
                  className="flex-1 group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-emerald-600 rounded-xl disabled:opacity-50 shadow-lg hover:shadow-emerald-500/20 overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Analyzing Workflow...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate Agent Prompt</span>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-5 shimmer-bg animate-shimmer"></div>
              <div className="h-[500px] bg-slate-900 rounded-2xl border border-slate-800 shimmer-bg animate-shimmer"></div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="animate-fade-in-up space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 flex items-center">ℹ️ Setup Advice</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">{result.setupInstructions}</p>
              </div>
              <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-[550px]">
                 <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                   <span className="text-xs font-mono text-slate-400">agent_instruction.md</span>
                   <button onClick={handleCopy} className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                     {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                     <span>{copied ? 'Copied!' : 'Copy'}</span>
                   </button>
                 </div>
                 <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                   <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{result.agentPrompt}</pre>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Why this works</h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DevAgentScripter;
