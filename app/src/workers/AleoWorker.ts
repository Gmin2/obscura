/**
 * Aleo Worker Wrapper
 * Provides typed access to worker methods via Comlink
 */

import { wrap, type Remote } from 'comlink';
import type { WorkerMethods } from './worker.ts';

let singletonWorker: Remote<WorkerMethods> | null = null;

/** Get the singleton Aleo worker instance */
export function getAleoWorker(): Remote<WorkerMethods> {
  if (!singletonWorker) {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onerror = (event) => {
      console.error('Aleo worker error:', event.message);
    };

    singletonWorker = wrap<WorkerMethods>(worker);
  }

  return singletonWorker;
}

/** Reset the worker (useful for testing or error recovery) */
export function resetAleoWorker(): void {
  singletonWorker = null;
}
