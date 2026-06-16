import React from 'react';
import { motion } from 'motion/react';
import BlurText from '../BlurText';

export default function FeaturesChess() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-24 md:gap-32">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            Service-for-Equity
          </span>
        </motion.div>
        
        <BlurText 
          text="Technical labor as a strategic asset." 
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] justify-center text-white"
        />
      </div>

      {/* Row 1 — The Model */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6"
        >
          <h3 className="text-3xl md:text-4xl font-heading italic text-white tracking-tight leading-tight">
            Your technical co-founder.<br />Aligned by equity.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            We trade technical excellence and strategic architecture for equity. From full-stack development to AI infrastructure and regional expansion — we provide the engine to reach $3M+ ARR and beyond.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Full-Stack Dev', 'AI & Agentic Infra', 'BizDev', 'Distribution', 'Marketing', 'Funding'].map((tag) => (
              <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-xs text-white/80 font-body">{tag}</span>
            ))}
          </div>
          <button className="liquid-glass-strong hover:bg-white/5 transition-colors rounded-full px-6 py-3 text-white font-medium text-sm mt-4">
            Explore the Model
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full"
        >
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group">
            <img 
              src="https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif" 
              alt="Service-for-equity preview" 
              className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
          </div>
        </motion.div>
      </div>

      {/* Row 2 — The Lab */}
      <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6 lg:pl-10"
        >
          <div className="liquid-glass rounded-full px-3 py-1 inline-flex w-fit">
            <span className="text-white/80 text-[10px] font-medium font-body uppercase tracking-widest">Exclusive Business OS</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading italic text-white tracking-tight leading-tight">
            The Lab.<br />Your proprietary growth engine.
          </h3>
          <p className="text-white/60 font-body font-light text-lg leading-relaxed max-w-md">
            Partners receive exclusive access to The Lab — our proprietary business operating system that automates operations, tracks growth milestones, and manages complex lifecycles across the portfolio.
          </p>
          <button className="liquid-glass-strong hover:bg-white/5 transition-colors rounded-full px-6 py-3 text-white font-medium text-sm mt-4">
            Tour The Lab
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full"
        >
          <div className="liquid-glass rounded-2xl p-2 w-full aspect-video md:aspect-[4/3] overflow-hidden group">
            <img 
              src="https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif" 
              alt="The Lab preview" 
              className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
          </div>
        </motion.div>
      </div>

    </section>
  );
}