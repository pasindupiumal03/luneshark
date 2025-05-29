"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Twitter, Send, Globe, Shield, Wallet } from "lucide-react";
import Navigation from "@/components/navigation";

// Dynamically import particles to avoid SSR issues
const ParticlesBackground = dynamic(
  () => import("@/components/particles-background"),
  {
    ssr: false,
  }
);

interface PhantomWallet {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  publicKey: { toString: () => string } | null;
}

declare global {
  interface Window {
    solana?: PhantomWallet;
  }
}

export default function HomePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [plioBalance, setPlioBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana?.isConnected && window.solana.publicKey) {
        setIsWalletConnected(true);
        setWalletAddress(window.solana.publicKey.toString());
        // Simulate fetching Plio balance (replace with actual API call)
        setPlioBalance(0); // Set to 0 as shown in the image
      }
    };

    checkWalletConnection();
  }, []);

  const connectPhantomWallet = async () => {
    if (!window.solana) {
      alert(
        "Phantom wallet not found! Please install Phantom wallet extension."
      );
      return;
    }

    try {
      setIsConnecting(true);
      const response = await window.solana.connect();
      const address = response.publicKey.toString();

      setIsWalletConnected(true);
      setWalletAddress(address);

      // Simulate fetching Plio balance (replace with actual API call)
      // In real implementation, you would call your API here
      setTimeout(() => {
        setPlioBalance(0); // Set to 0 as shown in the image
      }, 1000);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (window.solana) {
      await window.solana.disconnect();
      setIsWalletConnected(false);
      setWalletAddress("");
      setPlioBalance(null);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}..${address.slice(-4)}`;
  };

  // Check if user has enough $Plio for premium features
  const hasEnoughPlio = plioBalance !== null && plioBalance >= 50000;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />

      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        <ParticlesBackground />
      </div>

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 lg:pl-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Plio Logo */}
          <div className="mb-6 lg:mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl mx-auto">
              <img
                src="/plio_logo.jpg"
                alt="Plio Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center space-x-3 lg:space-x-4 mb-4 lg:mb-6">
            <div className="group w-8 h-8 lg:w-10 lg:h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
              <Twitter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="group w-8 h-8 lg:w-10 lg:h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
              <Send className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="group w-8 h-8 lg:w-10 lg:h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-pink-500/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
              <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
            </div>
            <div className="group w-8 h-8 lg:w-10 lg:h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          {/* Wallet Address with RGB Animation */}
          <div className="mb-6 lg:mb-8">
            <p className="text-xs sm:text-sm font-mono break-all px-4 animate-rgb">
              2FZJe3n9mAnyWHAvouZYEUMBtsxvov16Mma3puHp
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 lg:mb-8 leading-tight">
            $Plio Holder Panel
          </h1>

          {/* Connected Wallet Display */}
          {isWalletConnected && (
            <div className="mb-6 lg:mb-8">
              <div className="bg-purple-600/80 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-white font-medium">
                  {formatAddress(walletAddress)}
                </span>
              </div>
            </div>
          )}

          {/* Select Wallet / Disconnect Button */}
          <div className="mb-6 lg:mb-8">
            {!isWalletConnected ? (
              <Button
                onClick={connectPhantomWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Connecting..." : "Select Wallet"}
              </Button>
            ) : (
              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="border-pink-600 text-pink-400 hover:bg-pink-600/20 hover:border-pink-400 hover:text-pink-300 px-6 py-3 lg:px-8 lg:py-4 rounded-lg text-base lg:text-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-pink-500/20"
              >
                Disconnect Wallet
              </Button>
            )}
          </div>

          {/* Description Text */}
          <div className="max-w-md mx-auto space-y-1 lg:space-y-2 px-4 mb-8">
            <p className="text-gray-300 text-sm lg:text-base">
              Access exclusive holder tools.
            </p>
            <p className="text-gray-300 text-sm lg:text-base">
              Current Requirement: 50,000 $Plio.
            </p>
            <p className="text-gray-300 text-sm lg:text-base">
              Connect your wallet to view token details and use tools.
            </p>
          </div>

          {/* Plio Balance Container */}
          {isWalletConnected && plioBalance !== null && (
            <div className="max-w-lg mx-auto">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Your $Plio Balance
                </h3>
                <div className="text-left space-y-2">
                  <p className="bg-red-500/10 text-red-300 px-3 py-2 rounded-lg text-sm">
                    ⚠️ You have no $PLIO. You'll be restricted from using:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Image Generation</li>
                      <li>Dex Screener</li>
                    </ul>
                  </p>
                  <p className="text-gray-300 text-sm">
                    All other features remain available.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
