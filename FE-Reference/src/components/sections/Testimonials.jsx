import React from 'react';
import { motion } from 'motion/react';
import BlurText from '../BlurText';

const pillars = [
  {
    icon: 'solar:user-speak-bold-duotone',
    eyebrow: 'Founder Vision',
    title: 'The visionary behind the architecture.',
    body: "Driven by a technical track record as a Founder and CTO, our leadership operates at the intersection of technology and capital — bringing the experience of building scalable SaaS platforms and logistics networks to every partnership."
  },
  {
    icon: 'solar:wallet-money-bold-duotone',
    eyebrow: 'Funding Network',
    title: 'Strategic capital access.',
    body: "We bridge local innovation with global capital. Beyond our internal funding, we connect partners to a curated network of Private Equity firms, Angel Networks, and Institutional Investors."
  },
  {
    icon: 'solar:checklist-minimalistic-bold-duotone',
    eyebrow: 'The Bar',
    title: 'Built for revenue-ready ventures.',
    body: "Applicants need a working MVP, 6+ months in operation, and active revenue. Then we go deep: pitch deck review, technical audit, and a clear definition of your scaling needs."
  }
];

export default function Testimonials() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
      
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-white text-xs font-medium font-body uppercase tracking-wider">
            Leadership & Network
          </span>
        </motion.div>
        
        <BlurText 
          text="Capital, conviction, and code." 
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] justify-center text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-8 flex flex-col justify-between h-full"
          >
            <div className="mb-8">
              <div className="liquid-glass-strong rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <iconify-icon icon={item.icon} width="22" className="text-white/90"></iconify-icon>
              </div>
              <div className="text-white/50 text-[10px] uppercase tracking-widest font-body mb-3">{item.eyebrow}</div>
              <h4 className="text-2xl font-heading italic tracking-tight text-white mb-4 leading-tight">
                {item.title}
              </h4>
              <p className="text-white/70 font-body font-light text-base leading-relaxed">
                {item.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}