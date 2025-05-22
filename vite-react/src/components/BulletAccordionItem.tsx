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
  isOpen: boolean;
  isNextAction: boolean;
}

export function BulletAccordionItem({
  bulletKey,
  bulletText,
  rationaleText,
  feedback,
  onFeedbackChange,
  isOpen,
  isNextAction,
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
      className={`border-2 rounded p-4 bg-gray-50 shadow-sm ${
        (localRating !== null && feedback.qualitative.trim().length > 0)
          ? 'border-green-500 hover:border-green-600'
          : isOpen 
            ? 'border-gray-300' 
            : isNextAction
              ? 'border-orange-500 hover:border-orange-600'
              : ''
      }`}
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
            showBorder={isOpen && (localRating !== null || (isNextAction && feedback.qualitative.trim().length === 0))}
            isComplete={localRating !== null}
          />
        </div>

        {localRating !== null && (
          <textarea
            value={feedback.qualitative}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Any additional comments?"
            className={`w-full p-3 border-2 rounded shadow-inner bg-gray-50 text-sm ${
              feedback.qualitative.trim().length > 0 
                ? 'border-green-500 focus:border-green-600' 
                : isOpen && isNextAction && localRating !== null
                  ? 'border-orange-500 focus:border-orange-600'
                  : 'border-gray-300 focus:border-gray-400'
            }`}
            rows={4}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
