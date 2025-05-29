import { type NextRequest, NextResponse } from "next/server"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatRequest {
  message: string
  isNiceMode: boolean
  conversationHistory: Message[]
}

export async function POST(request: NextRequest) {
  try {
    const { message, isNiceMode, conversationHistory }: ChatRequest = await request.json()

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!OPENAI_API_KEY) {
      console.log("No OpenAI API key found, using fallback responses")
      return getPlioAgentResponse(message, isNiceMode)
    }

    // Build conversation context for OpenAI
    const systemPrompt = isNiceMode
      ? `You are PlioBot, a helpful and enthusiastic AI assistant for the $Plio token ecosystem. You're an expert on:
        - $Plio token and its holder benefits
        - Solana blockchain technology and ecosystem
        - Cryptocurrency markets and DeFi
        - The Plio Holder Panel tools (torrent search, analytics, image generation)
        - Upcoming features like crypto market dashboard and Solana gas tracker
        
        Key facts about $Plio:
        - Built on Solana blockchain
        - Requires 50,000 $Plio tokens for premium features (Analytics & Image Generation)
        - Offers torrent search for games and movies
        - Has an active roadmap with exciting features coming
        
        Always be helpful, informative, and enthusiastic about the $Plio ecosystem. Use emojis occasionally and maintain a positive, friendly tone. If asked about prices, mention that real-time price tracking is coming in the Crypto Market Dashboard.`
      : `You are PlioBot in crude mode - a direct, no-nonsense AI assistant for the $Plio token ecosystem. You're an expert on:
        - $Plio token and its holder benefits  
        - Solana blockchain technology
        - Cryptocurrency markets
        - The Plio Holder Panel tools and features
        
        Key facts:
        - $Plio is on Solana
        - Need 50k tokens for premium features
        - Free users get basic tools only
        - Premium users get analytics and image generation
        
        Be direct, honest, and sometimes sarcastic. Don't sugarcoat things, but still provide accurate information. Call out people who don't hold enough tokens. Be blunt about the token requirements.`

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    console.log("Sending request to OpenAI...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 300,
        temperature: isNiceMode ? 0.7 : 0.9,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API request failed: ${response.status}`)
    }

    const data = await response.json()
    const botResponse = data.choices[0]?.message?.content || "Sorry, I couldn't process that request."

    console.log("OpenAI response received successfully")
    return NextResponse.json({ message: botResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    // Fallback to predefined responses if OpenAI fails
    if (typeof message === "string" && typeof isNiceMode === "boolean") {
      return getPlioAgentResponse(message, isNiceMode)
    } else {
      return NextResponse.json({ message: "Error processing request." })
    }
  }
}

function getPlioAgentResponse(message: string, isNiceMode: boolean) {
  const lowerMessage = message.toLowerCase()

  // Plio-related responses
  if (lowerMessage.includes("plio") || lowerMessage.includes("$plio")) {
    const responses = isNiceMode
      ? [
          "$Plio is an amazing token on the Solana blockchain! 🚀 It powers our exclusive holder panel with tools for games, movies, and more. The current requirement for premium features is 50,000 $Plio tokens.",
          "Great question about $Plio! 😊 It's the utility token that unlocks all the cool features in our holder panel. From torrent searches to analytics tools, $Plio holders get exclusive access!",
        ]
      : [
          "$Plio is the token that separates the holders from the wannabes. You need 50k tokens to access the good stuff. No tokens? Enjoy the basic features.",
          "Plio token - your ticket to the VIP section. Without it, you're stuck in the cheap seats watching others have fun.",
        ]
    return NextResponse.json({ message: responses[Math.floor(Math.random() * responses.length)] })
  }

  // Solana-related responses
  if (lowerMessage.includes("solana") || lowerMessage.includes("sol")) {
    const responses = isNiceMode
      ? [
          "Solana is a fast and scalable blockchain! ⚡ It's a great network for projects like $Plio! 😊 With low fees and high throughput, it's perfect for our ecosystem.",
          "Solana is known for its speed and low transaction fees, while Ethereum has a larger ecosystem and is more decentralized. Both are great, but Solana is perfect for fast-paced projects like $Plio! 🚀",
        ]
      : [
          "Solana - fast, cheap, and doesn't make you wait forever for transactions like some other chains. That's why we built on it.",
          "Solana vs Ethereum? One costs pennies and is lightning fast, the other costs your firstborn and takes forever. Guess which one we chose.",
        ]
    return NextResponse.json({ message: responses[Math.floor(Math.random() * responses.length)] })
  }

  // Price-related responses
  if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    const responses = isNiceMode
      ? [
          "I can't give you real-time prices with the current tools, but the Crypto Market Tracker is coming soon! 😊 I'll let you know as soon as it's live.",
          "Price tracking is on our roadmap! 📈 The upcoming Crypto Market Dashboard will show live prices for SOL, BTC, ETH, and of course $Plio!",
        ]
      : [
          "No live prices yet. The market tracker isn't ready. Check back later or use CoinGecko like everyone else.",
          "Want prices? The feature isn't built yet. We're working on it, but for now you'll have to look elsewhere.",
        ]
    return NextResponse.json({ message: responses[Math.floor(Math.random() * responses.length)] })
  }

  // Tools/features responses
  if (lowerMessage.includes("tools") || lowerMessage.includes("features")) {
    const responses = isNiceMode
      ? [
          "Our holder panel has some awesome tools! 🎮 You can search for game and movie torrents, check out our roadmap, and chat with me! Premium features like Analytics and Image Generation require 50,000 $Plio tokens.",
          "We've got torrent search for games and movies, a detailed project roadmap, and this chat feature! 😊 More tools are coming soon, including crypto market tracking and Solana network stats!",
        ]
      : [
          "Games, movies, roadmap, and this chat. That's what you get for free. Want the good stuff? Buy 50k $Plio tokens.",
          "Basic tools are free, premium tools cost tokens. Simple economics. Pay to play or stick to the freebies.",
        ]
    return NextResponse.json({ message: responses[Math.floor(Math.random() * responses.length)] })
  }

  // Default responses
  const defaultResponses = isNiceMode
    ? [
        "I'm here to help with anything related to $Plio, Solana, or our tools! 😊 What would you like to know?",
        "Feel free to ask me about $Plio tokens, Solana blockchain, or any of the features in our holder panel! 🚀",
        "I'm your friendly PlioBot assistant! Ask me about crypto, our tools, or anything else you're curious about! ✨",
      ]
    : [
        "Ask me something useful about Plio, Solana, or the tools. I don't do small talk.",
        "What do you want to know? Make it worth my time.",
        "I'm here for Plio and crypto questions. Shoot.",
      ]

  return NextResponse.json({ message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)] })
}
