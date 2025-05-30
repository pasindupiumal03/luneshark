"use client";

import type React from "react";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Game {
  id: string;
  title: string;
  version: string;
  size: string;
  source: string;
  desc: string;
}

interface TorrentGameSearchProps {
  onClose: () => void;
}

const BASE_API_URL = "plio-v1-backend.vercel.app";

export default function TorrentGameSearch({ onClose }: TorrentGameSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data for demonstration - will be replaced with API call
  // const mockGames: Game[] = [
  //   {
  //     id: "1",
  //     title: "Days Gone Remastered (v1.08 + Broken Road DLC + MULTI23)",
  //     version: "v1.08",
  //     size: "38.4 GB",
  //     source: "DODI Repack",
  //   },
  //   {
  //     id: "2",
  //     title: "Clair Obscur: Expedition 33 - Deluxe Edition",
  //     version: "v56180 + All DLCs + Bonus Content + MULTI12",
  //     size: "36.8 GB",
  //     source: "DODI Repack",
  //   },
  //   {
  //     id: "3",
  //     title: "The Elder Scrolls IV: Oblivion Remastered - Deluxe Edition",
  //     version: "v0.411.140.0 + All DLCs + Bonus Content + MULTI9",
  //     size: "108.5 GB",
  //     source: "DODI Repack",
  //   },
  //   {
  //     id: "4",
  //     title: "Steel Seed: Deluxe Edition",
  //     version: "v1.0.4 + All DLCs + Bonus Content + MULTI12",
  //     size: "15.6 GB",
  //     source: "DODI Repack",
  //   },
  //   {
  //     id: "5",
  //     title: "Dragon Ball: Sparking! ZERO - Ultimate Edition",
  //     version: "v1.0",
  //     size: "45.2 GB",
  //     source: "DODI Repack",
  //   },
  //   {
  //     id: "6",
  //     title: "Soulslinger: Envoy of Death",
  //     version: "v1.0 + Bonus Content",
  //     size: "22.8 GB",
  //     source: "DODI Repack",
  //   },
  // ]

  // const handleSearch = async () => {
  //   if (!searchQuery.trim()) return

  //   setIsSearching(true)
  //   setHasSearched(true)

  //   // Simulate API call delay
  //   setTimeout(() => {
  //     // In a real implementation, this would be replaced with an actual API call
  //     // using the torrent API key provided by the user
  //     setSearchResults(mockGames)
  //     setIsSearching(false)
  //   }, 2000)
  // }

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter") {
  //     handleSearch()
  //   }
  // }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `${BASE_API_URL}/torrents/search?q=${encodeURIComponent(
          searchQuery
        )}&type=Games`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch torrents");
      }
      const data = await response.json();

      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching torrents:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Torrent Game Search</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search input */}
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search for PC Games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-gray-800/60 border-gray-700 text-white"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Search tip */}
        <p className="text-gray-400 text-sm mb-6">
          Tip: Use specific terms for better results (e.g., 'spider-man' works,
          'spiderman' might not).
        </p>

        {/* Loading indicator */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin mb-4"></div>
          </div>
        )}

        {/* Search results */}
        {!isSearching && hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((game, id) => (
              <div
                key={id}
                className="bg-gray-800/60 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-white font-semibold mb-2 text-center">
                  {game.title}
                </h3>
                <p className="text-gray-300 text-sm text-center mb-2">
                  {game.version}
                </p>
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mb-4">
                  <span>Size: {game.size}</span>
                  <span>|</span>
                  <span>
                    Source:{" "}
                    <span className="text-orange-400">{game.source}</span>
                  </span>
                </div>
                {game.desc ? (
                  <Link
                    href={game.desc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white inline-block text-center py-2 rounded"
                  >
                    Download Link
                  </Link>
                ) : (
                  <span className="w-full inline-block text-center text-gray-500 py-2">
                    No download link
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results state */}
        {!isSearching && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg mb-2">No results found</p>
            <p className="text-gray-400">Try different search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
