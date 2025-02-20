
import { useConversation } from "@11labs/react";

// Initialize ElevenLabs with the API key from localStorage
const initializeElevenLabs = () => {
  const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found. Please set up your API key first.');
  }
  
  // The initialization happens automatically when using useConversation
  // We just need to ensure the API key is available
  return apiKey;
};

// Export the initialization function
export { initializeElevenLabs };
