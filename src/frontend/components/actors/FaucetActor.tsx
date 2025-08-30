import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod } from '@dfinity/agent';
import { Faucet } from "../../../declarations/faucet/faucet.did";

// Type utilities to extract function signatures from ActorMethod
type FaucetMethods = keyof Faucet;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends FaucetMethods> {
  functionName: T;
  args?: ExtractArgs<Faucet[T]>;
  onSuccess?: (data: ExtractReturn<Faucet[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends FaucetMethods>(options: UseQueryCallOptions<T>) => {
  const [data, setData] = useState<ExtractReturn<Faucet[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated, unauthenticated } = useActors();

  const call = async (callArgs?: ExtractArgs<Faucet[T]>): Promise<ExtractReturn<Faucet[T]> | undefined> => {
    const actor = authenticated || unauthenticated;
    if (!actor) return undefined;

    setLoading(true);
    setError(null);
    
    try {
      const args = callArgs || options.args || [];
      const result = await (actor.faucet as any)[options.functionName](...args);
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

interface UseUpdateCallOptions<T extends FaucetMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<Faucet[T]>) => void;
  onError?: (error: any) => void;
}

export const useUpdateCall = <T extends FaucetMethods>(options: UseUpdateCallOptions<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated } = useActors();

  const call = async (args: ExtractArgs<Faucet[T]> = [] as any): Promise<ExtractReturn<Faucet[T]>> => {
    if (!authenticated) {
      const authError = new Error('Not authenticated');
      setError(authError);
      options.onError?.(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await (authenticated.faucet as any)[options.functionName](...args);
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

export type { Faucet };

// Compatibility layer that mimics the ic-reactor faucetActor API with full type safety
export const faucetActor = {
  useQueryCall: useQueryCall,
  useUpdateCall: useUpdateCall
};
