"use client";
import { useEffect, useRef } from "react";

// The landing's demo: a muted, looping clip of a real answer. Nothing loads until it is near the screen; it pauses off
// screen. Reduced motion (the OS setting or the Settings override, like globals.css) never autoplays: it shows controls.
function motionOff() {
  const m = document.documentElement.dataset.motion;
  return m === "reduce" || (m !== "full" && matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function DemoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const still = () => { v.controls = true; };   // no autoplay: let the viewer press play
    if (motionOff()) return still();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(still); else v.pause(); },
      { rootMargin: "200px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} className="demo-video" src={src} poster={poster} muted loop playsInline preload="none"
      width={1600} height={900} aria-label={label} />
  );
}
