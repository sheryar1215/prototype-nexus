
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import VoiceInterface from "@/components/VoiceInterface";

const Index = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold">Voice Assistant</h1>
          </div>
          
          <p className="mt-4 text-muted-foreground">
            Click the button below to start a voice conversation with the AI assistant.
          </p>

          <div className="mt-8">
            <VoiceInterface onSpeakingChange={setIsSpeaking} />
          </div>

          {isSpeaking && (
            <div className="mt-6 flex items-center justify-center text-primary">
              <div className="animate-pulse mr-2">●</div>
              AI is speaking...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
