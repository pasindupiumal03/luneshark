"use client";

import { useState, useEffect } from "react";
import {
  Gamepad2,
  Film,
  BarChart3,
  ImageIcon,
  Map,
  Bot,
  TrendingUp,
  MessageSquare,
  Search,
  Zap,
  Wallet,
  Settings,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import particles to avoid SSR issues
const ParticlesBackground = dynamic(
  () => import("@/components/particles-background"),
  {
    ssr: false,
  }
);

import React from "react";

type ToolCard = {
  name: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
  action: string;
  restricted?: boolean;
  comingSoon?: boolean;
};

const toolCards: ToolCard[] = [
  {
    name: "Games",
    desc: "Access a collection of games available for download.",
    icon: <Gamepad2 className="w-6 h-6 text-white" />,
    gradient: "from-[#3385ff] to-[#6e6bff]",
    action: "games",
  },
  {
    name: "Movies",
    desc: "Browse and download your favorite movies and TV shows.",
    icon: <Film className="w-6 h-6 text-white" />,
    gradient: "from-[#6e6bff] to-[#4ECDC4]",
    action: "movies",
  },
  {
    name: "Analytics",
    desc: "View detailed analytics and statistics.",
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    gradient: "from-[#4ECDC4] to-[#3385ff]",
    action: "analytics",
  },
  {
    name: "Images",
    desc: "Generate and download AI images.",
    icon: <ImageIcon className="w-6 h-6 text-white" />,
    gradient: "from-[#3385ff] to-[#4ECDC4]",
    action: "images",
  },
  {
    name: "Roadmap",
    desc: "Check out our development roadmap and upcoming features.",
    icon: <Map className="w-6 h-6 text-white" />,
    gradient: "from-[#4ECDC4] to-[#6e6bff]",
    action: "roadmap",
  },
  {
    name: "PlioBot",
    desc: "Chat with our AI assistant for help and information.",
    icon: <Bot className="w-6 h-6 text-white" />,
    gradient: "from-[#6e6bff] to-[#3385ff]",
    action: "chat",
  },
  {
    name: "Crypto Market",
    desc: "Track cryptocurrency prices and market data.",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    gradient: "from-[#4ECDC4] to-[#3385ff]",
    action: "market",
  },
  {
    name: "More Tools",
    desc: "Coming soon - Stay tuned for more exciting features!",
    icon: <Zap className="w-6 h-6 text-white" />,
    gradient: "from-[#4ECDC4] to-[#6e6bff]",
    action: "more-tools",
    comingSoon: true,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<ToolCard | null>(null);
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

  const handleToolCardClick = (card: ToolCard) => {
    if (card.comingSoon || card.restricted) return;

    // Dispatch a custom event that the Navigation component can listen to
    const event = new CustomEvent("toolSelected", {
      detail: { action: card.action },
    });
    window.dispatchEvent(event);
  };

  // Listen for tool selection from the sidebar
  useEffect(() => {
    const handleToolSelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ action: string }>;
      const action = customEvent.detail?.action;
      if (action) {
        const tool = toolCards.find((tool) => tool.action === action);
        if (tool) {
          setActiveTool(tool);
        }
      }
    };

    window.addEventListener(
      "toolSelected",
      handleToolSelected as EventListener
    );
    return () => {
      window.removeEventListener(
        "toolSelected",
        handleToolSelected as EventListener
      );
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        {/* Network pattern */}
        <div className="absolute inset-0 opacity-30">
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
                <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.3)" />
                <line
                  x1="50"
                  y1="50"
                  x2="100"
                  y2="0"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="100"
                  y2="100"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="0"
                  y2="100"
                  stroke="rgba(255,255,255,0.2)"
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
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={style}
            />
          ))}
        </div>
      </div>

      <div className="min-h-screen w-full flex relative z-10">
        <Navigation />
        <main className="flex-1 p-6 md:p-12 flex flex-col items-center w-full min-h-screen bg-transparent">
          <div className="w-full max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent font-extrabold">
                  $Plio{" "}
                </span>
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-extrabold">
                  Features
                </span>
              </h2>
              <p className="text-xl text-gray-300 font-mono max-w-3xl mx-auto">
                Explore our suite of tools designed to enhance your experience
              </p>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {toolCards.map((card, index) => (
                <div
                  key={index}
                  className={`group relative ${
                    card.comingSoon || card.restricted ? "" : "cursor-pointer"
                  }`}
                  onClick={() => handleToolCardClick(card)}
                >
                  <div className="backdrop-blur-md bg-white/10 border-2 border-white/30 glass-navbar p-8 rounded-2xl h-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                    <div
                      className={
                        card.comingSoon || card.restricted ? "opacity-70" : ""
                      }
                    >
                      {/* Gradient background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                      />

                      {/* Icon */}
                      <div className="relative mb-6">
                        <div
                          className={`relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.gradient} text-white`}
                        >
                          {card.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {card.name}
                        </h3>
                        <p className="text-gray-300 mb-4">{card.desc}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {card.restricted && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30">
                            Premium
                          </span>
                        )}
                        {card.comingSoon && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white border border-blue-500/30">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3385ff]/5 to-[#4ECDC4]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style jsx global>{`
            @keyframes gradient-x {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .animate-gradient-x {
              background-size: 200% auto;
              animation: gradient-x 8s ease infinite;
            }

            .glass-navbar {
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px); /* For Safari support */
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}
