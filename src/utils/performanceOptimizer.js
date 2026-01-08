// src/utils/performanceOptimizer.js
// Utilidades para optimizar rendimiento de la app

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce function - retrasa la ejecución hasta que pasen X ms sin llamadas
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limita la frecuencia de ejecución
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook para debounce
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle
 */
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

/**
 * Lazy load de imágenes
 */
export function lazyLoadImage(imageUrl, placeholder = '/placeholder.jpg') {
  const [src, setSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      setSrc(imageUrl);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
    };
  }, [imageUrl]);

  return { src, isLoading };
}

/**
 * Intersección Observer para lazy loading de componentes
 */
export function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Memoización simple para funciones costosas
 */
export function memoize(fn) {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Comprimir imagen antes de subir
 */
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calcular tamaño de bundle en KB
 */
export function getBundleSize(component) {
  const start = performance.now();
  component();
  const end = performance.now();
  
  return {
    loadTime: end - start,
    size: performance.memory ? performance.memory.usedJSHeapSize / 1024 : null
  };
}

/**
 * Medidor de performance
 */
export class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.metrics = [];
  }

  start(label) {
    performance.mark(`${this.name}-${label}-start`);
  }

  end(label) {
    performance.mark(`${this.name}-${label}-end`);
    
    try {
      performance.measure(
        `${this.name}-${label}`,
        `${this.name}-${label}-start`,
        `${this.name}-${label}-end`
      );

      const measure = performance.getEntriesByName(`${this.name}-${label}`)[0];
      
      this.metrics.push({
        label,
        duration: measure.duration,
        timestamp: Date.now()
      });

      console.log(`[Performance] ${this.name} - ${label}: ${measure.duration.toFixed(2)}ms`);
      
      return measure.duration;
    } catch (error) {
      console.error(`[Performance] Error midiendo ${label}:`, error);
      return null;
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverage(label) {
    const filtered = this.metrics.filter(m => m.label === label);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  clear() {
    this.metrics = [];
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Virtual scrolling simple para listas grandes
 */
export class VirtualScroller {
  constructor(items, itemHeight, containerHeight) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }

  getVisibleItems(scrollTop) {
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + this.containerHeight) / this.itemHeight);
    
    return {
      items: this.items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      offsetY: startIndex * this.itemHeight,
      totalHeight: this.items.length * this.itemHeight
    };
  }
}

export default {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  lazyLoadImage,
  useIntersectionObserver,
  memoize,
  compressImage,
  getBundleSize,
  PerformanceMonitor,
  VirtualScroller
};
