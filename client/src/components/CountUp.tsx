import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentValue, setCurrentValue] = useState(direction === 'down' ? to : from);

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (parseInt(decimals) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  // Intersection Observer to detect when element is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animation logic
  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') {
        onStart();
      }

      const timeoutId = setTimeout(() => {
        const startTime = Date.now();
        const startValue = direction === 'down' ? to : from;
        const endValue = direction === 'down' ? from : to;
        const valueRange = endValue - startValue;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = startValue + (valueRange * easeOutQuart);
          
          setCurrentValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (typeof onEnd === 'function') {
              onEnd();
            }
          }
        };

        requestAnimationFrame(animate);
      }, delay * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isInView, startWhen, direction, from, to, delay, onStart, onEnd, duration]);

  // Format the current value
  const formatValue = (value: number): string => {
    const hasDecimals = maxDecimals > 0;
    
    const options: Intl.NumberFormatOptions = {
      useGrouping: !!separator,
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0
    };

    const formattedNumber = Intl.NumberFormat('en-US', options).format(value);
    return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
  };

  return <span className={className} ref={ref}>{formatValue(currentValue)}</span>;
}
