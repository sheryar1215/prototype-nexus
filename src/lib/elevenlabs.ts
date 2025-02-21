
export const initializeElevenLabs = async () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  
  // Add specific error for missing API key
  if (!apiKey) {
    console.error("ElevenLabs API key not found in localStorage");
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  
  try {
    // Test API key validity with a simple endpoint
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "Accept": "application/json",
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      console.error(`ElevenLabs API Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      console.error("Error details:", errorData);
      throw new Error("Invalid ElevenLabs API key or API connection error. Please check your key.");
    }

    return apiKey;
  } catch (error) {
    console.error("ElevenLabs connection error:", error);
    throw new Error("Failed to connect to ElevenLabs API. Please check your internet connection and try again.");
  }
};

// Using a stable model for voice generation
export const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
export const ELEVENLABS_URL = "wss://api.elevenlabs.io/v1/text-to-speech/";
