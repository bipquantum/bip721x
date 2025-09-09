import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod, ActorSubclass } from '@dfinity/agent';
import { _SERVICE as Bip721Ledger } from "../../../declarations/bip721_ledger/bip721_ledger.did";

// Type utilities to extract function signatures from ActorMethod
type Bip721LedgerMethods = keyof Bip721Ledger;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends Bip721LedgerMethods> {
  functionName: T;
  args?: ExtractArgs<Bip721Ledger[T]>;
  onSuccess?: (data: ExtractReturn<Bip721Ledger[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends Bip721LedgerMethods>(options: UseQueryCallOptions<T>, actor: ActorSubclass<Bip721Ledger> | undefined) => {

  const [data, setData] = useState<ExtractReturn<Bip721Ledger[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = async (callArgs?: ExtractArgs<Bip721Ledger[T]>): Promise<ExtractReturn<Bip721Ledger[T]> | undefined> => {

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
  };

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
    }
  }, [actor, options.functionName, serializeArgs(options.args)]);

  return { data, loading, error, call };
};

interface UseUpdateCallOptions<T extends Bip721LedgerMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<Bip721Ledger[T]>) => void;
  onError?: (error: any) => void;
}

const useUpdateCall = <T extends Bip721LedgerMethods>(options: UseUpdateCallOptions<T>, actor: ActorSubclass<Bip721Ledger> | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = async (args: ExtractArgs<Bip721Ledger[T]> = [] as any): Promise<ExtractReturn<Bip721Ledger[T]> | undefined> => {

    if (!actor) return undefined;

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
  };

  return { call, loading, error };
};

export type { Bip721Ledger };

const useUnauthQueryCall = <T extends Bip721LedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useQueryCall(options, unauthenticated?.bip721Ledger as any);
}

const useAuthQueryCall = <T extends Bip721LedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { authenticated } = useActors();
  return useQueryCall(options, authenticated?.bip721Ledger as any);
}

const useUnauthUpdateCall = <T extends Bip721LedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useUpdateCall(options, unauthenticated?.bip721Ledger as any);
}

const useAuthUpdateCall = <T extends Bip721LedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { authenticated } = useActors();
  return useUpdateCall(options, authenticated?.bip721Ledger as any);
}

// Compatibility layer that mimics the ic-reactor bip721LedgerActor API with full type safety
export const bip721LedgerActor = {
  unauthenticated: {
    useQueryCall: useUnauthQueryCall,
    useUpdateCall: useUnauthUpdateCall
  },
  authenticated: {
    useQueryCall: useAuthQueryCall,
    useUpdateCall: useAuthUpdateCall
  }
};
