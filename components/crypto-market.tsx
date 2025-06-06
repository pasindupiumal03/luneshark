"use client";

import { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrendingTokens } from "@/lib/api";

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  logoUrl: string;
  marketCap?: number;
}

interface TrendingToken {
  token: {
    name: string;
    symbol: string;
    image: string;
  };
  pools: Array<{
    price: {
      usd: number;
    };
    lastUpdated: number;
  }>;
  events: {
    "24h": {
      priceChangePercentage: number;
    };
  };
}

interface CryptoMarketProps {
  onClose: () => void;
}

export default function CryptoMarket({ onClose }: CryptoMarketProps) {
  const [activeTab, setActiveTab] = useState<"large-cap" | "meme-coins">(
    "large-cap"
  );
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "large-cap") {
      fetchCryptoData();
    } else {
      fetchTrendingTokens();
    }
  }, [activeTab]);

  const fetchCryptoData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/crypto-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: activeTab,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCryptoData(data.cryptos || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch crypto data"
      );
      setCryptoData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getTrendingTokens();
      setTrendingTokens(result.slice(0, 6));
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch trending tokens");
      setTrendingTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return `$${price.toFixed(8)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src="/luneshark_logo.png"
                alt="Plio Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              Crypto Market Overview
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-slate-400 text-sm">
                Live prices from{" "}
                {activeTab === "large-cap" ? "CoinMarketCap" : "Solana Tracker"}
              </p>
              {lastUpdated && (
                <span className="text-slate-500 text-xs">
                  • Updated {formatLastUpdated()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={
                activeTab === "large-cap"
                  ? fetchCryptoData
                  : fetchTrendingTokens
              }
              disabled={isLoading}
              className="text-slate-400 hover:text-gray-600"
              title="Refresh prices"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center p-6 border-b border-slate-700/50">
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={activeTab === "large-cap" ? "default" : "ghost"}
              onClick={() => setActiveTab("large-cap")}
              disabled={isLoading}
              className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "large-cap"
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Large Cap
            </Button>
            <Button
              variant={activeTab === "meme-coins" ? "default" : "ghost"}
              onClick={() => setActiveTab("meme-coins")}
              disabled={isLoading}
              className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "meme-coins"
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Meme Coins
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <AlertCircle className="w-16 h-16 text-red-400" />
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Failed to Load Data
                </h3>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <Button
                  onClick={
                    activeTab === "large-cap"
                      ? fetchCryptoData
                      : fetchTrendingTokens
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (activeTab === "large-cap" ? cryptoData : trendingTokens)
              .length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <AlertCircle className="w-16 h-16 text-yellow-400" />
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-2">
                  No Data Available
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Unable to fetch cryptocurrency data at this time.
                </p>
                <Button
                  onClick={
                    activeTab === "large-cap"
                      ? fetchCryptoData
                      : fetchTrendingTokens
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === "large-cap" ? cryptoData : trendingTokens).map(
                (crypto: CryptoData | TrendingToken, index) => (
                  <div
                    key={
                      activeTab === "large-cap"
                        ? (crypto as CryptoData).id
                        : (crypto as TrendingToken).token.symbol
                    }
                    className="border-slate-700/50 bg-slate-800/40 border rounded-lg p-6 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      {/* Coin Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                          (activeTab === "large-cap" &&
                            (crypto as CryptoData).symbol === "SOL") ||
                          (activeTab === "meme-coins" &&
                            (crypto as TrendingToken).token.symbol === "DOGE")
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 p-0.5"
                            : "bg-slate-700"
                        }`}
                      >
                        <img
                          src={
                            activeTab === "large-cap"
                              ? (crypto as CryptoData).logoUrl ||
                                "/placeholder.svg"
                              : (crypto as TrendingToken).token.image ||
                                "/placeholder.svg"
                          }
                          alt={`${
                            activeTab === "large-cap"
                              ? (crypto as CryptoData).name
                              : (crypto as TrendingToken).token.name
                          } logo`}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span className="text-white font-bold text-lg">${
                                activeTab === "large-cap"
                                  ? (crypto as CryptoData).symbol.charAt(0)
                                  : (
                                      crypto as TrendingToken
                                    ).token.symbol.charAt(0)
                              }</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        {/* Coin Name */}
                        <h3 className="text-white font-semibold text-lg">
                          {activeTab === "large-cap"
                            ? (crypto as CryptoData).name
                            : (crypto as TrendingToken).token.name}
                        </h3>
                        {/* Coin Symbol */}
                        <p className="text-slate-400 text-sm">
                          {activeTab === "large-cap"
                            ? (crypto as CryptoData).symbol
                            : (crypto as TrendingToken).token.symbol}
                        </p>
                      </div>
                      {/* 24h Change */}
                      <div className="flex items-center">
                        {/* Arrow icon */}
                        {activeTab === "large-cap" ? (
                          (crypto as CryptoData).change24h > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )
                        ) : (crypto as TrendingToken).events["24h"]
                            .priceChangePercentage > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}

                        {/* Percentage text */}
                        <span
                          className={`text-xs ml-1 ${
                            activeTab === "large-cap"
                              ? (crypto as CryptoData).change24h > 0
                                ? "text-green-400"
                                : "text-red-400"
                              : (crypto as TrendingToken).events["24h"]
                                  .priceChangePercentage > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {activeTab === "large-cap"
                            ? (crypto as CryptoData).change24h > 0
                              ? "+"
                              : ""
                            : (crypto as TrendingToken).events["24h"]
                                .priceChangePercentage > 0
                            ? "+"
                            : ""}
                          {activeTab === "large-cap"
                            ? (crypto as CryptoData).change24h.toFixed(1)
                            : (crypto as TrendingToken).events[
                                "24h"
                              ].priceChangePercentage.toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      {/* Live Price */}
                      <p className="text-white text-2xl font-bold">
                        {formatPrice(
                          activeTab === "large-cap"
                            ? (crypto as CryptoData).price
                            : (crypto as TrendingToken).pools[0]?.price.usd ?? 0
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
