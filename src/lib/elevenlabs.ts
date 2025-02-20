
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found");
  }
  return apiKey;
};

// Updated to use Eleven Labs' default agent ID format
export const ELEVENLABS_AGENT_ID = "11labs/sales-coach-v1";
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Professional male voice
