import { useState, useEffect } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { LikertScale } from "@/components/LikertScale";

interface BulletAccordionItemProps {
  bulletKey: string;
  bulletText: string;
  rationaleText: string;
  feedback: {
    rating: number | null;
    qualitative: string;
  };
  onFeedbackChange: (update: { rating: number; qualitative: string }) => void;
}

export function BulletAccordionItem({
  bulletKey,
  bulletText,
  rationaleText,
  feedback,
  onFeedbackChange,
}: BulletAccordionItemProps) {
  const [localRating, setLocalRating] = useState<number | null>(
    feedback.rating
  );

  useEffect(() => {
    setLocalRating(feedback.rating);
  }, [feedback.rating]);

  const handleRatingChange = (rating: number) => {
    setLocalRating(rating);
    onFeedbackChange({
      rating,
      qualitative: feedback.qualitative,
    });
  };

  const handleTextChange = (text: string) => {
    if (localRating === null) return;
    onFeedbackChange({
      rating: localRating,
      qualitative: text,
    });
  };

  return (
    <AccordionItem
      value={bulletKey}
      className="border rounded p-4 bg-gray-50 shadow-sm"
    >
      <AccordionTrigger className="font-medium text-left">
        <li>{bulletText}</li>
      </AccordionTrigger>

      <AccordionContent className="pt-3 text-sm text-gray-700">
        <div className="text-sm whitespace-pre-line mb-3">{rationaleText}</div>

        <p className="mb-2 text-base font-semibold">
          To what extent does this description sound like you?
        </p>

        <div className="mb-4">
          <LikertScale
            value={localRating}
            onChange={handleRatingChange}
          />
        </div>

        {localRating !== null && (
          <textarea
            value={feedback.qualitative}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Any additional comments?"
            className="w-full p-3 border border-gray-300 rounded shadow-inner bg-gray-50 text-sm"
            rows={4}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
