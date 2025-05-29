"use client"

import type React from "react"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Movie {
  id: string
  title: string
  year: string
  quality: string
  size: string
  source: string
}

interface TorrentMovieSearchProps {
  onClose: () => void
}

export default function TorrentMovieSearch({ onClose }: TorrentMovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Mock data for demonstration - will be replaced with API call
  const mockMovies: Movie[] = [
    {
      id: "1",
      title: "Dune: Part Two",
      year: "2024",
      quality: "2160p 4K HDR10+ IMAX",
      size: "18.6 GB",
      source: "RARBG",
    },
    {
      id: "2",
      title: "Deadpool & Wolverine",
      year: "2024",
      quality: "1080p BluRay",
      size: "12.4 GB",
      source: "RARBG",
    },
    {
      id: "3",
      title: "The Batman",
      year: "2022",
      quality: "2160p 4K HDR10+",
      size: "22.8 GB",
      source: "RARBG",
    },
    {
      id: "4",
      title: "Oppenheimer",
      year: "2023",
      quality: "1080p IMAX",
      size: "15.2 GB",
      source: "RARBG",
    },
    {
      id: "5",
      title: "Interstellar",
      year: "2014",
      quality: "2160p 4K HDR10+",
      size: "24.5 GB",
      source: "RARBG",
    },
    {
      id: "6",
      title: "Inception",
      year: "2010",
      quality: "1080p BluRay",
      size: "10.8 GB",
      source: "RARBG",
    },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    // Simulate API call delay
    setTimeout(() => {
      // In a real implementation, this would be replaced with an actual API call
      // using the torrent API key provided by the user
      setSearchResults(mockMovies)
      setIsSearching(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Search Movie Torrents</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search input */}
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter movie title (e.g., Inception, Dune 2021)"
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
          Tip: Use specific terms for better results (e.g., 'spider-man' works, 'spiderman' might not).
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
            {searchResults.map((movie) => (
              <div key={movie.id} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-1 text-center">
                  {movie.title} <span className="text-gray-400">({movie.year})</span>
                </h3>
                <p className="text-gray-300 text-sm text-center mb-2">{movie.quality}</p>
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mb-4">
                  <span>Size: {movie.size}</span>
                  <span>|</span>
                  <span>
                    Source: <span className="text-orange-400">{movie.source}</span>
                  </span>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Download Link</Button>
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
  )
}
