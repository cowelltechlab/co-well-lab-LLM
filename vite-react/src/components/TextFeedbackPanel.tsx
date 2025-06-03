import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/useAppContext";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface TextFeedbackPanelProps {
  draftKey: "draft1" | "draft2";
  isActive?: boolean;
}

export default function TextFeedbackPanel({
  draftKey,
  isActive = true,
}: TextFeedbackPanelProps) {
  const { letterLabData, setLetterLabData } = useAppContext();

  // Get existing feedback from context if available
  const [likeFeedback, setLikeFeedback] = useState<string>(
    letterLabData?.textFeedback?.[draftKey]?.likes || ""
  );

  const [dislikeFeedback, setDislikeFeedback] = useState<string>(
    letterLabData?.textFeedback?.[draftKey]?.dislikes || ""
  );

  // Update context when feedback changes
  const updateContext = useCallback(() => {
    setLetterLabData((prevData) => {
      if (!prevData) return prevData;

      return {
        ...prevData,
        textFeedback: {
          ...(prevData?.textFeedback || {}),
          [draftKey]: {
            likes: likeFeedback,
            dislikes: dislikeFeedback,
          },
        },
      };
    });
  }, [setLetterLabData, draftKey, likeFeedback, dislikeFeedback]);

  // Update context on input change
  useEffect(() => {
    updateContext();
  }, [updateContext]);

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col space-y-2 p-3 rounded-lg border-2 ${
          likeFeedback.trim().length > 0
            ? "border-green-500"
            : isActive && dislikeFeedback.trim().length === 0
            ? "border-orange-500"
            : "border-gray-300"
        }`}
      >
        <Label className="font-medium">
          What do you like about this version?
        </Label>
        <Textarea
          value={likeFeedback}
          onChange={(e) => setLikeFeedback(e.target.value)}
          className="min-h-[100px] resize-none border-0 p-0 focus:ring-0"
          placeholder="Enter what you like about this version..."
        />
      </div>

      <div
        className={`flex flex-col space-y-2 p-3 rounded-lg border-2 ${
          dislikeFeedback.trim().length > 0
            ? "border-green-500"
            : isActive && likeFeedback.trim().length > 0
            ? "border-orange-500"
            : "border-gray-300"
        }`}
      >
        <Label className="font-medium">
          What do you not like about this version?
        </Label>
        <Textarea
          value={dislikeFeedback}
          onChange={(e) => setDislikeFeedback(e.target.value)}
          className="min-h-[100px] resize-none border-0 p-0 focus:ring-0"
          placeholder="Enter what you don't like about this version..."
        />
      </div>
    </div>
  );
}
