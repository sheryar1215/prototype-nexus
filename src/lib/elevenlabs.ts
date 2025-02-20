
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found");
  }
  return apiKey;
};

export const ELEVENLABS_AGENT_ID = "sales-coach"; // You'll replace this with your agent ID
export const ELEVENLABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Professional male voice
