// src/hooks/useOptimizedQuery.js
// Hook personalizado para queries optimizadas con cache

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabaseClient';

/**
 * Hook para queries optimizadas con cache y retry
 */
export function useOptimizedQuery(queryFn, dependencies = [], options = {}) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutos
    staleTime = 1 * 60 * 1000, // 1 minuto
    retry = 3,
    retryDelay = 1000,
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const cacheRef = useRef(new Map());
  const queryKey = JSON.stringify(dependencies);
  const lastFetchRef = useRef(0);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (retryCount = 0) => {
    if (!enabled) return;

    // Verificar cache
    const now = Date.now();
    const cached = cacheRef.current.get(queryKey);
    
    if (cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      return cached.data;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsFetching(true);

    try {
      const result = await queryFn();
      
      // Guardar en cache
      cacheRef.current.set(queryKey, {
        data: result,
        timestamp: now
      });

      setData(result);
      setError(null);
      lastFetchRef.current = now;
      
      return result;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Query] Request abortado');
        return;
      }

      console.error('[Query] Error:', err);

      // Retry logic
      if (retryCount < retry) {
        console.log(`[Query] Reintentando (${retryCount + 1}/${retry})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return fetchData(retryCount + 1);
      }

      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [queryKey, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(queryKey);
    return fetchData();
  }, [queryKey, fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    invalidate
  };
}

/**
 * Hook para mutations optimizadas
 */
export function useOptimizedMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (variables) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      
      if (onSuccess) {
        await onSuccess(result, variables);
      }
      
      return result;

    } catch (err) {
      console.error('[Mutation] Error:', err);
      setError(err);
      
      if (onError) {
        onError(err, variables);
      }
      
      throw err;

    } finally {
      setIsLoading(false);
      
      if (onSettled) {
        onSettled();
      }
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  return {
    mutate,
    isLoading,
    error
  };
}

export default useOptimizedQuery;
