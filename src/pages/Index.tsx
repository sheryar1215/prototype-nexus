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

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
          
          <p className="mt-4 text-muted-foreground">
            Welcome to your dashboard. This is where you can manage your application.
          </p>
          
          {/* Add your dashboard content here */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass rounded-lg p-4">
              <h3 className="text-lg font-medium">Getting Started</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Learn how to use this application effectively.
              </p>
            </div>
            
            <div className="glass rounded-lg p-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View your recent activity and interactions.
              </p>
            </div>
            
            <div className="glass rounded-lg p-4">
              <h3 className="text-lg font-medium">Settings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure your application preferences.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
