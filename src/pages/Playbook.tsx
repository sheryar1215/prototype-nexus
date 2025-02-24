
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaybookFormData {
  title: string;
  description: string;
  productName: string;
  targetAudience: string;
  keyFeatures: string[];
  benefits: string[];
  webhookUrl?: string;
}

const Playbook = () => {
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
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user.id) {
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
          user_id: session.user.id,
        });

      if (error) throw error;

      // If webhook URL is provided, send data to Google Drive
      if (formData.webhookUrl) {
        const { error: webhookError } = await supabase.functions.invoke('send-to-gdrive', {
          body: {
            playbookData: {
              title: formData.title,
              description: formData.description,
              productName: formData.productName,
              targetAudience: formData.targetAudience,
              keyFeatures: formData.keyFeatures.filter(f => f.trim() !== ""),
              benefits: formData.benefits.filter(b => b.trim() !== ""),
            },
            webhookUrl: formData.webhookUrl,
          },
        });

        if (webhookError) {
          toast({
            title: "Warning",
            description: "Playbook saved but failed to send to Google Drive",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Playbook created and sent to Google Drive",
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
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <h1 className="text-3xl font-semibold">Create Playbook</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the details below to generate a new sales playbook
          </p>

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
                <label className="text-sm font-medium">Google Drive Webhook URL (Optional)</label>
                <Input
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      webhookUrl: e.target.value,
                    }))
                  }
                  placeholder="Enter Google Drive webhook URL"
                  type="url"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Key Features</label>
                {formData.keyFeatures.map((feature, index) => (
                  <div key={index} className="mt-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        updateField("keyFeatures", index, e.target.value)
                      }
                      placeholder={`Feature ${index + 1}`}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => addField("keyFeatures")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Benefits</label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="mt-2">
                    <Input
                      value={benefit}
                      onChange={(e) =>
                        updateField("benefits", index, e.target.value)
                      }
                      placeholder={`Benefit ${index + 1}`}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => addField("benefits")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Benefit
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Playbook
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Playbook;
