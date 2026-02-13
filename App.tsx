
import React, { useState, useEffect } from 'react';
import PromptArchitect from './components/PromptArchitect';
import DevAgentScripter from './components/DevAgentScripter';
import PromptSentinel from './components/PromptSentinel';
import N8nAgentGenerator from './components/N8nAgentGenerator';
import PerplexityArchitect from './components/PerplexityArchitect';
import HowItWorks from './components/HowItWorks';
import Home from './components/Home';
import SettingsModal from './components/SettingsModal';
import { 
  SparklesIcon, ChevronDownIcon, HomeIcon, TerminalIcon, 
  BeakerIcon, WorkflowIcon, SettingsIcon, GlobeIcon, 
  SunIcon, MoonIcon
} from './components/Icons';

type ViewType = 'home' | 'architect' | 'agent' | 'sentinel' | 'n8n' | 'perplexity' | 'how-it-works';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navigateTo = (view: ViewType) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <button onClick={() => navigateTo('home')} className="flex items-center space-x-3 group focus:outline-none">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
               <HomeIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              PromptArchitect AI
            </h1>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
             
             <button 
               onClick={() => navigateTo('how-it-works')}
               className={`hidden sm:block text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                 currentView === 'how-it-works' 
                   ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                   : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'
               }`}
             >
               How it Works
             </button>

             <div className="relative">
               <button 
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className={`flex items-center space-x-1 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                    isMenuOpen || (currentView !== 'home' && currentView !== 'how-it-works')
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                 }`}
               >
                 <span>Tools</span>
                 <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
               </button>

               {isMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                   <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                     <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Generators</div>
                     <button onClick={() => navigateTo('architect')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                        <SparklesIcon className="w-4 h-4 text-indigo-500" />
                        <span>Prompt Architect</span>
                     </button>
                     <button onClick={() => navigateTo('agent')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all mt-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                        <TerminalIcon className="w-4 h-4 text-emerald-500" />
                        <span>DevAgent Scripter</span>
                     </button>
                     <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                     <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Research & Audit</div>
                     <button onClick={() => navigateTo('perplexity')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                        <GlobeIcon className="w-4 h-4 text-cyan-500" />
                        <span>Perplexity Architect</span>
                     </button>
                     <button onClick={() => navigateTo('sentinel')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all mt-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                        <BeakerIcon className="w-4 h-4 text-rose-500" />
                        <span>Prompt Sentinel</span>
                     </button>
                     <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                     <button onClick={() => navigateTo('n8n')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                        <WorkflowIcon className="w-4 h-4 text-orange-500" />
                        <span>n8n Architect</span>
                     </button>
                   </div>
                 </>
               )}
             </div>

             <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>

             <button onClick={toggleTheme} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300">
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
             </button>

             <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300">
                <SettingsIcon className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && <Home onNavigate={navigateTo} />}
        {currentView === 'how-it-works' && <HowItWorks onNavigate={navigateTo as any} />}
        {currentView === 'architect' && <div className="pt-10 animate-fade-in"><PromptArchitect /></div>}
        {currentView === 'agent' && <div className="pt-10 animate-fade-in"><DevAgentScripter /></div>}
        {currentView === 'sentinel' && <div className="pt-10 animate-fade-in"><PromptSentinel /></div>}
        {currentView === 'perplexity' && <div className="pt-10 animate-fade-in"><PerplexityArchitect /></div>}
        {currentView === 'n8n' && <div className="pt-10 animate-fade-in"><N8nAgentGenerator /></div>}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-12 text-center">
         <p className="text-slate-400 dark:text-slate-500 text-sm">Created for non-commercial and educational purposes.</p>
      </footer>
    </div>
  );
}

export default App;
