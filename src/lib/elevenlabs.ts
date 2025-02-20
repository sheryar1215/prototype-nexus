
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  console.log("API Key validation starting...");
  return apiKey;
};

// Using English-only turbo model which has better connection reliability
export const ELEVENLABS_AGENT_ID = "eleven_turbo_v2";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
