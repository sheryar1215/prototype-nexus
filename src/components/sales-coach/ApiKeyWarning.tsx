
interface ApiKeyWarningProps {
  apiKeyValid: boolean;
}

export function ApiKeyWarning({ apiKeyValid }: ApiKeyWarningProps) {
  if (apiKeyValid) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
      <p className="text-sm">
        ElevenLabs API key is required for voice coaching. Please add your API key in the Settings page 
        to enable the voice feedback feature. Without a valid API key, you won't be able to receive 
        verbal coaching feedback.
      </p>
    </div>
  );
}
