import React from 'react';

// Performance monitoring utilities

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private isDevelopment = process.env.NODE_ENV === 'development';

  startMark(name: string) {
    if (!this.isDevelopment) return;

    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
    };

    this.marks.set(name, mark);
  }

  endMark(name: string): number | null {
    if (!this.isDevelopment) return null;

    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    mark.endTime = performance.now();
    mark.duration = mark.endTime - mark.startTime;

    console.log(`⏱️ ${name}: ${mark.duration.toFixed(2)}ms`);

    return mark.duration;
  }

  getAllMarks(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Decorator for measuring function performance
export const measurePerformance = (name?: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const markName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startMark(markName);
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.finally(() => {
          performanceMonitor.endMark(markName);
        });
      } else {
        performanceMonitor.endMark(markName);
        return result;
      }
    };

    return descriptor;
  };
};

// Hook for measuring component render performance
export const useMeasureRender = (componentName: string) => {
  const isDev = process.env.NODE_ENV === 'development';
  const markName = `${componentName}-render`;

  if (isDev) {
    performanceMonitor.startMark(markName);
  }

  React.useEffect(() => {
    if (!isDev) {
      return;
    }

    return () => {
      performanceMonitor.endMark(markName);
    };
  }, [isDev, markName]);
};
