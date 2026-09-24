"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, Leaf } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface AnimatedStatProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

function AnimatedStat({ icon, value, suffix = "", label, delay = 0 }: AnimatedStatProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.min(Math.round(increment * currentStep), value));
      } else {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-5 rounded-2xl",
        "bg-secondary/50 backdrop-blur-sm border border-border",
        "transition-all duration-700",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center",
        "transition-transform duration-300 hover:scale-110"
      )}>
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {count.toLocaleString('pt-BR')}{suffix}
        </div>
        <div className="text-xs md:text-sm text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

interface HeroStatsProps {
  totalProducts?: number;
  soldProducts?: number;
  className?: string;
}

export function HeroStats({
  totalProducts = 500,
  soldProducts = 350,
  className,
}: HeroStatsProps) {
  return (
    <section className={cn("w-full py-8 md:py-12", className)}>
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Moda Sustentável em Números
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Cada peça segunda mão é um passo em direção a um futuro mais consciente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <AnimatedStat
            icon={<Package className="w-6 h-6 text-foreground" />}
            value={totalProducts}
            suffix="+"
            label="Peças Únicas"
            delay={0}
          />
          <AnimatedStat
            icon={<TrendingUp className="w-6 h-6 text-foreground" />}
            value={soldProducts}
            suffix="+"
            label="Peças Adotadas"
            delay={200}
          />
        </div>
      </div>
    </section>
  );
}
