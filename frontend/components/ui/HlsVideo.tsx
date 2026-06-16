"use client";

import { useEffect, useRef, type CSSProperties, type VideoHTMLAttributes } from "react";
import Hls from "hls.js";

type Props = VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  className?: string;
  style?: CSSProperties;
  poster?: string;
};

export default function HlsVideo({ src, className, style, poster, ...props }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | undefined;

    if (Hls.isSupported()) {
      hls = new Hls({ startLevel: 2 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (props.autoPlay) video.play().catch((e) => console.warn("HLS Autoplay prevented:", e));
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (props.autoPlay) {
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e) => console.warn("Native Autoplay prevented:", e));
        });
      }
    }

    return () => {
      hls?.destroy();
    };
  }, [src, props.autoPlay]);

  return <video ref={videoRef} className={className} style={style} poster={poster} playsInline {...props} />;
}
