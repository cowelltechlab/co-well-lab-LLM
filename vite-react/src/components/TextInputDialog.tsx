
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextInputDialogProps {
  open: boolean;
  title: string;
  description: string;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function TextInputDialog({
  open,
  title,
  description,
  initialValue,
  onSave,
  onClose
}: TextInputDialogProps) {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder={`Paste your ${title.toLowerCase()} here...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`min-h-32 border-2 ${
            inputValue.trim().length > 0 
              ? "border-green-500 focus:border-green-600" 
              : "border-orange-500 focus:border-orange-600"
          }`}
        />

        <Button 
          variant="outline"
          onClick={handleSave}
          disabled={inputValue.trim().length === 0}
          className={inputValue.trim().length > 0 ? "border-2 border-orange-500 hover:border-orange-600" : ""}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}