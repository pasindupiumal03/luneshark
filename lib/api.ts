import axios from "axios";

const DEXSCREENER_BASE_API_URL = "https://api.dexscreener.com";
const SOLANA_TRACKER_API_URL = "https://data.solanatracker.io";
const SOLANA_TRACKER_API_KEY = "ccebdde5-d68f-49ca-b2d9-83b62db5c29d";

export const getTrendingTokens = async () => {
  try {
    const response = await axios.get(
      `${SOLANA_TRACKER_API_URL}/tokens/trending`,
      {
        headers: { "x-api-key": SOLANA_TRACKER_API_KEY },
      }
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      return { tokens: [] };
    }
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    return { tokens: [] };
  }
};

export const getTokenData = async (address: string) => {
  try {
    const response = await axios.get(
      `${SOLANA_TRACKER_API_URL}/tokens/${address}`,
      {
        headers: { "x-api-key": SOLANA_TRACKER_API_KEY },
      }
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.warn("No data found for address:", address);
      return null;
    }
  } catch (error) {
    console.error("Error fetrching token data: ", error);
    return null;
  }
};
