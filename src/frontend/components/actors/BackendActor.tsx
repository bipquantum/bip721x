import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod } from '@dfinity/agent';
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

const useQueryCall = <T extends BackendMethods>(options: UseQueryCallOptions<T>) => {
  const [data, setData] = useState<ExtractReturn<Backend[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated, unauthenticated } = useActors();

  const call = async (callArgs?: ExtractArgs<Backend[T]>): Promise<ExtractReturn<Backend[T]> | undefined> => {
    const actor = authenticated || unauthenticated;
    if (!actor) return undefined;

    setLoading(true);
    setError(null);
    
    try {
      const args = callArgs || options.args || [];
      const result = await (actor.backend as any)[options.functionName](...args);
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
  };

  // Helper function to safely serialize args including BigInt
  const serializeArgs = (args: any) => {
    try {
      return JSON.stringify(args, (key, value) =>
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
    }
  }, [authenticated, unauthenticated, options.functionName, serializeArgs(options.args)]);

  return { data, loading, error, call };
};

interface UseUpdateCallOptions<T extends BackendMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<Backend[T]>) => void;
  onError?: (error: any) => void;
}

export const useUpdateCall = <T extends BackendMethods>(options: UseUpdateCallOptions<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated } = useActors();

  const call = async (args: ExtractArgs<Backend[T]> = [] as any): Promise<ExtractReturn<Backend[T]>> => {
    if (!authenticated) {
      const authError = new Error('Not authenticated');
      setError(authError);
      options.onError?.(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await (authenticated.backend as any)[options.functionName](...args);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
};

export type { Backend };

// Compatibility layer that mimics the ic-reactor backendActor API with full type safety
export const backendActor = {
  useQueryCall: useQueryCall,
  useUpdateCall: useUpdateCall
};
