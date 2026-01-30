/**
 * Aleo Wallet Provider
 * Wraps the app with wallet adapter context for connecting to Leo Wallet and other Aleo wallets
 */

import { useMemo, type ReactNode } from 'react';
import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

/** Import wallet adapter styles */
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider Component
 * Provides wallet connection context to the entire app
 */
export function WalletProvider({ children }: WalletProviderProps) {
  /** Initialize wallet adapters */
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'Obscura Darkpool',
      }),
    ],
    []
  );

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
}

export default WalletProvider;
