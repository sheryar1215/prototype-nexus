
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found");
  }
  // Validate API key format (should be a string starting with "11" and be at least 32 characters)
  if (!apiKey.startsWith("11") || apiKey.length < 32) {
    throw new Error("Invalid ElevenLabs API key format. Please check your API key in Settings.");
  }
  return apiKey;
};

// Updated to use Eleven Labs' default agent ID format
export const ELEVENLABS_AGENT_ID = "11labs/sales-coach-v1";
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Professional male voice
