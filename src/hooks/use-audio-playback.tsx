
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { playAudioResponse } from "@/utils/speech-utils";

export function useAudioPlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Format error message for toast notifications
  const formatErrorMessage = (error: string): string => {
    if (error === "detected_unusual_activity") {
      return "ElevenLabs detected unusual activity. Please check your account or try again later.";
    }
    return error;
  };
  
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
              const errorMsg = error.message || "Unknown error";
              setAudioPlaybackError(errorMsg);
              
              toast({
                variant: "destructive",
                title: "Speech Error",
                description: formatErrorMessage(errorMsg),
              });
              setIsSpeaking(false);
            }
          );
        } catch (error) {
          console.error("Error playing audio feedback:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
          setIsSpeaking(false);
          setAudioPlaybackError(errorMsg);
          
          toast({
            variant: "destructive",
            title: "Speech Error",
            description: formatErrorMessage(errorMsg),
          });
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
          
          toast({
            title: "Retrying Speech",
            description: "Connecting to ElevenLabs voice service...",
          });
          
          await playAudioResponse(
            coachingResponse,
            apiKey,
            voiceId,
            modelId,
            getVoiceUrl,
            setIsSpeaking,
            (error) => {
              const errorMsg = error.message || "Unknown error";
              setAudioPlaybackError(errorMsg);
              setIsSpeaking(false);
              
              toast({
                variant: "destructive",
                title: "Speech Error",
                description: formatErrorMessage(errorMsg),
              });
            }
          );
        } catch (error) {
          console.error("Error retrying audio playback:", error);
          setIsSpeaking(false);
          
          const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
          setAudioPlaybackError(errorMsg);
          
          toast({
            variant: "destructive",
            title: "Speech Error",
            description: formatErrorMessage(errorMsg),
          });
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
