
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  // Log the first two characters to help debug (we won't show the whole key for security)
  console.log("API Key starts with:", apiKey.substring(0, 2));
  
  // Validate API key format (starts with "sk" and contains underscore)
  if (!apiKey.startsWith("sk")) {
    throw new Error("Invalid ElevenLabs API key format. Your key should start with 'sk'.");
  }
  
  if (!apiKey.includes("_")) {
    throw new Error("Invalid ElevenLabs API key format. Your key should contain an underscore.");
  }

  return apiKey;
};

// Updated to use correct format for the agent ID
export const ELEVENLABS_AGENT_ID = "eleven_monolingual_v1";
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Professional male voice
