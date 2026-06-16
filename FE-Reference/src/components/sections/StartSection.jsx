import React from 'react';
import { motion } from 'motion/react';
import HlsVideo from '../HlsVideo';
import BlurText from '../BlurText';

export default function StartSection() {
  return (
    <section className="relative w-full min-h-[700px] flex items-center justify-center py-32 overflow-hidden">
      {/* Background Video */}
      <HlsVideo
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      />

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-8"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            The Thesis
          </span>
        </motion.div>

        <BlurText 
          text="We architect the future of Jamaica." 
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] justify-center text-white mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/60 font-body font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          We modernize the island's infrastructure and empower the next generation of tech-founders. Enterprise-grade technology, direct capital from our own funds, and exclusive access to a network of strategic funding partners — focused 100% on the Jamaican ecosystem.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-8 py-4 text-white font-medium text-sm"
        >
          Join the Ecosystem
        </motion.button>
      </div>
    </section>
  );
}