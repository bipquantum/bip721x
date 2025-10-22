import { useState, useEffect, useCallback } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod, ActorSubclass } from '@dfinity/agent';
import { _SERVICE as CkUsdtLedger } from "../../../declarations/ckusdt_ledger/ckusdt_ledger.did";

// Type utilities to extract function signatures from ActorMethod
type CkUsdtLedgerMethods = keyof CkUsdtLedger;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends CkUsdtLedgerMethods> {
  functionName: T;
  args?: ExtractArgs<CkUsdtLedger[T]>;
  onSuccess?: (data: ExtractReturn<CkUsdtLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends CkUsdtLedgerMethods>(options: UseQueryCallOptions<T>, actor: ActorSubclass<CkUsdtLedger> | undefined) => {
  
  const [data, setData] = useState<ExtractReturn<CkUsdtLedger[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = useCallback(
    async (callArgs?: ExtractArgs<CkUsdtLedger[T]>): Promise<ExtractReturn<CkUsdtLedger[T]> | undefined> => {
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

interface UseUpdateCallOptions<T extends CkUsdtLedgerMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<CkUsdtLedger[T]>) => void;
  onError?: (error: any) => void;
}

export const useUpdateCall = <T extends CkUsdtLedgerMethods>(options: UseUpdateCallOptions<T>, actor: ActorSubclass<CkUsdtLedger> | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = useCallback(
    async (args: ExtractArgs<CkUsdtLedger[T]> = [] as any): Promise<ExtractReturn<CkUsdtLedger[T]> | undefined> => {

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

export type { CkUsdtLedger };

const useUnauthQueryCall = <T extends CkUsdtLedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { unauthenticated } = useActors();
  return useQueryCall(options, unauthenticated?.ckusdtLedger as any);
}

const useAuthQueryCall = <T extends CkUsdtLedgerMethods>(options: UseQueryCallOptions<T>) => {
  const { authenticated } = useActors();
  return useQueryCall(options, authenticated?.ckusdtLedger as any);
}

const useUnauthUpdateCall = <T extends CkUsdtLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { unauthenticated } = useActors();
      return useUpdateCall(options, unauthenticated?.ckusdtLedger as any);
}

const useAuthUpdateCall = <T extends CkUsdtLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const { authenticated } = useActors();
  return useUpdateCall(options, authenticated?.ckusdtLedger as any);
}

// Compatibility layer that mimics the ic-reactor ckusdtLedgerActor API with full type safety
export const ckusdtLedgerActor = {
  unauthenticated: {
    useQueryCall: useUnauthQueryCall,
    useUpdateCall: useUnauthUpdateCall
  },
  authenticated: {
    useQueryCall: useAuthQueryCall,
    useUpdateCall: useAuthUpdateCall
  }
};
