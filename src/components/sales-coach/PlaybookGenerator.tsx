
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";
import { initializeElevenLabs } from "@/lib/elevenlabs";
import { ApiKeyWarning } from "./ApiKeyWarning";

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

  // Generate dynamic content based on inputs
  const generateDynamicObjections = (product: string, company: string, persona: string) => {
    // Extract keywords from inputs to generate more relevant content
    const productKeywords = product.toLowerCase();
    const isSubscription = productKeywords.includes("subscription") || productKeywords.includes("saas");
    const isTech = productKeywords.includes("software") || productKeywords.includes("platform") || productKeywords.includes("app");
    const isService = productKeywords.includes("service") || productKeywords.includes("consulting");
    
    const objections = [
      {
        objection: "It's too expensive",
        response: isSubscription 
          ? "Response: Focus on ROI and how our subscription model spreads costs over time"
          : "Response: Focus on ROI and long-term cost savings"
      },
      {
        objection: company ? `We already use ${company.includes(" ") ? company.split(" ")[0] : "a similar solution"}`
          : "We're happy with our current solution",
        response: isTech 
          ? "Response: Highlight our platform's unique features and superior integration capabilities"
          : "Response: Highlight unique benefits and differentiation from competitors"
      },
      {
        objection: isTech ? "We don't have IT resources to implement this" : "We don't have time to implement something new",
        response: isTech 
          ? "Response: Emphasize our dedicated implementation team and quick technical onboarding"
          : "Response: Emphasize quick onboarding and minimal disruption to operations"
      }
    ];

    if (persona) {
      objections.push({
        objection: `I need to consult with ${persona.includes("manager") ? "senior leadership" : "my team"} first`,
        response: `Response: Offer a collaborative demo with ${persona.includes("manager") ? "their team" : "key stakeholders"} to accelerate the decision process`
      });
    }

    return objections;
  };

  // Generate dynamic value propositions
  const generateValueProps = (product: string) => {
    const productKeywords = product.toLowerCase();
    const props = [];

    if (productKeywords.includes("automation") || productKeywords.includes("workflow")) {
      props.push("Increases efficiency by automating repetitive tasks");
    } else {
      props.push("Increases efficiency by streamlining workflows");
    }

    if (productKeywords.includes("cost") || productKeywords.includes("saving")) {
      props.push("Reduces operational costs by up to 30% through optimization");
    } else {
      props.push("Reduces costs through automation and resource optimization");
    }

    if (productKeywords.includes("customer") || productKeywords.includes("client") || productKeywords.includes("service")) {
      props.push("Improves customer satisfaction with faster response times and better service delivery");
    } else {
      props.push("Improves overall performance with better resource allocation");
    }

    if (productKeywords.includes("data") || productKeywords.includes("analytics")) {
      props.push("Provides actionable insights through advanced analytics");
    }

    if (productKeywords.includes("compliance") || productKeywords.includes("security")) {
      props.push("Ensures regulatory compliance and enhances security measures");
    }

    return props.slice(0, 4); // Return up to 4 value propositions
  };

  // Generate sales script outline based on inputs
  const generateSalesScript = (product: string, company: string, persona: string) => {
    const steps = [
      "Introduction: Build rapport and establish credibility",
      "Discovery: Understand pain points and current processes"
    ];

    if (company) {
      steps.push(`Company Background: Acknowledge ${company}'s market position and challenges`);
    }

    steps.push("Solution Presentation: Align product benefits with specific needs");

    if (persona) {
      steps.push(`Personalized Value: Address specific concerns for ${persona} role`);
    }

    steps.push("Objection Handling: Address concerns proactively");
    steps.push("Closing: Clear next steps and timeline");
    
    return steps;
  };

  // Generate a playbook using the dynamic content generators
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
      // Generate dynamic content
      const valueProps = generateValueProps(productDetails);
      const objections = generateDynamicObjections(productDetails, targetCompany, customerPersona);
      const salesScript = generateSalesScript(productDetails, targetCompany, customerPersona);
      
      // Create product name from first few words if long
      const productName = productDetails.split(' ').length > 3 
        ? productDetails.split(' ').slice(0, 3).join(' ') + "..."
        : productDetails;
      
      // Format the playbook with the dynamic content
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
        
        <ApiKeyWarning apiKeyValid={apiKeyValid} />
        
        <div className="space-y-4 mt-4">
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
              placeholder="Describe your ideal customer (e.g., CTO, Marketing Manager)"
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
