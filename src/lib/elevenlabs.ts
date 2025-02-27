
export const initializeElevenLabs = async () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  
  // Validate the API key before returning it
  try {
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
  } catch (error) {
    console.error("Error validating ElevenLabs API key:", error);
    throw new Error("Could not connect to ElevenLabs. Please check your internet connection and try again.");
  }
};

// Using a stable model for voice generation
export const ELEVENLABS_MODEL_ID = "eleven_turbo_v2"; // Changed to turbo v2 for better stability
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
export const ELEVENLABS_URL = "wss://api.elevenlabs.io/v1/text-to-speech/";

// Helper function to wait for a specified time
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
