
export const initializeElevenLabs = async () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  
  // Validate the API key before returning it
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "Accept": "application/json",
      "xi-api-key": apiKey
    }
  });

  if (!response.ok) {
    throw new Error("Invalid ElevenLabs API key. Please check your key in Settings.");
  }

  return apiKey;
};

// Using a stable model for voice generation
export const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

