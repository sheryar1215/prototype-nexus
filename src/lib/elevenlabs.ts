
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  // Only log for debugging
  console.log("API Key validation starting...");
  
  // Basic validation - just check if it exists and starts with sk_
  if (!apiKey.startsWith("sk_")) {
    throw new Error("Invalid ElevenLabs API key format. Your key should start with 'sk_'.");
  }

  return apiKey;
};

// Using the correct model ID for the latest ElevenLabs API
export const ELEVENLABS_AGENT_ID = "eleven_turbo_v2";
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV";
