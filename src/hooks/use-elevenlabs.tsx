
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useElevenLabs() {
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState("EXAVITQu4vr4xnSDxMaL"); // Sarah's voice ID
  const { toast } = useToast();
  
  useEffect(() => {
    checkApiKey();
    
    const savedVoiceId = localStorage.getItem("ELEVENLABS_VOICE_ID");
    if (savedVoiceId) {
      setSelectedVoiceId(savedVoiceId);
    }
  }, []);

  const checkApiKey = async () => {
    if (isCheckingApiKey) return false;
    
    try {
      setIsCheckingApiKey(true);
      const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
      
      if (!apiKey) {
        setApiKeyValid(false);
        setIsCheckingApiKey(false);
        return false;
      }
      
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
      
      // Parse response to check subscription status
      const data = await response.json();
      if (data.subscription?.status === "free") {
        toast({
          title: "Free Tier Limitations",
          description: "You're using a free ElevenLabs account. Some features may be limited.",
        });
      }
      
      setApiKeyValid(true);
      setIsCheckingApiKey(false);
      return true;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      setIsCheckingApiKey(false);
      
      if (localStorage.getItem("ELEVENLABS_API_KEY")) {
        toast({
          variant: "destructive",
          title: "Voice Feedback Unavailable",
          description: error.message || "Please check your ElevenLabs API key in Settings",
        });
      }
      return false;
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
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
