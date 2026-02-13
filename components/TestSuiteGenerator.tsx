import React, { useState } from 'react';
import { generateTestSuite } from '../services/geminiService';
import { TestSuiteResponse } from '../types';
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

const TestSuiteGenerator: React.FC = () => {
  const [promptOrLogic, setPromptOrLogic] = useState('');
  const [focusArea, setFocusArea] = useState<'robustness' | 'security' | 'logic' | 'formatting'>('robustness');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestSuiteResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptOrLogic.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await generateTestSuite({
        promptOrLogic,
        focusArea,
        language
      });
      setResult(data);
    } catch (error) {
      console.error("Failed", error);
      alert("Failed to generate test suite.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInput = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Happy Path': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Adversarial/Injection': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Edge Case': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {!result && (
          <>
            <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-4">
              <BeakerIcon className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold text-rose-700 tracking-wide uppercase">QA & Validation</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Test Suite <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-600">Generator</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Don't just write prompts—test them. Generate edge cases, injection attempts, and logic traps to bulletproof your AI workflow.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Input Form */}
        <div className={`transition-all duration-500 ${result ? '' : 'max-w-3xl mx-auto w-full'}`}>
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 relative overflow-hidden ring-1 ring-slate-900/5">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Focus Area</label>
                  <select 
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                  >
                    <option value="robustness">General Robustness</option>
                    <option value="security">Security & Injection</option>
                    <option value="logic">Complex Logic</option>
                    <option value="formatting">Output Formatting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Lang</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Prompt or Logic to Test</label>
                <textarea
                  value={promptOrLogic}
                  onChange={(e) => setPromptOrLogic(e.target.value)}
                  placeholder="Paste your system prompt here, or describe the logic you want to test (e.g., 'A chatbot that processes pizza orders but must refuse alcohol')."
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none resize-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !promptOrLogic}
                className={`
                  w-full group relative inline-flex items-center justify-center px-8 py-4 
                  text-base font-bold text-white transition-all duration-200 
                  bg-rose-600 rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                `}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <RefreshIcon className="w-5 h-5 animate-spin" />
                    <span>Generating Scenarios...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <BugIcon className="w-5 h-5" />
                    <span>Find Edge Cases</span>
                  </span>
                )}
              </button>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-rose-50 blur-3xl opacity-50 pointer-events-none"></div>
          </form>
        </div>

        {/* Loading Skeleton */}
        {loading && !result && (
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-rose-50 rounded-2xl border border-rose-100 mx-auto w-full max-w-2xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col space-y-4 h-64">
                   <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
                      <div className="h-6 w-6 bg-slate-100 rounded"></div>
                   </div>
                   <div className="space-y-2 flex-1">
                      <div className="h-3 w-20 bg-slate-100 rounded"></div>
                      <div className="h-16 bg-slate-50 rounded-lg w-full"></div>
                   </div>
                   <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                      <div className="h-3 w-full bg-slate-50 rounded"></div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {result && !loading && (
          <div className="animate-fade-in-up space-y-6">
            
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-center">
              <p className="text-rose-800 font-medium">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getTypeStyle(scenario.type)}`}>
                      {scenario.type}
                    </span>
                    <button 
                      onClick={() => handleCopyInput(scenario.input, idx)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy Input"
                    >
                      {copiedIndex === idx ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Test Input</h4>
                      <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono text-slate-700 whitespace-pre-wrap border border-slate-100">
                        {scenario.input}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Expected Behavior</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         {scenario.expectedBehavior}
                       </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 italic">
                        <span className="font-semibold not-italic text-slate-600">Why:</span> {scenario.reasoning}
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

export default TestSuiteGenerator;