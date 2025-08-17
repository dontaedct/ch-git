import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to prevent memory leaks by managing timeouts, intervals, event listeners, and subscriptions
 * with automatic cleanup on component unmount.
 */
export function useMemoryLeakPrevention() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListenersRef = useRef<Array<{
    target: EventTarget;
    type: string;
    listener: EventListener;
    options?: AddEventListenerOptions;
  }>>(new Array());
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>(new Array());

  // Safe setTimeout that automatically cleans up
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Safe setInterval that automatically cleans up
  const safeSetInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  // Safe addEventListener that automatically cleans up
  const safeAddEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    eventListenersRef.current.push({ target, type, listener, options });
  }, []);

  // Safe subscription management
  const safeSubscribe = useCallback((subscription: { unsubscribe: () => void }) => {
    subscriptionsRef.current.push(subscription);
  }, []);

  // Clear specific timeout
  const clearSafeTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    if (timeoutsRef.current.has(timeoutId)) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(timeoutId);
    }
  }, []);

  // Clear specific interval
  const clearSafeInterval = useCallback((intervalId: NodeJS.Timeout) => {
    if (intervalsRef.current.has(intervalId)) {
      clearInterval(intervalId);
      intervalsRef.current.delete(intervalId);
    }
  }, []);

  // Remove specific event listener
  const safeRemoveEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: EventListenerOptions
  ) => {
    target.removeEventListener(type, listener, options);
    const index = eventListenersRef.current.findIndex(
      item => item.target === target && item.type === type && item.listener === listener
    );
    if (index > -1) {
      eventListenersRef.current.splice(index, 1);
    }
  }, []);

  // Unsubscribe from specific subscription
  const safeUnsubscribe = useCallback((subscription: { unsubscribe: () => void }) => {
    const index = subscriptionsRef.current.indexOf(subscription);
    if (index > -1) {
      subscription.unsubscribe();
      subscriptionsRef.current.splice(index, 1);
    }
  }, []);

  // Cleanup function that can be called manually
  const cleanup = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach(intervalId => {
      clearInterval(intervalId);
    });
    intervalsRef.current.clear();

    // Remove all event listeners
    eventListenersRef.current.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    eventListenersRef.current.length = 0;

    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach(subscription => {
      subscription.unsubscribe();
    });
    subscriptionsRef.current.length = 0;
  }, []);

  // Automatic cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,
    safeSubscribe,
    clearSafeTimeout,
    clearSafeInterval,
    safeRemoveEventListener,
    safeUnsubscribe,
    cleanup,
    // Getters for debugging
    getActiveTimeouts: () => timeoutsRef.current.size,
    getActiveIntervals: () => intervalsRef.current.size,
    getActiveEventListeners: () => eventListenersRef.current.length,
    getActiveSubscriptions: () => subscriptionsRef.current.length,
  };
}

/**
 * Hook for managing a single timeout with automatic cleanup
 */
export function useSafeTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, []);

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearSafeTimeout;
  }, [clearSafeTimeout]);

  return { setSafeTimeout, clearSafeTimeout };
}

/**
 * Hook for managing a single interval with automatic cleanup
 */
export function useSafeInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setSafeInterval = useCallback((callback: () => void, delay: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(callback, delay);
  }, []);

  const clearSafeInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearSafeInterval;
  }, [clearSafeInterval]);

  return { setSafeInterval, clearSafeInterval };
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useSafeEventListener(
  target: EventTarget | null,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions
) {
  useEffect(() => {
    if (!target) return;

    target.addEventListener(type, listener, options);
    return () => {
      target.removeEventListener(type, listener, options);
    };
  }, [target, type, listener, options]);
}

/**
 * Hook for managing subscriptions with automatic cleanup
 */
export function useSafeSubscription(subscription: { unsubscribe: () => void } | null) {
  useEffect(() => {
    if (!subscription) return;

    return () => {
      subscription.unsubscribe();
    };
  }, [subscription]);
}
