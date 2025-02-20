
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  // Log the first two characters to help debug (we won't show the whole key for security)
  console.log("API Key starts with:", apiKey.substring(0, 2));
  
  // Validate API key format (must start with "11" and be at least 32 characters)
  if (!apiKey.startsWith("11")) {
    throw new Error("Invalid ElevenLabs API key format. Your key starts with '" + apiKey.substring(0, 2) + "' but it should start with '11'. Please make sure you're using an ElevenLabs API key from elevenlabs.io.");
  }
  
  if (apiKey.length < 32) {
    throw new Error("Invalid ElevenLabs API key length. The key should be at least 32 characters long.");
  }

  return apiKey;
};

// Updated to use Eleven Labs' default agent ID format
export const ELEVENLABS_AGENT_ID = "11labs/sales-coach-v1";
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Professional male voice
