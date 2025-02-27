
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PlaybookFormData } from "@/types/playbook";

interface PlaybookFormProps {
  userId: string | undefined;
}

export const PlaybookForm = ({ userId }: PlaybookFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlaybookFormData>({
    title: "",
    description: "",
    productName: "",
    targetAudience: "",
    keyFeatures: [""],
    benefits: [""],
    webhookUrl: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a playbook",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("playbooks")
        .insert({
          title: formData.title,
          description: formData.description,
          product_name: formData.productName,
          target_audience: formData.targetAudience,
          key_features: formData.keyFeatures.filter(f => f.trim() !== ""),
          benefits: formData.benefits.filter(b => b.trim() !== ""),
          user_id: userId,
        });

      if (error) throw error;

      // If webhook URL is provided, send data to webhook
      if (formData.webhookUrl) {
        const playbookData = {
          title: formData.title,
          description: formData.description,
          productName: formData.productName,
          targetAudience: formData.targetAudience,
          keyFeatures: formData.keyFeatures.filter(f => f.trim() !== ""),
          benefits: formData.benefits.filter(b => b.trim() !== ""),
        };

        const { data: webhookData, error: webhookError } = await supabase.functions.invoke('trigger-webhook', {
          body: {
            webhookUrl: formData.webhookUrl,
            playbookData: playbookData,
          },
        });

        if (webhookError) {
          console.error("Webhook error:", webhookError);
          toast({
            title: "Warning",
            description: "Playbook saved but failed to trigger webhook",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Playbook created and webhook triggered successfully",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Playbook created successfully",
        });
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        productName: "",
        targetAudience: "",
        keyFeatures: [""],
        benefits: [""],
        webhookUrl: "",
      });

      // Navigate to the dashboard or playbooks list
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: "keyFeatures" | "benefits") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateField = (
    field: "keyFeatures" | "benefits",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter playbook title"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Enter playbook description"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Product Name</label>
          <Input
            value={formData.productName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                productName: e.target.value,
              }))
            }
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Target Audience</label>
          <Input
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                targetAudience: e.target.value,
              }))
            }
            placeholder="Enter target audience"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Webhook URL (Optional)</label>
          <Input
            value={formData.webhookUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                webhookUrl: e.target.value,
              }))
            }
            placeholder="Enter webhook URL for integration"
            type="url"
          />
        </div>

        <FieldArrayInput 
          label="Key Features"
          values={formData.keyFeatures}
          placeholder="Feature"
          onAdd={() => addField("keyFeatures")}
          onChange={(index, value) => updateField("keyFeatures", index, value)}
        />

        <FieldArrayInput 
          label="Benefits"
          values={formData.benefits}
          placeholder="Benefit"
          onAdd={() => addField("benefits")}
          onChange={(index, value) => updateField("benefits", index, value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Playbook
      </Button>
    </form>
  );
};

interface FieldArrayInputProps {
  label: string;
  values: string[];
  placeholder: string;
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
}

const FieldArrayInput = ({ 
  label, 
  values, 
  placeholder,
  onAdd,
  onChange 
}: FieldArrayInputProps) => {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {values.map((value, index) => (
        <div key={index} className="mt-2">
          <Input
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={`${placeholder} ${index + 1}`}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={onAdd}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add {placeholder}
      </Button>
    </div>
  );
};
