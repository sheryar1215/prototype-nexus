
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { playAudioResponse } from "@/utils/speech-utils";

export function useAudioPlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const playFeedback = async (
    coachingResponse: string,
    apiKeyValid: boolean,
    voiceId: string,
    modelId: string,
    getVoiceUrl: (voiceId: string) => string
  ) => {
    if (coachingResponse && !isSpeaking && apiKeyValid) {
      const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
      if (apiKey) {
        try {
          setAudioPlaybackError(null);
          setIsSpeaking(true);
          
          toast({
            title: "Coach Speaking",
            description: "Listen to the feedback from your sales coach.",
          });
          
          await playAudioResponse(
            coachingResponse,
            apiKey,
            voiceId,
            modelId,
            getVoiceUrl,
            setIsSpeaking,
            (error) => {
              console.error("Speech playback error:", error);
              setAudioPlaybackError(error.message);
              toast({
                variant: "destructive",
                title: "Speech Error",
                description: error.message,
              });
              setIsSpeaking(false);
            }
          );
        } catch (error) {
          console.error("Error playing audio feedback:", error);
          setIsSpeaking(false);
          setAudioPlaybackError(error instanceof Error ? error.message : "Unknown error occurred");
        }
      }
    }
  };

  const retryAudioPlayback = async (
    coachingResponse: string,
    apiKeyValid: boolean,
    voiceId: string,
    modelId: string,
    getVoiceUrl: (voiceId: string) => string
  ) => {
    if (coachingResponse && apiKeyValid) {
      setAudioPlaybackError(null);
      const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
      
      if (apiKey) {
        try {
          setIsSpeaking(true);
          await playAudioResponse(
            coachingResponse,
            apiKey,
            voiceId,
            modelId,
            getVoiceUrl,
            setIsSpeaking,
            (error) => {
              setAudioPlaybackError(error.message);
              setIsSpeaking(false);
            }
          );
        } catch (error) {
          console.error("Error retrying audio playback:", error);
          setIsSpeaking(false);
        }
      }
    }
  };

  return {
    isSpeaking,
    audioPlaybackError,
    setAudioPlaybackError,
    playFeedback,
    retryAudioPlayback
  };
}
