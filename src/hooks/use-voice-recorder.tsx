
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopRecording();
    };
  }, []);

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
    // Check microphone permissions
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

      mediaRecorder.start(1000); // Collect data in 1-second chunks
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak now. Recording will automatically process after you stop.",
      });

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not start recording. Please try again.",
      });
      return false;
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

  const getRecordedAudio = async (): Promise<Blob | null> => {
    if (audioChunksRef.current.length === 0) return null;
    
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    setRecordedAudio(audioBlob);
    return audioBlob;
  };

  const saveRecording = () => {
    if (!recordedAudio) return;
    
    // Create a download link
    const url = URL.createObjectURL(recordedAudio);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `sales-pitch-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Recording Saved",
      description: "Your sales pitch recording has been saved to your device.",
    });
  };

  const completeProcessing = () => {
    setIsProcessing(false);
  };

  return {
    isRecording,
    isProcessing,
    recordedAudio,
    startRecording,
    stopRecording,
    getRecordedAudio,
    saveRecording,
    completeProcessing
  };
}
