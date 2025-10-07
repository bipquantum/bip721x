import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod, ActorSubclass } from '@dfinity/agent';
import { _SERVICE as BqcLedger } from "../../../declarations/ckusdt_ledger/ckusdt_ledger.did";

// Type utilities to extract function signatures from ActorMethod
type BqcLedgerMethods = keyof BqcLedger;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends BqcLedgerMethods> {
  functionName: T;
  args?: ExtractArgs<BqcLedger[T]>;
  onSuccess?: (data: ExtractReturn<BqcLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends BqcLedgerMethods>(options: UseQueryCallOptions<T>, actor: ActorSubclass<BqcLedger> | undefined) => {

  const [data, setData] = useState<ExtractReturn<BqcLedger[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = async (callArgs?: ExtractArgs<BqcLedger[T]>): Promise<ExtractReturn<BqcLedger[T]> | undefined> => {

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

interface UseUpdateCallOptions<T extends BqcLedgerMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<BqcLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useUpdateCall = <T extends BqcLedgerMethods>(options: UseUpdateCallOptions<T>, actor: ActorSubclass<BqcLedger> | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = async (args: ExtractArgs<BqcLedger[T]> = [] as any): Promise<ExtractReturn<BqcLedger[T]> | undefined> => {

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

export type { BqcLedger };

const useUnauthQueryCall = <T extends BqcLedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useQueryCall(options, unauthenticated?.bqcLedger as any);
}

const useAuthQueryCall = <T extends BqcLedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { authenticated } = useActors();
  return useQueryCall(options, authenticated?.bqcLedger as any);
}

const useUnauthUpdateCall = <T extends BqcLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { unauthenticated } = useActors();
      return useUpdateCall(options, unauthenticated?.bqcLedger as any);
}

const useAuthUpdateCall = <T extends BqcLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { authenticated } = useActors();
  return useUpdateCall(options, authenticated?.bqcLedger as any);
}

// Compatibility layer that mimics the ic-reactor bqcLedgerActor API with full type safety
export const bqcLedgerActor = {
  unauthenticated: {
    useQueryCall: useUnauthQueryCall,
    useUpdateCall: useUnauthUpdateCall
  },
  authenticated: {
    useQueryCall: useAuthQueryCall,
    useUpdateCall: useAuthUpdateCall
  }
};
