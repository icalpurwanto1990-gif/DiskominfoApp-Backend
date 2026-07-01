import React, { useEffect, useRef } from "react";

/**
 * ScrollReveal — Wraps children with a fade-in animation
 * when the element enters the viewport using IntersectionObserver.
 * @param {string} direction - "up" (default) | "left"
 * @param {number} delay - delay in ms before animation starts
 * @param {string} className - additional classes
 */
export const ScrollReveal = ({ children, direction = "up", delay = 0, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animClass = direction === "left" ? "reveal-left" : "reveal";
    el.classList.add(animClass);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
