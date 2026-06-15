"use client";

import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function BlurText({ text, className = "", delay = 0, stagger = 0.08 }: BlurTextProps) {
  const words = text.split(" ");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`blur-text-container ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="blur-word"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(12px)",
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.7s ease ${delay + i * stagger}s, filter 0.7s ease ${delay + i * stagger}s, transform 0.7s ease ${delay + i * stagger}s`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
