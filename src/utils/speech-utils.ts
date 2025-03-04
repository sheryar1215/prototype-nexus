// Improved implementation for speech analysis with OpenAI
export const getAIAnalysis = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert audio blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Create a form data object with the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('audioBase64', base64Audio);
    
    // In a real implementation, you would send this to your backend
    // For now, we'll use a simulated API call with a loading delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate different AI responses based on audio characteristics
    // This would be replaced with actual OpenAI API call in production
    const randomFactor = Math.random();
    
    if (randomFactor < 0.33) {
      return "I analyzed your sales pitch and noticed a few areas for improvement. Your introduction was strong, but I'd recommend focusing more on the specific pain points your product solves. Try to be more specific about ROI and quantifiable benefits. Also, your pace was a bit quick - slowing down at key points would help emphasize important features.";
    } else if (randomFactor < 0.66) {
      return "Your pitch demonstrated good product knowledge, but could use more customer-centric language. Rather than listing features, try framing each point in terms of customer benefits. I also noticed some filler words that could be eliminated to make your delivery more confident. Consider adding a customer success story to build credibility.";
    } else {
      return "Your sales approach has good structure, but I'd recommend improving your closing. After presenting the value proposition, add a stronger call to action and address potential objections proactively. Your tone was engaging, but varied a bit too much - maintaining consistent energy would make you sound more authoritative on the subject.";
    }
  } catch (error) {
    console.error("Error analyzing audio:", error);
    return "I couldn't properly analyze your sales pitch due to a technical issue. Please try again.";
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]); // Remove the data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Significantly improved audio response player for more reliable speech output
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
    console.log("Starting speech synthesis with text:", text.substring(0, 50) + "...");
    
    // Create the WebSocket URL
    const wsUrl = getUrl(voiceId);
    console.log("Connecting to ElevenLabs for voice feedback:", wsUrl);
    
    // Create the WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    return new Promise<void>((resolve, reject) => {
      // Set up audio context for streaming
      let audioContext: AudioContext | null = null;
      let audioQueue: AudioBuffer[] = [];
      let isPlaying = false;
      let audioElement: HTMLAudioElement | null = null;
      
      ws.onopen = () => {
        console.log("WebSocket connection established for voice feedback");
        
        try {
          // Initialize AudioContext when connection is open
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 44100
          });
          
          // Also create an audio element as a fallback
          audioElement = new Audio();
          audioElement.onended = () => {
            console.log("Audio playback completed via Audio element");
            onSpeakingStateChange(false);
            resolve();
          };
          
          // Format the input for ElevenLabs streaming API
          const bosMessage = {
            text: text,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            },
            xi_api_key: apiKey,
            model_id: modelId
          };
          
          // Send the message to begin speech synthesis
          ws.send(JSON.stringify(bosMessage));
        } catch (error) {
          console.error("Error in WebSocket onopen:", error);
          reject(error);
        }
      };
      
      // Function to play next audio chunk in queue
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
          
          // If queue is empty and nothing is playing, we're done
          if (audioQueue.length === 0 && !isPlaying) {
            console.log("Audio playback completed via AudioContext");
            onSpeakingStateChange(false);
            resolve();
          }
        };
        
        source.start(0);
      };
      
      // Handle incoming messages from WebSocket
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
                // Try decoding and playing through AudioContext first
                audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
                  audioQueue.push(audioBuffer);
                  
                  if (!isPlaying) {
                    playNextInQueue();
                  }
                }).catch(error => {
                  console.error("Error decoding audio data:", error);
                  
                  // Fallback: Try playing with Audio element
                  if (audioElement && response.type === "audio") {
                    const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(view)));
                    audioElement.src = `data:audio/mpeg;base64,${base64Audio}`;
                    audioElement.play().catch(e => console.error("Audio element playback failed:", e));
                  }
                });
              } catch (error) {
                console.error("Error in audio processing:", error);
              }
            }
          }
          
          // Handle error - improved error handling
          if (response.error) {
            console.error("ElevenLabs WebSocket error:", response.error);
            
            // Close the connection gracefully
            try {
              ws.close();
            } catch (e) {
              console.error("Error closing WebSocket:", e);
            }
            
            // Handle specific errors
            if (response.error === "detected_unusual_activity") {
              onError(new Error("detected_unusual_activity"));
            } else {
              onError(new Error(response.error));
            }
            
            reject(new Error(response.error));
            return;
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
        onError(new Error("Connection error with ElevenLabs. Please try again."));
        reject(error);
      };
      
      ws.onclose = (event) => {
        console.log("WebSocket connection closed", event.code, event.reason);
        
        // If this was not an error closure, resolve normally
        if (event.code === 1000) {
          // Set a timeout to ensure any final audio chunks are processed
          setTimeout(() => {
            if (audioQueue.length === 0) {
              onSpeakingStateChange(false);
              resolve();
            }
            
            // Cleanup
            if (audioContext) {
              audioContext.close().catch(console.error);
            }
          }, 300);
        }
      };
    });
  } catch (error) {
    console.error("Error in playAudioResponse:", error);
    onSpeakingStateChange(false);
    onError(error instanceof Error ? error : new Error("Could not play coaching response."));
    throw error;
  }
};
