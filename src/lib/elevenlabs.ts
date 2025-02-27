
// Improved ElevenLabs integration with better error handling

export const initializeElevenLabs = async () => {
  const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  
  try {
    // Use a simple endpoint that's less likely to have CORS issues
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: {
        "Accept": "application/json",
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key. Please check your key in Settings.");
      } else {
        throw new Error(`ElevenLabs API error (${response.status}): ${response.statusText}`);
      }
    }
    
    return apiKey;
  } catch (error) {
    console.error("Error validating ElevenLabs API key:", error);
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    // Re-throw the error with a user-friendly message
    throw error instanceof Error ? error : new Error("Unknown error connecting to ElevenLabs.");
  }
};

// Using a stable model for voice generation
export const ELEVENLABS_MODEL_ID = "eleven_monolingual_v1"; // Using the most stable model
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

// Helper function to wait for a specified time
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Formatted URL builder to make sure we're using the correct endpoint
export const getElevenLabsUrl = (voiceId: string) => {
  return `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${ELEVENLABS_MODEL_ID}`;
};
