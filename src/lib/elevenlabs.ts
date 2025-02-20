
export const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }

  // Only log for debugging
  console.log("API Key validation starting...");
  
  // Basic validation
  if (!apiKey.trim()) {
    throw new Error("ElevenLabs API key cannot be empty.");
  }

  return apiKey;
};

// Using stable model and voice IDs that are known to work
export const ELEVENLABS_AGENT_ID = "eleven_monolingual_v1";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
