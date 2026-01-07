import { useState, useEffect, useCallback } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod, ActorSubclass } from '@dfinity/agent';
import { Backend } from "../../../declarations/backend/backend.did";

// Type utilities to extract function signatures from ActorMethod
type BackendMethods = keyof Backend;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends BackendMethods> {
  functionName: T;
  args?: ExtractArgs<Backend[T]>;
  onSuccess?: (data: ExtractReturn<Backend[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends BackendMethods>(options: UseQueryCallOptions<T>, actor: ActorSubclass<Backend> | undefined) => {
  
  const [data, setData] = useState<ExtractReturn<Backend[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const ready = !!actor;

  const call = useCallback(
    async (callArgs?: ExtractArgs<Backend[T]>): Promise<ExtractReturn<Backend[T]> | undefined> => {
      if (!actor) return undefined;

      setLoading(true);
      setError(null);
      
      try {
        const args = callArgs || options.args || [];
        const result = await (actor as any)[options.functionName](...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [actor, options.functionName, options.args, options.onSuccess, options.onError]
  );

  // Helper function to safely serialize args including BigInt
  const serializeArgs = (args: any) => {
    try {
      return JSON.stringify(args, (_, value) =>
        typeof value === 'bigint' ? value.toString() + 'n' : value
      );
    } catch {
      // Fallback for circular references or other issues
      return String(args);
    }
  };

  // Auto-call if args are provided
  useEffect(() => {
    if (options.args !== undefined) {
      call();
    } else {
      // Reset data if no args
      setData(undefined);
    }
  }, [actor, options.functionName, serializeArgs(options.args)]);

  return { data, loading, ready, error, call };
};

interface UseUpdateCallOptions<T extends BackendMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<Backend[T]>) => void;
  onError?: (error: any) => void;
}

export const useUpdateCall = <T extends BackendMethods>(options: UseUpdateCallOptions<T>, actor: ActorSubclass<Backend> | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const ready = !!actor;

  const call = useCallback(
    async (args: ExtractArgs<Backend[T]> = [] as any): Promise<ExtractReturn<Backend[T]> | undefined> => {

      if(!actor) return undefined;

      setLoading(true);
      setError(null);
    
      try {
        const result = await (actor as any)[options.functionName](...args);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [actor, options.functionName, options.onSuccess, options.onError]
  );

  return { call, loading, ready, error };
};

export type { Backend };

const useUnauthQueryCall = <T extends BackendMethods>(options: UseQueryCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useQueryCall(options, unauthenticated?.backend as any);
}

const useAuthQueryCall = <T extends BackendMethods>(options: UseQueryCallOptions<T>) => {
  const { authenticated } = useActors();
  return useQueryCall(options, authenticated?.backend as any);
}

const useUnauthUpdateCall = <T extends BackendMethods>(options: UseUpdateCallOptions<T>) => {
  const { unauthenticated } = useActors();
      return useUpdateCall(options, unauthenticated?.backend as any);
}

const useAuthUpdateCall = <T extends BackendMethods>(options: UseUpdateCallOptions<T>) => {
  const { authenticated } = useActors();
  return useUpdateCall(options, authenticated?.backend as any);
}

// Compatibility layer that mimics the ic-reactor backendActor API with full type safety
export const backendActor = {
  unauthenticated: {
    useQueryCall: useUnauthQueryCall,
    useUpdateCall: useUnauthUpdateCall
  },
  authenticated: {
    useQueryCall: useAuthQueryCall,
    useUpdateCall: useAuthUpdateCall
  }
};
