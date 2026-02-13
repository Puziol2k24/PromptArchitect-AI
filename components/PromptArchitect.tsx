
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOptimizedPrompts } from '../services/geminiService';
import { PromptResponse } from '../types';
import PromptCard from './PromptCard';
import { SparklesIcon, RefreshIcon, CpuIcon } from './Icons';

const LANGUAGES = [
  "English", "Polish", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese", "Korean", "Russian", "Ukrainian"
];

const TONES = [
  "Professional", "Witty", "Formal", "Casual", "Enthusiastic", "Creative",
  "Empathetic", "Persuasive", "Direct", "Instructional"
];

const PromptArchitect: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [complexity, setComplexity] = useState<'basic' | 'intermediate' | 'advanced'>('advanced');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    // Reset any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await generateOptimizedPrompts({
        topic,
        tone: tone || undefined,
        complexity,
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Request cancelled by user");
      } else {
        console.error("Failed", error);
        alert("Failed to generate prompts. Please try again.");
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

  const skeletonVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="w-full">
      {/* Input Section */}
      <motion.section 
        layout
        className={`transition-all duration-700 ease-in-out ${result ? 'mb-12' : 'min-h-[60vh] flex flex-col justify-center max-w-4xl mx-auto'}`}
      >
        <div className="mb-10 text-center">
           <AnimatePresence mode="wait">
             {!result && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-full mb-6 shadow-sm">
                   <CpuIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                   <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">AI Prompt Engineer</span>
                 </div>
                 <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                   Master every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">AI Model</span>
                 </h2>
                 <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                   Generate highly optimized system prompts tailored for Gemini, OpenAI, and Claude from a single idea.
                 </p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <motion.form 
          layout
          onSubmit={handleGenerate} 
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 relative overflow-hidden z-10 transition-colors duration-300"
        >
          <div className="flex flex-col space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your task, role, or topic (e.g., 'A strict code reviewer for Python', 'Creative writer for sci-fi')"
                className="w-full min-h-[140px] bg-transparent text-xl p-6 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-100 rounded-2xl transition-all"
                spellCheck={false}
              />
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                 {[
                   { label: 'Lang', value: language, setter: setLanguage, options: LANGUAGES },
                   { label: 'Tone', value: tone, setter: setTone, options: TONES, auto: true },
                   { label: 'Level', value: complexity, setter: setComplexity, options: ['basic', 'intermediate', 'advanced'] }
                 ].map((sel, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{sel.label}</span>
                      <select 
                        value={sel.value}
                        onChange={(e) => sel.setter(e.target.value as any)}
                        className="bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer min-w-[80px]"
                      >
                        {sel.auto && <option value="" className="dark:bg-slate-800">Auto</option>}
                        {sel.options.map(opt => (
                          <option key={opt} value={opt} className="dark:bg-slate-800">{opt}</option>
                        ))}
                      </select>
                    </div>
                 ))}
              </div>

              <div className="flex items-center space-x-3">
                {loading && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3.5 text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    Cancel
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !topic}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-slate-900 dark:bg-indigo-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {loading ? (
                    <span className="flex items-center space-x-2 relative z-10">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Optimizing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2 relative z-10">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate Prompts</span>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl opacity-50 pointer-events-none"></div>
        </motion.form>
      </motion.section>

      {/* Loading Shimmer Skeletons */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
            variants={skeletonVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
                className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 space-y-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 shimmer-bg animate-shimmer pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-xl w-full"></div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl"></div>
                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Optimized Results <span className="text-slate-400 dark:text-slate-500 font-normal text-lg ml-2">({language})</span></h3>
               <button onClick={() => handleGenerate()} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                 <RefreshIcon className="w-4 h-4" />
                 <span>Regenerate</span>
               </button>
            </div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {result.prompts
                .sort((a, b) => {
                  const order = { 'GEMINI': 0, 'OPENAI': 1, 'CLAUDE': 2 };
                  return order[a.modelName] - order[b.modelName];
                })
                .map((prompt, idx) => (
                  <motion.div 
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                  >
                     <PromptCard data={prompt} />
                  </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptArchitect;
