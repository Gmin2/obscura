/**
 * Transaction Service
 * Execute darkpool transactions via wallet adapter
 */

import { Transaction } from '@demox-labs/aleo-wallet-adapter-base';
import { PROGRAM_ID, PRICE_SCALE } from './types.ts';

/** Network chain ID */
export const CHAIN_ID = 'testnetbeta';

/** Default transaction fee in credits */
export const DEFAULT_FEE = 0.5;

/** Scale a number to u128 format */
function toScaledString(value: number): string {
  const scaled = BigInt(Math.round(value * Number(PRICE_SCALE)));
  return `${scaled}u128`;
}

/** Generate a random salt as scalar */
function generateSalt(): string {
  const random = Math.floor(Math.random() * 1000000000);
  return `${random}scalar`;
}

/** Get current timestamp as u64 */
function getTimestamp(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `${timestamp}u64`;
}

/** Format address for Leo */
function formatAddress(address: string): string {
  return address;
}

/** Format field value */
function formatField(value: string | number): string {
  const v = typeof value === 'number' ? value.toString() : value;
  return v.endsWith('field') ? v : `${v}field`;
}

/** Format u8 value */
function formatU8(value: number): string {
  return `${value}u8`;
}

/** Format u64 value */
// function formatU64(value: number | bigint): string {
//   return `${value}u64`;
// }

/**
 * Create a place_order transaction
 */
export function createPlaceOrderTransaction(
  address: string,
  side: number,
  baseAsset: string,
  quoteAsset: string,
  amount: number,
  price: number,
  fee: number = DEFAULT_FEE
): Transaction {
  const inputs = [
    formatU8(side),                    // side: u8 (0=buy, 1=sell)
    formatField(baseAsset),            // base_asset: field
    formatField(quoteAsset),           // quote_asset: field
    toScaledString(amount),            // amount: u128
    toScaledString(price),             // price: u128
    generateSalt(),                    // salt: scalar
    getTimestamp(),                    // timestamp: u64
  ];

  return Transaction.createTransaction(
    address,
    CHAIN_ID,
    PROGRAM_ID,
    'place_order',
    inputs,
    fee,
    false // public fee
  );
}

/**
 * Create a cancel_order transaction
 * Note: Requires the order record as input
 */
export function createCancelOrderTransaction(
  address: string,
  orderRecord: string,
  fee: number = DEFAULT_FEE
): Transaction {
  const inputs = [orderRecord];

  return Transaction.createTransaction(
    address,
    CHAIN_ID,
    PROGRAM_ID,
    'cancel_order',
    inputs,
    fee,
    false
  );
}

/**
 * Create a mint_token transaction (for testing)
 */
export function createMintTokenTransaction(
  address: string,
  receiver: string,
  assetId: string,
  amount: number,
  fee: number = DEFAULT_FEE
): Transaction {
  const inputs = [
    formatAddress(receiver),           // receiver: address
    formatField(assetId),              // asset_id: field
    toScaledString(amount),            // amount: u128
  ];

  return Transaction.createTransaction(
    address,
    CHAIN_ID,
    PROGRAM_ID,
    'mint_token',
    inputs,
    fee,
    false
  );
}

/**
 * Create a transfer_token transaction
 */
export function createTransferTokenTransaction(
  address: string,
  tokenRecord: string,
  to: string,
  amount: number,
  fee: number = DEFAULT_FEE
): Transaction {
  const inputs = [
    tokenRecord,                       // token: Token record
    formatAddress(to),                 // to: address
    toScaledString(amount),            // amount: u128
  ];

  return Transaction.createTransaction(
    address,
    CHAIN_ID,
    PROGRAM_ID,
    'transfer_token',
    inputs,
    fee,
    false
  );
}

/**
 * Transaction result type
 */
export interface TransactionResult {
  success: boolean;
  txId?: string;
  error?: string;
}

/**
 * Hook-friendly transaction executor type
 */
export type TransactionExecutor = (tx: Transaction) => Promise<string>;
