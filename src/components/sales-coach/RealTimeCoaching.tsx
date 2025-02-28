
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { 
  initializeElevenLabs, 
  getElevenLabsUrl, 
  ELEVENLABS_MODEL_ID, 
  ELEVENLABS_VOICE_ID 
} from "@/lib/elevenlabs";

export function RealTimeCoaching() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coachingResponse, setCoachingResponse] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is valid on mount
    checkApiKey();
    
    // Cleanup on unmount
    return () => {
      stopRecording();
    };
  }, []);

  const checkApiKey = async () => {
    try {
      await initializeElevenLabs();
      setApiKeyValid(true);
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      toast({
        variant: "destructive",
        title: "API Key Error",
        description: error.message || "Please add a valid ElevenLabs API key in Settings",
      });
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      toast({
        variant: "destructive",
        title: "Microphone Required",
        description: "Please allow microphone access to use this feature.",
      });
      return false;
    }
  };

  const startRecording = async () => {
    // First check if API key is valid
    if (!apiKeyValid) {
      await checkApiKey();
      if (!apiKeyValid) return;
    }

    // Then check microphone permissions
    const hasMicPermission = await requestMicrophonePermission();
    if (!hasMicPermission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await processUserSpeech(audioBlob);
        setIsProcessing(false);
      };

      mediaRecorder.start(1000); // Collect data in 1-second chunks
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak now. Recording will automatically process after you stop.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not start recording. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
        // Stop all audio tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        toast({
          title: "Recording Stopped",
          description: "Processing your speech...",
        });
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  const processUserSpeech = async (audioBlob: Blob) => {
    try {
      // In a real implementation, you would send this to a server for speech-to-text
      // and then process it with an AI coach
      const coachingFeedback = await getAIAnalysis(audioBlob);
      setCoachingResponse(coachingFeedback);
      await playCoachingResponse(coachingFeedback);
    } catch (error) {
      console.error("Error processing speech:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Could not process your speech. Please try again.",
      });
    }
  };

  const getAIAnalysis = async (audioBlob: Blob): Promise<string> => {
    // This is a mock implementation
    // In a real implementation, you would:
    // 1. Convert the audio to text using a speech-to-text service
    // 2. Send the text to an AI model for analysis
    // 3. Return the AI's response
    
    // For now, we'll return a mock response based on the audio length
    const audioLength = audioBlob.size;
    
    if (audioLength < 100000) {
      return "Your sales pitch was too brief. Try to elaborate more on the product benefits and value proposition.";
    } else if (audioLength < 500000) {
      return "Good start! Your pitch had a nice pace, but consider adding more specific examples of how the product can solve customer problems.";
    } else {
      return "Excellent detailed pitch! Your tone was confident and you covered the main selling points well. Consider adding a stronger call to action at the end.";
    }
  };

  const playCoachingResponse = async (text: string) => {
    if (!text || !apiKeyValid) return;
    
    try {
      setIsSpeaking(true);
      
      // Get the API key
      const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
      if (!apiKey) {
        throw new Error("ElevenLabs API key not found");
      }
      
      // Create the WebSocket URL
      const wsUrl = getElevenLabsUrl(ELEVENLABS_VOICE_ID);
      console.log("Connecting to ElevenLabs:", wsUrl);
      
      // Create the WebSocket connection
      const ws = new WebSocket(wsUrl);
      
      let audioContext: AudioContext | null = null;
      let audioQueue: AudioBuffer[] = [];
      let isPlaying = false;
      
      const playNextInQueue = () => {
        if (!audioContext || audioQueue.length === 0 || isPlaying) return;
        
        isPlaying = true;
        const audioBuffer = audioQueue.shift()!;
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          isPlaying = false;
          playNextInQueue();
        };
        
        source.start(0);
      };
      
      ws.onopen = () => {
        console.log("WebSocket connection established");
        
        // Initialize AudioContext when connection is open
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Use the BOS/EOS format for ElevenLabs streaming API
        const bosMessage = {
          text: text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          },
          xi_api_key: apiKey,
          model_id: ELEVENLABS_MODEL_ID
        };
        
        ws.send(JSON.stringify(bosMessage));
      };
      
      ws.onmessage = async (event) => {
        try {
          const response = JSON.parse(event.data);
          
          // Handle audio chunk
          if (response.audio) {
            const audioData = atob(response.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            
            if (audioContext) {
              try {
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioQueue.push(audioBuffer);
                
                if (!isPlaying) {
                  playNextInQueue();
                }
              } catch (error) {
                console.error("Error decoding audio data:", error);
              }
            }
          }
          
          // Handle error
          if (response.error) {
            console.error("ElevenLabs WebSocket error:", response.error);
            throw new Error(response.error);
          }
          
          // Handle end of stream
          if (response.isFinal) {
            console.log("End of speech stream");
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsSpeaking(false);
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: "Error playing coaching response. Please try again.",
        });
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setIsSpeaking(false);
        
        // Cleanup
        if (audioContext) {
          audioContext.close().catch(console.error);
        }
      };
      
      // Set a timeout to close the connection if it takes too long
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }, 30000); // 30 seconds timeout
      
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error("Error playing coaching response:", error);
      setIsSpeaking(false);
      toast({
        variant: "destructive",
        title: "Speech Error",
        description: "Could not play coaching response. Please try again.",
      });
    }
  };

  return (
    <div className="glass rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold">Real-Time Coaching</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Start speaking and get instant coaching feedback on your sales pitch!
      </p>
      
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!apiKeyValid || isProcessing || isSpeaking}
          className={isRecording ? "bg-destructive hover:bg-destructive/90" : ""}
        >
          {isRecording ? (
            <>
              <MicOff className="mr-2" />
              Stop Recording
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Mic className="mr-2" />
              Start Speaking
            </>
          )}
        </Button>
      </div>
      
      {isSpeaking && (
        <div className="mt-6 flex items-center justify-center">
          <div className="glass animate-pulse rounded-full p-4">
            <Volume2 className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      
      {coachingResponse && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Coach Feedback:</h3>
          <p>{coachingResponse}</p>
        </div>
      )}
      
      {!apiKeyValid && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          <p className="text-sm">
            Please add your ElevenLabs API key in the Settings page to use this feature.
          </p>
        </div>
      )}
    </div>
  );
}
