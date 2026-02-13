
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  SparklesIcon, TerminalIcon, BeakerIcon, WorkflowIcon, 
  GlobeIcon, ArrowRightIcon, CpuIcon, GridIcon, CheckIcon,
  ImageIcon, VideoIcon
} from './Icons';

interface HomeProps {
  onNavigate: (view: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const tools = [
    {
      id: 'architect',
      name: 'Prompt Architect',
      tag: 'Flagship Module',
      description: 'The core engine. Transform vague ideas into multi-layered system prompts optimized for deep reasoning models.',
      icon: SparklesIcon,
      color: 'indigo',
      size: 'lg',
      features: ['Context Anchoring', 'Persona Mapping', 'Schema Enforcement']
    },
    {
      id: 'agent',
      name: 'DevAgent Scripter',
      tag: 'Engineering',
      description: 'Zero-hallucination instruction sets for Cursor & Copilot. Pure production code.',
      icon: TerminalIcon,
      color: 'emerald',
      size: 'md'
    },
    {
      id: 'perplexity',
      name: 'Perplexity Architect',
      tag: 'Research',
      description: 'Deep web research prompts. Force academic sources and filter out SEO noise.',
      icon: GlobeIcon,
      color: 'cyan',
      size: 'md'
    },
    {
      id: 'image-gen',
      name: 'Image Prompter',
      tag: 'Creative',
      description: 'Midjourney & Stable Diffusion prompts with style, lighting, and negative prompt handling.',
      icon: ImageIcon,
      color: 'pink',
      size: 'md'
    },
    {
      id: 'video-gen',
      name: 'Video Director',
      tag: 'Creative',
      description: 'Cinematic prompts for Runway & Sora. Control camera, motion, and temporal consistency.',
      icon: VideoIcon,
      color: 'purple',
      size: 'md'
    },
    {
      id: 'sentinel',
      name: 'Prompt Sentinel',
      tag: 'Security',
      description: 'Red Teaming suite. Audit your prompts for jailbreaks and logic leaks.',
      icon: BeakerIcon,
      color: 'rose',
      size: 'md'
    },
    {
      id: 'n8n',
      name: 'Workflow Architect',
      tag: 'Automation',
      description: 'Visual logic to agent code. The bridge between n8n and AI autonomy.',
      icon: WorkflowIcon,
      color: 'orange',
      size: 'md'
    }
  ];

  // Added explicit Variants type to fix AnimationGeneratorType errors
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Added explicit Variants type and ensured 'spring' is inferred correctly as a literal
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pb-32"
    >
      {/* Cinematic Hero Section */}
      <section className="relative pt-24 pb-20 text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] -z-10 animate-pulse-slow"
        ></motion.div>
        
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full mb-12 shadow-xl shadow-indigo-500/5">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
           </span>
           <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">The Intelligence Layer v3.5</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-6xl sm:text-9xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
          Command the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500">Full Potential.</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light mb-12">
          PromptArchitect AI is a high-end engineering suite that bridges the gap between human intent and machine reasoning for the world's most capable models.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => onNavigate('architect')}
             className="group px-12 py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-2xl shadow-indigo-500/30 flex items-center space-x-4 overflow-hidden relative"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
             <span className="text-lg">Initialize Architect</span>
             <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
           </motion.button>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => onNavigate('how-it-works')}
             className="px-12 py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg"
           >
             View Methodology
           </motion.button>
        </motion.div>
      </section>

      {/* Anatomy Visualizer */}
      <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 mb-40">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-slate-800 p-8 sm:p-20 shadow-2xl relative group overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <div className="w-16 h-1 bg-indigo-500 mb-8 rounded-full"></div>
                 <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Structured Intent Engine</h2>
                 <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-light">
                   Generic prompts produce generic results. Our engine applies **Reasoning Injection**—restructuring your idea into a multi-layered system architecture that forces the LLM into a specialized cognitive state.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { l: 'Identity Injection', d: 'Expert persona alignment.', c: 'indigo' },
                      { l: 'Reasoning Triggers', d: 'CoT logic enforcement.', c: 'purple' },
                      { l: 'Boundary Logic', d: 'Negative constraint filters.', c: 'rose' },
                      { l: 'Schema Synthesis', d: 'Structured output formatting.', c: 'emerald' }
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className={`mt-1 bg-${item.c}-500/20 p-1 rounded-full`}>
                           <CheckIcon className={`w-4 h-4 text-${item.c}-500`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.l}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{item.d}</p>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>

              <div className="relative">
                 <motion.div 
                   whileHover={{ y: -10 }}
                   className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-1 shadow-2xl shadow-indigo-500/10"
                 >
                    <div className="bg-slate-800 dark:bg-slate-900/50 rounded-t-[2.4rem] px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                       <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                       </div>
                       <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">System Architect v3.5</div>
                    </div>
                    <div className="p-8 font-mono text-xs sm:text-sm space-y-4">
                       <div className="flex space-x-3">
                          <span className="text-indigo-500">❯</span>
                          <span className="text-slate-400">Restructuring raw intent...</span>
                       </div>
                       <div className="pl-6 py-4 border-l-2 border-indigo-500/20 space-y-2">
                          <div><span className="text-purple-400">@inject</span> <span className="text-slate-300">Persona(StaffEngineer)</span></div>
                          <div><span className="text-purple-400">@inject</span> <span className="text-slate-300">Constraints(NoYapping, StrictJSON)</span></div>
                          <div><span className="text-purple-400">@anchor</span> <span className="text-slate-300">Context(AdvancedReasoning)</span></div>
                       </div>
                       <div className="text-emerald-500 animate-pulse">■ Logic Optimization Successful.</div>
                    </div>
                 </motion.div>
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
              </div>
           </div>
        </div>
      </motion.section>

      {/* Bento Grid Tools */}
      <section className="max-w-7xl mx-auto px-4 mb-40">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="max-w-2xl">
              <div className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Engineering Suite</div>
              <h2 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">The Toolset.</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-light">Specialized modules designed to handle every edge case of modern AI integration.</p>
           </div>
           <GridIcon className="w-12 h-12 text-slate-100 dark:text-slate-800 hidden md:block" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.id}
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(tool.id)}
              className={`
                group relative text-left rounded-[3rem] p-10 transition-all duration-700 overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl
                ${tool.size === 'lg' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2'}
                bg-white dark:bg-slate-900/80 backdrop-blur-sm
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${tool.color}-500/0 via-${tool.color}-500/0 to-${tool.color}-500/[0.03] group-hover:to-${tool.color}-500/10 transition-all duration-700`}></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-auto">
                   <div className={`p-5 bg-${tool.color}-500/10 rounded-2xl text-${tool.color}-600 dark:text-${tool.color}-400 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                      <tool.icon className={`${tool.size === 'lg' ? 'w-12 h-12' : 'w-7 h-7'}`} />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">{tool.tag}</div>
                </div>
                
                <div className="mt-16">
                   <h3 className={`${tool.size === 'lg' ? 'text-4xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                      {tool.name}
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-[340px] font-light">
                      {tool.description}
                   </p>
                </div>

                {tool.size === 'lg' && (
                  <div className="mt-10 flex flex-wrap gap-3">
                     {tool.features?.map((f, idx) => (
                       <span key={idx} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                         {f}
                       </span>
                     ))}
                  </div>
                )}

                <div className={`mt-12 flex items-center space-x-3 text-sm font-black uppercase tracking-[0.2em] text-${tool.color}-600 dark:text-${tool.color}-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0`}>
                   <span>Launch Module</span>
                   <ArrowRightIcon className="w-5 h-5" />
                </div>
              </div>

              <tool.icon className={`absolute -bottom-16 -right-16 ${tool.size === 'lg' ? 'w-80 h-80' : 'w-48 h-48'} opacity-[0.01] dark:opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 transform rotate-12 group-hover:rotate-0 group-hover:scale-125`} />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Ecosystem Section */}
      <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 text-center py-20 border-t border-slate-100 dark:border-slate-800">
         <h3 className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em] mb-16">Primary Ecosystem Partners</h3>
         <div className="flex flex-wrap justify-center gap-16 md:gap-32 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
            <span className="text-3xl font-black text-slate-900 dark:text-white">Google Gemini</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">OpenAI GPT-4o</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">Anthropic Claude</span>
         </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section variants={itemVariants} className="max-w-5xl mx-auto px-4 mt-20">
         <div className="bg-slate-900 dark:bg-indigo-600 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 relative z-10 tracking-tight">Stop Guessing. <br/>Start Engineering.</h2>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('architect')}
              className="relative z-10 px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-2xl"
            >
              Get Started for Free
            </motion.button>
         </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;
