import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsVideo({ src, className, style, poster, ...props }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls;

    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      hls = new Hls({
        startLevel: 2, // start with decent quality
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (props.autoPlay) {
          video.play().catch(e => console.warn("HLS Autoplay prevented:", e));
        }
      });
    } 
    // Fallback for native HLS support (Safari)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (props.autoPlay) {
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.warn("Native Autoplay prevented:", e));
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, props.autoPlay]);

  return (
    <video 
      ref={videoRef} 
      className={className} 
      style={style} 
      poster={poster}
      playsInline
      {...props} 
    />
  );
}