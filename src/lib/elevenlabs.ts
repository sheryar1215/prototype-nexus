
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  console.log("API Key validation starting...");
  return apiKey;
};

// Using more stable configurations
export const ELEVENLABS_AGENT_ID = "eleven_english_sts_v2";
export const ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam voice
