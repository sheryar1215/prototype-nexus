
export const getAIAnalysis = async (audioBlob: Blob): Promise<string> => {
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

export const playAudioResponse = async (
  text: string,
  apiKey: string,
  voiceId: string,
  modelId: string,
  getUrl: (voiceId: string) => string,
  onSpeakingStateChange: (isSpeaking: boolean) => void,
  onError: (error: Error) => void
) => {
  if (!text || !apiKey) return;
  
  try {
    onSpeakingStateChange(true);
    
    // Create the WebSocket URL
    const wsUrl = getUrl(voiceId);
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
        model_id: modelId
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
      onSpeakingStateChange(false);
      onError(new Error("Error playing coaching response. Please try again."));
    };
    
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      onSpeakingStateChange(false);
      
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
    onSpeakingStateChange(false);
    onError(error instanceof Error ? error : new Error("Could not play coaching response."));
  }
};
