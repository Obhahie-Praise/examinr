"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AIVoiceOrbState = "idle" | "listening" | "thinking" | "speaking";
export type AIVoiceOrbTheme = "aurora" | "monochrome" | "chromatic";

export interface AIVoiceOrbProps {
  /** Active interactive state. Default: "idle" */
  state?: AIVoiceOrbState;
  /** Diameter of the orb in pixels. Default: 240 */
  size?: number;
  /** Color theme. Default: "chromatic" */
  theme?: AIVoiceOrbTheme;
  /** Simulated or real audio input level (0 to 1) */
  audioLevel?: number;
  /** Custom click handler */
  onClick?: () => void;
  className?: string;
}

const THEME_PALETTES: Record<
  AIVoiceOrbTheme,
  { c1: string; c2: string; c3: string; c4: string }
> = {
  chromatic: {
    c1: "rgba(99, 102, 241, 0.8)", // indigo
    c2: "rgba(236, 72, 153, 0.7)", // pink
    c3: "rgba(56, 189, 248, 0.8)", // sky
    c4: "rgba(251, 146, 60, 0.7)", // orange
  },
  aurora: {
    c1: "rgba(16, 185, 129, 0.8)", // emerald
    c2: "rgba(6, 182, 212, 0.75)", // cyan
    c3: "rgba(139, 92, 246, 0.75)", // purple
    c4: "rgba(52, 211, 153, 0.6)", // mint
  },
  monochrome: {
    c1: "rgba(255, 255, 255, 0.85)",
    c2: "rgba(200, 200, 210, 0.6)",
    c3: "rgba(140, 140, 150, 0.7)",
    c4: "rgba(90, 90, 100, 0.5)",
  },
};

export function AIVoiceOrb({
  state = "idle",
  size = 240,
  theme = "chromatic",
  audioLevel = 0,
  onClick,
  className,
}: AIVoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const themeRef = useRef(theme);

  useEffect(() => {
    stateRef.current = state;
    audioLevelRef.current = audioLevel;
    themeRef.current = theme;
  }, [state, audioLevel, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;
      const currentPalette = THEME_PALETTES[themeRef.current] || THEME_PALETTES.chromatic;

      // Speed configuration based on state
      let speed = 0.02;
      let amplitudeMultiplier = 1;

      if (currentState === "thinking") {
        speed = 0.07;
        amplitudeMultiplier = 1.3;
      } else if (currentState === "listening") {
        speed = 0.03 + currentAudio * 0.04;
        amplitudeMultiplier = 1 + currentAudio * 2.2;
      } else if (currentState === "speaking") {
        speed = 0.05 + Math.sin(t * 3) * 0.02;
        amplitudeMultiplier = 1.6 + Math.sin(t * 4) * 0.8;
      } else {
        // idle
        speed = 0.015;
        amplitudeMultiplier = 0.9 + Math.sin(t * 1.5) * 0.15;
      }

      if (reduceMotion) {
        speed = 0;
        amplitudeMultiplier = 1;
      }

      t += speed;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.35;

      // Outer soft glow halo
      const haloGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.4, cx, cy, baseRadius * 1.5);
      haloGrad.addColorStop(0, currentPalette.c1.replace("0.8", "0.2"));
      haloGrad.addColorStop(0.6, currentPalette.c2.replace("0.7", "0.1"));
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Draw multi-layer organic harmonic blobs
      ctx.globalCompositeOperation = "screen";

      const layers = [
        { color: currentPalette.c1, angleOffset: 0, freq: 3, amp: 14 * amplitudeMultiplier },
        { color: currentPalette.c2, angleOffset: 2.1, freq: 4, amp: 18 * amplitudeMultiplier },
        { color: currentPalette.c3, angleOffset: 4.2, freq: 5, amp: 12 * amplitudeMultiplier },
        { color: currentPalette.c4, angleOffset: 1.0, freq: 3, amp: 16 * amplitudeMultiplier },
      ];

      for (const layer of layers) {
        ctx.beginPath();
        const points = 60;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble =
            Math.sin(angle * layer.freq + t + layer.angleOffset) * layer.amp +
            Math.cos(angle * 2 - t * 1.5) * (layer.amp * 0.5);
          const r = baseRadius + wobble;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(
          cx + Math.cos(t + layer.angleOffset) * 20,
          cy + Math.sin(t + layer.angleOffset) * 20,
          0,
          cx,
          cy,
          baseRadius * 1.2
        );
        grad.addColorStop(0, layer.color);
        grad.addColorStop(0.7, layer.color.replace(/0\.\d+\)/, "0.4)"));
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Center Core Specular Brightness
      ctx.beginPath();
      const coreGrad = ctx.createRadialGradient(
        cx + Math.sin(t * 2) * 8,
        cy + Math.cos(t * 2) * 8,
        0,
        cx,
        cy,
        baseRadius * 0.6
      );
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      coreGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.arc(cx, cy, baseRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size, reduceMotion]);

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={cn(
        "relative flex items-center justify-center select-none cursor-pointer transition-transform active:scale-95",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block rounded-full"
      />
    </div>
  );
}
