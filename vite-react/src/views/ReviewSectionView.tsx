import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { Card } from "@/components/ui/card";

import { Accordion } from "@radix-ui/react-accordion";

import { BulletAccordionItem } from "@/components/BulletAccordionItem";

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
          <BulletAccordionItem
            key={key}
            bulletKey={key}
            bulletText={bp.text}
            rationaleText={bp.rationale}
          />
        ))}
      </Accordion>
    </Card>
  );
}
