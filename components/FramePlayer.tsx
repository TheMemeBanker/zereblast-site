"use client";

import { useEffect, useRef, useState } from "react";

interface FramePlayerProps {
  basePath: string;
  frameCount: number;
  fps?: number;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

const imageCache = new Map<string, HTMLImageElement>();
const loadingCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  if (loadingCache.has(src)) return loadingCache.get(src)!;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      loadingCache.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      loadingCache.delete(src);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });

  loadingCache.set(src, promise);
  return promise;
}

export default function FramePlayer({
  basePath,
  frameCount,
  fps = 12,
  format = "jpg",
  className,
  style,
}: FramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(1);
  const lastTimeRef = useRef(0);
  const preloaded = useRef(new Set<number>());
  const interval = 1000 / fps;

  // Preload first batch of frames
  useEffect(() => {
    const preloadCount = Math.min(20, frameCount);
    for (let i = 1; i <= preloadCount; i++) {
      const num = i.toString().padStart(4, "0");
      loadImage(`${basePath}${num}.${format}`)
        .then(() => preloaded.current.add(i))
        .catch(() => {});
    }
  }, [basePath, frameCount, format]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;

      if (time - lastTimeRef.current >= interval) {
        let nextFrame = frameRef.current + 1;
        if (nextFrame > frameCount) nextFrame = 1;

        // Preload ahead
        for (let i = 1; i <= 5; i++) {
          const ahead = nextFrame + i;
          if (ahead <= frameCount && !preloaded.current.has(ahead)) {
            const num = ahead.toString().padStart(4, "0");
            loadImage(`${basePath}${num}.${format}`)
              .then(() => preloaded.current.add(ahead))
              .catch(() => {});
          }
        }

        // Draw current frame
        const num = frameRef.current.toString().padStart(4, "0");
        const src = `${basePath}${num}.${format}`;
        const cached = imageCache.get(src);

        if (cached) {
          if (canvas.width !== cached.naturalWidth || canvas.height !== cached.naturalHeight) {
            canvas.width = cached.naturalWidth;
            canvas.height = cached.naturalHeight;
          }
          ctx.drawImage(cached, 0, 0, canvas.width, canvas.height);
        } else {
          loadImage(src)
            .then((img) => {
              if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
              }
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              preloaded.current.add(frameRef.current);
            })
            .catch(() => {});
        }

        frameRef.current = nextFrame;
        lastTimeRef.current = time;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, interval, basePath, format]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}
