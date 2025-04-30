import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@radix-ui/react-accordion";
import { BulletAccordionItem } from "@/components/BulletAccordionItem";
import { CheckCircle } from "lucide-react";

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
  const { letterLabData, setLetterLabData } = useAppContext();
  const navigate = useNavigate();

  const [sectionFeedback, setSectionFeedback] = useState<{
    [bpKey: string]: {
      rating: number | null;
      qualitative: string;
    };
  }>({});

  useEffect(() => {
    if (!letterLabData || !sectionName) return;

    const section = letterLabData[sectionName];

    const restored = Object.entries(section).reduce((acc, [bpKey, bp]) => {
      acc[bpKey] = {
        rating: typeof bp.rating === "number" ? bp.rating : null,
        qualitative: bp.qualitative ?? "",
      };

      return acc;
    }, {} as typeof sectionFeedback);

    setSectionFeedback(restored);
  }, [letterLabData, sectionName]);

  if (!sectionName || !letterLabData || !beliefSectionMeta[sectionName]) {
    navigate("/review-all");
    return null;
  }

  const { title, intro } = beliefSectionMeta[sectionName];
  const bulletPoints = letterLabData[sectionName];

  const updateFeedback = (
    bpKey: string,
    update: { rating: number; qualitative: string }
  ) => {
    setSectionFeedback((prev) => ({
      ...prev,
      [bpKey]: {
        rating: update.rating,
        qualitative: update.qualitative,
      },
    }));
  };

  const allComplete = Object.keys(bulletPoints).every(
    (bpKey) =>
      sectionFeedback[bpKey]?.rating &&
      sectionFeedback[bpKey]?.qualitative.trim().length > 0
  );

  const handleComplete = () => {
    if (!letterLabData || !sectionName) return;

    const updatedSection = Object.entries(letterLabData[sectionName]).reduce(
      (acc, [bpKey, original]) => {
        acc[bpKey] = {
          ...original,
          rating: sectionFeedback[bpKey]?.rating ?? null,
          qualitative: sectionFeedback[bpKey]?.qualitative ?? "",
        };
        return acc;
      },
      {} as (typeof letterLabData)[BSETBeliefKey]
    );

    setLetterLabData({
      ...letterLabData,
      [sectionName]: updatedSection,
    });

    navigate("/review-all");
  };

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-6">
      <h2 className="text-xl font-bold">Let’s Review Your {title} Section</h2>
      <p className="whitespace-pre-line text-gray-700">{intro}</p>

      <h3 className="text-lg font-semibold mt-6"> {title} </h3>

      <Accordion type="multiple" className="space-y-4">
        {Object.entries(bulletPoints).map(([bpKey, bp]) => (
          <BulletAccordionItem
            key={bpKey}
            bulletKey={bpKey}
            bulletText={bp.text}
            rationaleText={bp.rationale}
            feedback={
              sectionFeedback[bpKey] ?? { thumbs: null, qualitative: "" }
            }
            onFeedbackChange={(update) => updateFeedback(bpKey, update)}
          />
        ))}
      </Accordion>
      <Button onClick={handleComplete} disabled={!allComplete} className="mt-8">
        {allComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
        Complete Section Review
      </Button>
    </Card>
  );
}
