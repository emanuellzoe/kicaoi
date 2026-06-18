"use client";

import { useEffect, useRef, useState } from "react";

const INTERSECTION_THRESHOLD = 0.1;
const BLUR_HIDDEN = "blur(12px)";
const BLUR_VISIBLE = "blur(0px)";
const TRANSLATE_HIDDEN = "translateY(24px)";
const TRANSLATE_VISIBLE = "translateY(0)";

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
      { threshold: INTERSECTION_THRESHOLD }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`blur-text-container ${className}`} aria-label={text}>
      {words.map((word, i) => {
        const t = `${delay + i * stagger}s`;
        return (
          <span
            key={i}
            className="blur-word"
            aria-hidden="true"
            style={{
              opacity: visible ? 1 : 0,
              filter: visible ? BLUR_VISIBLE : BLUR_HIDDEN,
              transform: visible ? TRANSLATE_VISIBLE : TRANSLATE_HIDDEN,
              transition: `opacity 0.7s ease ${t}, filter 0.7s ease ${t}, transform 0.7s ease ${t}`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
