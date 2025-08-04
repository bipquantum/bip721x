import { useState } from 'react';
import { useActors } from '../common/ActorsContext';
import { Backend } from '../../../declarations/backend/backend.did';
import { ActorMethod } from '@dfinity/agent';

// Type utilities to extract function signatures from ActorMethod
type BackendMethods = keyof Backend;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

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