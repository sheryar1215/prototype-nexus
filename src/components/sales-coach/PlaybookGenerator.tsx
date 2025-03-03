
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

interface PlaybookGeneratorProps {
  onPlaybookGenerated?: (playbook: string) => void;
}

export function PlaybookGenerator({ onPlaybookGenerated }: PlaybookGeneratorProps) {
  const [productDetails, setProductDetails] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [customerPersona, setCustomerPersona] = useState("");
  const [playbook, setPlaybook] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Mock function to generate a playbook
  // In a real implementation, this would call an API
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedPlaybook = `
# SALES PLAYBOOK: ${productDetails.split(' ').slice(0, 3).join(' ')}

## Product Overview
${productDetails}

${targetCompany ? `## Target Company\n${targetCompany}\n` : ''}
${customerPersona ? `## Customer Persona\n${customerPersona}\n` : ''}

## Key Value Propositions
1. Increases efficiency by streamlining workflows
2. Reduces costs through automation
3. Improves customer satisfaction with better response times

## Common Objections & Responses
1. "It's too expensive"
   - Response: Focus on ROI and long-term cost savings
   
2. "We're happy with our current solution"
   - Response: Highlight unique features and integration capabilities
   
3. "We don't have time to implement new software"
   - Response: Emphasize quick onboarding and dedicated support

## Sales Script Outline
1. Introduction: Build rapport and establish credibility
2. Discovery: Understand pain points and current processes
3. Solution Presentation: Align product benefits with customer needs
4. Objection Handling: Address concerns proactively
5. Closing: Clear next steps and timeline
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
    
    // Clean up
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
        
        <div className="space-y-4">
          <div>
            <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Product Details
            </label>
            <Textarea
              id="productDetails"
              placeholder="Describe your product, its features, and benefits"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="targetCompany" className="block text-sm font-medium text-gray-700 mb-1">
              Target Company (optional)
            </label>
            <Input
              id="targetCompany"
              placeholder="Describe the ideal company for your product"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="customerPersona" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Persona (optional)
            </label>
            <Input
              id="customerPersona"
              placeholder="Describe your ideal customer"
              value={customerPersona}
              onChange={(e) => setCustomerPersona(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={generatePlaybook} 
            disabled={isGenerating || !productDetails.trim()}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Playbook"}
          </Button>
        </div>
        
        {playbook && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Generated Playbook</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadPlaybook}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-md whitespace-pre-line text-sm overflow-auto max-h-96">
              {playbook}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
