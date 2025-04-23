import { useState, useEffect } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { Star } from "lucide-react";

interface BulletAccordionItemProps {
  bulletKey: string;
  bulletText: string;
  rationaleText: string;
  feedback: {
    rating: number | null;
    qualitative: string;
  };
  onFeedbackChange: (update: {
    rating: number;
    qualitative: string;
  }) => void;
}

export function BulletAccordionItem({
  bulletKey,
  bulletText,
  rationaleText,
  feedback,
  onFeedbackChange,
}: BulletAccordionItemProps) {

  const [localRating, setLocalRating] = useState<number | null>(feedback.rating);

  useEffect(() => {
    setLocalRating(feedback.rating);
  }, [feedback.rating]);

  const handleStarClick = (rating: number) => {
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
        <div className="font-semibold mb-1">
          A strategic, high-impact domain aligned with [placeholder]:
        </div>

        <div className="text-sm whitespace-pre-line mb-3">
          {rationaleText}
        </div>

        <p className="mb-2">
          How well does this rationale align with your understanding of yourself and your
          experience?
        </p>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = localRating !== null && localRating >= star;
            return (
              <Star
                key={star}
                onClick={() => handleStarClick(star)}
                fill={isSelected ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className={`w-6 h-6 cursor-pointer ${
                  isSelected ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-500`}
              />
            );
          })}
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
