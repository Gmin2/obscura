/**
 * MintTokens Component
 * Allows users to mint test tokens for the darkpool (testnet only)
 */

import { useState, useCallback } from 'react';
import { Coins, Loader2, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { useDarkpoolTransactions } from '../hooks/useDarkpool.ts';

/** Available tokens to mint */
const MINTABLE_TOKENS = [
  { id: '1', symbol: 'ETH', name: 'Ethereum', defaultAmount: 10 },
  { id: '2', symbol: 'USDC', name: 'USD Coin', defaultAmount: 10000 },
  { id: '3', symbol: 'BTC', name: 'Bitcoin', defaultAmount: 1 },
  { id: '4', symbol: 'ALEO', name: 'Aleo', defaultAmount: 1000 },
];

interface MintTokensProps {
  onMinted?: (tokenId: string, amount: number, txId: string) => void;
}

const MintTokens: React.FC<MintTokensProps> = ({ onMinted }) => {
  const [selectedToken, setSelectedToken] = useState(MINTABLE_TOKENS[0]);
  const [amount, setAmount] = useState(selectedToken.defaultAmount.toString());
  const [successTxId, setSuccessTxId] = useState<string | null>(null);

  const { mintToken, loading, error, connected } = useDarkpoolTransactions();

  const handleMint = useCallback(async () => {
    if (!connected) return;

    setSuccessTxId(null);

    const result = await mintToken(selectedToken.id, parseFloat(amount));

    if (result.success && result.txId) {
      setSuccessTxId(result.txId);
      onMinted?.(selectedToken.id, parseFloat(amount), result.txId);
    }
  }, [connected, mintToken, selectedToken, amount, onMinted]);

  const handleTokenChange = (token: typeof MINTABLE_TOKENS[0]) => {
    setSelectedToken(token);
    setAmount(token.defaultAmount.toString());
  };

  return (
    <div className="bg-ink border border-paper/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Coins size={16} className="text-accent" />
        <h3 className="font-mono text-xs uppercase tracking-wider text-paper/60">Mint Test Tokens</h3>
        <span className="ml-auto text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
          TESTNET
        </span>
      </div>

      {/* Warning */}
      <div className="mb-4 p-2 bg-yellow-400/5 border border-yellow-400/20 rounded text-[10px] font-mono text-yellow-400/80 flex items-start gap-2">
        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        <span>These are test tokens on Aleo Testnet. They have no real value.</span>
      </div>

      {/* Token Selection */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {MINTABLE_TOKENS.map((token) => (
          <button
            key={token.id}
            onClick={() => handleTokenChange(token)}
            className={`p-2 rounded border text-center transition-all ${
              selectedToken.id === token.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-paper/10 text-paper/50 hover:border-paper/30 hover:text-paper'
            }`}
          >
            <div className="font-mono text-xs font-bold">{token.symbol}</div>
            <div className="text-[9px] text-paper/40">{token.name}</div>
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-[10px] font-mono text-paper/40 uppercase tracking-wider mb-1 block">
          Amount to Mint
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-charcoal border border-paper/10 rounded py-2 px-3 font-mono text-sm text-paper outline-none focus:border-accent/50 transition-all"
          />
          <span className="flex items-center px-3 bg-charcoal border border-paper/10 rounded font-mono text-xs text-accent">
            {selectedToken.symbol}
          </span>
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="flex gap-2 mb-4">
        {[0.1, 1, 10, 100].map((multiplier) => {
          const quickAmount = selectedToken.defaultAmount * multiplier;
          return (
            <button
              key={multiplier}
              onClick={() => setAmount(quickAmount.toString())}
              className="flex-1 py-1.5 bg-charcoal border border-paper/10 rounded font-mono text-[10px] text-paper/50 hover:border-paper/30 hover:text-paper transition-all"
            >
              {quickAmount.toLocaleString()}
            </button>
          );
        })}
      </div>

      {/* Success Message */}
      {successTxId && (
        <div className="mb-4 p-2 bg-q-green/10 border border-q-green/30 rounded text-[10px] font-mono text-q-green flex items-center gap-2">
          <CheckCircle size={12} />
          <span>Minted {amount} {selectedToken.symbol}!</span>
          <a
            href={`https://explorer.aleo.org/transaction/${successTxId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto hover:text-q-green/80 flex items-center gap-1"
          >
            View TX <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-q-red/10 border border-q-red/30 rounded text-[10px] font-mono text-q-red">
          {error}
        </div>
      )}

      {/* Mint Button */}
      <button
        onClick={handleMint}
        disabled={loading || !connected}
        className="w-full py-3 bg-accent text-ink rounded-lg font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-all"
      >
        {!connected ? (
          'Connect Wallet to Mint'
        ) : loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Minting...
          </>
        ) : (
          <>
            <Coins size={14} />
            Mint {selectedToken.symbol}
          </>
        )}
      </button>

      {/* Info */}
      <p className="mt-3 text-[10px] font-mono text-paper/30 text-center">
        Minting requires a small gas fee (~0.5 credits)
      </p>
    </div>
  );
};

export default MintTokens;
