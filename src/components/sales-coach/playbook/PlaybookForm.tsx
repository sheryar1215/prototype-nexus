
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface PlaybookFormProps {
  productDetails: string;
  targetCompany: string;
  customerPersona: string;
  onProductDetailsChange: (value: string) => void;
  onTargetCompanyChange: (value: string) => void;
  onCustomerPersonaChange: (value: string) => void;
}

export function PlaybookForm({
  productDetails,
  targetCompany,
  customerPersona,
  onProductDetailsChange,
  onTargetCompanyChange,
  onCustomerPersonaChange,
}: PlaybookFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 mb-1">
          Product Details
        </label>
        <Textarea
          id="productDetails"
          placeholder="Describe your product, its features, and benefits"
          value={productDetails}
          onChange={(e) => onProductDetailsChange(e.target.value)}
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
          onChange={(e) => onTargetCompanyChange(e.target.value)}
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
          onChange={(e) => onCustomerPersonaChange(e.target.value)}
        />
      </div>
    </div>
  );
}
