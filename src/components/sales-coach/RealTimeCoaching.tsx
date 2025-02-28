
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { getAIAnalysis, playAudioResponse } from "@/utils/speech-utils";
import { RecordingButton } from "./RecordingButton";
import { CoachingResponse } from "./CoachingResponse";
import { ApiKeyWarning } from "./ApiKeyWarning";
import { VoiceSelector } from "./VoiceSelector";

export function RealTimeCoaching() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachingResponse, setCoachingResponse] = useState("");
  const { toast } = useToast();
  
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

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      const audioBlob = await getRecordedAudio();
      
      if (audioBlob) {
        try {
          const coachingFeedback = await getAIAnalysis(audioBlob);
          setCoachingResponse(coachingFeedback);
          
          // Get the API key for ElevenLabs
          const apiKey = localStorage.getItem("ELEVENLABS_API_KEY");
          if (apiKey) {
            await playAudioResponse(
              coachingFeedback,
              apiKey,
              voiceId,
              modelId,
              getVoiceUrl,
              setIsSpeaking,
              (error) => {
                toast({
                  variant: "destructive",
                  title: "Speech Error",
                  description: error.message,
                });
              }
            );
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
        await checkApiKey();
        if (!apiKeyValid) return;
      }
      
      startRecording();
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
        apiKeyValid={apiKeyValid}
        onToggleRecording={toggleRecording}
      />
      
      <CoachingResponse
        coachingResponse={coachingResponse}
        isSpeaking={isSpeaking}
        recordedAudio={recordedAudio}
        onSaveRecording={saveRecording}
      />
      
      <ApiKeyWarning apiKeyValid={apiKeyValid} />
    </div>
  );
}
