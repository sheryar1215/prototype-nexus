
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  
  const playAudioResponse = async (
    text: string,
    apiKey: string,
    voiceId: string,
    modelId: string,
    getVoiceUrl: (voiceId: string) => string,
    onStatusChange: (isSpeaking: boolean) => void,
    onError: (error: Error) => void
  ) => {
    if (!text || !apiKey) {
      onError(new Error("Missing text or API key"));
      return;
    }

    console.info("Starting speech synthesis with text:", text.substring(0, 50) + "...");
    
    try {
      const url = getVoiceUrl(voiceId);
      console.info("Connecting to ElevenLabs for voice feedback:", url);

      const ws = new WebSocket(url);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      let audioQueue: Float32Array[] = [];
      let isPlaying = false;

      ws.onopen = () => {
        console.info("WebSocket connection established for voice feedback");
        
        // Send the API key as the first message
        ws.send(JSON.stringify({
          text: " ", // Send a blank message first
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          },
          xi_api_key: apiKey,
        }));

        // Send the actual text content
        ws.send(JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          },
          xi_api_key: apiKey,
        }));

        // BOS - Beginning of Stream message
        ws.send(JSON.stringify({ bos: true }));

        // EOS - End of Stream message
        ws.send(JSON.stringify({ eos: true }));
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Check for error messages from ElevenLabs
          if (message.error) {
            console.error("ElevenLabs WebSocket error:", message.error);
            onError(new Error(message.error));
            ws.close();
            return;
          }

          // Check for audio chunks
          if (message.audio) {
            const audioData = atob(message.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            
            const decodedData = await audioContext.decodeAudioData(arrayBuffer);
            const decodedBuffer = decodedData.getChannelData(0);
            
            audioQueue.push(decodedBuffer);
            
            if (!isPlaying) {
              isPlaying = true;
              onStatusChange(true);
              playNextInQueue();
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          onError(error instanceof Error ? error : new Error("Error processing audio"));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError(new Error("Connection error"));
      };

      ws.onclose = (event) => {
        console.info("WebSocket connection closed", event.code, event.reason);
        // Only set speaking to false if it wasn't an error
        if (isPlaying) {
          setTimeout(() => {
            onStatusChange(false);
          }, 500); // Small delay to ensure all audio is played
        }
      };

      const playNextInQueue = async () => {
        if (audioQueue.length === 0) {
          isPlaying = false;
          return;
        }

        const audioBuffer = audioQueue.shift();
        if (!audioBuffer) return;

        const source = audioContext.createBufferSource();
        const audioBufferToPlay = audioContext.createBuffer(1, audioBuffer.length, audioContext.sampleRate);
        audioBufferToPlay.getChannelData(0).set(audioBuffer);
        
        source.buffer = audioBufferToPlay;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          playNextInQueue();
        };
        
        source.start();
      };

    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      onError(error instanceof Error ? error : new Error("Failed to connect to voice service"));
    }
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
