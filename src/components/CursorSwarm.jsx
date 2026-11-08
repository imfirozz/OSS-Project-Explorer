

import { useEffect, useRef } from "react";
import gsap from "gsap";

const N_COMETS = 5;     
const CHAIN_LEN = 10;   
const TOTAL = N_COMETS * CHAIN_LEN; 

const ORBIT_RADIUS = 60;        
const ORBIT_ELLIPSE = 0.72;    

const OUTLINE = "#F5EEE5";

// Per-arm colour palettes (warm-sandstone, no neons)
const COMET_PALETTES = [
  // Arm 0 — Bronze / Amber
  ["#D99A67","#C58A5B","#B8947A","#A87B5E","#C09070","#D99A67","#C58A5B","#B8947A","#A87B5E","#C09070"],
  // Arm 1 — Dusty Teal / Sage
  ["#82A3A1","#91A58C","#6B9A98","#A3B2A0","#7D9E9C","#82A3A1","#91A58C","#6B9A98","#A3B2A0","#7D9E9C"],
  // Arm 2 — Terracotta
  ["#B87864","#C07060","#A86858","#D08070","#B07060","#B87864","#C07060","#A86858","#D08070","#B07060"],
  // Arm 3 — Mixed warm
  ["#C58A5B","#D99A67","#B8947A","#91A58C","#82A3A1","#C58A5B","#D99A67","#B8947A","#91A58C","#82A3A1"],
  // Arm 4 — Sand / Warm neutral
  ["#B8947A","#C09070","#A87B5E","#D99A67","#C58A5B","#B8947A","#C09070","#A87B5E","#D99A67","#C58A5B"],
];

// Orbital angular speeds (rad/frame) — slightly different per arm for organic feel
const ORBIT_SPEEDS = Array.from({ length: N_COMETS }, (_, c) => 0.007 + c * 0.0016);

// ─── SVG cursor-arrow shape ───────────────────────────────────────────────────
function CursorArrowSVG({ fill, size }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 10 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M1 1 L1 10.5 L3.5 8 L5.2 12 L6.5 11.5 L4.8 7.5 L8.5 7.5 Z"
        fill={fill}
        stroke={OUTLINE}
        strokeWidth="0.85"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Static visual descriptors for JSX (no .current access in render) ────────
const PARTICLE_DEFS = Array.from({ length: TOTAL }, (_, i) => {
  const c = Math.floor(i / CHAIN_LEN);
  const j = i % CHAIN_LEN;
  return {
    id: i,
    colour: COMET_PALETTES[c][j],
    // Head is largest (15 px), tail tapers to 6 px
    size: Math.max(6, 15 - j * 0.95),
  };
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function CursorSwarm() {
  const shouldRender =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const elRefs = useRef([]);

  // All physics state — never touches React
  const mouse = useRef({ x: -500, y: -500 });
  const hasEntered = useRef(false);
  const phy = useRef(null);

  // Orbital state
  const orbitAngles = useRef(
    Array.from({ length: N_COMETS }, (_, c) => (c / N_COMETS) * Math.PI * 2)
  );
  const orbitRadiusCurrent = useRef(ORBIT_RADIUS);
  const orbitRadiusTarget = useRef(ORBIT_RADIUS);

  const scatterLock = useRef(false);

  useEffect(() => {
    if (!shouldRender) return;

    const els = elRefs.current;

    // Build mutable physics state per particle
    phy.current = PARTICLE_DEFS.map((def, i) => {
      const j = i % CHAIN_LEN;
      return {
        x: -500,
        y: -500,
        rotation: 0,
        scale: 1,
        opacity: 0,
        // Target opacity: comet head=1.0, tail fades to 0.42
        baseOpacity: Math.max(0.42, 1 - j * 0.058),
        opacityTarget: 0,
        vx: 0,
        vy: 0,
        vr: 0,
        scattered: false,
        // Lerp factor: head tracks orbit quickly, tail lags for comet effect
        lerpFactor: Math.max(0.07, 0.19 - j * 0.012),
      };
    });

    // Stamp initial DOM state
    phy.current.forEach((_, i) => {
      const el = els[i];
      if (el) gsap.set(el, { x: -500, y: -500, rotation: 0, opacity: 0, scale: 1 });
    });

    // ── GSAP ticker: runs every RAF frame ────────────────────────────────────
    function onTick() {
      const particles = phy.current;
      if (!particles) return;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Smoothly lerp orbit radius (for scatter burst / return)
      orbitRadiusCurrent.current +=
        (orbitRadiusTarget.current - orbitRadiusCurrent.current) * 0.06;
      const r = orbitRadiusCurrent.current;

      for (let c = 0; c < N_COMETS; c++) {
        // Advance orbital angle
        orbitAngles.current[c] += ORBIT_SPEEDS[c];
        const angle = orbitAngles.current[c];

        // Orbit head target (slightly elliptical)
        const headX = mx + Math.cos(angle) * r;
        const headY = my + Math.sin(angle) * r * ORBIT_ELLIPSE;

        for (let j = 0; j < CHAIN_LEN; j++) {
          const idx = c * CHAIN_LEN + j;
          const p = particles[idx];
          const el = els[idx];
          if (!el) continue;

          // ── Opacity lerp (all via physics, no competing tweens) ────────────
          p.opacity += (p.opacityTarget - p.opacity) * 0.055;

          if (p.scattered) {
            // Velocity physics with friction
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.87;
            p.vy *= 0.87;
            p.rotation += p.vr;
            p.vr *= 0.91;

            // Auto-rejoin when velocity decays
            if (Math.abs(p.vx) + Math.abs(p.vy) < 0.4) {
              p.scattered = false;
              p.vx = 0;
              p.vy = 0;
              p.vr = 0;
            }
          } else {
            // Lerp-chain: each particle follows its leader
            const prevX = p.x;
            const prevY = p.y;

            const targetX = j === 0 ? headX : particles[c * CHAIN_LEN + j - 1].x;
            const targetY = j === 0 ? headY : particles[c * CHAIN_LEN + j - 1].y;

            p.x += (targetX - p.x) * p.lerpFactor;
            p.y += (targetY - p.y) * p.lerpFactor;

            // Direction-aware rotation: arrow faces its travel direction
            const dx = p.x - prevX;
            const dy = p.y - prevY;
            const spd = Math.sqrt(dx * dx + dy * dy);
            if (spd > 0.2) {
              const targetRot = Math.atan2(dy, dx) * (180 / Math.PI) - 45;
              // Shortest-path rotation interpolation
              let diff = targetRot - p.rotation;
              if (diff > 180) diff -= 360;
              if (diff < -180) diff += 360;
              p.rotation += diff * 0.12;
            }
          }

          gsap.set(el, {
            x: p.x,
            y: p.y,
            rotation: p.rotation,
            scale: p.scale,
            opacity: p.opacity,
          });
        }
      }
    }

    gsap.ticker.add(onTick);

    // ── Pointermove ──────────────────────────────────────────────────────────
    function onPointerMove(e) {
      const mx = e.clientX;
      const my = e.clientY;
      mouse.current = { x: mx, y: my };

      // First entry: teleport all particles to cursor, then fade in staggered
      if (!hasEntered.current) {
        hasEntered.current = true;
        const particles = phy.current;
        for (let c = 0; c < N_COMETS; c++) {
          const angle = orbitAngles.current[c];
          for (let j = 0; j < CHAIN_LEN; j++) {
            const idx = c * CHAIN_LEN + j;
            const p = particles[idx];
            p.x = mx + Math.cos(angle) * ORBIT_RADIUS;
            p.y = my + Math.sin(angle) * ORBIT_RADIUS * ORBIT_ELLIPSE;
            // Staggered fade: arm 0 head first, arm 4 tail last
            const delay = (c * 2 + j) * 45;
            setTimeout(() => {
              p.opacityTarget = p.baseOpacity;
            }, delay);
          }
        }
        return;
      }

      // Proximity repulsion: scatter particles whose orbit passes near cursor
      const particles = phy.current;
      particles.forEach((p) => {
        if (p.scattered) return;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 34 && dist > 0.5) {
          const force = ((34 - dist) / 34) * 9;
          const angle = Math.atan2(dy, dx);
          p.scattered = true;
          p.vx = Math.cos(angle) * force;
          p.vy = Math.sin(angle) * force;
          p.vr = (Math.random() - 0.5) * 12;
        }
      });
    }

    // ── Pointerdown: burst orbit outward, then spiral back ───────────────────
    function onPointerDown() {
      if (scatterLock.current) return;
      scatterLock.current = true;

      // Burst orbit radius
      orbitRadiusTarget.current = ORBIT_RADIUS * 2.6;

      const particles = phy.current;
      particles?.forEach((p, i) => {
        const c = Math.floor(i / CHAIN_LEN);
        const angle = orbitAngles.current[c];
        const force = 8 + Math.random() * 12;
        p.scattered = true;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force;
        p.vr = (Math.random() - 0.5) * 18;
        p.scale = 0.8 + Math.random() * 0.5;
      });

      // Begin returning orbit radius after brief pause
      setTimeout(() => {
        orbitRadiusTarget.current = ORBIT_RADIUS;
      }, 500);

      // Unlock and restore scale after full regroup
      setTimeout(() => {
        scatterLock.current = false;
        particles?.forEach((p) => { p.scale = 1; });
      }, 1500);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      gsap.killTweensOf(els);
      phy.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
        overflow: "hidden",
      }}
    >
      {PARTICLE_DEFS.map((def, i) => (
        <div
          key={def.id}
          ref={(el) => { elRefs.current[i] = el; }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "transform, opacity",
            transformOrigin: "top left",
          }}
        >
          <CursorArrowSVG fill={def.colour} size={def.size} />
        </div>
      ))}
    </div>
  );
}
