
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface PlaybookDisplayProps {
  playbook: string;
  onDownload: () => void;
}

export function PlaybookDisplay({ playbook, onDownload }: PlaybookDisplayProps) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Generated Playbook</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDownload}
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
  );
}
