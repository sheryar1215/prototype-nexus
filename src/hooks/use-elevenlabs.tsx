
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  initializeElevenLabs, 
  getElevenLabsUrl, 
  ELEVENLABS_MODEL_ID, 
  ELEVENLABS_VOICE_ID 
} from "@/lib/elevenlabs";

export function useElevenLabs() {
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(ELEVENLABS_VOICE_ID);
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
      await initializeElevenLabs();
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

  return {
    apiKeyValid,
    isCheckingApiKey,
    checkApiKey,
    getVoiceUrl: getElevenLabsUrl,
    modelId: ELEVENLABS_MODEL_ID,
    voiceId: selectedVoiceId,
    setVoiceId: handleVoiceChange
  };
}
