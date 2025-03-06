
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useElevenLabs() {
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState("21m00Tcm4TlvDq8ikWAM"); // Default voice ID
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if API key is valid on mount
    checkApiKey();
    
    // Get saved voice ID from localStorage
    const savedVoiceId = localStorage.getItem("ELEVENLABS_VOICE_ID");
    if (savedVoiceId) {
      setSelectedVoiceId(savedVoiceId);
    }
  }, []);

  const checkApiKey = async () => {
    if (isCheckingApiKey) return false;
    
    try {
      setIsCheckingApiKey(true);
      
      // Get API key from localStorage
      const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
      
      if (!apiKey) {
        setApiKeyValid(false);
        setIsCheckingApiKey(false);
        return false;
      }
      
      // Validate API key with a simple request
      const response = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: {
          "Accept": "application/json",
          "xi-api-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(response.status === 401 
          ? "Invalid ElevenLabs API key" 
          : `ElevenLabs API error (${response.status})`);
      }
      
      setApiKeyValid(true);
      setIsCheckingApiKey(false);
      
      // Show success toast when API key is valid
      toast({
        title: "Voice Coaching Ready",
        description: "ElevenLabs voice is connected. The coach will speak to you.",
      });
      return true;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      setIsCheckingApiKey(false);
      
      // Only show toast if this wasn't an initial check
      if (localStorage.getItem("ELEVENLABS_API_KEY")) {
        toast({
          variant: "destructive",
          title: "Voice Feedback Unavailable",
          description: error.message || "Please add a valid ElevenLabs API key in Settings for voice feedback",
        });
      }
      return false;
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    // Save the selected voice to localStorage for persistence
    localStorage.setItem("ELEVENLABS_VOICE_ID", voiceId);
    
    toast({
      title: "Voice Changed",
      description: "The coach's voice has been updated.",
    });
  };

  const getVoiceUrl = (voiceId: string) => {
    return `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_multilingual_v2`;
  };

  return {
    apiKeyValid,
    isCheckingApiKey,
    checkApiKey,
    getVoiceUrl,
    modelId: "eleven_multilingual_v2",
    voiceId: selectedVoiceId,
    setVoiceId: handleVoiceChange
  };
}
