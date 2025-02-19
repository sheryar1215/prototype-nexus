
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Loader2 } from "lucide-react";

interface PlaybookFormData {
  title: string;
  description: string;
  productName: string;
  targetAudience: string;
  keyFeatures: string[];
  benefits: string[];
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
  });
  const { toast } = useToast();
  const { session } = useAuth();

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

      // Insert the playbook data into Supabase
      const { data, error } = await supabase
        .from("playbooks")
        .insert({
          title: formData.title,
          description: formData.description,
          product_name: formData.productName,
          target_audience: formData.targetAudience,
          key_features: formData.keyFeatures,
          benefits: formData.benefits,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Playbook created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        productName: "",
        targetAudience: "",
        keyFeatures: [""],
        benefits: [""],
      });
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
