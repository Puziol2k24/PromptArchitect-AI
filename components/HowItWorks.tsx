
import React, { useState } from 'react';
import { SparklesIcon, TerminalIcon, CpuIcon, ArrowRightIcon, CheckIcon, GlobeIcon, WorkflowIcon, RefreshIcon, BeakerIcon } from './Icons';

interface HowItWorksProps {
  onNavigate: (view: any) => void;
}

type ModelOutput = {
  name: string;
  icon: string;
  content: string;
};

type ExampleScenario = {
  id: string;
  title: string;
  tool: string;
  input: string;
  outputs: ModelOutput[];
  features: string[];
  color: 'indigo' | 'emerald' | 'cyan';
};

const SCENARIOS: ExampleScenario[] = [
  {
    id: 'arch',
    title: 'Prompt Engineering',
    tool: 'Prompt Architect',
    input: "I want to write a story about a futuristic city.",
    outputs: [
      {
        name: 'Narrative Flow',
        icon: '✨',
        content: "Act as a World-Class Sci-Fi Author.\n\n[CONTEXT]\nWorld: Cyber-Noir Tokyo 2099.\nTheme: Human-AI Synthesis.\n\n[CONSTRAINTS]\n1. Use sensory-rich descriptions.\n2. Maintain a melancholic yet hopeful tone.\n3. Think step-by-step about the plot twist."
      },
      {
        name: 'Technical Spec',
        icon: '📐',
        content: "# ROLE: Sci-Fi Writer\n\n## SCENARIO\nA futuristic city in 2099.\n\n## INSTRUCTIONS\n- Focus on world-building through 'show, don't tell'.\n- Tone: Melancholic & Cyber-Noir.\n- Length: 1000 words.\n\n### FORMAT\nReturn in Markdown format with clear sections."
      },
      {
        name: 'System Logic',
        icon: '⚙️',
        content: "<system_instruction>\nYou are an elite science fiction storyteller. Your prose is cinematic and evocative.\n\n<context>\nSetting: Tokyo 2099.\nCentral Conflict: The blur between digital consciousness and organic life.\n</context>\n\n<style_guide>\n- Eschew cliches.\n- Use XML-style tags for internal reasoning.\n</style_guide>\n</system_instruction>"
      }
    ],
    features: ['Multi-Model Targetting', 'Persona Mapping', 'Syntax Alignment'],
    color: 'indigo'
  },
  {
    id: 'dev',
    title: 'Coding Assistance',
    tool: 'DevAgent Scripter',
    input: "Fix my React login form, it doesn't work.",
    outputs: [
      {
        name: 'Agent Scripter',
        icon: '💻',
        content: "@context: React, Firebase Auth\n\n# INSTRUCTION\nAct as a Senior Security Engineer. Analyze AuthContext.tsx.\n\n1. Check for missing dependency arrays.\n2. Ensure proper error handling for 401/403 states.\n3. Do NOT rewrite the UI, only fix the logic.\n4. Use Zod for validation."
      }
    ],
    features: ['Context Anchoring', 'Security Constraints', 'Anti-Lazy Coding'],
    color: 'emerald'
  },
  {
    id: 'perp',
    title: 'Deep Research',
    tool: 'Perplexity Architect',
    input: "Find info on solid state batteries.",
    outputs: [
      {
        name: 'Search Prompt',
        icon: '🌐',
        content: "site:edu OR site:gov \"solid state battery\" after:2024-01-01\n\n# RESEARCH GOAL\nCompare energy density (Wh/kg) between leading prototypes.\n\n# FORMAT\nOutput a Comparative Analysis table followed by primary academic sources."
      }
    ],
    features: ['Operator Injection', 'Academic Filtering', 'Comparative Logic'],
    color: 'cyan'
  }
];

const TOOLS_DETAILED = [
  {
    id: 'architect',
    title: 'Prompt Architect',
    description: 'Takes raw, messy human ideas and restructures them into crystal-clear system instructions optimized for LLM reasoning.',
    icon: SparklesIcon,
    color: 'indigo',
    visual: (
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        {/* Chaotic inputs turning into structure */}
        <div className="absolute left-4 top-4 w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full rotate-12 opacity-60"></div>
        <div className="absolute left-6 top-8 w-8 h-1 bg-slate-300 dark:bg-slate-700 rounded-full -rotate-6 opacity-60"></div>
        <div className="absolute left-2 top-10 w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full rotate-45 opacity-60"></div>
        
        <ArrowRightIcon className="w-5 h-5 text-indigo-400 mx-2 absolute left-1/2 -translate-x-1/2" />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 flex flex-col space-y-1.5 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <div className="w-full h-1.5 bg-indigo-400 rounded-full"></div>
          <div className="w-3/4 h-1.5 bg-indigo-300 rounded-full"></div>
          <div className="w-full h-1.5 bg-indigo-300 rounded-full"></div>
        </div>
      </div>
    )
  },
  {
    id: 'agent',
    title: 'DevAgent Scripter',
    description: 'Generates context-aware instructions for Cursor & Copilot. It "anchors" the AI to your specific file paths and tech stack.',
    icon: TerminalIcon,
    color: 'emerald',
    visual: (
      <div className="relative w-full h-full p-4 font-mono text-[6px] sm:text-[8px] leading-tight">
        <div className="bg-slate-900 w-full h-full rounded-lg p-2 border border-slate-700 shadow-sm relative overflow-hidden">
           <div className="text-purple-400 mb-1">@context: UserAuth</div>
           <div className="text-emerald-400"># INSTRUCTION</div>
           <div className="text-slate-400">1. Use existing hooks</div>
           <div className="text-slate-400">2. No placeholders</div>
           
           <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
             Active
           </div>
        </div>
      </div>
    )
  },
  {
    id: 'sentinel',
    title: 'Prompt Sentinel',
    description: 'Acts as a Red Team Auditor. It throws adversarial injections (jailbreaks, logic bypasses) at your prompt to see if it breaks.',
    icon: BeakerIcon,
    color: 'rose',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
         {/* Shield */}
         <div className="w-12 h-16 bg-rose-100 dark:bg-rose-900/20 border-2 border-rose-400 rounded-b-2xl flex items-center justify-center relative z-10">
           <CheckIcon className="w-6 h-6 text-rose-500" />
         </div>
         {/* Arrows bouncing off */}
         <div className="absolute left-2 top-1/2 w-8 h-0.5 bg-slate-300 dark:bg-slate-600 rotate-12"></div>
         <div className="absolute right-2 top-1/3 w-8 h-0.5 bg-slate-300 dark:bg-slate-600 -rotate-12"></div>
         <div className="absolute bottom-2 left-6 w-1 h-1 bg-rose-400 rounded-full animate-ping"></div>
      </div>
    )
  },
  {
    id: 'n8n',
    title: 'Workflow Architect',
    description: 'Converts a visual screenshot of your n8n canvas into precise JSON tool definitions and system logic.',
    icon: WorkflowIcon,
    color: 'orange',
    visual: (
      <div className="relative w-full h-full p-4 flex items-center justify-center">
         {/* Nodes */}
         <div className="absolute left-4 top-4 w-6 h-6 bg-orange-400 rounded-lg shadow-sm z-10"></div>
         <div className="absolute right-6 bottom-6 w-6 h-6 bg-slate-400 rounded-full shadow-sm z-10"></div>
         <div className="absolute right-4 top-8 w-6 h-6 bg-orange-300 rounded-lg shadow-sm z-10"></div>
         
         {/* Lines */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 30 25 C 50 25, 50 40, 70 40" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" fill="none" />
            <path d="M 70 40 C 50 50, 60 70, 80 80" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" fill="none" />
         </svg>
      </div>
    )
  },
  {
    id: 'perplexity',
    title: 'Perplexity Architect',
    description: 'Filters out SEO spam by injecting search operators like "site:gov" or "filetype:pdf" into your query.',
    icon: GlobeIcon,
    color: 'cyan',
    visual: (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
         <div className="w-full bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 rounded-full h-8 flex items-center px-3 shadow-sm mb-2">
           <GlobeIcon className="w-3 h-3 text-cyan-500 mr-2" />
           <div className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded"></div>
         </div>
         <div className="flex gap-1">
            <span className="text-[6px] px-1 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-200 dark:border-cyan-800">site:gov</span>
            <span className="text-[6px] px-1 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-200 dark:border-cyan-800">after:2024</span>
         </div>
      </div>
    )
  }
];

// Refined Styling for Unified Interactive Lab
const THEME_CLASSES = {
  indigo: {
    sidebarActive: 'bg-white dark:bg-slate-800 border-indigo-500 shadow-lg dark:shadow-indigo-900/20 scale-[1.02]',
    sidebarTextActive: 'text-indigo-600 dark:text-indigo-400',
    indicator: 'bg-indigo-500',
    tag: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    bgGradient: 'bg-indigo-500/5 dark:bg-indigo-500/10',
    outputHeader: 'text-indigo-600 dark:text-indigo-400',
    outputBorder: 'border-indigo-100 dark:border-indigo-900/50',
    outputBg: 'bg-indigo-50/30 dark:bg-indigo-900/10',
    loader: 'text-indigo-500',
    tabActive: 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300 ring-1 ring-black/5 dark:ring-white/10'
  },
  emerald: {
    sidebarActive: 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg dark:shadow-emerald-900/20 scale-[1.02]',
    sidebarTextActive: 'text-emerald-600 dark:text-emerald-400',
    indicator: 'bg-emerald-500',
    tag: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    bgGradient: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    outputHeader: 'text-emerald-600 dark:text-emerald-400',
    outputBorder: 'border-emerald-100 dark:border-emerald-900/50',
    outputBg: 'bg-emerald-50/30 dark:bg-emerald-900/10',
    loader: 'text-emerald-500',
    tabActive: 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-300 ring-1 ring-black/5 dark:ring-white/10'
  },
  cyan: {
    sidebarActive: 'bg-white dark:bg-slate-800 border-cyan-500 shadow-lg dark:shadow-cyan-900/20 scale-[1.02]',
    sidebarTextActive: 'text-cyan-600 dark:text-cyan-400',
    indicator: 'bg-cyan-500',
    tag: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800',
    bgGradient: 'bg-cyan-500/5 dark:bg-cyan-500/10',
    outputHeader: 'text-cyan-600 dark:text-cyan-400',
    outputBorder: 'border-cyan-100 dark:border-cyan-900/50',
    outputBg: 'bg-cyan-50/30 dark:bg-cyan-900/10',
    loader: 'text-cyan-500',
    tabActive: 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-300 ring-1 ring-black/5 dark:ring-white/10'
  }
};

const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const [activeScenario, setActiveScenario] = useState<ExampleScenario>(SCENARIOS[0]);
  const [activeModelIdx, setActiveModelIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(true);

  const theme = THEME_CLASSES[activeScenario.color];

  const triggerScenario = (scenario: ExampleScenario) => {
    if (scenario.id === activeScenario.id) return;
    
    setIsProcessing(true);
    setShowResult(false);
    setActiveScenario(scenario);
    setActiveModelIdx(0);
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResult(true);
    }, 800);
  };

  return (
    <div className="animate-fade-in pb-20 pt-16">
      {/* Intro Section */}
      <section className="text-center max-w-4xl mx-auto px-4 mb-24">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-full mb-8 shadow-sm">
           <CpuIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
           <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">Methodology & Interactive Demo</span>
        </div>
        <h1 className="text-4xl sm:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
          Engineering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Future.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
          LLMs are deterministic engines. We bridge the gap between human intent and machine understanding through <strong>structured context injection</strong> across Gemini, OpenAI, and Claude.
        </p>
      </section>

      {/* Mechanics Section */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">The Mechanics</h2>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Our toolkit leverages the latest in prompting science to ensure your AI behaves exactly as intended.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <SparklesIcon className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Meta-Prompting</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                We wrap your request in a high-order instruction set that defines the <strong>persona</strong>, <strong>constraints</strong>, and <strong>output schema</strong>.
              </p>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <CpuIcon className="w-24 h-24 text-purple-500" />
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Chain-of-Thought</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                For complex tasks, we inject instructions that force the model to <strong>"think step-by-step"</strong>, drastically reducing logic errors.
              </p>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <GlobeIcon className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 font-bold text-xl">3</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Syntax Alignment</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Claude likes XML. OpenAI likes Markdown. We pivot the output syntax to match the <strong>specific model family</strong> chosen.
              </p>
           </div>
        </div>
      </section>

      {/* Visual Workflow Infographic */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-16 shadow-xl relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
           
           <div className="relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Visualizing the Process</h2>
                 <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">See how PromptArchitect transforms a vague idea into a production-ready system instruction.</p>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                 
                 {/* Step 1: Input */}
                 <div className="flex-1 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-lg flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                       <span className="text-4xl">💭</span>
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-white dark:border-slate-900">1</div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Raw Intent</h3>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 text-left w-full max-w-[250px] shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-xl"></div>
                       <p className="opacity-60">"I need a bot to help me write code for my website."</p>
                    </div>
                 </div>

                 {/* Arrow */}
                 <div className="hidden lg:block">
                    <ArrowRightIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                 </div>

                 {/* Step 2: Processing */}
                 <div className="flex-1 flex flex-col items-center text-center group">
                    <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-500/30 shadow-2xl shadow-indigo-500/20 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                       <CpuIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                       <div className="absolute inset-0 rounded-[2rem] border border-indigo-500/20 animate-ping opacity-20"></div>
                       <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white border border-white dark:border-slate-900">2</div>
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">The Architect Engine</h3>
                    <div className="flex gap-2 justify-center">
                       <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase rounded-full">Meta-Prompting</span>
                       <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded-full">Context Injection</span>
                    </div>
                 </div>

                 {/* Arrow */}
                 <div className="hidden lg:block">
                    <ArrowRightIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                 </div>

                 {/* Step 3: Output */}
                 <div className="flex-1 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border-2 border-emerald-100 dark:border-emerald-500/30 shadow-lg flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                       <SparklesIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white border border-white dark:border-slate-900">3</div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Optimized System Prompt</h3>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-xs font-mono text-slate-600 dark:text-slate-400 text-left w-full max-w-[250px] shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-xl"></div>
                       <p><span className="text-purple-500"># Role:</span> Senior Engineer</p>
                       <p><span className="text-blue-500"># Task:</span> Web Dev</p>
                       <p><span className="text-emerald-500"># Constraints:</span> ...</p>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </section>

      {/* Comprehensive Tool Suite Section */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Comprehensive Tool Suite</h2>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Five specialized engines designed to handle every aspect of the AI development lifecycle.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_DETAILED.map((tool) => (
             <div key={tool.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                
                {/* Graphic Area */}
                <div className={`h-40 bg-${tool.color}-50 dark:bg-${tool.color}-900/10 border-b border-slate-50 dark:border-slate-800 relative group-hover:scale-105 transition-transform duration-700 ease-out`}>
                   {tool.visual}
                </div>

                {/* Content Area */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-2 rounded-xl bg-${tool.color}-100 dark:bg-${tool.color}-900/30 text-${tool.color}-600 dark:text-${tool.color}-400`}>
                        <tool.icon className="w-6 h-6" />
                     </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                     {tool.description}
                  </p>
                  
                  <button 
                    onClick={() => onNavigate(tool.id)}
                    className={`w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-${tool.color}-600 hover:text-white hover:border-transparent transition-all`}
                  >
                    Launch Tool
                  </button>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* Interactive Laboratory (Redesigned) */}
      <section className="max-w-7xl mx-auto px-4 mb-40">
        <div className="relative">
           {/* Section Header */}
           <div className="text-center mb-12">
             <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full mb-4">
               <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${activeScenario.color}-400`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 bg-${activeScenario.color}-500`}></span>
               </span>
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Live Transformation Engine</span>
             </div>
             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">See the Logic in Action</h2>
           </div>

           {/* The Lab Interface */}
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
              
              {/* Sidebar / Controls */}
              <div className="lg:w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                 <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Select Scenario</h3>
                 <div className="space-y-3 flex-1">
                    {SCENARIOS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => triggerScenario(s)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 group ${
                          activeScenario.id === s.id 
                          ? THEME_CLASSES[s.color].sidebarActive
                          : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                         <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-bold ${activeScenario.id === s.id ? THEME_CLASSES[s.color].sidebarTextActive : 'text-inherit'}`}>
                               {s.title}
                            </span>
                            {activeScenario.id === s.id && <div className={`w-2 h-2 rounded-full ${THEME_CLASSES[s.color].indicator}`}></div>}
                         </div>
                         <div className="text-xs opacity-70 truncate">{s.tool}</div>
                      </button>
                    ))}
                 </div>
                 
                 {/* Features Badge List */}
                 <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Modules</h4>
                    <div className="flex flex-wrap gap-2">
                       {activeScenario.features.map(f => (
                         <span key={f} className={`px-2 py-1 rounded-md text-[10px] font-bold border ${theme.tag}`}>
                           {f}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Main Display Area */}
              <div className="flex-1 p-6 sm:p-10 relative overflow-hidden flex flex-col">
                 {/* Background decoration */}
                 <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none ${theme.bgGradient}`}></div>

                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10">
                    
                    {/* Input Card */}
                    <div className="flex flex-col">
                       <div className="flex items-center justify-between mb-4 px-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Human Input</span>
                          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-4"></div>
                       </div>
                       <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                             <span className="text-xl">👤</span>
                          </div>
                          <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 italic">
                             "{activeScenario.input}"
                          </p>
                       </div>
                    </div>

                    {/* Output Card */}
                    <div className="flex flex-col">
                       <div className="flex items-center justify-between mb-4 px-2">
                          <span className={`text-xs font-bold uppercase tracking-widest ${theme.outputHeader}`}>Optimized Prompt</span>
                          <div className={`h-px flex-1 bg-current opacity-20 mx-4 ${theme.outputHeader}`}></div>
                          
                          {/* Tabs for models */}
                          {!isProcessing && showResult && activeScenario.outputs.length > 1 && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                               {activeScenario.outputs.map((out, idx) => (
                                 <button
                                   key={out.name}
                                   onClick={() => setActiveModelIdx(idx)}
                                   className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                      activeModelIdx === idx
                                      ? theme.tabActive
                                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                   }`}
                                 >
                                    {out.name}
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>

                       <div className={`flex-1 relative rounded-2xl border-2 transition-all duration-500 overflow-hidden flex flex-col ${isProcessing ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' : `${theme.outputBorder} ${theme.outputBg}`}`}>
                          
                          {isProcessing ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <RefreshIcon className={`w-8 h-8 animate-spin ${theme.loader} mb-4`} />
                                <span className={`text-xs font-bold ${theme.loader} uppercase tracking-widest animate-pulse`}>Processing logic...</span>
                             </div>
                          ) : (
                             <div className="flex-1 p-6 overflow-hidden flex flex-col animate-fade-in-up">
                                <div className="flex items-center mb-4">
                                   <span className="text-xl mr-3">{activeScenario.outputs[activeModelIdx].icon}</span>
                                   <span className={`text-xs font-bold ${theme.outputHeader} uppercase tracking-wider`}>
                                      {activeScenario.outputs[activeModelIdx].name} Structure
                                   </span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                   <pre className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                      {activeScenario.outputs[activeModelIdx].content}
                                   </pre>
                                </div>
                             </div>
                          )}
                          
                          {/* Bottom status bar */}
                          <div className={`bg-white/50 dark:bg-black/20 backdrop-blur-sm p-3 border-t ${theme.outputBorder} flex items-center justify-between`}>
                             <div className="flex items-center text-[10px] font-bold text-slate-500">
                                <TerminalIcon className="w-3 h-3 mr-1.5" />
                                <span>System Prompt Preview</span>
                             </div>
                             <div className={`flex items-center text-[10px] font-bold ${theme.outputHeader}`}>
                                <CheckIcon className="w-3 h-3 mr-1.5" />
                                <span>Ready to Copy</span>
                             </div>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] mx-4 sm:mx-0 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-8 relative z-10">Stop guessing. Start Architecting.</h2>
        <button 
          onClick={() => onNavigate('home')}
          className="relative z-10 px-12 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-lg"
        >
          Get Started with the Toolkit
        </button>
      </section>
      
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;
