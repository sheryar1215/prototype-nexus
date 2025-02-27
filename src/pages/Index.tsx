
import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, PlayCircle } from "lucide-react";
import { initializeElevenLabs, ELEVENLABS_MODEL_ID, ELEVENLABS_VOICE_ID, ELEVENLABS_URL, delay } from "../lib/elevenlabs";

const scenarios = [
  {
    id: 1,
    title: "Product Introduction",
    description: "Practice introducing your product to a potential customer.",
  },
  {
    id: 2,
    title: "Handling Objections",
    description: "Learn to address common customer concerns and objections.",
  },
  {
    id: 3,
    title: "Closing the Sale",
    description: "Practice different techniques for closing a sale.",
  },
];

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsInitialized(true);
      setIsConnecting(false);
      connectionAttempts.current = 0;
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsInitialized(false);
      setIsRecording(false);
      setIsConnecting(false);
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      setIsRecording(false);
      setIsInitialized(false);
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error?.message || "Could not connect to ElevenLabs. Please try again in a moment.",
      });
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are an experienced sales coach helping with ${selectedScenario.title}. Provide constructive feedback and guidance.`,
        },
        firstMessage: "Hello! I'm your sales coach. Let's start practicing.",
        language: "en",
      },
      tts: {
        voiceId: ELEVENLABS_VOICE_ID,
        stability: 0.5, // Reduced stability for better performance
        similarityBoost: 0.5, // Reduced for better performance
        modelId: ELEVENLABS_MODEL_ID
      },
    },
  });

  const checkApiKey = useCallback(async () => {
    try {
      const apiKey = await initializeElevenLabs();
      console.log("API key validated successfully");
      setApiKeyValid(true);
      return true;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      toast({
        variant: "destructive",
        title: "API Key Error",
        description: error.message,
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const requestMicrophonePermission = async () => {
    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log("Microphone permission granted");
      return true;
    } catch (error: any) {
      console.error("Microphone permission error:", error);
      toast({
        variant: "destructive",
        title: "Microphone Required",
        description: "Please allow microphone access to use this feature.",
      });
      return false;
    }
  };

  const startConversation = async () => {
    if (isConnecting) {
      console.log("Already attempting to connect, please wait...");
      return false;
    }
    
    try {
      setIsConnecting(true);
      connectionAttempts.current += 1;
      
      // Check microphone permission first
      const hasMicPermission = await requestMicrophonePermission();
      if (!hasMicPermission) {
        setIsConnecting(false);
        return false;
      }
      
      // Then check API key
      const isKeyValid = await checkApiKey();
      if (!isKeyValid) {
        setIsConnecting(false);
        return false;
      }

      // Clean up any existing session
      if (isInitialized) {
        console.log("Cleaning up existing session...");
        try {
          await conversation.endSession();
        } catch (err) {
          console.log("Error ending previous session:", err);
        }
        // Wait a moment for cleanup
        await delay(1000);
      }
      
      console.log("Starting new session...");
      // Construct the full URL with the voice ID
      const fullUrl = `${ELEVENLABS_URL}${ELEVENLABS_VOICE_ID}`;
      console.log("Connecting to:", fullUrl);
      
      await conversation.startSession({
        url: fullUrl,
      });
      
      return true;
    } catch (error: any) {
      console.error("Start conversation error:", error);
      setIsConnecting(false);
      
      // Retry logic
      if (connectionAttempts.current < maxConnectionAttempts) {
        toast({
          title: "Retrying connection",
          description: `Connection attempt ${connectionAttempts.current} of ${maxConnectionAttempts}...`,
        });
        // Wait before retrying
        await delay(2000);
        return startConversation();
      } else {
        connectionAttempts.current = 0;
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Could not connect to ElevenLabs after multiple attempts. Please check your API key and internet connection.",
        });
        return false;
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const success = await startConversation();
      if (success) {
        setIsRecording(true);
      }
    } else {
      try {
        console.log("Stopping recording and ending session...");
        await conversation.endSession();
      } catch (error) {
        console.error("End session error:", error);
      } finally {
        setIsRecording(false);
        setIsInitialized(false);
        setIsConnecting(false);
      }
    }
  };

  // Update prompt when scenario changes
  useEffect(() => {
    if (conversation && isInitialized) {
      // If already in a session and scenario changes, restart the session
      console.log("Scenario changed, restarting session...");
      toggleRecording().then(() => {
        if (!isRecording) {
          toggleRecording();
        }
      });
    }
  }, [selectedScenario]);

  useEffect(() => {
    return () => {
      if (isInitialized) {
        console.log("Component unmounting, cleaning up session...");
        conversation.endSession().catch(console.error);
      }
    };
  }, [isInitialized, conversation]);

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <h1 className="text-3xl font-semibold">Sales Practice Coach</h1>
          <p className="mt-4 text-muted-foreground">
            Practice your sales skills with our AI-powered coach.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`glass cursor-pointer rounded-lg p-4 transition-all hover:scale-105 ${
                  selectedScenario.id === scenario.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <h3 className="text-lg font-medium">{scenario.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {scenario.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              size="lg"
              className={isRecording ? "bg-destructive hover:bg-destructive/90" : ""}
              onClick={toggleRecording}
              disabled={!apiKeyValid || isConnecting}
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2" />
                  Stop Practice
                </>
              ) : (
                <>
                  <Mic className="mr-2" />
                  {isConnecting ? "Connecting..." : "Start Practice"}
                </>
              )}
            </Button>
          </div>

          {conversation.isSpeaking && (
            <div className="mt-6 flex items-center justify-center">
              <div className="glass animate-pulse rounded-full p-4">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-medium">Instructions</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-4">
              <li>Select a scenario from the options above</li>
              <li>Click "Start Practice" to begin the conversation</li>
              <li>Speak naturally as if you're talking to a real customer</li>
              <li>The AI coach will respond and provide feedback</li>
              <li>Click "Stop Practice" when you're done</li>
            </ol>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Note: Make sure you've added your ElevenLabs API key in the Settings page and allowed microphone access.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
