import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import HlsVideo from '../HlsVideo';
import BlurText from '../BlurText';

const steps = [
  { num: '01', title: 'The Bar', desc: 'Working MVP, 6+ months in business, and active revenue.' },
  { num: '02', title: 'The Pitch', desc: 'Share your business overview and upload your pitch deck.' },
  { num: '03', title: 'The Ask', desc: 'Define your technical and capital needs for Jamaican scale.' }
];

export default function CtaFooter() {
  return (
    <section className="relative w-full min-h-[900px] flex flex-col items-center justify-end overflow-hidden pt-32">
      
      {/* Background Video */}
      <HlsVideo
        src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      />

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto w-full mb-20">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            Partnership Application
          </span>
        </motion.div>

        <BlurText 
          text="Join the ecosystem." 
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.85] justify-center text-white mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/60 font-body font-light text-lg mb-12 max-w-xl mx-auto"
        >
          A three-step path from revenue-ready venture to fully operationalized partner.
        </motion.p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + idx * 0.12, duration: 0.6 }}
              className="liquid-glass rounded-2xl p-6 text-left"
            >
              <div className="text-white/40 text-xs font-body tracking-widest mb-3">STEP {step.num}</div>
              <h5 className="text-xl font-heading italic text-white mb-2 tracking-tight">{step.title}</h5>
              <p className="text-white/60 font-body font-light text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button className="bg-white text-black hover:bg-white/90 transition-colors duration-300 rounded-full px-8 py-3.5 font-medium text-sm w-full sm:w-auto">
            Start Application
          </button>
          <button className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-8 py-3.5 text-white font-medium text-sm w-full sm:w-auto">
            Speak with the Team
          </button>
        </motion.div>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 w-full border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-body font-light">
            © 2026 Digitize Ventures. Architecting Jamaica's digital future.
          </p>
          
          <div className="flex items-center gap-6">
            {['Portfolio', 'The Lab', 'Privacy', 'Contact'].map((item) => (
              <Link 
                key={item} 
                to="/" 
                className="text-white/40 hover:text-white transition-colors text-xs font-body font-light"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}