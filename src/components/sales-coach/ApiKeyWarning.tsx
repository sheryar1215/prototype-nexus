
interface ApiKeyWarningProps {
  apiKeyValid: boolean;
}

export function ApiKeyWarning({ apiKeyValid }: ApiKeyWarningProps) {
  if (apiKeyValid) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
      <p className="text-sm">
        Please add your ElevenLabs API key in the Settings page to use this feature.
      </p>
    </div>
  );
}
