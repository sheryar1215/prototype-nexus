
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { getAIAnalysis, playAudioResponse } from "@/utils/speech-utils";
import { RecordingButton } from "./RecordingButton";
import { CoachingResponse } from "./CoachingResponse";
import { ApiKeyWarning } from "./ApiKeyWarning";
import { VoiceSelector } from "./VoiceSelector";
import { Volume2 } from "lucide-react";

export function RealTimeCoaching() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachingResponse, setCoachingResponse] = useState("");
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isRecording,
    isProcessing,
    recordedAudio,
    startRecording,
    stopRecording,
    getRecordedAudio,
    saveRecording,
    completeProcessing
  } = useVoiceRecorder();
  
  const {
    apiKeyValid,
    checkApiKey,
    getVoiceUrl,
    modelId,
    voiceId,
    setVoiceId
  } = useElevenLabs();

  // Handle navigation to settings page
  const navigateToSettings = () => {
    navigate("/settings");
  };

  // Auto-play audio feedback when a coaching response is received
  useEffect(() => {
    const playFeedback = async () => {
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

    playFeedback();
  }, [coachingResponse, apiKeyValid]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      
      toast({
        title: "Processing",
        description: "Coach is listening to your pitch...",
      });
      
      const audioBlob = await getRecordedAudio();
      
      if (audioBlob) {
        try {
          // Get AI analysis of the sales pitch
          const coachingFeedback = await getAIAnalysis(audioBlob);
          setCoachingResponse(coachingFeedback);
          
          // Audio feedback will automatically be played by the useEffect above
          if (!apiKeyValid) {
            toast({
              variant: "warning",
              title: "Voice Feedback Unavailable",
              description: "Add your ElevenLabs API key in Settings to hear verbal feedback.",
            });
          }
        } catch (error) {
          console.error("Error processing speech:", error);
          toast({
            variant: "destructive",
            title: "Processing Error",
            description: "Could not process your speech. Please try again.",
          });
          setIsSpeaking(false);
        } finally {
          completeProcessing();
        }
      }
    } else {
      // First check if API key is valid
      if (!apiKeyValid) {
        const isValid = await checkApiKey();
        if (!isValid) {
          toast({
            variant: "warning",
            title: "API Key Missing",
            description: "Please add your ElevenLabs API key in Settings for voice coaching.",
          });
        }
      }
      
      // Clear previous coaching response
      setCoachingResponse("");
      setAudioPlaybackError(null);
      
      // Start recording
      const success = await startRecording();
      if (success) {
        toast({
          title: "Recording Started",
          description: "Speak your sales pitch clearly into the microphone.",
        });
      }
    }
  };

  // Retry audio playback if there was an error
  const retryAudioPlayback = async () => {
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

  return (
    <div className="glass rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold">Real-Time Coaching</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Start speaking and get instant coaching feedback on your sales pitch!
      </p>
      
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <VoiceSelector 
          selectedVoiceId={voiceId} 
          onVoiceChange={setVoiceId} 
          disabled={isRecording || isProcessing || isSpeaking}
        />
      </div>
      
      <RecordingButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        apiKeyValid={true} // Allow recording even without API key
        onToggleRecording={toggleRecording}
      />
      
      {isSpeaking && (
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="glass animate-pulse rounded-full p-4 mb-2">
            <Volume2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Coach is speaking...</p>
        </div>
      )}
      
      <CoachingResponse
        coachingResponse={coachingResponse}
        isSpeaking={isSpeaking}
        recordedAudio={recordedAudio}
        onSaveRecording={saveRecording}
      />
      
      {audioPlaybackError && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
          <p className="text-sm font-medium">Audio playback error: {audioPlaybackError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-red-200 hover:bg-red-300 border-red-300" 
            onClick={retryAudioPlayback}
          >
            Retry Speech
          </Button>
        </div>
      )}
      
      <ApiKeyWarning 
        apiKeyValid={apiKeyValid} 
        onSettingsClick={navigateToSettings}
      />
    </div>
  );
}
