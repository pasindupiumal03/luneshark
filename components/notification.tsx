"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationProps {
  message: string
  type?: "error" | "success" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

export default function Notification({ message, type = "error", duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-600/90 border-red-500 text-white"
      case "success":
        return "bg-green-600/90 border-green-500 text-white"
      case "warning":
        return "bg-yellow-600/90 border-yellow-500 text-white"
      case "info":
        return "bg-blue-600/90 border-blue-500 text-white"
      default:
        return "bg-red-600/90 border-red-500 text-white"
    }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg ${getTypeStyles()}`}
      >
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6 text-white hover:bg-white/20 ml-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
