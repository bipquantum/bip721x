import { useState, useEffect } from 'react';
import { useActors } from '../common/ActorsContext';
import { ActorMethod } from '@dfinity/agent';
import { _SERVICE as CkBtcLedger } from "../../../declarations/ckbtc_ledger/ckbtc_ledger.did";
import { canisterId } from '../../../declarations/ckbtc_ledger';

// Type utilities to extract function signatures from ActorMethod
type CkBtcLedgerMethods = keyof CkBtcLedger;
type ExtractArgs<T> = T extends ActorMethod<infer P, any> ? P : never;
type ExtractReturn<T> = T extends ActorMethod<any, infer R> ? R : never;

interface UseQueryCallOptions<T extends CkBtcLedgerMethods> {
  functionName: T;
  args?: ExtractArgs<CkBtcLedger[T]>;
  onSuccess?: (data: ExtractReturn<CkBtcLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useQueryCall = <T extends CkBtcLedgerMethods>(options: UseQueryCallOptions<T>) => {

  const [data, setData] = useState<ExtractReturn<CkBtcLedger[T]> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated, unauthenticated } = useActors();

  const call = async (callArgs?: ExtractArgs<CkBtcLedger[T]>): Promise<ExtractReturn<CkBtcLedger[T]> | undefined> => {
    console.log("Canister id: " + canisterId);
    const actor = authenticated || unauthenticated;
    if (!actor) return undefined;

    setLoading(true);
    setError(null);
    
    try {
      const args = callArgs || options.args || [];
      const result = await (actor.ckbtcLedger as any)[options.functionName](...args);
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

interface UseUpdateCallOptions<T extends CkBtcLedgerMethods> {
  functionName: T;
  onSuccess?: (data: ExtractReturn<CkBtcLedger[T]>) => void;
  onError?: (error: any) => void;
}

const useUpdateCall = <T extends CkBtcLedgerMethods>(options: UseUpdateCallOptions<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { authenticated } = useActors();

  const call = async (args: ExtractArgs<CkBtcLedger[T]> = [] as any): Promise<ExtractReturn<CkBtcLedger[T]>> => {
    console.log("Canister id: " + canisterId);
    if (!authenticated) {
      const authError = new Error('Not authenticated');
      setError(authError);
      options.onError?.(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await (authenticated.ckbtcLedger as any)[options.functionName](...args);
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

export type { CkBtcLedger };

// Compatibility layer that mimics the ic-reactor ckbtcLedgerActor API with full type safety
export const ckbtcLedgerActor = {
  useQueryCall: useQueryCall,
  useUpdateCall: useUpdateCall
};
