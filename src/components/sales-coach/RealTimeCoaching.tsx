
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
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

  const navigateToSettings = () => {
    navigate("/settings");
  };

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
          // For demo purposes, using a sample response
          // In production, you would send the audio to your backend
          completeProcessing();
          const mockResponse = "Your pitch demonstrated good product knowledge. Try connecting features to customer needs and include a stronger call to action. Let's work on making it more customer-focused.";
          setCoachingResponse(mockResponse);
          
          // Attempt to play audio feedback
          await playFeedback(mockResponse, apiKeyValid, voiceId, modelId, getVoiceUrl);
        } catch (error: any) {
          console.error("Error processing speech:", error);
          setAudioPlaybackError(error.message || "Error processing your speech");
          completeProcessing();
          
          toast({
            variant: "destructive",
            title: "Processing Error",
            description: "Could not process your speech. Please try again.",
          });
        }
      }
    } else {
      // First check if API key is valid
      const isValid = await checkApiKey();
      if (!isValid) {
        toast({
          variant: "default",
          title: "API Key Required",
          description: "Please add your ElevenLabs API key in Settings for voice coaching.",
        });
        return;
      }
      
      // Clear previous coaching response and errors
      setAudioPlaybackError(null);
      setCoachingResponse("");
      
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

  const handleRetryAudioPlayback = async () => {
    if (coachingResponse) {
      try {
        await retryAudioPlayback(coachingResponse, apiKeyValid, voiceId, modelId, getVoiceUrl);
        setAudioPlaybackError(null);
      } catch (error: any) {
        console.error("Error retrying audio playback:", error);
        setAudioPlaybackError(error.message || "Failed to play audio feedback");
      }
    }
  };

  return (
    <div className="glass rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold">Real-Time Coaching</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Start speaking and get instant coaching feedback on your sales pitch!
      </p>
      
      <div className="mt-4">
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
        apiKeyValid={true}
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
