"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type WalletContextType = {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connecting: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Load wallet address from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    } else if (window.solana && window.solana.isPhantom) {
      // Try to auto-connect if Phantom is already connected
      window.solana
        .connect({ onlyIfTrusted: true })
        .then((resp: { publicKey: { toString: () => string } }) => {
          setWalletAddress(resp.publicKey.toString());
          localStorage.setItem("walletAddress", resp.publicKey.toString());
        })
        .catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    let tries = 0;

    // Wait for Phantom to be injected
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
        setWalletAddress(resp.publicKey.toString());
        localStorage.setItem("walletAddress", resp.publicKey.toString());
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

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
    if (
      typeof window !== "undefined" &&
      window.solana &&
      window.solana.isPhantom
    ) {
      window.solana.disconnect && window.solana.disconnect();
    }
  };

  return (
    <WalletContext.Provider
      value={{ walletAddress, connectWallet, disconnectWallet, connecting }}
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
