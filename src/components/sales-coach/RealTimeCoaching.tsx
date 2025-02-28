
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Volume2, Send } from "lucide-react";
import { 
  initializeElevenLabs, 
  getElevenLabsUrl, 
  ELEVENLABS_MODEL_ID, 
  ELEVENLABS_VOICE_ID 
} from "@/lib/elevenlabs";
import { Input } from "@/components/ui/input";

export function RealTimeCoaching() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coachingResponse, setCoachingResponse] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleAskQuestion = async () => {
    if (!question.trim() || !apiKeyValid || isAskingQuestion) return;

    try {
      setIsAskingQuestion(true);
      const response = await getAnswerForQuestion(question);
      setCoachingResponse(response);
      await playCoachingResponse(response);
      setQuestion("");
      setIsAskingQuestion(false);
    } catch (error) {
      console.error("Error asking question:", error);
      setIsAskingQuestion(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process your question. Please try again.",
      });
    }
  };

  const getAnswerForQuestion = async (userQuestion: string): Promise<string> => {
    // This function would normally call an API with the question
    // For now, we'll use predefined responses based on keywords in the question
    const questionLower = userQuestion.toLowerCase();
    
    if (questionLower.includes("objection") || questionLower.includes("reject")) {
      return "When handling objections, remember to listen fully before responding. Acknowledge the concern, ask clarifying questions, and then address the specific issue with relevant benefits. For price objections, focus on value rather than defending the price.";
    } else if (questionLower.includes("close") || questionLower.includes("closing")) {
      return "For effective closing, summarize the key benefits that resonated with the customer. Use assumptive language like 'When we implement this...' rather than 'If...'. Trial closes throughout your presentation help gauge readiness. The best close is one that feels like a natural next step, not a high-pressure tactic.";
    } else if (questionLower.includes("question") || questionLower.includes("ask")) {
      return "Asking effective questions is crucial in sales. Use open-ended questions that start with 'How' or 'What' to understand the customer's situation better. Avoid rapid-fire questioning - give the customer time to respond fully. Good questions to ask include: 'What challenges are you facing with your current solution?' and 'How would solving this problem impact your business goals?'";
    } else if (questionLower.includes("pitch") || questionLower.includes("present")) {
      return "A successful sales pitch follows a clear structure: Start with a compelling hook related to their pain point, briefly introduce your solution, share 2-3 relevant case studies, describe how your product works, emphasize specific benefits (not just features), address potential objections, and end with a clear call to action. Keep your pitch to under 10 minutes when possible.";
    } else if (questionLower.includes("follow up") || questionLower.includes("followup")) {
      return "For effective follow-ups, always reference your previous conversation and add new value with each contact. Wait 3-5 days after the initial meeting, use various channels (email, call, LinkedIn), and be persistent but respectful. A good follow-up sequence might include 5-7 touches over 3-4 weeks before considering the lead inactive.";
    } else {
      return `Regarding your question about ${userQuestion.split(' ').slice(0, 3).join(' ')}..., in sales, it's important to focus on the customer's specific needs rather than generic approaches. Could you provide more details about the specific sales scenario you're facing so I can give you more targeted advice?`;
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAskQuestion();
    }
  };

  return (
    <div className="glass rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold">Real-Time Coaching</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Start speaking and get instant coaching feedback on your sales pitch!
      </p>
      
      {/* Voice recording section */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!apiKeyValid || isProcessing || isSpeaking || isAskingQuestion}
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
      
      {/* Question asking section */}
      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Ask a question about sales scenarios:</h3>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="E.g., How do I handle price objections?"
            className="flex-1"
            disabled={isAskingQuestion || isSpeaking || isRecording}
          />
          <Button
            onClick={handleAskQuestion}
            disabled={!question.trim() || !apiKeyValid || isAskingQuestion || isSpeaking || isRecording}
          >
            {isAskingQuestion ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2 sr-only md:not-sr-only md:inline-flex">Ask</span>
          </Button>
        </div>
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
