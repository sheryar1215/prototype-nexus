
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, PlayCircle } from "lucide-react";
import { initializeElevenLabs, ELEVENLABS_AGENT_ID, ELEVENLABS_VOICE_ID } from "../lib/elevenlabs";

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

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsInitialized(true);
      setIsConnecting(false);
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
        description: "Lost connection to ElevenLabs. Please try again.",
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
        stability: 0.5,
        similarityBoost: 0.5,
      },
    },
  });

  const checkApiKey = useCallback(async () => {
    try {
      const apiKey = initializeElevenLabs();
      if (apiKey) {
        setApiKeyValid(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setApiKeyValid(false);
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your ElevenLabs API key in Settings.",
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const startConversation = async () => {
    if (isConnecting) return false;
    
    try {
      // First check API key
      const isKeyValid = await checkApiKey();
      if (!isKeyValid) {
        return false;
      }

      setIsConnecting(true);

      // Ensure we have microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset any existing session
      if (isInitialized) {
        await conversation.endSession().catch(() => {});
      }
      
      // Add a small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Starting session with agent ID:", ELEVENLABS_AGENT_ID);
      await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
      });
      
      return true;
    } catch (error: any) {
      console.error("Start error:", error);
      setIsConnecting(false);
      
      if (error.name === "NotAllowedError") {
        toast({
          variant: "destructive",
          title: "Microphone Required",
          description: "Please allow microphone access to use this feature.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Could not connect to ElevenLabs. Please try again in a moment.",
        });
      }
      return false;
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
        setIsConnecting(true);
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

  useEffect(() => {
    return () => {
      if (isInitialized) {
        conversation.endSession().catch(console.error);
      }
    };
  }, [isInitialized, conversation]);

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
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
        </div>
      </main>
    </div>
  );
};

export default Index;
