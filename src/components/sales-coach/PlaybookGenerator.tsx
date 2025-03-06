
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { initializeElevenLabs } from "@/lib/elevenlabs";
import { ApiKeyWarning } from "./ApiKeyWarning";
import { PlaybookForm } from "./playbook/PlaybookForm";
import { PlaybookDisplay } from "./playbook/PlaybookDisplay";
import { generateDynamicObjections, generateValueProps, generateSalesScript } from "./playbook/playbookUtils";

interface PlaybookGeneratorProps {
  onPlaybookGenerated?: (playbook: string) => void;
}

export function PlaybookGenerator({ onPlaybookGenerated }: PlaybookGeneratorProps) {
  const [productDetails, setProductDetails] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [customerPersona, setCustomerPersona] = useState("");
  const [playbook, setPlaybook] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(true);
  const { toast } = useToast();

  // Check if the API key is valid when component mounts
  useState(() => {
    const checkApiKey = async () => {
      try {
        await initializeElevenLabs();
        setApiKeyValid(true);
      } catch (error) {
        console.error("Error validating API key:", error);
        setApiKeyValid(false);
      }
    };
    
    checkApiKey();
  });

  const generatePlaybook = async () => {
    if (!productDetails.trim()) {
      toast({
        variant: "destructive",
        title: "Required Information",
        description: "Please enter product details to generate a playbook.",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const valueProps = generateValueProps(productDetails);
      const objections = generateDynamicObjections(productDetails, targetCompany, customerPersona);
      const salesScript = generateSalesScript(productDetails, targetCompany, customerPersona);
      
      const productName = productDetails.split(' ').length > 3 
        ? productDetails.split(' ').slice(0, 3).join(' ') + "..."
        : productDetails;
      
      const generatedPlaybook = `
# SALES PLAYBOOK: ${productName}

## Product Overview
${productDetails}

${targetCompany ? `## Target Company\n${targetCompany}\n` : ''}
${customerPersona ? `## Customer Persona\n${customerPersona}\n` : ''}

## Key Value Propositions
${valueProps.map((prop, index) => `${index + 1}. ${prop}`).join('\n')}

## Common Objections & Responses
${objections.map((obj, index) => `${index + 1}. "${obj.objection}"\n   - ${obj.response}`).join('\n\n')}

## Sales Script Outline
${salesScript.map((step, index) => `${index + 1}. ${step}`).join('\n')}
      `;
      
      setPlaybook(generatedPlaybook);
      
      if (onPlaybookGenerated) {
        onPlaybookGenerated(generatedPlaybook);
      }
      
      toast({
        title: "Playbook Generated",
        description: "Your sales playbook has been successfully created.",
      });
    } catch (error) {
      console.error("Error generating playbook:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the playbook. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPlaybook = () => {
    if (!playbook) return;
    
    const blob = new Blob([playbook], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-playbook-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Playbook Downloaded",
      description: "Your sales playbook has been saved to your device.",
    });
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Sales Playbook Generator</h2>
        
        <ApiKeyWarning apiKeyValid={apiKeyValid} />
        
        <div className="space-y-4 mt-4">
          <PlaybookForm
            productDetails={productDetails}
            targetCompany={targetCompany}
            customerPersona={customerPersona}
            onProductDetailsChange={setProductDetails}
            onTargetCompanyChange={setTargetCompany}
            onCustomerPersonaChange={setCustomerPersona}
          />
          
          <Button 
            onClick={generatePlaybook} 
            disabled={isGenerating || !productDetails.trim()}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Playbook"}
          </Button>
        </div>
        
        {playbook && (
          <PlaybookDisplay
            playbook={playbook}
            onDownload={downloadPlaybook}
          />
        )}
      </CardContent>
    </Card>
  );
}
