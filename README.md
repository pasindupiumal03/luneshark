# Plio Holder Panel

A Next.js application for $Plio token holders featuring exclusive tools and utilities.

## Features

- 🎮 **Torrent Game Search** - Search and download PC games
- 🎬 **Movie Torrent Search** - Find and download movies
- 🤖 **PlioBot Chat** - AI-powered assistant with Nice/Crude modes
- 📊 **Crypto Market Overview** - Live cryptocurrency prices
- 🗺️ **Project Roadmap** - View upcoming features
- 💰 **Phantom Wallet Integration** - Connect your Solana wallet
- 🔒 **Token-Gated Features** - Premium features for 50k+ $Plio holders

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Phantom Wallet browser extension (for wallet features)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd plio-website
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Add your API keys to `.env.local`:
\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys Required

### OpenAI API Key
- Used for PlioBot chat functionality
- Get your key from: https://platform.openai.com/api-keys
- Add to `.env.local` as `OPENAI_API_KEY`

### CoinMarketCap API Key
- Used for live cryptocurrency price data
- Get your free key from: https://coinmarketcap.com/api/
- Add to `.env.local` as `COINMARKETCAP_API_KEY`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   ├── particles-background.tsx
│   ├── torrent-game-search.tsx
│   ├── torrent-movie-search.tsx
│   ├── plio-bot.tsx
│   ├── crypto-market.tsx
│   ├── project-roadmap.tsx
│   └── notification.tsx
├── services/             # API service functions
├── public/              # Static assets
└── ...config files
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features Overview

### Token-Gated Access
- **Free Features**: Games, Movies, Roadmap, PlioBot, Crypto Market
- **Premium Features** (50k+ $Plio): Analytics, Image Generation

### Wallet Integration
- Connect Phantom wallet to view $Plio balance
- Automatic feature access based on token holdings
- Secure wallet connection with disconnect option

### PlioBot AI Assistant
- **Nice Mode**: Friendly, helpful responses with emojis
- **Crude Mode**: Direct, no-nonsense responses
- Real-time chat with conversation history
- Powered by OpenAI GPT-3.5-turbo

### Crypto Market Dashboard
- Live prices from CoinMarketCap API
- Large Cap cryptocurrencies (BTC, ETH, SOL, etc.)
- Popular meme coins (DOGE, SHIB, PEPE, etc.)
- Real-time price updates and 24h changes

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for chat functionality | Yes |
| `COINMARKETCAP_API_KEY` | CoinMarketCap API key for crypto prices | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support or questions, please contact the development team.
