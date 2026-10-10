import { useEffect, useRef, useState, type ReactNode } from 'react';
import '../../theme/promo-bleed.css';
import styles from './PromoCarousel.module.css';

export interface PromoCarouselProps {
  children: ReactNode[];
  'aria-label': string;
  /** `bleed` runs the slides edge to edge of the screen, with the dots over the image. */
  variant?: 'card' | 'bleed';
}

// One-at-a-time carousel with dot navigation (2026-09-15, direct feedback:
// "only one rectangle in view and dots to navigate"). Astryx's own
// Carousel (used by AssetsHomePage's existing PromoCard row) has no dot
// pagination — it's a bare scroll-snap track with optional prev/next
// buttons, not a fit for this layout — so this is a small dedicated
// wrapper rather than a prop this session would need to add upstream.
//
// Active index tracked via IntersectionObserver on each slide, not
// scroll-position math against scrollLeft/clientWidth: that arithmetic
// breaks under RTL, zoom, and sub-pixel snap rounding, where
// IntersectionObserver's own visibility ratio does not. A slide crossing
// the 50% visibility threshold is the one snapped into view.
export function PromoCarousel({ children, 'aria-label': ariaLabel, variant = 'card' }: PromoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.children] as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      const index = slides.indexOf(visible.target as HTMLElement);
      if (index >= 0) setActiveIndex(index);
    }, { root: track, threshold: 0.5 });
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [children.length]);
  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };
  return (
    <div className={styles.root} data-variant={variant}>
      <div ref={trackRef} className={styles.track} role="region" aria-label={ariaLabel}>
        {children}
      </div>
      {children.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label={`${ariaLabel} pagination`}>
          {children.map((_, index) => (
            <button key={index} type="button" role="tab" aria-selected={index === activeIndex}
              aria-label={`Go to slide ${index + 1}`} className={styles.dot} data-active={index === activeIndex}
              onClick={() => scrollToIndex(index)} />
          ))}
        </div>
      )}
    </div>
  );
}
