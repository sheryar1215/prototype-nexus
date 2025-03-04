
// Improved ElevenLabs integration with better error handling and debugging

// Default API key from environment variable (if available)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";

export const initializeElevenLabs = async () => {
  // Try to get API key from localStorage or use the environment variable
  const storedApiKey = localStorage.getItem("ELEVENLABS_API_KEY");
  const apiKey = storedApiKey || ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found. Please add your API key in Settings.");
  }
  
  try {
    console.log("Validating ElevenLabs API key...");
    
    // Use a simple endpoint that's less likely to have CORS issues
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: {
        "Accept": "application/json",
        "xi-api-key": apiKey // This is the correct header for ElevenLabs API
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key. Please check your key in Settings.");
      } else {
        throw new Error(`ElevenLabs API error (${response.status}): ${response.statusText}`);
      }
    }
    
    console.log("ElevenLabs API key is valid");
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

// Using a stable model for voice generation - increased stability
export const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"; // Using better model for more natural speech
export const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

// Helper function to wait for a specified time
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Formatted URL builder to make sure we're using the correct endpoint
export const getElevenLabsUrl = (voiceId: string) => {
  return `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${ELEVENLABS_MODEL_ID}`;
};

// List of available voices with their IDs
export const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Default)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam" },
];
