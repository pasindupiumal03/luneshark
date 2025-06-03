"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

type TokenBalance = {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
};

type WalletContextType = {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  connecting: boolean;
  getTokenBalance: (
    tokenMintAddress: string,
    decimals?: number
  ) => Promise<number | null>;
  getAllTokenBalances: () => Promise<TokenBalance[]>;
  refreshTokenBalances: () => Promise<void>;
  tokenBalances: TokenBalance[];
  loadingTokens: boolean;
  connection: Connection;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({
  children,
  rpcEndpoint = "https://api.devnet.solana.com",
}: {
  children: ReactNode;
  rpcEndpoint?: string;
}) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [connection] = useState(() => new Connection(rpcEndpoint));

  // Load wallet address on mount, but only attempt auto-connect if explicitly allowed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAddress = localStorage.getItem("walletAddress");
    const shouldAutoConnect = localStorage.getItem("autoConnect") === "true";

    if (
      savedAddress &&
      shouldAutoConnect &&
      window.solana &&
      window.solana.isPhantom
    ) {
      window.solana
        .connect({ onlyIfTrusted: true })
        .then((resp: { publicKey: { toString: () => string } }) => {
          const address = resp.publicKey.toString();
          if (address === savedAddress) {
            setWalletAddress(address);
          } else {
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("autoConnect");
          }
        })
        .catch(() => {
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("autoConnect");
        });
    }
  }, []);

  // Auto-load token balances when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      refreshTokenBalances();
    } else {
      setTokenBalances([]);
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    setConnecting(true);
    let tries = 0;

    while (typeof window !== "undefined" && !window.solana && tries < 10) {
      await new Promise((res) => setTimeout(res, 200));
      tries++;
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.solana &&
        window.solana.isPhantom
      ) {
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        localStorage.setItem("autoConnect", "true");
      } else {
        alert(
          "Phantom wallet not found. Please install the Phantom extension."
        );
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setWalletAddress(null);
    setTokenBalances([]);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("autoConnect");

    if (
      typeof window !== "undefined" &&
      window.solana &&
      window.solana.isPhantom
    ) {
      try {
        await window.solana.disconnect();
        console.log("Wallet disconnected successfully");
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
      }
    }
  };

  const getTokenBalance = useCallback(
    async (
      tokenMintAddress: string,
      decimals: number = 9
    ): Promise<number | null> => {
      if (!walletAddress) {
        console.warn("Wallet not connected");
        return null;
      }

      try {
        const userPublicKey = new PublicKey(walletAddress);
        const tokenMintPublicKey = new PublicKey(tokenMintAddress);
        const associatedTokenAddress = await getAssociatedTokenAddress(
          tokenMintPublicKey,
          userPublicKey
        );

        try {
          const tokenAccount = await getAccount(
            connection,
            associatedTokenAddress
          );
          const balance = Number(tokenAccount.amount) / Math.pow(10, decimals);
          return balance;
        } catch (tokenError: any) {
          if (tokenError.name === "TokenAccountNotFoundError") {
            return 0;
          }
          throw tokenError;
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
        return null;
      }
    },
    [walletAddress, connection]
  );

  const getAllTokenBalances = useCallback(async (): Promise<TokenBalance[]> => {
    if (!walletAddress) {
      return [];
    }

    try {
      const userPublicKey = new PublicKey(walletAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        userPublicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );

      const balances: TokenBalance[] = tokenAccounts.value
        .map((account: any) => {
          const parsedInfo = account.account.data.parsed.info;
          const tokenAmount = parsedInfo.tokenAmount;

          return {
            mint: parsedInfo.mint,
            balance: Number(tokenAmount.amount),
            decimals: tokenAmount.decimals,
            uiAmount: tokenAmount.uiAmount || 0,
          };
        })
        .filter((token: any) => token.uiAmount > 0);

      return balances;
    } catch (error) {
      console.error("Error fetching all token balances:", error);
      return [];
    }
  }, [walletAddress, connection]);

  const refreshTokenBalances = useCallback(async () => {
    if (!walletAddress) {
      setTokenBalances([]);
      return;
    }

    setLoadingTokens(true);
    try {
      const balances = await getAllTokenBalances();
      setTokenBalances(balances);
    } catch (error) {
      console.error("Error refreshing token balances:", error);
      setTokenBalances([]);
    } finally {
      setLoadingTokens(false);
    }
  }, [walletAddress, getAllTokenBalances]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        disconnectWallet,
        connecting,
        getTokenBalance,
        getAllTokenBalances,
        refreshTokenBalances,
        tokenBalances,
        loadingTokens,
        connection,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
