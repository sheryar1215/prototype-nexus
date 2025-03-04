
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { getAIAnalysis } from "@/utils/speech-utils";
import { RecordingButton } from "./RecordingButton";
import { CoachingResponse } from "./CoachingResponse";
import { ApiKeyWarning } from "./ApiKeyWarning";
import { VoiceSelector } from "./VoiceSelector";
import { SpeakingIndicator } from "./SpeakingIndicator";
import { AudioErrorMessage } from "./AudioErrorMessage";

export function RealTimeCoaching() {
  const [coachingResponse, setCoachingResponse] = useState("");
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

  const {
    isSpeaking,
    audioPlaybackError,
    setAudioPlaybackError,
    playFeedback,
    retryAudioPlayback
  } = useAudioPlayback();

  // Handle navigation to settings page
  const navigateToSettings = () => {
    navigate("/settings");
  };

  // Auto-play audio feedback when a coaching response is received
  useEffect(() => {
    playFeedback(coachingResponse, apiKeyValid, voiceId, modelId, getVoiceUrl);
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
              variant: "default",
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
            variant: "default",
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
  const handleRetryAudioPlayback = () => {
    retryAudioPlayback(coachingResponse, apiKeyValid, voiceId, modelId, getVoiceUrl);
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
      
      {isSpeaking && <SpeakingIndicator />}
      
      <CoachingResponse
        coachingResponse={coachingResponse}
        isSpeaking={isSpeaking}
        recordedAudio={recordedAudio}
        onSaveRecording={saveRecording}
      />
      
      {audioPlaybackError && (
        <AudioErrorMessage 
          errorMessage={audioPlaybackError}
          onRetry={handleRetryAudioPlayback}
        />
      )}
      
      <ApiKeyWarning 
        apiKeyValid={apiKeyValid} 
        onSettingsClick={navigateToSettings}
      />
    </div>
  );
}
