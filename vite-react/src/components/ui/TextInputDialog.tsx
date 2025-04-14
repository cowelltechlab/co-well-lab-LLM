
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
          className="min-h-32"
        />

        <Button onClick={handleSave}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}