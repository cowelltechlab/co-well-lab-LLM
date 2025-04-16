import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface BulletAccordionItemProps {
  bulletKey: string;
  bulletText: string;
  rationaleText: string;
  feedback: {
    thumbs: "up" | "down" | null;
    qualitative: string;
  };
  onFeedbackChange: (update: {
    thumbs: "up" | "down";
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
  const handleThumbClick = (direction: "up" | "down") => {
    onFeedbackChange({
      thumbs: direction,
      qualitative: feedback.qualitative,
    });
  };

  const handleTextChange = (text: string) => {
    if (!feedback.thumbs) return; // avoid capturing feedback if no thumb selected
    onFeedbackChange({
      thumbs: feedback.thumbs,
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

        <div className="text-sm whitespace-pre-line mb-3">{rationaleText}</div>

        <p className="mb-2">
          Does this rationale align with your understanding of yourself and your
          experience?
        </p>

        <div className="flex gap-3 mb-2">
          <button
            onClick={() => handleThumbClick("up")}
            className={`text-xl p-1 rounded ${
              feedback.thumbs === "up"
                ? "bg-green-100 text-green-600"
                : "text-gray-500 hover:text-green-600"
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleThumbClick("down")}
            className={`text-xl p-1 rounded ${
              feedback.thumbs === "down"
                ? "bg-red-100 text-red-600"
                : "text-gray-500 hover:text-red-600"
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        {feedback.thumbs && (
          <textarea
            value={feedback.qualitative}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={
              feedback.thumbs === "up"
                ? "Great! Do you have any feedback for additional comments about this snippet?"
                : "Uh oh, let’s fix this. What about this reasoning do you not agree with? How would you re-write this snippet?"
            }
            className="w-full p-3 border border-gray-300 rounded shadow-inner bg-gray-50 text-sm"
            rows={4}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
