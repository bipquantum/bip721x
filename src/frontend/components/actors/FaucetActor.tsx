import { useState, useEffect, useCallback } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod, ActorSubclass } from '@dfinity/agent';
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

const useQueryCall = <T extends FaucetMethods>(options: UseQueryCallOptions<T>, actor: ActorSubclass<Faucet> | undefined) => {
  
  const [data, setData] = useState<ExtractReturn<Faucet[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = useCallback(
    async (callArgs?: ExtractArgs<Faucet[T]>): Promise<ExtractReturn<Faucet[T]> | undefined> => {
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

  return { data, loading, error, call };
};

interface UseUpdateCallOptions<T extends FaucetMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<Faucet[T]>) => void;
  onError?: (error: any) => void;
}

export const useUpdateCall = <T extends FaucetMethods>(options: UseUpdateCallOptions<T>, actor: ActorSubclass<Faucet> | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = useCallback(
    async (args: ExtractArgs<Faucet[T]> = [] as any): Promise<ExtractReturn<Faucet[T]> | undefined> => {

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

  return { call, loading, error };
};

export type { Faucet };

const useUnauthQueryCall = <T extends FaucetMethods>(options: UseQueryCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useQueryCall(options, unauthenticated?.faucet as any);
}

const useAuthQueryCall = <T extends FaucetMethods>(options: UseQueryCallOptions<T>) => {
  const { authenticated } = useActors();
  return useQueryCall(options, authenticated?.faucet as any);
}

const useUnauthUpdateCall = <T extends FaucetMethods>(options: UseUpdateCallOptions<T>) => {
  const { unauthenticated } = useActors();
      return useUpdateCall(options, unauthenticated?.faucet as any);
}

const useAuthUpdateCall = <T extends FaucetMethods>(options: UseUpdateCallOptions<T>) => {
  const { authenticated } = useActors();
  return useUpdateCall(options, authenticated?.faucet as any);
}

// Compatibility layer that mimics the ic-reactor faucetActor API with full type safety
export const faucetActor = {
  unauthenticated: {
    useQueryCall: useUnauthQueryCall,
    useUpdateCall: useUnauthUpdateCall
  },
  authenticated: {
    useQueryCall: useAuthQueryCall,
    useUpdateCall: useAuthUpdateCall
  }
};
