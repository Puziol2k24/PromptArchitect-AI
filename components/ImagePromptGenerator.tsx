
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImagePrompt } from '../services/geminiService';
import { ImagePromptResponse } from '../types';
import { ImageIcon, RefreshIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

const LANGUAGES = [
  "English", "Polish", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese"
];

const STYLES = [
  "Photorealistic", "Anime / Manga", "Cinematic", "Cyberpunk", "Oil Painting",
  "Watercolor", "3D Render (Octane)", "Pixel Art", "Vector Illustration", "Surrealism"
];

const ASPECT_RATIOS = ["1:1 (Square)", "16:9 (Landscape)", "9:16 (Portrait)", "2:3 (Poster)", "21:9 (Ultrawide)"];

const ImagePromptGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [artStyle, setArtStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1 (Square)');
  const [mood, setMood] = useState('');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImagePromptResponse | null>(null);
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
      const data = await generateImagePrompt({
        description,
        artStyle,
        aspectRatio,
        mood: mood || "Balanced and detailed",
        language
      }, controller.signal);
      setResult(data);
    } catch (error) {
      if ((error as Error).message === 'Aborted') {
        console.log("Image gen cancelled");
      } else {
        console.error("Failed", error);
        alert("Failed to generate image prompt.");
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
            <div className="inline-flex items-center space-x-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 px-3 py-1 rounded-full mb-4">
              <ImageIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-xs font-semibold text-pink-700 dark:text-pink-300 tracking-wide uppercase">Generative Art Studio</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Prompt Gen</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Create breathtaking visuals with specialized prompts for Midjourney, DALL-E 3, and Stable Diffusion.
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
                  <label className="text-xs font-bold text-slate-500 uppercase">Art Style</label>
                  <select 
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                  >
                    {ASPECT_RATIOS.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Mood / Lighting</label>
                   <input 
                      type="text"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g. Dark, Neon, Golden Hour"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none"
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                   <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                    >
                      {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Subject / Scene</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to see. e.g. 'A futuristic samurai walking through a rainy neon city'"
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                    bg-pink-600 rounded-xl hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  `}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      <span>Dreaming...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate Image Prompts</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-pink-50 dark:bg-pink-900/10 blur-3xl opacity-50 pointer-events-none"></div>
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
               {/* Midjourney Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Midjourney v6</h3>
                   <button onClick={() => handleCopy(result.midjourneyPrompt, 'mj')} className="text-slate-400 hover:text-pink-500 transition-colors">
                     {copiedField === 'mj' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                   {result.midjourneyPrompt}
                 </div>
               </div>

               {/* Stable Diffusion Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">Stable Diffusion XL</h3>
                   <button onClick={() => handleCopy(result.stableDiffusionPrompt, 'sd')} className="text-slate-400 hover:text-pink-500 transition-colors">
                     {copiedField === 'sd' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800 mb-4">
                   {result.stableDiffusionPrompt}
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Negative Prompt</h4>
                   <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-xs font-mono text-red-800 dark:text-red-300">
                     {result.negativePrompt}
                   </div>
                 </div>
               </div>

               {/* DALL-E 3 Card */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative md:col-span-2">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">DALL-E 3</h3>
                   <button onClick={() => handleCopy(result.dallePrompt, 'dalle')} className="text-slate-400 hover:text-pink-500 transition-colors">
                     {copiedField === 'dalle' ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                   </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                   {result.dallePrompt}
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-bold">Tips:</span> {result.parameterTips}</p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImagePromptGenerator;
