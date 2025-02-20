
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  return apiKey;
};

// Using most stable configuration
export const ELEVENLABS_AGENT_ID = "eleven_turbo_v2";
export const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah voice - most reliable for conversations
