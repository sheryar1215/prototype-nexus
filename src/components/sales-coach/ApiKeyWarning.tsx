
interface ApiKeyWarningProps {
  apiKeyValid: boolean;
}

export function ApiKeyWarning({ apiKeyValid }: ApiKeyWarningProps) {
  if (apiKeyValid) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
      <p className="text-sm">
        ElevenLabs API key is not valid or not set. The default API key will be used automatically,
        but if you want to use your own key, please add it in the Settings page.
      </p>
    </div>
  );
}
