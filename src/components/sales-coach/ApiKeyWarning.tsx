
interface ApiKeyWarningProps {
  apiKeyValid: boolean;
}

export function ApiKeyWarning({ apiKeyValid }: ApiKeyWarningProps) {
  if (apiKeyValid) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
      <p className="text-sm">
        ElevenLabs API key is not valid. A default API key is configured, 
        but you may need to add your own key in the Settings page for best results.
      </p>
    </div>
  );
}
