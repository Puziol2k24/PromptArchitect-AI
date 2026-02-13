
import React, { useState, useEffect } from 'react';
import { SettingsIcon, CheckIcon, ServerIcon } from './Icons';
import { updateAISettings, getAISettings } from '../services/geminiService';
import { AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS: { id: AIProvider; name: string; soon?: boolean }[] = [
  { id: 'GEMINI', name: 'Google Gemini' },
  { id: 'OPENAI', name: 'OpenAI' },
  { id: 'ANTHROPIC', name: 'Anthropic Claude' },
  { id: 'OLLAMA', name: 'Ollama (Local)', soon: true },
  { id: 'LM_STUDIO', name: 'LM Studio (Local)', soon: true },
  { id: 'CUSTOM', name: 'Custom OpenAI-Compatible', soon: true },
];

const DEFAULT_MODELS: Record<AIProvider, string[]> = {
  GEMINI: ['gemini-flash-lite-latest', 'gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash-lite-latest'],
  OPENAI: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  ANTHROPIC: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  OLLAMA: ['llama3', 'mistral', 'gemma', 'qwen2'],
  LM_STUDIO: ['local-model', 'loaded-model'],
  CUSTOM: ['local-model', 'llama-3-8b', 'mistral-7b'],
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<AIProvider>('GEMINI');
  const [model, setModel] = useState('gemini-flash-lite-latest');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getAISettings();
      setProvider(current.provider);
      setModel(current.model);
      setApiKey(current.apiKey || '');
      setBaseUrl(current.baseUrl || '');
      setSaved(false);
    }
  }, [isOpen]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    // Set default model for that provider
    setModel(DEFAULT_MODELS[newProvider][0]);
    // Reset key
    setApiKey('');
    
    // Set default Base URL based on provider
    if (newProvider === 'GEMINI') setBaseUrl('');
    else if (newProvider === 'OPENAI') setBaseUrl('https://api.openai.com/v1');
    else if (newProvider === 'OLLAMA') setBaseUrl('http://localhost:11434/v1');
    else if (newProvider === 'LM_STUDIO') setBaseUrl('http://localhost:1234/v1');
    else if (newProvider === 'CUSTOM') setBaseUrl('http://localhost:11434/v1'); // Default to generic local
    else setBaseUrl('');
  };

  const handleSave = () => {
    updateAISettings({
      provider,
      model,
      apiKey: apiKey.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-black/80 w-full max-w-lg overflow-hidden animate-zoom-in border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">AI Provider Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Select Provider</label>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.id;
                const isDisabled = p.soon;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && handleProviderChange(p.id)}
                    disabled={isDisabled}
                    className={`
                      relative flex items-center justify-center px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200
                      ${isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' 
                        : isDisabled 
                          ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    {p.name}
                    {isDisabled && (
                       <span className="absolute -top-2 -right-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                         SOON
                       </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Model Name</label>
             <div className="relative">
                <input 
                  type="text" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 outline-none transition-all"
                  placeholder="e.g. gpt-4-turbo"
                />
             </div>
             <p className="text-xs text-slate-400 dark:text-slate-500">
               {provider === 'GEMINI' ? 'Using Google GenAI SDK' : 'Using OpenAI-compatible API'}
             </p>
          </div>

          {/* Base URL */}
          {(provider !== 'GEMINI' && provider !== 'ANTHROPIC') && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Base URL</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                  <ServerIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 outline-none font-mono text-sm transition-all"
                  placeholder="http://localhost:11434/v1"
                />
              </div>
            </div>
          )}

          {/* API Key */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               {provider === 'GEMINI' ? 'API Key (Optional if env set)' : 'API Key'}
             </label>
             <input 
               type="password" 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 outline-none font-mono text-sm transition-all"
               placeholder={provider === 'GEMINI' ? 'Using default env key...' : 'sk-...'}
             />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
           <button 
             onClick={onClose}
             className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
           >
             Cancel
           </button>
           <button 
             onClick={handleSave}
             className={`
               flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg text-sm
               ${saved 
                 ? 'bg-green-500 hover:bg-green-600' 
                 : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500'}
             `}
           >
             {saved ? (
               <>
                 <CheckIcon className="w-4 h-4" />
                 <span>Saved</span>
               </>
             ) : (
               <span>Save Settings</span>
             )}
           </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
