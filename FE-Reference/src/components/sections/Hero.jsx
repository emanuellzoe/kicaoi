import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Play } from 'lucide-react';
import BlurText from '../BlurText';

export default function Hero() {
  return (
    <section className="relative overflow-visible w-full" style={{ height: '1000px' }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
        className="absolute left-0 w-full h-full object-cover z-0"
        style={{ top: '0%' }}
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-b from-transparent to-black z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 h-full" style={{ paddingTop: '150px' }}>
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="liquid-glass rounded-full px-1 py-1 pr-4 flex items-center gap-3 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            JA 🇯🇲
          </span>
          <span className="text-white/80 font-body text-sm font-medium">
            Architecting Jamaica's digital future.
          </span>
        </motion.div>

        {/* Heading */}
        <BlurText 
          text="Build. Fund. Scale." 
          className="text-6xl md:text-7xl lg:text-[7.5rem] font-heading italic text-foreground leading-[0.85] max-w-4xl tracking-tight justify-center"
          delay={0.1}
          stagger={0.12}
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8 text-lg md:text-xl text-white/70 font-body font-light leading-relaxed max-w-2xl"
        >
          The technology and strategic partner for high-growth Jamaican ventures. Enterprise-grade infrastructure, direct capital, and a curated network of global investors.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <button className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-6 py-3.5 flex items-center gap-2 text-white font-medium text-sm">
            Apply for Partnership
            <ArrowUpRight className="w-4 h-4 opacity-70" />
          </button>
          <button className="rounded-full px-6 py-3.5 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium text-sm">
            <Play className="w-4 h-4 fill-current" />
            View the Thesis
          </button>
        </motion.div>

        {/* Partners Bar */}
        <div className="mt-auto pb-12 pt-16 flex flex-col items-center w-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="liquid-glass rounded-full px-4 py-1.5 mb-8"
          >
            <span className="text-white/50 text-xs font-body uppercase tracking-widest">
              Companies Under Management
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80"
          >
            {[
              { name: 'Island Run', icon: 'solar:delivery-bold-duotone' },
              { name: 'Modular Jamaica', icon: 'solar:widget-5-bold-duotone' },
              { name: 'MipAthleisure', icon: 'solar:t-shirt-bold-duotone' }
            ].map((partner) => (
              <div key={partner.name} className="flex items-center gap-3 text-2xl md:text-3xl font-heading italic text-white hover:opacity-100 hover:scale-105 transition-all cursor-default">
                <iconify-icon icon={partner.icon} width="28" className="opacity-80"></iconify-icon>
                {partner.name}
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}