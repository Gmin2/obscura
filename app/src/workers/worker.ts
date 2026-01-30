/**
 * Aleo Web Worker
 * Handles all SDK operations off the main thread
 */

// @ts-nocheck - SDK types may not be fully accurate
import {
  Account,
  ProgramManager,
  PrivateKey,
  initThreadPool,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
} from '@provablehq/sdk';
import { expose } from 'comlink';

const NETWORK_URL = 'https://api.explorer.provable.com/v1';

/** Initialize the thread pool - must be called before any SDK operations */
await initThreadPool();

/** Execute a program locally without generating a proof (for testing) */
async function localProgramExecution(
  program: string,
  functionName: string,
  inputs: string[]
): Promise<string[]> {
  const programManager = new ProgramManager();
  const account = new Account();
  programManager.setAccount(account);

  const response = await programManager.run(program, functionName, inputs, false);
  return response.getOutputs();
}

/** Generate a new private key */
async function generatePrivateKey(): Promise<string> {
  const key = new PrivateKey();
  return key.to_string();
}

/** Create an account from a private key and get info */
async function getAccountInfo(privateKey: string): Promise<{ address: string; viewKey: string }> {
  const account = new Account({ privateKey });
  return {
    address: account.address().to_string(),
    viewKey: account.viewKey().to_string(),
  };
}

/** Get public balance for an address */
async function getPublicBalance(address: string): Promise<number> {
  const networkClient = new AleoNetworkClient(NETWORK_URL);
  return await networkClient.getPublicBalance(address);
}

/** Get the latest block height */
async function getLatestHeight(): Promise<number> {
  const networkClient = new AleoNetworkClient(NETWORK_URL);
  return await networkClient.getLatestHeight();
}

/** Query a mapping value */
async function getMappingValue(
  programId: string,
  mappingName: string,
  key: string
): Promise<string | null> {
  const networkClient = new AleoNetworkClient(NETWORK_URL);
  try {
    return await networkClient.getProgramMappingValue(programId, mappingName, key);
  } catch {
    return null;
  }
}

/** Execute a program on the network */
async function executeProgram(
  programId: string,
  functionName: string,
  inputs: string[],
  privateKey: string,
  fee: number = 0.01
): Promise<string> {
  const account = new Account({ privateKey });
  const networkClient = new AleoNetworkClient(NETWORK_URL);

  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const recordProvider = new NetworkRecordProvider(account, networkClient);

  const programManager = new ProgramManager(
    NETWORK_URL,
    keyProvider,
    recordProvider
  );
  programManager.setAccount(account);

  const tx = await programManager.buildExecutionTransaction({
    programName: programId,
    functionName,
    inputs,
    priorityFee: fee,
    privateFee: false,
  });

  return await networkClient.submitTransaction(tx);
}

/** Deploy a program to the network */
async function deployProgram(
  program: string,
  privateKey: string,
  fee: number = 1.9
): Promise<string> {
  const account = new Account({ privateKey });
  const networkClient = new AleoNetworkClient(NETWORK_URL);

  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const recordProvider = new NetworkRecordProvider(account, networkClient);

  const programManager = new ProgramManager(
    NETWORK_URL,
    keyProvider,
    recordProvider
  );
  programManager.setAccount(account);

  return await programManager.deploy(program, fee);
}

/** Wait for a transaction to be confirmed */
async function waitForConfirmation(
  txId: string,
  timeout: number = 60000
): Promise<{ confirmed: boolean; blockHeight?: number }> {
  const networkClient = new AleoNetworkClient(NETWORK_URL);

  try {
    const result = await networkClient.waitForTransactionConfirmation(txId, 2000, timeout);
    return {
      confirmed: true,
      blockHeight: result?.height ?? result?.block_height,
    };
  } catch {
    return { confirmed: false };
  }
}

/** Find unspent records for an account */
async function findRecords(
  privateKey: string,
  programId: string,
  startHeight: number,
  endHeight?: number
): Promise<string[]> {
  const account = new Account({ privateKey });
  const networkClient = new AleoNetworkClient(NETWORK_URL);

  const end = endHeight ?? await networkClient.getLatestHeight();

  const records = await networkClient.findUnspentRecords(
    startHeight,
    end,
    [programId],
    [0],
    undefined,
    [],
    account.privateKey()
  );

  return records.map((r: { toString: () => string }) => r.toString());
}

/** Exposed worker methods */
const workerMethods = {
  localProgramExecution,
  generatePrivateKey,
  getAccountInfo,
  getPublicBalance,
  getLatestHeight,
  getMappingValue,
  executeProgram,
  deployProgram,
  waitForConfirmation,
  findRecords,
};

export type WorkerMethods = typeof workerMethods;

expose(workerMethods);
