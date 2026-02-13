
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateVideoPrompt } from '../services/geminiService';
import { VideoPromptResponse } from '../types';
import { VideoIcon, RefreshIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

const LANGUAGES = [
  "English", "Polish", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese"
];

const VideoPromptGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [motionLevel, setMotionLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [cameraMovement, setCameraMovement] = useState<'ZOOM' | 'PAN' | 'TILT' | 'STATIC' | 'FPV'>('PAN');
  const [duration, setDuration] = useState<'SHORT' | 'LONG'>('SHORT');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoPromptResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const data = await generateVideoPrompt({
        description,
        motionLevel,
        cameraMovement,
        duration,
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Video gen cancelled");
      } else {
        console.error("Failed", error);
        alert("Failed to generate video prompt.");
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {!result && (
          <>
            <div className="inline-flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 px-3 py-1 rounded-full mb-4">
              <VideoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 tracking-wide uppercase">AI Video Director</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">Prompt Gen</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Direct your AI scenes. Generate cinematic prompts for Runway Gen-2, Pika, Sora, and Google Veo with precise camera and motion controls.
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
                  <label className="text-xs font-bold text-slate-500 uppercase">Motion Level</label>
                  <select 
                    value={motionLevel}
                    onChange={(e) => setMotionLevel(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                  >
                    <option value="LOW">Low (Subtle)</option>
                    <option value="MEDIUM">Medium (Balanced)</option>
                    <option value="HIGH">High (Action)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Camera Movement</label>
                  <select 
                    value={cameraMovement}
                    onChange={(e) => setCameraMovement(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                  >
                    <option value="STATIC">Static / Tripod</option>
                    <option value="PAN">Pan (Horizontal)</option>
                    <option value="TILT">Tilt (Vertical)</option>
                    <option value="ZOOM">Zoom In/Out</option>
                    <option value="FPV">FPV Drone</option>
                  </select>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
                   <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                   >
                      <option value="SHORT">Short Loop (4s)</option>
                      <option value="LONG">Extended (10s+)</option>
                   </select>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                   <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                      {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Scene Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the action. e.g. 'A drone shot flying over a cybernetic jungle, mist rolling in'"
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                  disabled={loading || !description}
                  className={`
                    flex-1 group relative inline-flex items-center justify-center px-8 py-4 
                    text-base font-bold text-white transition-all duration-200 
                    bg-purple-600 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  `}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Directing Scene...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate Video Prompts</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-purple-50 dark:bg-purple-900/10 blur-3xl opacity-50 pointer-events-none"></div>
          </form>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
               {/* Runway Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Runway Gen-2</h3>
                   <button onClick={() => handleCopy(result.runwayPrompt, 'runway')} className="text-slate-400 hover:text-purple-500 transition-colors">
                     {copiedField === 'runway' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                   {result.runwayPrompt}
                 </div>
               </div>

               {/* Pika Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pika Labs</h3>
                   <button onClick={() => handleCopy(result.pikaPrompt, 'pika')} className="text-slate-400 hover:text-purple-500 transition-colors">
                     {copiedField === 'pika' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                   {result.pikaPrompt}
                 </div>
               </div>

               {/* Veo Card - ADDED */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Google Veo (DeepMind)</h3>
                   <button onClick={() => handleCopy(result.veoPrompt, 'veo')} className="text-slate-400 hover:text-purple-500 transition-colors">
                     {copiedField === 'veo' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                   {result.veoPrompt}
                 </div>
               </div>

               {/* Sora / Technical Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">OpenAI Sora & Tech Specs</h3>
                   <button onClick={() => handleCopy(result.soraPrompt, 'sora')} className="text-slate-400 hover:text-purple-500 transition-colors">
                     {copiedField === 'sora' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800 mb-4 font-mono">
                   {result.soraPrompt}
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                       <div className="text-[9px] font-bold text-slate-400 uppercase">Camera</div>
                       <div className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{result.technicalSettings.cameraControl}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                       <div className="text-[9px] font-bold text-slate-400 uppercase">Motion</div>
                       <div className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{result.technicalSettings.motionBucket}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                       <div className="text-[9px] font-bold text-slate-400 uppercase">FPS</div>
                       <div className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{result.technicalSettings.fps}</div>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoPromptGenerator;
