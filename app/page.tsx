"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Twitter,
  Send,
  Globe,
  Shield,
  Wallet,
  Rocket,
  Copy,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";

// Dynamically import particles to avoid SSR issues
const ParticlesBackground = dynamic(
  () => import("@/components/particles-background"),
  { ssr: false }
);

export default function HomePage() {
  const { walletAddress, connecting, connectWallet, disconnectWallet } =
    useWallet();
  const router = useRouter();
  const isWalletConnected = !!walletAddress;
  const [plioBalance, setPlioBalance] = useState<number | null>(null);
  const [particleStyles, setParticleStyles] = useState<
    Array<React.CSSProperties>
  >([]);

  // Generate particle styles on the client side after hydration
  useEffect(() => {
    const generateRandomStyle = (): React.CSSProperties => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    });

    setParticleStyles(Array.from({ length: 20 }, generateRandomStyle));
  }, []);

  const handleConnectWallet = async () => {
    if (isWalletConnected) {
      await disconnectWallet();
      setPlioBalance(null);
    } else {
      await connectWallet();
      // Simulate fetching Plio balance (replace with actual API call)
      setTimeout(() => {
        setPlioBalance(0); // Set to 0 as shown in the image
      }, 1000);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here if you want
  };

  // Check if user has enough $Plio for premium features
  const hasEnoughPlio = plioBalance !== null && plioBalance >= 50000;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with off-white color */}
      <Navigation />
      <div className="absolute inset-0 bg-[#f5f1e8]">
        {/* Network pattern */}
        <div className="opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <pattern
                id="network"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="50" cy="50" r="2" fill="#3a4449" />
                <line
                  x1="50"
                  y1="50"
                  x2="100"
                  y2="0"
                  stroke="#3a4449"
                  strokeWidth="1"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="100"
                  y2="100"
                  stroke="#3a4449"
                  strokeWidth="1"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="0"
                  y2="100"
                  stroke="#3a4449"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network)" />
          </svg>
        </div>

        {/* Particles Background */}
        <div className="absolute inset-0">
          <ParticlesBackground />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {particleStyles.map((style, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#3a4449]/20 rounded-full animate-pulse"
              style={style}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-0 right-0 w-fit p-2 z-50">
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-1 bg-[#f5f1e8]/80 border border-[#3a4449]/20 text-[#3a4449] rounded-md px-2 py-1 sm:px-3 sm:py-1.5 transition-colors duration-200 backdrop-blur-sm">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-[#3a4449]" />
            <span className="text-xs sm:text-sm font-medium">
              {connecting
                ? "Connecting..."
                : isWalletConnected
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </span>
            {isWalletConnected && (
              <Button
                size="icon"
                variant="ghost"
                className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 active:text-[#3a4449] text-[#3a4449] p-1"
                onClick={() => copyToClipboard(walletAddress)}
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>

          {isWalletConnected && (
            <div className="flex items-center bg-[#5a6e73]/20 border border-[#5a6e73]/30 text-[#5a6e73] rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5a6e73] rounded-full mr-1 sm:mr-1.5 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-medium">
                Connected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 pt-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <img
                src="/luneshark_logo.png"
                alt="Plio Logo"
                className="w-full h-full object-cover rounded-3xl shadow-2xl shadow-[#3a4449]/25"
              />
            </div>

            {/* Social Icons */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                size="icon"
                variant="ghost"
                className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 text-[#3a4449] backdrop-blur-sm"
                onClick={() =>
                  window.open(
                    "https://x.com/PlioSol",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <img
                  src="/x-twitter-brands-solid.svg"
                  alt="twitter"
                  className="w-5 h-5 rounded-md object-cover"
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 text-[#3a4449] backdrop-blur-sm"
                onClick={() =>
                  window.open(
                    "https://telegram.org/PlioSol",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <img
                  src="/telegram.png"
                  alt="Telegram"
                  className="w-5 h-5 rounded-md object-cover"
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 text-[#3a4449] backdrop-blur-sm"
                onClick={() =>
                  window.open(
                    "https://pump.fun/coin/2E7ZJe3n9mAnyW1AvouZY8EbfWBssvxov116Mma3pump",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <img
                  src="/Pump_fun_logo.png"
                  alt="Pumpfun"
                  className="w-5 h-5 rounded-md object-cover"
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 text-[#3a4449] backdrop-blur-sm p-2"
                onClick={() =>
                  window.open(
                    "https://dexscreener.com/solana/2cgwesvhz9gftdyqvbcje7lwvyoxk7oj35qega56vjfy",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <img
                  src="/dexscreener.jpg"
                  alt="DexScreener"
                  className="w-5 h-5 rounded-md object-cover"
                />
              </Button>
            </div>
          </div>

          <div className="mb-6 lg:mb-8 flex items-center justify-center gap-2">
            <p className="text-xs sm:text-sm font-mono break-all px-4 py-2 bg-[#f5f1e8]/80 rounded-lg text-[#3a4449]">
              2E7ZJe3n9mAnyW1AvouZY8EbfWBssvxov116Mma3pump
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="bg-[#f5f1e8]/80 hover:bg-[#3a4449]/10 active:text-[#3a4449] text-[#3a4449]"
              onClick={() =>
                copyToClipboard("2E7ZJe3n9mAnyW1AvouZY8EbfWBssvxov116Mma3pump")
              }
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Heading */}
          <div className="relative mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-[#3a4449]">
              <span className="relative">
                <span className="bg-gradient-to-r from-[#5a6e73] to-[#3a4449] bg-clip-text text-transparent font-extrabold">
                  $Luneshark
                </span>
                <span className="mx-3 text-[#3a4449]">Holder</span>
                <span className="bg-gradient-to-r from-[#3a4449] to-[#5a6e73] bg-clip-text text-transparent font-extrabold">
                  Panel
                </span>
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="bg-[#5a6e73] hover:bg-[#3a4449] text-[#f5f1e8] font-semibold px-8 py-6 text-lg shadow-2xl shadow-[#3a4449]/25 transition-all duration-300 hover:scale-105"
            >
              <Rocket className="w-6 h-6 mr-3" />
              Launch Luneshark
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleConnectWallet}
              disabled={connecting}
              className="bg-[#f5f1e8]/80 border-[#3a4449]/30 text-[#3a4449] hover:bg-[#3a4449]/10 font-semibold px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Wallet className="w-6 h-6 mr-3" />
              {connecting
                ? "Connecting..."
                : isWalletConnected
                ? "Disconnect Wallet"
                : "Connect Wallet"}
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-4 text-[#3a4449] max-w-2xl mx-auto">
            <p className="text-xl font-medium flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#5a6e73]" />
              Access exclusive holder tools
            </p>

            <div className="bg-[#f5f1e8]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#3a4449]/20">
              <p className="text-lg mb-3 flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2 text-[#5a6e73]" />
                <span className="font-semibold">Current Requirement:</span>
              </p>
              <Badge className="ml-2 mb-4 bg-[#5a6e73] text-[#f5f1e8] font-bold">
                50,000 $Luneshark
              </Badge>

              <p className="text-base text-[#3a4449]/80 leading-relaxed text-center">
                Connect your wallet to view token details and access exclusive
                holder tools.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          {isWalletConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <Card className="bg-[#f5f1e8]/80 border-[#3a4449]/20 backdrop-blur-sm p-6 hover:bg-[#3a4449]/10 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-[#5a6e73] mb-4 mx-auto" />
                <h3 className="text-[#3a4449] font-semibold mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-[#3a4449]/70 text-sm">
                  Track your holdings and market performance
                </p>
              </Card>

              <Card className="bg-[#f5f1e8]/80 border-[#3a4449]/20 backdrop-blur-sm p-6 hover:bg-[#3a4449]/10 transition-all duration-300">
                <Shield className="w-8 h-8 text-[#5a6e73] mb-4 mx-auto" />
                <h3 className="text-[#3a4449] font-semibold mb-2">
                  Exclusive Access
                </h3>
                <p className="text-[#3a4449]/70 text-sm">
                  Holder-only features and premium tools
                </p>
              </Card>

              <Card className="bg-[#f5f1e8]/80 border-[#3a4449]/20 backdrop-blur-sm p-6 hover:bg-[#3a4449]/10 transition-all duration-300">
                <Sparkles className="w-8 h-8 text-[#5a6e73] mb-4 mx-auto" />
                <h3 className="text-[#3a4449] font-semibold mb-2">
                  Advanced Tools
                </h3>
                <p className="text-[#3a4449]/70 text-sm">
                  Professional trading and analysis suite
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
