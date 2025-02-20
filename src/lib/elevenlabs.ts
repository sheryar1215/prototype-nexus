
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  console.log("API Key validation starting...");
  return apiKey;
};

// Using most stable configuration for speech to speech model
export const ELEVENLABS_AGENT_ID = "eleven_english_sts_v2";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice - most stable option
