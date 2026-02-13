
import React, { useState, useEffect } from 'react';
import { GeneratedPrompt } from '../types';
import { CopyIcon, CheckIcon, EditIcon } from './Icons';

interface PromptCardProps {
  data: GeneratedPrompt;
}

const modelStyles = {
  GEMINI: {
    gradient: 'from-blue-500 to-purple-600',
    darkGradient: 'dark:from-blue-600 dark:to-purple-700',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    icon: '✨'
  },
  OPENAI: {
    gradient: 'from-green-500 to-emerald-600',
    darkGradient: 'dark:from-green-600 dark:to-emerald-700',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    icon: '🟢'
  },
  CLAUDE: {
    gradient: 'from-orange-500 to-red-500',
    darkGradient: 'dark:from-orange-600 dark:to-red-700',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
    icon: '✴️'
  }
};

const PromptCard: React.FC<PromptCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(data.promptContent);

  const style = modelStyles[data.modelName];

  useEffect(() => {
    setCurrentContent(data.promptContent);
  }, [data.promptContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border ${style.border} transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b ${style.border} flex items-center justify-between bg-opacity-30 ${style.bg}`}>
        <div className="flex items-center space-x-3">
          <span className="text-xl filter drop-shadow-sm">{style.icon}</span>
          <h3 className={`font-bold text-lg ${style.text}`}>
            {data.modelName === 'OPENAI' ? 'OpenAI Models' : data.modelName === 'GEMINI' ? 'Google Gemini' : 'Anthropic Claude'}
          </h3>
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 ${style.badge}`}>
          Optimized
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col space-y-5">
        
        {/* Explanation Bubble */}
        <div className={`${style.bg} p-4 rounded-2xl text-sm leading-relaxed ${style.text} border border-white/10`}>
          <p><strong className="font-semibold opacity-80">Strategy:</strong> {data.explanation}</p>
        </div>

        {/* Prompt Input/Textarea */}
        <div className="flex-1 relative group">
          <div className="absolute top-3 right-3 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Edit Prompt"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Copy"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          </div>
          
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            System Prompt
          </label>
          
          {isEditing ? (
            <textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full h-80 p-4 text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none leading-relaxed"
            />
          ) : (
            <div 
              className="w-full h-80 p-4 text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl overflow-y-auto whitespace-pre-wrap cursor-text hover:border-slate-300 dark:hover:border-slate-700 transition-colors custom-scrollbar leading-relaxed"
              onClick={() => setIsEditing(true)}
            >
              {currentContent}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-2 pt-5 border-t border-slate-100 dark:border-slate-800">
           <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Usage Tips</h4>
           <ul className="space-y-2">
             {data.tips.map((tip, i) => (
               <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start">
                 <span className="mr-2 mt-0.5 text-indigo-400 dark:text-indigo-500 text-[10px]">●</span>
                 {tip}
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
