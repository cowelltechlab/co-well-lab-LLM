import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface TextFeedbackPanelProps {
  draftKey: "draft1" | "draft2";
}

export default function TextFeedbackPanel({ draftKey }: TextFeedbackPanelProps) {
  const { letterLabData, setLetterLabData } = useAppContext();
  
  // Get existing feedback from context if available
  const [likeFeedback, setLikeFeedback] = useState<string>(
    letterLabData?.textFeedback?.[draftKey]?.likes || ""
  );
  
  const [dislikeFeedback, setDislikeFeedback] = useState<string>(
    letterLabData?.textFeedback?.[draftKey]?.dislikes || ""
  );
  
  // Update context when feedback changes
  const updateContext = () => {
    if (!letterLabData) return;
    
    setLetterLabData({
      ...letterLabData,
      textFeedback: {
        ...(letterLabData?.textFeedback || {}),
        [draftKey]: {
          likes: likeFeedback,
          dislikes: dislikeFeedback
        }
      }
    });
  };
  
  // Update context on input change
  useEffect(() => {
    updateContext();
  }, [likeFeedback, dislikeFeedback]);
  
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col space-y-2">
        <Label className="font-medium">What do you like about this draft?</Label>
        <Textarea
          value={likeFeedback}
          onChange={(e) => setLikeFeedback(e.target.value)}
          className="min-h-[100px]"
          placeholder="Enter what you like about this draft..."
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <Label className="font-medium">What do you not like about this draft?</Label>
        <Textarea
          value={dislikeFeedback}
          onChange={(e) => setDislikeFeedback(e.target.value)}
          className="min-h-[100px]"
          placeholder="Enter what you don't like about this draft..."
        />
      </div>
    </div>
  );
}