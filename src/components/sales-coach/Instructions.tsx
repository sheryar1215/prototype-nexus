
export const Instructions = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium">Instructions</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-4">
        <li>Select a scenario from the options above</li>
        <li>Click "Start Practice" to begin the conversation</li>
        <li>Speak naturally as if you're talking to a real customer</li>
        <li>The AI coach will respond and provide feedback</li>
        <li>Click "Stop Practice" when you're done</li>
      </ol>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>Note: Make sure you've added your ElevenLabs API key in the Settings page and allowed microphone access.</p>
      </div>
    </div>
  );
};
