
import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScenarioSelection, Scenario } from "@/components/sales-coach/ScenarioSelection";
import { RecordingControls } from "@/components/sales-coach/RecordingControls";
import { Instructions } from "@/components/sales-coach/Instructions";
import { RealTimeCoaching } from "@/components/sales-coach/RealTimeCoaching";
import { PlaybookGenerator } from "@/components/sales-coach/PlaybookGenerator";

const scenarios: Scenario[] = [
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
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const { toast } = useToast();
  const [showRealTimeCoaching, setShowRealTimeCoaching] = useState(false);
  const [showPlaybookGenerator, setShowPlaybookGenerator] = useState(false);
  const [generatedPlaybook, setGeneratedPlaybook] = useState<string | null>(null);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const toggleCoachingMode = () => {
    setShowRealTimeCoaching(!showRealTimeCoaching);
    setShowPlaybookGenerator(false);
  };

  const togglePlaybookGenerator = () => {
    setShowPlaybookGenerator(!showPlaybookGenerator);
    setShowRealTimeCoaching(false);
  };

  const handlePlaybookGenerated = (playbook: string) => {
    setGeneratedPlaybook(playbook);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold">Sales Practice Coach</h1>
            <div className="flex gap-3">
              <Button 
                variant={showPlaybookGenerator ? "default" : "outline"} 
                onClick={togglePlaybookGenerator}
              >
                {showPlaybookGenerator ? "Hide Playbook Generator" : "Sales Playbook Generator"}
              </Button>
              <Button 
                variant={showRealTimeCoaching ? "default" : "outline"} 
                onClick={toggleCoachingMode}
              >
                {showRealTimeCoaching ? "Hide Real-Time Coaching" : "Real-Time Coaching"}
              </Button>
            </div>
          </div>
          
          <p className="mt-4 text-muted-foreground">
            Practice your sales skills with our AI-powered coach and generate custom sales playbooks.
          </p>

          {showPlaybookGenerator && (
            <PlaybookGenerator onPlaybookGenerated={handlePlaybookGenerated} />
          )}

          {showRealTimeCoaching ? (
            <RealTimeCoaching />
          ) : (
            !showPlaybookGenerator && (
              <>
                <ScenarioSelection
                  scenarios={scenarios}
                  selectedScenario={selectedScenario}
                  onScenarioChange={handleScenarioChange}
                />

                <RecordingControls
                  isRecording={false}
                  isConnecting={false}
                  isSpeaking={false}
                  apiKeyValid={false}
                  onToggleRecording={() => {}}
                />

                <Instructions />
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
