// src/components/BulletAccordionItem.tsx

import { useState } from "react";
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
}

export function BulletAccordionItem({
  bulletKey,
  bulletText,
  rationaleText,
}: BulletAccordionItemProps) {
  const [thumbDirection, setThumbDirection] = useState<"up" | "down" | null>(
    null
  );

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
            onClick={() => setThumbDirection("up")}
            className={`text-xl ${
              thumbDirection === "up" ? "text-green-600" : ""
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => setThumbDirection("down")}
            className={`text-xl ${
              thumbDirection === "down" ? "text-red-600" : ""
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        {thumbDirection && (
          <textarea
            placeholder={
              thumbDirection === "up"
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
