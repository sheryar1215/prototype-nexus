
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio.delta') {
      onSpeakingChange(true);
    } else if (event.type === 'response.audio.done') {
      onSpeakingChange(false);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    onSpeakingChange(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        size="lg"
        onClick={isConnected ? endConversation : startConversation}
        className={isConnected ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isConnected ? (
          <>
            <MicOff className="mr-2 h-5 w-5" />
            Stop Speaking
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            Start Speaking
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceInterface;
