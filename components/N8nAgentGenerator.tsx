
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateN8nAgentPrompt } from '../services/geminiService';
import { N8nAgentResponse } from '../types';
import { WorkflowIcon, UploadIcon, RefreshIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

const LANGUAGES = [
  "English",
  "Polish",
  "Spanish",
  "French",
  "German"
];

const N8nAgentGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<N8nAgentResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !selectedImage) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await generateN8nAgentPrompt({
        description,
        imageBase64: selectedImage || undefined,
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("n8n gen cancelled");
      } else {
        console.error("Failed", error);
        alert("Failed to generate n8n prompt.");
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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {!result && (
          <>
            <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 px-3 py-1 rounded-full mb-4">
              <WorkflowIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 tracking-wide uppercase">n8n Workflow Architect</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Architect</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Upload a screenshot of your n8n canvas or describe your logic. We'll generate the perfect System Prompt and Tool definitions for your AI Agent node.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className={`transition-all duration-500 ${result ? '' : 'lg:col-span-2 lg:max-w-3xl lg:mx-auto w-full'}`}>
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
            <div className="space-y-6">
              
              <div className="flex justify-end">
                 <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700 w-auto">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Lang</span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                 </div>
              </div>

              {/* Image Upload Area */}
              <div 
                className={`
                  border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer
                  ${selectedImage ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                
                {selectedImage ? (
                  <div className="relative">
                    <img src={selectedImage} alt="Workflow Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full p-1 hover:bg-red-50 hover:text-red-500 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p className="mt-2 text-xs text-orange-600 font-semibold">Click to change image</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600">
                      <UploadIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Workflow Screenshot</p>
                    <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Workflow Logic / Goal</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your AI Agent should do. E.g., 'Take the user input, search the vector store for documentation, and answer the question.'"
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                  disabled={loading || (!description && !selectedImage)}
                  className={`
                    flex-1 group relative inline-flex items-center justify-center px-8 py-4 
                    text-base font-bold text-white transition-all duration-200 
                    bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:from-orange-600 hover:to-red-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  `}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Analyzing Workflow...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate n8n Prompt</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-50 dark:bg-orange-900/10 blur-3xl opacity-50 pointer-events-none"></div>
          </form>
        </div>

        {/* Results Grid */}
        {result && !loading && (
          <div className="animate-fade-in-up space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Workflow Analysis</h4>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                 {result.workflowAnalysis}
               </p>
            </div>
            {/* ... other results ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default N8nAgentGenerator;
