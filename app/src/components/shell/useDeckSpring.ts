import { useEffect, useRef, useState } from 'react';

// Hand-rolled spring integrator (2026-09-16) — CLAUDE.md §5 closes the
// dependency list and states "No animation library", so the deck's
// settle physics are integrated here rather than pulled from
// framer-motion/react-spring. Semi-implicit Euler at a clamped timestep:
// stable at the stiffness/damping range the spec asks for (320-380 /
// 28-34) without the overshoot an explicit integrator shows when a
// dropped frame makes dt spike.
export interface SpringConfig { stiffness: number; damping: number }

const REST_DISPLACEMENT = 0.1;
const REST_VELOCITY = 0.1;
// 64ms — two dropped frames at 30fps. Beyond that the tab was likely
// backgrounded; integrating the real elapsed time would fling the card.
const MAX_STEP_MS = 64;

// Drives one value toward `target`. Returns the live value plus a
// setter that jumps without animating (used while a finger is down —
// during drag the card tracks the pointer exactly, no spring).
export function useDeckSpring(target: number, config: SpringConfig, isAnimating: boolean) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);
  const frame = useRef(0);
  const lastTime = useRef(0);
  const current = useRef(target);

  useEffect(() => {
    if (!isAnimating) {
      current.current = target;
      velocity.current = 0;
      setValue(target);
      return;
    }
    const step = (now: number) => {
      const dt = Math.min(now - (lastTime.current || now), MAX_STEP_MS) / 1000;
      lastTime.current = now;
      const displacement = current.current - target;
      const acceleration = -config.stiffness * displacement - config.damping * velocity.current;
      velocity.current += acceleration * dt;
      current.current += velocity.current * dt;
      if (Math.abs(current.current - target) < REST_DISPLACEMENT && Math.abs(velocity.current) < REST_VELOCITY) {
        current.current = target;
        velocity.current = 0;
        setValue(target);
        return;
      }
      setValue(current.current);
      frame.current = requestAnimationFrame(step);
    };
    lastTime.current = 0;
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, isAnimating, config.stiffness, config.damping]);

  return value;
}
