
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  return apiKey;
};

// Using a simpler configuration focused on reliability
export const ELEVENLABS_AGENT_ID = "eleven_turbo_v2";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
