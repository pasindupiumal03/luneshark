"use client"

import { useState } from "react"
import { Gamepad2, Film, BarChart3, ImageIcon, Map, Bot, TrendingUp, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import TorrentGameSearch from "./torrent-game-search"
import TorrentMovieSearch from "./torrent-movie-search"
import ProjectRoadmap from "./project-roadmap"
import PlioBot from "./plio-bot"
import CryptoMarket from "./crypto-market"
import Notification from "./notification"

const menuItems = [
  { icon: Gamepad2, label: "Games", href: "#", action: "games" },
  { icon: Film, label: "Movies", href: "#", action: "movies" },
  { icon: BarChart3, label: "Analytics", href: "#", action: "analytics", restricted: true },
  { icon: ImageIcon, label: "Images", href: "#", action: "images", restricted: true },
  { icon: Map, label: "Roadmap", href: "#", action: "roadmap" },
  { icon: Bot, label: "PlioBot", href: "#", action: "chat" },
  { icon: TrendingUp, label: "Crypto Market", href: "#", action: "market" },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showGameSearch, setShowGameSearch] = useState(false)
  const [showMovieSearch, setShowMovieSearch] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMarket, setShowMarket] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const handleMenuItemClick = (action?: string, restricted?: boolean) => {
    if (action === "games") {
      setShowGameSearch(true)
    } else if (action === "movies") {
      setShowMovieSearch(true)
    } else if (action === "roadmap") {
      setShowRoadmap(true)
    } else if (action === "chat") {
      setShowChat(true)
    } else if (action === "market") {
      setShowMarket(true)
    } else if (restricted) {
      setShowNotification(true)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 flex-col items-center py-6 z-40">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">Plio</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col space-y-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-800 transition-colors group"
              title={item.label}
              onClick={(e) => {
                if (item.action || item.restricted) {
                  e.preventDefault()
                  handleMenuItemClick(item.action, item.restricted)
                }
              }}
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <nav className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 p-6">
            {/* Logo */}
            <div className="mb-8 mt-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Plio</span>
                </div>
                <span className="text-white font-bold text-xl">Plio</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    if (item.action || item.restricted) {
                      e.preventDefault()
                      handleMenuItemClick(item.action, item.restricted)
                      setIsOpen(false)
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{item.label}</span>
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Error Notification */}
      {showNotification && (
        <Notification
          message="Requires at least 50000 $Plio to access."
          type="error"
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Torrent Game Search Modal */}
      {showGameSearch && <TorrentGameSearch onClose={() => setShowGameSearch(false)} />}

      {/* Torrent Movie Search Modal */}
      {showMovieSearch && <TorrentMovieSearch onClose={() => setShowMovieSearch(false)} />}

      {/* Project Roadmap Modal */}
      {showRoadmap && <ProjectRoadmap onClose={() => setShowRoadmap(false)} />}

      {/* PlioBot Chat Modal */}
      {showChat && <PlioBot onClose={() => setShowChat(false)} />}

      {/* Crypto Market Modal */}
      {showMarket && <CryptoMarket onClose={() => setShowMarket(false)} />}
    </>
  )
}
