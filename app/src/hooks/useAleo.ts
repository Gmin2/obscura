/**
 * React Hooks for Aleo Operations
 * Provides typed access to Aleo SDK via Web Worker and wallet adapter
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getAleoWorker } from '../workers/AleoWorker.ts';

/** Re-export useWallet from wallet adapter for wallet connection */
export { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

interface AleoState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

/** Hook for basic Aleo operations */
export function useAleo() {
  const [state, setState] = useState<AleoState>({
    initialized: true,
    loading: false,
    error: null,
  });

  const worker = getAleoWorker();

  const setLoading = useCallback((loading: boolean) => {
    setState(s => ({ ...s, loading, error: loading ? null : s.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(s => ({ ...s, loading: false, error }));
  }, []);

  /** Execute program locally (no proof, for testing) */
  const executeLocal = useCallback(async (
    program: string,
    functionName: string,
    inputs: string[]
  ): Promise<string[]> => {
    setLoading(true);
    try {
      const outputs = await worker.localProgramExecution(program, functionName, inputs);
      setLoading(false);
      return outputs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setError(message);
      throw err;
    }
  }, [worker, setLoading, setError]);

  /** Execute program on network */
  const execute = useCallback(async (
    programId: string,
    functionName: string,
    inputs: string[],
    privateKey: string,
    fee?: number
  ): Promise<string> => {
    setLoading(true);
    try {
      const txId = await worker.executeProgram(programId, functionName, inputs, privateKey, fee);
      setLoading(false);
      return txId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setError(message);
      throw err;
    }
  }, [worker, setLoading, setError]);

  /** Deploy program to network */
  const deploy = useCallback(async (
    program: string,
    privateKey: string,
    fee?: number
  ): Promise<string> => {
    setLoading(true);
    try {
      const txId = await worker.deployProgram(program, privateKey, fee);
      setLoading(false);
      return txId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deployment failed';
      setError(message);
      throw err;
    }
  }, [worker, setLoading, setError]);

  return {
    ...state,
    executeLocal,
    execute,
    deploy,
  };
}

/** Hook for querying balance */
export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const worker = getAleoWorker();

  const refresh = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    setError(null);
    try {
      const bal = await worker.getPublicBalance(address);
      setBalance(bal);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(message);
      setLoading(false);
    }
  }, [address, worker]);

  useEffect(() => {
    if (address) {
      refresh();
    }
  }, [address, refresh]);

  return {
    balance,
    balanceInCredits: balance / 1_000_000,
    loading,
    error,
    refresh,
  };
}

/** Hook for querying mapping values */
export function useMappingValue(
  programId: string,
  mappingName: string,
  key: string | null
) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const worker = getAleoWorker();

  const refresh = useCallback(async () => {
    if (!key) return;

    setLoading(true);
    setError(null);
    try {
      const val = await worker.getMappingValue(programId, mappingName, key);
      setValue(val);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch mapping';
      setError(message);
      setLoading(false);
    }
  }, [programId, mappingName, key, worker]);

  useEffect(() => {
    if (key) {
      refresh();
    }
  }, [key, refresh]);

  return {
    value,
    loading,
    error,
    refresh,
  };
}

/** Hook for transaction status */
export function useTransaction() {
  const [txId, setTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const worker = getAleoWorker();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Submit and track a transaction */
  const track = useCallback(async (id: string) => {
    setTxId(id);
    setStatus('pending');
    setError(null);
    setBlockHeight(null);

    try {
      const result = await worker.waitForConfirmation(id, 120000);
      if (result.confirmed) {
        setStatus('confirmed');
        setBlockHeight(result.blockHeight ?? null);
      } else {
        setStatus('failed');
        setError('Transaction not confirmed');
      }
    } catch (err) {
      setStatus('failed');
      const message = err instanceof Error ? err.message : 'Failed to track transaction';
      setError(message);
    }
  }, [worker]);

  /** Reset transaction state */
  const reset = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
    setTxId(null);
    setStatus('idle');
    setBlockHeight(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  return {
    txId,
    status,
    blockHeight,
    error,
    track,
    reset,
    isPending: status === 'pending',
    isConfirmed: status === 'confirmed',
    isFailed: status === 'failed',
  };
}
