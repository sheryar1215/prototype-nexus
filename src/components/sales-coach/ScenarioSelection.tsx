
import { useState } from "react";

export interface Scenario {
  id: number;
  title: string;
  description: string;
}

interface ScenarioSelectionProps {
  scenarios: Scenario[];
  selectedScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}

export const ScenarioSelection = ({
  scenarios,
  selectedScenario,
  onScenarioChange,
}: ScenarioSelectionProps) => {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((scenario) => (
        <div
          key={scenario.id}
          className={`glass cursor-pointer rounded-lg p-4 transition-all hover:scale-105 ${
            selectedScenario.id === scenario.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onScenarioChange(scenario)}
        >
          <h3 className="text-lg font-medium">{scenario.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {scenario.description}
          </p>
        </div>
      ))}
    </div>
  );
};
