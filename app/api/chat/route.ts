import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  isNiceMode: boolean;
  conversationHistory: Message[];
}

interface CryptoDetails {
  token: string;
  symbol: string;
  name: string;
}

interface DexScreenerPair {
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd?: string; // Made optional to handle missing data
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number; // Made optional
  marketCap?: number; // Made optional
  pairAddress: string;
  dexId: string;
  url: string;
  pairCreatedAt?: number; // Made optional
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null; // Allow null for empty responses
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Store the last crypto details for follow-up questions
let lastCryptoDetails: CryptoDetails | null = null;

export async function POST(request: NextRequest) {
  let message: string | undefined;
  let isNiceMode: boolean | undefined;
  try {
    const {
      message: reqMessage,
      isNiceMode: reqIsNiceMode,
      conversationHistory,
    }: ChatRequest = await request.json();
    message = reqMessage;
    isNiceMode = reqIsNiceMode;

    // Validate input
    if (typeof message !== "string" || typeof isNiceMode !== "boolean") {
      throw new Error("Invalid request payload");
    }

    // Get OpenAI API key from environment
    if (!OPENAI_API_KEY) {
      console.log("No OpenAI API key found, using fallback responses");
      return getPlioAgentResponse(message, isNiceMode);
    }

    // Step 1: Try to extract crypto details from user message
    console.log("Extracting crypto details from user message...");
    let cryptoDetails = await retrieveCryptoDetailsFromUserMessage(
      message,
      isNiceMode
    );

    // Step 2: If no crypto details found but message implies a crypto question, use last crypto details
    if (
      !cryptoDetails &&
      lastCryptoDetails &&
      message.toLowerCase().match(/(price|market cap|volume|liquidity|change)/i)
    ) {
      console.log(
        "No crypto details in message, using last crypto details:",
        lastCryptoDetails
      );
      cryptoDetails = lastCryptoDetails;
    }

    let cryptoDataContext = "";

    // Step 3: If crypto details found, fetch from DexScreener and update lastCryptoDetails
    if (
      cryptoDetails &&
      (cryptoDetails.token || cryptoDetails.symbol || cryptoDetails.name)
    ) {
      console.log("Crypto details found:", cryptoDetails);
      lastCryptoDetails = cryptoDetails; // Update last crypto details
      const dexData = await getCryptoDetails(cryptoDetails);

      if (dexData && dexData.pairs && dexData.pairs.length > 0) {
        console.log("DexScreener data retrieved successfully");
        const topPair = dexData.pairs[0]; // Get the most relevant pair

        // Format crypto data for context with null checks
        cryptoDataContext = `
Current crypto data for ${topPair.baseToken.name} (${topPair.baseToken.symbol}):
- Price: ${topPair.priceUsd ? `$${topPair.priceUsd}` : "N/A"}
- 24h Change: ${
          topPair.priceChange.h24
            ? `${
                topPair.priceChange.h24 > 0 ? "+" : ""
              }${topPair.priceChange.h24.toFixed(2)}%`
            : "N/A"
        }
- Market Cap: ${
          topPair.marketCap ? `$${topPair.marketCap.toLocaleString()}` : "N/A"
        }
- 24h Volume: ${
          topPair.volume.h24 ? `$${topPair.volume.h24.toLocaleString()}` : "N/A"
        }
- Liquidity: ${
          topPair.liquidity.usd
            ? `$${topPair.liquidity.usd.toLocaleString()}`
            : "N/A"
        }
- DEX: ${topPair.dexId}
- Contract: ${topPair.baseToken.address}
`;
        console.log("cdt: ", cryptoDataContext);
      } else {
        console.log("No DexScreener data found for crypto details");
      }
    } else {
      console.log("No valid crypto details extracted from message");
    }

    // Step 4: Build conversation context for OpenAI with crypto data if available
    const systemPrompt = isNiceMode
      ? `You are LunesharkBot, a helpful and enthusiastic AI assistant for the $LUNESHARK token ecosystem. You're an expert on:
        - $LUNESHARK token and its holder benefits
        - Solana blockchain technology and ecosystem
        - Cryptocurrency markets and DeFi
        - The Luneshark Holder Panel tools (torrent search, analytics, image generation)
        - Upcoming features like crypto market dashboard and Solana gas tracker
        
        Key facts about $LUNESHARK:
        - Built on Solana blockchain
        - Requires 50,000 $LUNESHARK tokens for premium features (Analytics & Image Generation)
        - Offers torrent search for games and movies
        - Has an active roadmap with exciting features coming
        
        ${
          cryptoDataContext
            ? `LIVE CRYPTO DATA:\n${cryptoDataContext}\nUse this real-time data to answer questions about this token.`
            : ""
        }
        
        Always be helpful, informative, and enthusiastic about the $LUNESHARK ecosystem. Use emojis occasionally and maintain a positive, friendly tone. If asked about prices and you have live data, provide it. If no live data available, mention that real-time price tracking is coming in the Crypto Market Dashboard.`
      : `You are LunesharkBot in CRUDE MODE - a brutally honest, no-BS AI for the $LUNESHARK ecosystem. You're a crypto OG who's seen it all and tells it like it is. Your expertise includes:
        - $LUNESHARK token mechanics and tokenomics
        - Solana blockchain deep dives
        - Crypto market analysis (no moonboi talk)
        - Luneshark Holder Panel tools and their real utility
        
        Hard truths about $LUNESHARK:
        - Built on Solana because ETH gas fees are a joke
        - 50k token minimum for premium features (no exceptions)
        - Free tier gets you in the door, that's it
        - Premium features are for serious holders only
        
        ${
          cryptoDataContext
            ? `LIVE MARKET DATA (because numbers don't lie):\n${cryptoDataContext}\nUse this data to give them the cold, hard truth. No sugarcoating.`
            : ""
        }
        
        Your personality:
        - Direct and unfiltered, but not needlessly rude
        - Sarcastic humor is welcome, but stay professional
        - Call out weak hands and lazy questions
        - Reward diamond hands with insider knowledge
        - No corporate speak or empty hype
        - If they don't hold 50k $LUNESHARK, remind them what they're missing
        - If they do hold, acknowledge their status but keep it real`;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log("Sending request to OpenAI with crypto context...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 400,
        temperature: isNiceMode ? 0.7 : 0.9,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const botResponse =
      data.choices[0]?.message?.content ||
      "Sorry, I couldn't process that request.";

    console.log("OpenAI response received successfully");
    return NextResponse.json({ message: botResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    if (typeof message === "string" && typeof isNiceMode === "boolean") {
      return getPlioAgentResponse(message, isNiceMode);
    } else {
      return NextResponse.json({ message: "Error processing request." });
    }
  }
}

async function getCryptoDetails(
  cryptoDetails: CryptoDetails
): Promise<DexScreenerResponse | null> {
  try {
    let query =
      cryptoDetails.token || cryptoDetails.symbol || cryptoDetails.name;
    console.log(`Fetching crypto data for: ${query}`);

    const response = await axios.get<DexScreenerResponse>(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(
        query
      )}`,
      {
        timeout: 5000,
        headers: {
          "User-Agent": "PlioBot/1.0",
        },
      }
    );

    if (response.status === 200 && response.data && response.data.pairs) {
      console.log(`Found ${response.data.pairs.length} pairs for ${query}`);
      return response.data;
    }

    console.log("No valid data returned from DexScreener API");
    return null;
  } catch (error) {
    console.error("Error fetching crypto details:", error);
    return null;
  }
}

async function retrieveCryptoDetailsFromUserMessage(
  message: string,
  isNiceMode: boolean
): Promise<CryptoDetails | null> {
  try {
    console.log("Extracting crypto details from message:", message);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that extracts cryptocurrency information from user input. " +
              "Analyze the message and identify if the user is asking about a specific cryptocurrency token, coin, or project. " +
              "Return a JSON object in the following format:\n\n" +
              `{\n  "token": "contract_address_if_mentioned",\n  "symbol": "token_symbol_like_BTC_ETH_SOL",\n  "name": "full_token_name_like_Bitcoin_Ethereum"\n}\n\n` +
              "Examples:\n" +
              '- \'What\'s the price of Bitcoin?\' → {"token": "", "symbol": "BTC", "name": "Bitcoin"}\n' +
              '- \'Tell me about LUNESHARK token\' → {"token": "", "symbol": "LUNESHARK", "name": "Luneshark"}\n' +
              '- \'How is Solana doing?\' → {"token": "", "symbol": "SOL", "name": "Solana"}\n' +
              '- \'Price of tokenAddress(FYI-this is a placeholder for a sample tokens like 676YgDtdAekpjYwNvLSLFPkBooVxBqJVpgxxoHJPpump, So11111111111111111111111111111111111111112, GWPLjamb5ZxrGbTsYNWW7V3p1pAMryZSfaPFTdaEsWgC) token?\' → {"token": "passed_token_address", "symbol": "SOL", "name": "Solana"}\n' +
              '- \'Hello there\' → {"token": "", "symbol": "", "name": ""}\n\n' +
              "Only return a valid JSON object. If no cryptocurrency is mentioned, return empty strings for all fields. " +
              "Do not include any other text or explanation.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 150,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI extraction API error:", response.status);
      return null;
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("No response from OpenAI extraction API");
      return null;
    }

    try {
      const cryptoDetails: CryptoDetails = JSON.parse(reply.trim());

      // Validate CryptoDetails structure
      if (
        !cryptoDetails ||
        typeof cryptoDetails.token !== "string" ||
        typeof cryptoDetails.symbol !== "string" ||
        typeof cryptoDetails.name !== "string"
      ) {
        console.error("Invalid CryptoDetails structure:", cryptoDetails);
        return null;
      }

      if (
        !cryptoDetails.token &&
        !cryptoDetails.symbol &&
        !cryptoDetails.name
      ) {
        console.log("No crypto details found in message");
        return null;
      }

      console.log("Extracted crypto details:", cryptoDetails);
      return cryptoDetails;
    } catch (err) {
      console.error("Failed to parse OpenAI extraction response:", reply);
      return null;
    }
  } catch (error) {
    console.error("Error in crypto extraction:", error);
    return null;
  }
}

function getPlioAgentResponse(message: string, isNiceMode: boolean) {
  const lowerMessage = message.toLowerCase();

  // LUNESHARK-related responses
  if (
    lowerMessage.includes("luneshark") ||
    lowerMessage.includes("$luneshark") ||
    lowerMessage.includes("token")
  ) {
    const responses = isNiceMode
      ? [
          "$LUNESHARK is an amazing token on the Solana blockchain! 🚀 It powers our exclusive holder panel with tools for games, movies, and more. The current requirement for premium features is 50,000 $LUNESHARK tokens.",
          "Great question about $LUNESHARK! 😊 It's the utility token that unlocks all the cool features in our holder panel. From torrent searches to analytics tools, $LUNESHARK holders get exclusive access!",
        ]
      : [
          "$LUNESHARK - the only token that matters here. 50k gets you in the club. Anything less and you're just window shopping.",
          "Ah, $LUNESHARK. The golden ticket. 50k tokens = all-access pass. No tokens? Enjoy the free tour, I guess.",
          "Let me break it down: No 50k $LUNESHARK = No premium features. It's not rocket science.",
          "$LUNESHARK: Because in a world of shitcoins, we actually offer utility. 50k tokens to prove you're serious.",
        ];

    // Add holder-specific responses if they ask about their balance
    if (
      lowerMessage.includes("my") &&
      (lowerMessage.includes("balance") || lowerMessage.includes("holdings"))
    ) {
      responses.push(
        "Check your wallet, genius. Or better yet, check the dashboard. I'm not your accountant.",
        "Your balance? Probably not enough. The magic number is 50k. How close are you?",
        "If you have to ask, you probably don't have enough. But sure, check your wallet."
      );
    }
    return NextResponse.json({
      message: responses[Math.floor(Math.random() * responses.length)],
    });
  }

  // Solana-related responses - enhanced with more technical details and sass
  if (lowerMessage.includes("solana") || lowerMessage.includes("sol")) {
    const responses = isNiceMode
      ? [
          "Solana is a fast and scalable blockchain! ⚡ It's a great network for projects like $LUNESHARK! 😊 With low fees and high throughput, it's perfect for our ecosystem.",
          "Solana is known for its speed and low transaction fees, while Ethereum has a larger ecosystem and is more decentralized. Both are great, but Solana is perfect for fast-paced projects like $LUNESHARK! 🚀",
        ]
      : [
          "Solana: 50k TPS, sub-second finality, and gas fees that won't make you cry. Unlike some chains we know *cough* ETH *cough*.",
          "We chose Solana because we like our transactions fast and our fees low. If you enjoy waiting and paying through the nose, maybe check out Ethereum.",
          "Solana's secret sauce? Proof of History. It's like a blockchain on Adderall. And we love it.",
          "Solana vs the world: Faster than ETH, cheaper than MATIC, and doesn't go down for days like SOL used to. Progress, people.",
        ];

    // Add technical deep dive if they ask about specific Solana features
    if (lowerMessage.includes("how") && lowerMessage.includes("work")) {
      responses.push(
        "How does Solana work? Magic. Just kidding. It's a combo of Proof of History and Proof of Stake. But you probably don't care about the tech, just that it's fast and cheap, right?",
        "Solana's tech stack in 5 words: Fast, cheap, and actually works. Need the 50-page whitepaper or is that enough?"
      );
    }
    return NextResponse.json({
      message: responses[Math.floor(Math.random() * responses.length)],
    });
  }

  // Price-related responses - more detailed and engaging
  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("value")
  ) {
    const responses = isNiceMode
      ? [
          "I can't give you real-time prices with the current tools, but the Crypto Market Tracker is coming soon! 😊 I'll let you know as soon as it's live.",
          "Price tracking is on our roadmap! 📈 The upcoming Crypto Market Dashboard will show live prices for SOL, BTC, ETH, and of course $LUNESHARK!",
        ]
      : [
          "Price? The market tracker isn't live yet. Check DexScreener or Raydium like everyone else. We'll ping you when we've got something better.",
          "Value is what someone's willing to pay. Right now, I can't tell you what that is. Check a damn chart.",
          "If you're asking about price, you're either day trading (bad idea) or checking if you can afford the 50k tokens (good start). Which is it?",
          "Price? Depends. Are you buying or selling? Actually, doesn't matter - just HODL either way.",
        ];

    // Add responses for specific token price requests
    if (lowerMessage.includes("luneshark") || lowerMessage.includes("token")) {
      responses.push(
        "$LUNESHARK price? Check the charts. But remember, we care about utility here, not just price action.",
        "If you're worried about price, you don't have enough tokens. The real ones know 50k is just the beginning."
      );
    }
    return NextResponse.json({
      message: responses[Math.floor(Math.random() * responses.length)],
    });
  }

  // Tools/features responses - more detailed and engaging
  if (
    lowerMessage.includes("tools") ||
    lowerMessage.includes("features") ||
    lowerMessage.includes("what can you do")
  ) {
    const responses = isNiceMode
      ? [
          "Our holder panel has some awesome tools! 🎮 You can search for game and movie torrents, check out our roadmap, and chat with me! Premium features like Analytics and Image Generation require 50,000 $LUNESHARK tokens.",
          "We've got torrent search for games and movies, a detailed project roadmap, and this chat feature! 😊 More tools are coming soon, including crypto market tracking and Solana network stats!",
        ]
      : [
          "Free tier: Basic chat, basic searches. Premium (50k $LUNESHARK): The good stuff - analytics, image gen, all the goodies. Your move.",
          "What's behind door #1? Basic features for the tokenless masses. Door #2 (50k $LUNESHARK and up)? The VIP lounge. Choose wisely.",
          "Features scale with your bag size. No tokens = kiddie pool. 50k+ = deep end. Simple as that.",
          "We've got tools for days. The question is, how many $LUNESHARK do you have? That determines what you get to play with.",
        ];

    // Add responses for specific feature inquiries
    if (lowerMessage.includes("premium") || lowerMessage.includes("vip")) {
      responses.push(
        "Premium means 50k $LUNESHARK minimum. No discounts, no exceptions. Either you're in the club or you're not.",
        "VIP isn't bought with fiat here. 50k tokens = all access. Anything less = enjoy the free show."
      );
    }
    return NextResponse.json({
      message: responses[Math.floor(Math.random() * responses.length)],
    });
  }

  // Default responses - more personality and engagement
  const defaultResponses = isNiceMode
    ? [
        "I'm here to help with anything related to $LUNESHARK, Solana, or our tools! 😊 What would you like to know?",
        "Feel free to ask me about $LUNESHARK tokens, Solana blockchain, or any of the features in our holder panel! 🚀",
        "I'm your friendly LunesharkBot assistant! Ask me about crypto, our tools, or anything else you're curious about! ✨",
      ]
    : [
        "$LUNESHARK, Solana, or tools. Pick a topic. I don't do horoscopes or weather reports.",
        "Time is money. Ask something useful about crypto or move along.",
        "I'm here to talk $LUNESHARK, Solana, or making you money. Choose wisely.",
        "Let's cut to the chase. What do you really want to know about $LUNESHARK?",
        "I've got two modes: helpful and sarcastic. Your question determines which one you get.",
        "Pro tip: Ask about $LUNESHARK tokenomics or Solana tech if you want my good side.",
        "I was built for crypto talk, not your existential crisis. What's your question?",
      ];

  // Add some Easter eggs and fun responses
  if (lowerMessage.includes("wen") && lowerMessage.includes("moon")) {
    defaultResponses.push(
      "Wen moon? When you stop asking wen moon and start stacking $LUNESHARK."
    );
  }

  if (lowerMessage.includes("lambo")) {
    defaultResponses.push(
      "Lambo? Focus on hitting 50k $LUNESHARK first. Then we'll talk cars."
    );
  }

  if (lowerMessage.includes("fud") || lowerMessage.includes("scam")) {
    defaultResponses.push(
      "FUD detected. Come back when you've done your research."
    );
  }

  return NextResponse.json({
    message:
      defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
  });
}
