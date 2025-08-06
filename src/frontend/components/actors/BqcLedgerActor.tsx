import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod } from '@dfinity/agent';
import { _SERVICE as BqcLedger } from "../../../declarations/bqc_ledger/bqc_ledger.did";

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

const useQueryCall = <T extends BqcLedgerMethods>(options: UseQueryCallOptions<T>) => {
  const [data, setData] = useState<ExtractReturn<BqcLedger[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated, unauthenticated } = useActors();

  const call = async (callArgs?: ExtractArgs<BqcLedger[T]>): Promise<ExtractReturn<BqcLedger[T]> | undefined> => {
    const actor = authenticated || unauthenticated;
    if (!actor) return undefined;

    setLoading(true);
    setError(null);
    
    try {
      const args = callArgs || options.args || [];
      const result = await (actor.bqcLedger as any)[options.functionName](...args);
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
  }, [authenticated, unauthenticated, options.functionName, serializeArgs(options.args)]);

  return { data, loading, error, call };
};

interface UseUpdateCallOptions<T extends BqcLedgerMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<BqcLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useUpdateCall = <T extends BqcLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated } = useActors();

  const call = async (args: ExtractArgs<BqcLedger[T]> = [] as any): Promise<ExtractReturn<BqcLedger[T]>> => {
    if (!authenticated) {
      const authError = new Error('Not authenticated');
      setError(authError);
      options.onError?.(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await (authenticated.bqcLedger as any)[options.functionName](...args);
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

// Compatibility layer that mimics the ic-reactor bqcLedgerActor API with full type safety
export const bqcLedgerActor = {
  useQueryCall: useQueryCall,
  useUpdateCall: useUpdateCall
};
