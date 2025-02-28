
import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { 
  initializeElevenLabs, 
  ELEVENLABS_MODEL_ID, 
  ELEVENLABS_VOICE_ID, 
  delay, 
  getElevenLabsUrl 
} from "../lib/elevenlabs";
import { Button } from "@/components/ui/button";
import { ScenarioSelection, Scenario } from "@/components/sales-coach/ScenarioSelection";
import { RecordingControls } from "@/components/sales-coach/RecordingControls";
import { Instructions } from "@/components/sales-coach/Instructions";
import { RealTimeCoaching } from "@/components/sales-coach/RealTimeCoaching";

const scenarios: Scenario[] = [
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
  const [showRealTimeCoaching, setShowRealTimeCoaching] = useState(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;

  // Create conversation instance with improved error handling
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs successfully");
      setIsInitialized(true);
      setIsConnecting(false);
      connectionAttempts.current = 0;
      
      toast({
        title: "Connected",
        description: "Successfully connected to ElevenLabs voice assistant.",
      });
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
        stability: 0.3, // Lower for better performance
        similarityBoost: 0.3, // Lower for better performance
        modelId: ELEVENLABS_MODEL_ID
      },
    },
  });

  const checkApiKey = useCallback(async () => {
    try {
      await initializeElevenLabs();
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
          // Wait a moment for cleanup
          await delay(1000);
        } catch (err) {
          console.log("Error ending previous session:", err);
        }
      }
      
      console.log("Starting new session...");
      
      // Use the helper function to get the correct URL format
      const fullUrl = getElevenLabsUrl(ELEVENLABS_VOICE_ID);
      console.log("Connecting to:", fullUrl);
      
      // Add a slight delay before connection attempt
      await delay(500);
      
      try {
        await conversation.startSession({
          url: fullUrl,
        });
        return true;
      } catch (error) {
        console.error("Failed to start session:", error);
        throw error;
      }
      
    } catch (error: any) {
      console.error("Start conversation error:", error);
      setIsConnecting(false);
      
      // Retry logic with exponential backoff
      if (connectionAttempts.current < maxConnectionAttempts) {
        const backoffTime = Math.pow(2, connectionAttempts.current) * 1000;
        
        toast({
          title: "Retrying connection",
          description: `Connection attempt ${connectionAttempts.current} of ${maxConnectionAttempts}. Retrying in ${backoffTime/1000} seconds...`,
        });
        
        // Wait with exponential backoff before retrying
        await delay(backoffTime);
        return startConversation();
      } else {
        connectionAttempts.current = 0;
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Could not connect to ElevenLabs after multiple attempts. Please check your API key and internet connection. You may need to try again later.",
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

  // Handle scenario changes
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        console.log("Component unmounting, cleaning up session...");
        conversation.endSession().catch(console.error);
      }
    };
  }, [isInitialized, conversation]);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const toggleCoachingMode = () => {
    setShowRealTimeCoaching(!showRealTimeCoaching);
    
    // If switching to standard mode and recording is active, stop it
    if (showRealTimeCoaching && isRecording) {
      toggleRecording();
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold">Sales Practice Coach</h1>
            <Button 
              variant="outline" 
              onClick={toggleCoachingMode}
              className="ml-4"
            >
              {showRealTimeCoaching ? "Switch to Standard Mode" : "Switch to Real-Time Coaching"}
            </Button>
          </div>
          
          <p className="mt-4 text-muted-foreground">
            Practice your sales skills with our AI-powered coach.
          </p>

          {showRealTimeCoaching ? (
            <RealTimeCoaching />
          ) : (
            <>
              <ScenarioSelection
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onScenarioChange={handleScenarioChange}
              />

              <RecordingControls
                isRecording={isRecording}
                isConnecting={isConnecting}
                isSpeaking={conversation.isSpeaking}
                apiKeyValid={apiKeyValid}
                onToggleRecording={toggleRecording}
              />

              <Instructions />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
