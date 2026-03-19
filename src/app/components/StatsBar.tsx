"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 0, suffix: "+", label: "Tiendas aliadas" },
  { value: 0, suffix: "+", label: "Profesionales" },
  { value: 0, label: "Categorías" },
  { value: 0, label: "Planes disponibles" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (value === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="text-4xl font-black" style={{ color: "#43D696" }}>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="w-full" style={{ background: "#1a1b3c" }}>
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 gap-y-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            <span className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
