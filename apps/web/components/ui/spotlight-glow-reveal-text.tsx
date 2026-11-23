"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightGlowRevealTextProps {
  /** The text string to illuminate */
  text?: string;
  /** Spotlight beam radius in pixels. Default: 120 */
  radius?: number;
  /** Accent glow color in CSS color notation. Default: "rgba(255,255,255,0.9)" */
  glowColor?: string;
  /** Base dimmed opacity of unlit text (0 to 1). Default: 0.15 */
  dimmedOpacity?: number;
  /** Optional custom class name */
  className?: string;
}

export function SpotlightGlowRevealText({
  text = "Hover to illuminate the spotlight text",
  radius = 120,
  glowColor = "rgba(255,255,255,0.95)",
  dimmedOpacity = 0.18,
  className,
}: SpotlightGlowRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: -999, y: -999 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: -999, y: -999 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-block select-none cursor-text py-4 font-bold tracking-tight",
        className
      )}
    >
      {/* Background Dimmed Text */}
      <span
        style={{ opacity: dimmedOpacity }}
        className="text-neutral-500 dark:text-neutral-400 transition-opacity duration-300"
      >
        {text}
      </span>

      {/* Illuminated Spotlight Text Mask */}
      <span
        aria-hidden="true"
        style={{
          WebkitMaskImage: isHovered
            ? `radial-gradient(${radius}px circle at ${coords.x}px ${coords.y}px, black 30%, transparent 100%)`
            : "none",
          maskImage: isHovered
            ? `radial-gradient(${radius}px circle at ${coords.x}px ${coords.y}px, black 30%, transparent 100%)`
            : "none",
          opacity: isHovered ? 1 : 0,
        }}
        className="pointer-events-none absolute inset-0 py-4 text-black dark:text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-opacity duration-200"
      >
        {text}
      </span>
    </div>
  );
}
