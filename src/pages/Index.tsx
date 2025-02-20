
import { useState, useEffect } from "react";
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

  useEffect(() => {
    try {
      initializeElevenLabs();
      setApiKeyValid(true);
    } catch (error) {
      setApiKeyValid(false);
      toast({
        variant: "destructive",
        title: "API Key Error",
        description: "Please set up your ElevenLabs API key in Settings to use the conversation feature.",
      });
    }
  }, [toast]);

  const conversation = useConversation({
    overrides: {
      agent: {
        prompt: {
          prompt: `You are an experienced sales coach. You are helping a salesperson practice ${selectedScenario.title}. 
          Provide constructive feedback and guidance based on their responses. Be encouraging but honest in your feedback.
          Focus on helping them improve their approach and techniques.`,
        },
        firstMessage: `Let's practice ${selectedScenario.title}. I'll play the role of a potential customer, and you'll be the salesperson. 
        Remember to be natural and confident. Are you ready to begin?`,
        language: "en",
      },
      tts: {
        voiceId: ELEVENLABS_VOICE_ID
      },
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation. Please check your API key and try again.",
      });
      setIsRecording(false);
    },
  });

  const startConversation = async () => {
    if (!apiKeyValid) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please set up your ElevenLabs API key in Settings first.",
      });
      return false;
    }

    try {
      // Request microphone access before starting the session
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation session
      await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
      });
      
      toast({
        title: "Conversation Started",
        description: "You can now begin the sales practice scenario.",
      });
      
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("Start conversation error:", error);
      
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use this feature.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start conversation. Please try again.",
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
        await conversation.endSession();
        setIsRecording(false);
        setIsInitialized(false);
        toast({
          title: "Practice Session Ended",
          description: "Your sales practice session has ended.",
        });
      } catch (error: any) {
        console.error("End conversation error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to end conversation properly.",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (isInitialized) {
        conversation.endSession();
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
            Practice your sales skills with our AI-powered coach. Choose a scenario and start practicing.
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
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2" />
                  Stop Practice
                </>
              ) : (
                <>
                  <Mic className="mr-2" />
                  Start Practice
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
