import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion"; // or wherever you installed accordion

type BSETBeliefKey =
  | "BSETB_enactive_mastery"
  | "BSETB_vicarious_experience"
  | "BSETB_verbal_persuasion";

const beliefSectionMeta: Record<
  BSETBeliefKey,
  { title: string; intro: string }
> = {
  BSETB_enactive_mastery: {
    title: "Enactive Mastery Experience",
    intro: `This section highlights the moments in your career where you’ve succeeded at something meaningful — where you’ve shown, through action, that you’re competent and capable...`,
  },
  BSETB_vicarious_experience: {
    title: "Vicarious Experience / Social Modeling",
    intro: `This section focuses on how you’ve drawn confidence by observing or learning from others — especially those similar to you...`,
  },
  BSETB_verbal_persuasion: {
    title: "Verbal Persuasion / Physiological & Affective States",
    intro: `This section explores encouragement, affirmations, and your ability to manage emotion under pressure — how those factors boost your sense of self-efficacy...`,
  },
};

export function ReviewSectionView() {
  const { sectionName } = useParams<{ sectionName: BSETBeliefKey }>();
  const { letterLabData } = useAppContext();
  const navigate = useNavigate();

  if (!sectionName || !letterLabData || !beliefSectionMeta[sectionName]) {
    navigate("/review-all");
    return null;
  }

  const { title, intro } = beliefSectionMeta[sectionName];
  const bulletPoints = letterLabData[sectionName];

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-6">
      <h2 className="text-xl font-bold">Let’s Review Your {title} Section</h2>
      <p className="whitespace-pre-line text-gray-700">{intro}</p>

      <h3 className="text-lg font-semibold mt-6"> {title} </h3>

      <Accordion type="multiple" className="space-y-4">
        {Object.entries(bulletPoints).map(([key, bp]) => (
          <AccordionItem
            key={key}
            value={key}
            className="border rounded p-4 bg-gray-50 shadow-sm"
          >
            <AccordionTrigger className="font-medium text-left">
              <li>{bp.text}</li>
            </AccordionTrigger>
            <AccordionContent className="pt-3 text-sm text-gray-700">
              <div className="font-semibold mb-1">
                A strategic, high-impact domain aligned with [placeholder]:
              </div>
              <div className="text-sm whitespace-pre-line mb-3">
                {bp.rationale}
              </div>
              <div className="text-base">
                <p className="mb-2">
                  Does this rationale align with your understanding of yourself
                  and your experience?
                </p>
                <div className="flex gap-3">
                  <span className="text-xl cursor-pointer">👍</span>
                  <span className="text-xl cursor-pointer">👎</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
